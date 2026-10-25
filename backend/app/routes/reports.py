import json
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from app.database import get_db

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/generate")
def generate_report(
    report_type: str = Query("overall_risk"),
    department: Optional[str] = Query(None),
    risk_category: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    with get_db() as conn:
        cursor = conn.cursor()

        dept_filter = " AND s.department = ?" if department and department != "All" else ""
        risk_filter = " AND p.risk_category = ?" if risk_category and risk_category != "All" else ""
        
        params = []
        if dept_filter:
            params.append(department)
        if risk_filter:
            params.append(risk_category)

        if report_type == "high_risk":
            query = f"""
                SELECT s.student_id, s.first_name || ' ' || s.last_name as student_name,
                       s.department, s.semester, s.attendance_pct, s.gpa, s.internal_marks,
                       p.risk_score, p.risk_category, p.factors_json, p.recommendations_json,
                       (SELECT COUNT(*) FROM counseling_sessions cs WHERE cs.student_id = s.student_id) as sessions_count
                FROM students s
                JOIN (
                    SELECT p1.*
                    FROM predictions p1
                    INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
                ) p ON s.student_id = p.student_id
                WHERE p.risk_category = 'HIGH RISK' {dept_filter}
                ORDER BY p.risk_score DESC;
            """
            rows = cursor.execute(query, [p for p in params if p != risk_category]).fetchall()

            data = []
            for r in rows:
                data.append({
                    "student_id": r["student_id"],
                    "name": r["student_name"],
                    "department": r["department"],
                    "semester": r["semester"],
                    "attendance": f"{r['attendance_pct']}%",
                    "gpa": r["gpa"],
                    "internal_marks": r["internal_marks"],
                    "risk_score": f"{r['risk_score']}%",
                    "counseling_sessions": r["sessions_count"],
                    "key_factors": ", ".join(json.loads(r["factors_json"])[:2]) if r["factors_json"] else "N/A"
                })

            summary = {
                "title": "High-Risk Student Action Report",
                "description": "Comprehensive list of students with predicted dropout probability exceeding 65%, prioritized for emergency intervention.",
                "total_records": len(data),
                "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "filters_applied": {"department": department or "All", "type": "High-Risk Cohort"}
            }

            return {"summary": summary, "records": data}

        elif report_type == "counseling_activity":
            query = """
                SELECT cs.id, cs.student_id, s.first_name || ' ' || s.last_name as student_name,
                       s.department, cs.counselor_name, cs.session_date, cs.support_category,
                       cs.status, cs.follow_up_date, cs.action_plan
                FROM counseling_sessions cs
                JOIN students s ON cs.student_id = s.student_id
                ORDER BY cs.session_date DESC;
            """
            rows = cursor.execute(query).fetchall()

            data = []
            for r in rows:
                data.append({
                    "session_id": r["id"],
                    "student_id": r["student_id"],
                    "student_name": r["student_name"],
                    "department": r["department"],
                    "counselor": r["counselor_name"],
                    "date": r["session_date"],
                    "category": r["support_category"],
                    "status": r["status"],
                    "follow_up": r["follow_up_date"] or "None Scheduled"
                })

            summary = {
                "title": "Counseling Activity and Outreach Report",
                "description": "Documentation of all structured counseling sessions, support categories provided, and scheduled student follow-ups.",
                "total_records": len(data),
                "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "filters_applied": {"department": department or "All"}
            }

            return {"summary": summary, "records": data}

        elif report_type == "department_wise":
            dept_stats = cursor.execute("""
                SELECT s.department,
                       COUNT(s.id) as total_students,
                       ROUND(AVG(s.attendance_pct), 1) as avg_attendance,
                       ROUND(AVG(s.gpa), 2) as avg_gpa,
                       SUM(CASE WHEN p.risk_category = 'HIGH RISK' THEN 1 ELSE 0 END) as high_risk_count,
                       SUM(CASE WHEN p.risk_category = 'MEDIUM RISK' THEN 1 ELSE 0 END) as medium_risk_count,
                       SUM(CASE WHEN p.risk_category = 'LOW RISK' THEN 1 ELSE 0 END) as low_risk_count
                FROM students s
                LEFT JOIN (
                    SELECT p1.student_id, p1.risk_category
                    FROM predictions p1
                    INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
                ) p ON s.student_id = p.student_id
                GROUP BY s.department;
            """).fetchall()

            data = []
            for d in dept_stats:
                high_pct = round((d["high_risk_count"] / d["total_students"]) * 100, 1) if d["total_students"] > 0 else 0
                data.append({
                    "department": d["department"],
                    "total_students": d["total_students"],
                    "avg_attendance": f"{d['avg_attendance']}%",
                    "avg_gpa": d["avg_gpa"],
                    "high_risk_count": d["high_risk_count"],
                    "medium_risk_count": d["medium_risk_count"],
                    "low_risk_count": d["low_risk_count"],
                    "high_risk_percentage": f"{high_pct}%"
                })

            summary = {
                "title": "Department-Wise Comparative Retention Report",
                "description": "Analysis of academic performance, attendance compliance, and dropout risk vulnerability aggregated across academic departments.",
                "total_records": len(data),
                "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "filters_applied": {}
            }

            return {"summary": summary, "records": data}

        else: # overall_risk default
            query = f"""
                SELECT s.student_id, s.first_name || ' ' || s.last_name as student_name,
                       s.department, s.semester, s.attendance_pct, s.gpa, s.internal_marks,
                       p.risk_score, p.risk_category, p.model_used
                FROM students s
                LEFT JOIN (
                    SELECT p1.*
                    FROM predictions p1
                    INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
                ) p ON s.student_id = p.student_id
                WHERE 1=1 {dept_filter} {risk_filter}
                ORDER BY s.id ASC;
            """
            rows = cursor.execute(query, params).fetchall()

            data = []
            for r in rows:
                data.append({
                    "student_id": r["student_id"],
                    "name": r["student_name"],
                    "department": r["department"],
                    "semester": r["semester"],
                    "attendance": f"{r['attendance_pct']}%",
                    "gpa": r["gpa"],
                    "internal_marks": r["internal_marks"],
                    "risk_score": f"{r['risk_score']}%" if r["risk_score"] else "N/A",
                    "risk_category": r["risk_category"] or "Pending",
                    "model_used": r["model_used"] or "None"
                })

            summary = {
                "title": "Institutional Student Dropout Risk Master Report",
                "description": "Comprehensive institutional dataset cross-referencing attendance, examination standing, and calibrated risk assessments.",
                "total_records": len(data),
                "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "filters_applied": {"department": department or "All", "risk_category": risk_category or "All"}
            }

            return {"summary": summary, "records": data}
