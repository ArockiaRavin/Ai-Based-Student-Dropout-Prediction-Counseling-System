import json
import csv
import io
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.models import StudentCreate, StudentUpdate, StudentResponse
from app.ml.pipeline import ml_system
from app.auth_utils import get_optional_user, require_role, log_audit

router = APIRouter(prefix="/students", tags=["students"])

@router.get("")
def list_students(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    semester: Optional[int] = Query(None),
    risk_level: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("id"),
    sort_order: Optional[str] = Query("asc"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT s.*, 
                   p.risk_score, p.risk_category, p.model_used, p.factors_json, p.positive_indicators_json, p.recommendations_json, p.created_at as pred_created_at,
                   (SELECT COUNT(*) FROM interventions i WHERE i.student_id = s.student_id AND i.status != 'Completed') as active_interventions_count,
                   (SELECT COUNT(*) FROM counseling_sessions cs WHERE cs.student_id = s.student_id) as counseling_sessions_count
            FROM students s
            LEFT JOIN (
                SELECT p1.*
                FROM predictions p1
                INNER JOIN (
                    SELECT student_id, MAX(id) as max_id
                    FROM predictions
                    GROUP BY student_id
                ) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            WHERE 1=1
        """
        params = []

        if search:
            search_clean = f"%{search.strip()}%"
            query += " AND (s.student_id LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ?)"
            params.extend([search_clean, search_clean, search_clean, search_clean])

        if department and department != "All":
            query += " AND s.department = ?"
            params.append(department)

        if semester:
            query += " AND s.semester = ?"
            params.append(semester)

        if risk_level and risk_level != "All":
            query += " AND p.risk_category = ?"
            params.append(risk_level)

        # Sanitize sort column
        allowed_sorts = {
            "id": "s.id",
            "student_id": "s.student_id",
            "name": "s.first_name",
            "attendance": "s.attendance_pct",
            "gpa": "s.gpa",
            "semester": "s.semester",
            "risk_score": "p.risk_score"
        }
        col = allowed_sorts.get(sort_by, "s.id")
        direction = "DESC" if sort_order.lower() == "desc" else "ASC"
        query += f" ORDER BY {col} {direction}"

        rows = cursor.execute(query, params).fetchall()

        is_viewer = current_user and current_user.get("role") == "Viewer"
        results = []
        for r in rows:
            latest_pred = None
            if r["risk_category"]:
                latest_pred = {
                    "risk_score": r["risk_score"],
                    "risk_category": r["risk_category"],
                    "model_used": r["model_used"],
                    "factors": json.loads(r["factors_json"]) if r["factors_json"] else [],
                    "positive_indicators": json.loads(r["positive_indicators_json"]) if r["positive_indicators_json"] else [],
                    "recommendations": json.loads(r["recommendations_json"]) if r["recommendations_json"] else [],
                    "created_at": r["pred_created_at"]
                }

            # Privacy protection for Viewer role: mask email
            display_email = r["email"]
            if is_viewer and "@" in display_email:
                local_part, domain = display_email.split("@", 1)
                display_email = f"{local_part[:2]}***@{domain}"

            results.append({
                "id": r["id"],
                "student_id": r["student_id"],
                "first_name": r["first_name"],
                "last_name": r["last_name"],
                "email": display_email,
                "department": r["department"],
                "semester": r["semester"],
                "attendance_pct": r["attendance_pct"],
                "gpa": r["gpa"],
                "internal_marks": r["internal_marks"],
                "assignment_completion_pct": r["assignment_completion_pct"],
                "previous_semester_result": r["previous_semester_result"],
                "engagement_level": r["engagement_level"],
                "financial_support_needed": r["financial_support_needed"],
                "status": r["status"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
                "latest_prediction": latest_pred,
                "active_interventions_count": r["active_interventions_count"],
                "counseling_sessions_count": r["counseling_sessions_count"]
            })

        return {"students": results, "total": len(results)}

@router.get("/export/csv")
def export_students_csv():
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT s.student_id, s.first_name, s.last_name, s.email, s.department, s.semester,
                   s.attendance_pct, s.gpa, s.internal_marks, s.assignment_completion_pct,
                   s.previous_semester_result, s.engagement_level, s.financial_support_needed, s.status,
                   p.risk_score, p.risk_category, p.model_used
            FROM students s
            LEFT JOIN (
                SELECT p1.*
                FROM predictions p1
                INNER JOIN (
                    SELECT student_id, MAX(id) as max_id
                    FROM predictions
                    GROUP BY student_id
                ) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            ORDER BY s.id ASC;
        """
        rows = cursor.execute(query).fetchall()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Student ID", "First Name", "Last Name", "Email", "Department", "Semester",
            "Attendance (%)", "GPA", "Internal Marks", "Assignment Completion (%)",
            "Previous Semester Result", "Engagement Level", "Financial Support Needed", "Status",
            "Risk Score (%)", "Risk Category", "Model Used"
        ])

        for r in rows:
            writer.writerow([
                r["student_id"], r["first_name"], r["last_name"], r["email"], r["department"], r["semester"],
                r["attendance_pct"], r["gpa"], r["internal_marks"], r["assignment_completion_pct"],
                r["previous_semester_result"], r["engagement_level"], "Yes" if r["financial_support_needed"] else "No", r["status"],
                r["risk_score"] or "N/A", r["risk_category"] or "N/A", r["model_used"] or "N/A"
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=student_dropout_records.csv"}
        )

@router.get("/{student_id}")
def get_student(student_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        student = cursor.execute("SELECT * FROM students WHERE student_id = ?;", (student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Predictions history
        predictions = cursor.execute("""
            SELECT * FROM predictions WHERE student_id = ? ORDER BY id DESC;
        """, (student_id,)).fetchall()
        
        pred_history = []
        for p in predictions:
            pred_history.append({
                "id": p["id"],
                "model_used": p["model_used"],
                "risk_score": p["risk_score"],
                "risk_category": p["risk_category"],
                "factors": json.loads(p["factors_json"]) if p["factors_json"] else [],
                "positive_indicators": json.loads(p["positive_indicators_json"]) if p["positive_indicators_json"] else [],
                "recommendations": json.loads(p["recommendations_json"]) if p["recommendations_json"] else [],
                "created_at": p["created_at"]
            })

        # Counseling sessions
        sessions = cursor.execute("""
            SELECT * FROM counseling_sessions WHERE student_id = ? ORDER BY id DESC;
        """, (student_id,)).fetchall()

        # Interventions
        interventions = cursor.execute("""
            SELECT * FROM interventions WHERE student_id = ? ORDER BY id DESC;
        """, (student_id,)).fetchall()

        return {
            "student": student,
            "latest_prediction": pred_history[0] if pred_history else None,
            "predictions_history": pred_history,
            "counseling_sessions": sessions,
            "interventions": interventions
        }

@router.post("")
def create_student(
    payload: StudentCreate,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator", "Counselor"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        # Check duplicate
        existing = cursor.execute("SELECT id FROM students WHERE student_id = ?;", (payload.student_id,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Student ID already exists")

        cursor.execute("""
            INSERT INTO students (
                student_id, first_name, last_name, email, department, semester,
                attendance_pct, gpa, internal_marks, assignment_completion_pct,
                previous_semester_result, engagement_level, financial_support_needed, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            payload.student_id, payload.first_name, payload.last_name, payload.email,
            payload.department, payload.semester, payload.attendance_pct, payload.gpa,
            payload.internal_marks, payload.assignment_completion_pct,
            payload.previous_semester_result, payload.engagement_level,
            payload.financial_support_needed, payload.status
        ))

        # Run automated initial prediction
        pred = ml_system.predict_student(payload.model_dump())
        cursor.execute("""
            INSERT INTO predictions (
                student_id, model_used, risk_score, risk_category,
                factors_json, positive_indicators_json, recommendations_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (
            payload.student_id, pred["model_used"], pred["risk_score"], pred["risk_category"],
            json.dumps(pred["factors"]), json.dumps(pred["positive_indicators"]), json.dumps(pred["recommendations"])
        ))

        # Alert if High Risk
        if pred["risk_category"] == "HIGH RISK":
            cursor.execute("""
                INSERT INTO notifications (title, message, type, student_id)
                VALUES (?, ?, 'alert', ?);
            """, (
                f"New High Risk Student Added: {payload.first_name} {payload.last_name}",
                f"{payload.student_id} was identified as High Risk ({pred['risk_score']}%). Immediate counselor assignment recommended.",
                payload.student_id
            ))

        # Audit log
        user_name = current_user.get("name", "User")
        log_audit(conn, user_name, "CREATE_STUDENT", "Student", payload.student_id, f"Added student {payload.first_name} {payload.last_name} ({payload.department})")

        return {
            "message": "Student created successfully",
            "student_id": payload.student_id,
            "prediction": pred
        }

@router.put("/{student_id}")
def update_student(
    student_id: str,
    payload: StudentUpdate,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator", "Counselor"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        student = cursor.execute("SELECT * FROM students WHERE student_id = ?;", (student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        updates = {}
        for k, v in payload.model_dump(exclude_unset=True).items():
            if v is not None:
                updates[k] = v

        if not updates:
            return {"message": "No changes submitted"}

        set_clause = ", ".join([f"{k} = ?" for k in updates.keys()]) + ", updated_at = CURRENT_TIMESTAMP"
        values = list(updates.values()) + [student_id]

        cursor.execute(f"UPDATE students SET {set_clause} WHERE student_id = ?;", values)

        # Refresh student record
        updated_student = cursor.execute("SELECT * FROM students WHERE student_id = ?;", (student_id,)).fetchone()

        # Re-run prediction to reflect academic changes
        pred = ml_system.predict_student(dict(updated_student))
        cursor.execute("""
            INSERT INTO predictions (
                student_id, model_used, risk_score, risk_category,
                factors_json, positive_indicators_json, recommendations_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (
            student_id, pred["model_used"], pred["risk_score"], pred["risk_category"],
            json.dumps(pred["factors"]), json.dumps(pred["positive_indicators"]), json.dumps(pred["recommendations"])
        ))

        user_name = current_user.get("name", "User")
        log_audit(conn, user_name, "UPDATE_STUDENT", "Student", student_id, f"Updated fields: {list(updates.keys())}")

        return {
            "message": "Student updated successfully",
            "student": updated_student,
            "new_prediction": pred
        }

@router.delete("/{student_id}")
def delete_student(
    student_id: str,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        student = cursor.execute("SELECT * FROM students WHERE student_id = ?;", (student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute("DELETE FROM students WHERE student_id = ?;", (student_id,))
        user_name = current_user.get("name", "Admin")
        log_audit(conn, user_name, "DELETE_STUDENT", "Student", student_id, f"Deleted student record for {student['first_name']} {student['last_name']}")

        return {"message": f"Student {student_id} deleted successfully"}

@router.post("/import")
async def import_students_csv(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    imported = 0
    errors = []

    with get_db() as conn:
        cursor = conn.cursor()
        for idx, row in enumerate(reader):
            try:
                s_id = row.get("Student ID") or row.get("student_id")
                first = row.get("First Name") or row.get("first_name") or "Student"
                last = row.get("Last Name") or row.get("last_name") or str(idx + 1)
                email = row.get("Email") or row.get("email") or f"{s_id.lower()}@eduretain.edu"
                dept = row.get("Department") or row.get("department") or "Computer Science & Engineering"
                sem = int(row.get("Semester") or row.get("semester") or 1)
                att = float(row.get("Attendance (%)") or row.get("attendance_pct") or 75.0)
                gpa = float(row.get("GPA") or row.get("gpa") or 6.5)
                internal = float(row.get("Internal Marks") or row.get("internal_marks") or 55.0)
                assign = float(row.get("Assignment Completion (%)") or row.get("assignment_completion_pct") or 70.0)
                prev_res = row.get("Previous Semester Result") or row.get("previous_semester_result") or "Pass - 0 Backlogs"
                eng = row.get("Engagement Level") or row.get("engagement_level") or "Medium"
                fin_str = str(row.get("Financial Support Needed") or row.get("financial_support_needed") or "0").lower()
                fin = 1 if fin_str in ["1", "true", "yes"] else 0

                if not s_id:
                    continue

                cursor.execute("""
                    INSERT OR REPLACE INTO students (
                        student_id, first_name, last_name, email, department, semester,
                        attendance_pct, gpa, internal_marks, assignment_completion_pct,
                        previous_semester_result, engagement_level, financial_support_needed, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Enrolled');
                """, (s_id, first, last, email, dept, sem, att, gpa, internal, assign, prev_res, eng, fin))

                # Run prediction
                pred = ml_system.predict_student({
                    "attendance_pct": att, "gpa": gpa, "internal_marks": internal,
                    "assignment_completion_pct": assign, "previous_semester_result": prev_res,
                    "engagement_level": eng, "financial_support_needed": fin, "semester": sem
                })

                cursor.execute("""
                    INSERT INTO predictions (
                        student_id, model_used, risk_score, risk_category,
                        factors_json, positive_indicators_json, recommendations_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?);
                """, (
                    s_id, pred["model_used"], pred["risk_score"], pred["risk_category"],
                    json.dumps(pred["factors"]), json.dumps(pred["positive_indicators"]), json.dumps(pred["recommendations"])
                ))
                imported += 1
            except Exception as e:
                errors.append(f"Row {idx+1}: {str(e)}")

        cursor.execute("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?);
        """, ("System User", "CSV_IMPORT", "Students", "Bulk", f"Imported {imported} student records via CSV"))

    return {
        "message": f"Successfully imported {imported} students",
        "errors": errors if errors else None
    }
