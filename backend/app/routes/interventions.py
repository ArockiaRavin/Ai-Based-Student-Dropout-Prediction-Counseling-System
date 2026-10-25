from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.database import get_db
from app.models import InterventionCreate, InterventionUpdate, InterventionResponse

router = APIRouter(prefix="/interventions", tags=["interventions"])

@router.get("")
def list_interventions(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT i.*, s.first_name, s.last_name, s.department, s.attendance_pct, s.gpa,
                   p.risk_score, p.risk_category
            FROM interventions i
            JOIN students s ON i.student_id = s.student_id
            LEFT JOIN (
                SELECT p1.*
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            WHERE 1=1
        """
        params = []
        if status and status != "All":
            query += " AND i.status = ?"
            params.append(status)
        if category and category != "All":
            query += " AND i.category = ?"
            params.append(category)
        if student_id:
            query += " AND i.student_id = ?"
            params.append(student_id)

        query += " ORDER BY i.target_date ASC, i.id DESC"
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
                "risk_score": r["risk_score"],
                "risk_category": r["risk_category"],
                "title": r["title"],
                "description": r["description"],
                "category": r["category"],
                "assigned_to": r["assigned_to"],
                "status": r["status"],
                "target_date": r["target_date"],
                "outcome_notes": r["outcome_notes"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"]
            })

        # Summary statistics
        total = len(results)
        completed = sum(1 for x in results if x["status"] == "Completed")
        in_progress = sum(1 for x in results if x["status"] == "In Progress")
        scheduled = sum(1 for x in results if x["status"] == "Scheduled")
        needs_followup = sum(1 for x in results if x["status"] == "Needs Follow-up")
        new_count = sum(1 for x in results if x["status"] == "New")

        return {
            "interventions": results,
            "summary": {
                "total": total,
                "completed": completed,
                "in_progress": in_progress,
                "scheduled": scheduled,
                "needs_followup": needs_followup,
                "new": new_count
            }
        }

@router.post("")
def create_intervention(payload: InterventionCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        student = cursor.execute("SELECT first_name, last_name FROM students WHERE student_id = ?;", (payload.student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute("""
            INSERT INTO interventions (
                student_id, title, description, category,
                assigned_to, status, target_date, outcome_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            payload.student_id, payload.title, payload.description,
            payload.category, payload.assigned_to, payload.status,
            payload.target_date, payload.outcome_notes
        ))
        int_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?);
        """, (payload.assigned_to, "CREATE_INTERVENTION", "Intervention", str(int_id), f"Created intervention '{payload.title}' for {student['first_name']} {student['last_name']}"))

        return {
            "message": "Intervention created successfully",
            "id": int_id
        }

@router.put("/{intervention_id}")
def update_intervention(intervention_id: int, payload: InterventionUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        item = cursor.execute("SELECT * FROM interventions WHERE id = ?;", (intervention_id,)).fetchone()
        if not item:
            raise HTTPException(status_code=404, detail="Intervention not found")

        updates = {}
        for k, v in payload.model_dump(exclude_unset=True).items():
            if v is not None:
                updates[k] = v

        if updates:
            set_clause = ", ".join([f"{k} = ?" for k in updates.keys()]) + ", updated_at = CURRENT_TIMESTAMP"
            values = list(updates.values()) + [intervention_id]
            cursor.execute(f"UPDATE interventions SET {set_clause} WHERE id = ?;", values)

            cursor.execute("""
                INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
                VALUES (?, ?, ?, ?, ?);
            """, ("System User", "UPDATE_INTERVENTION", "Intervention", str(intervention_id), f"Updated intervention #{intervention_id} status to {updates.get('status', item['status'])}"))

        return {"message": "Intervention updated successfully"}
