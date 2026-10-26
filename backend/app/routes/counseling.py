from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.models import CounselingSessionCreate, CounselingSessionResponse
from app.auth_utils import require_role, log_audit

router = APIRouter(prefix="/counseling", tags=["counseling"])

@router.get("/sessions")
def list_counseling_sessions(
    student_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    support_category: Optional[str] = Query(None)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT cs.*, s.first_name, s.last_name, s.department, s.attendance_pct, s.gpa
            FROM counseling_sessions cs
            JOIN students s ON cs.student_id = s.student_id
            WHERE 1=1
        """
        params = []
        if student_id:
            query += " AND cs.student_id = ?"
            params.append(student_id)
        if status and status != "All":
            query += " AND cs.status = ?"
            params.append(status)
        if support_category and support_category != "All":
            query += " AND cs.support_category = ?"
            params.append(support_category)

        query += " ORDER BY cs.session_date DESC, cs.id DESC"
        rows = cursor.execute(query, params).fetchall()

        results = []
        for r in rows:
            results.append({
                "id": r["id"],
                "student_id": r["student_id"],
                "student_name": f"{r['first_name']} {r['last_name']}",
                "department": r["department"],
                "attendance_pct": r["attendance_pct"],
                "gpa": r["gpa"],
                "counselor_name": r["counselor_name"],
                "session_date": r["session_date"],
                "support_category": r["support_category"],
                "notes": r["notes"],
                "action_plan": r["action_plan"],
                "follow_up_date": r["follow_up_date"],
                "status": r["status"],
                "created_at": r["created_at"]
            })

        return {"sessions": results, "total": len(results)}

@router.post("/sessions")
def create_counseling_session(
    payload: CounselingSessionCreate,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator", "Counselor"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        student = cursor.execute("SELECT first_name, last_name FROM students WHERE student_id = ?;", (payload.student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute("""
            INSERT INTO counseling_sessions (
                student_id, counselor_name, session_date, support_category,
                notes, action_plan, follow_up_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            payload.student_id, payload.counselor_name or current_user.get("name", "Counselor"), payload.session_date,
            payload.support_category, payload.notes, payload.action_plan,
            payload.follow_up_date, payload.status
        ))
        session_id = cursor.lastrowid

        user_name = current_user.get("name", payload.counselor_name)
        log_audit(conn, user_name, "RECORD_COUNSELING", "CounselingSession", str(session_id), f"Recorded session for {student['first_name']} {student['last_name']} under {payload.support_category}")

        return {
            "message": "Counseling session recorded successfully",
            "session_id": session_id
        }

@router.put("/sessions/{session_id}")
def update_counseling_session(
    session_id: int,
    payload: dict,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator", "Counselor"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        session = cursor.execute("SELECT * FROM counseling_sessions WHERE id = ?;", (session_id,)).fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        updates = []
        params = []
        for field in ["notes", "action_plan", "follow_up_date", "status", "support_category", "counselor_name"]:
            if field in payload:
                updates.append(f"{field} = ?")
                params.append(payload[field])

        if updates:
            params.append(session_id)
            cursor.execute(f"UPDATE counseling_sessions SET {', '.join(updates)} WHERE id = ?;", params)

        return {"message": "Session updated successfully"}

@router.get("/overview")
def get_counselor_overview():
    with get_db() as conn:
        cursor = conn.cursor()

        # High priority cases awaiting attention
        priority_cases = cursor.execute("""
            SELECT s.student_id, s.first_name, s.last_name, s.department, s.attendance_pct, s.gpa, s.semester,
                   p.risk_score, p.risk_category, p.factors_json, p.recommendations_json,
                   (SELECT COUNT(*) FROM counseling_sessions cs WHERE cs.student_id = s.student_id) as sessions_held
            FROM students s
            JOIN (
                SELECT p1.*
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            WHERE p.risk_category = 'HIGH RISK'
            ORDER BY p.risk_score DESC
            LIMIT 10;
        """).fetchall()

        # Upcoming follow-ups
        upcoming_followups = cursor.execute("""
            SELECT cs.id, cs.student_id, cs.counselor_name, cs.follow_up_date, cs.support_category, cs.action_plan,
                   s.first_name, s.last_name, s.department
            FROM counseling_sessions cs
            JOIN students s ON cs.student_id = s.student_id
            WHERE cs.follow_up_date IS NOT NULL AND cs.follow_up_date != ''
            ORDER BY cs.follow_up_date ASC
            LIMIT 8;
        """).fetchall()

        # Support category breakdown
        cat_counts = cursor.execute("""
            SELECT support_category, COUNT(*) as count
            FROM counseling_sessions
            GROUP BY support_category;
        """).fetchall()

        return {
            "priority_cases": priority_cases,
            "upcoming_followups": upcoming_followups,
            "category_distribution": cat_counts
        }
