import json
import time
from fastapi import APIRouter, Query
from typing import Optional, Dict, Any, Tuple
from app.database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

_dashboard_cache: Optional[Dict[str, Any]] = None
_dashboard_cache_time: float = 0.0
_risk_cache: Dict[str, Tuple[Dict[str, Any], float]] = {}
_CACHE_TTL = 30.0  # 30-second TTL

def invalidate_analytics_cache():
    global _dashboard_cache, _dashboard_cache_time, _risk_cache
    _dashboard_cache = None
    _dashboard_cache_time = 0.0
    _risk_cache.clear()

@router.get("/dashboard-summary")
def get_dashboard_summary():
    global _dashboard_cache, _dashboard_cache_time
    now = time.time()
    if _dashboard_cache is not None and (now - _dashboard_cache_time) < _CACHE_TTL:
        return _dashboard_cache

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Total Students
        total_students = cursor.execute("SELECT COUNT(*) as cnt FROM students;").fetchone()["cnt"]

        # 2. Latest predictions breakdown
        pred_counts = cursor.execute("""
            SELECT p.risk_category, COUNT(*) as count
            FROM (
                SELECT p1.student_id, p1.risk_category, p1.risk_score
                FROM predictions p1
                INNER JOIN (
                    SELECT student_id, MAX(id) as max_id
                    FROM predictions
                    GROUP BY student_id
                ) p2 ON p1.id = p2.max_id
            ) p
            GROUP BY p.risk_category;
        """).fetchall()

        cat_map = {r["risk_category"]: r["count"] for r in pred_counts}
        high_risk_count = cat_map.get("HIGH RISK", 0)
        medium_risk_count = cat_map.get("MEDIUM RISK", 0)
        low_risk_count = cat_map.get("LOW RISK", 0)

        # 3. Students Awaiting Counseling: High risk students who have 0 counseling sessions
        awaiting_counseling = cursor.execute("""
            SELECT COUNT(*) as cnt
            FROM students s
            JOIN (
                SELECT p1.student_id, p1.risk_category
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            LEFT JOIN counseling_sessions cs ON s.student_id = cs.student_id
            WHERE p.risk_category = 'HIGH RISK' AND cs.id IS NULL;
        """).fetchone()["cnt"]

        # 4. Follow-ups Due: Counseling sessions with follow_up_date
        followups_due = cursor.execute("""
            SELECT COUNT(*) as cnt
            FROM counseling_sessions
            WHERE follow_up_date IS NOT NULL AND follow_up_date != '';
        """).fetchone()["cnt"]

        # 5. Department-wise Risk Distribution
        dept_risk = cursor.execute("""
            SELECT s.department,
                   SUM(CASE WHEN p.risk_category = 'HIGH RISK' THEN 1 ELSE 0 END) as high_risk,
                   SUM(CASE WHEN p.risk_category = 'MEDIUM RISK' THEN 1 ELSE 0 END) as medium_risk,
                   SUM(CASE WHEN p.risk_category = 'LOW RISK' THEN 1 ELSE 0 END) as low_risk,
                   COUNT(s.id) as total
            FROM students s
            LEFT JOIN (
                SELECT p1.student_id, p1.risk_category
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            GROUP BY s.department;
        """).fetchall()

        # 6. Scatter Plot Data: Attendance vs Risk Score
        scatter_data = cursor.execute("""
            SELECT s.student_id, s.first_name || ' ' || s.last_name as name, s.department,
                   s.attendance_pct, s.gpa, p.risk_score, p.risk_category
            FROM students s
            JOIN (
                SELECT p1.student_id, p1.risk_score, p1.risk_category
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            ORDER BY s.id ASC;
        """).fetchall()

        # 7. Academic Performance Trends: Grouped by Semester average GPA & Internal Marks
        sem_trends_raw = cursor.execute("""
            SELECT s.semester,
                   ROUND(CAST(AVG(s.gpa) AS numeric), 2) as avg_gpa,
                   ROUND(CAST(AVG(s.internal_marks) AS numeric), 1) as avg_internal,
                   ROUND(CAST(AVG(s.attendance_pct) AS numeric), 1) as avg_attendance,
                   ROUND(CAST(AVG(p.risk_score) AS numeric), 1) as avg_risk_score
            FROM students s
            LEFT JOIN (
                SELECT p1.student_id, p1.risk_score
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            GROUP BY s.semester
            ORDER BY s.semester ASC;
        """).fetchall()

        sem_trends = [
            {
                "semester": r["semester"],
                "avg_gpa": float(r["avg_gpa"]) if r.get("avg_gpa") is not None else 0.0,
                "avg_internal": float(r["avg_internal"]) if r.get("avg_internal") is not None else 0.0,
                "avg_attendance": float(r["avg_attendance"]) if r.get("avg_attendance") is not None else 0.0,
                "avg_risk_score": float(r["avg_risk_score"]) if r.get("avg_risk_score") is not None else 0.0
            }
            for r in sem_trends_raw
        ]

        # 8. Top Risk Factor Drivers across all high/medium risk students
        factor_counts = {
            "Attendance Below 75%": 0,
            "Active Academic Backlogs": 0,
            "Low GPA (< 6.0)": 0,
            "Low Assignment Completion (< 60%)": 0,
            "Internal Exam Deficit (< 50)": 0,
            "Low Classroom Engagement": 0,
            "Financial Hardship Reported": 0
        }
        students_all = cursor.execute("""
            SELECT s.*, p.risk_category
            FROM students s
            JOIN (
                SELECT p1.student_id, p1.risk_category
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            WHERE p.risk_category IN ('HIGH RISK', 'MEDIUM RISK');
        """).fetchall()

        for s in students_all:
            if s["attendance_pct"] < 75.0:
                factor_counts["Attendance Below 75%"] += 1
            if "backlog" in str(s["previous_semester_result"]).lower() and "0 backlog" not in str(s["previous_semester_result"]).lower():
                factor_counts["Active Academic Backlogs"] += 1
            if s["gpa"] < 6.0:
                factor_counts["Low GPA (< 6.0)"] += 1
            if s["assignment_completion_pct"] < 60.0:
                factor_counts["Low Assignment Completion (< 60%)"] += 1
            if s["internal_marks"] < 50.0:
                factor_counts["Internal Exam Deficit (< 50)"] += 1
            if s["engagement_level"] == "Low":
                factor_counts["Low Classroom Engagement"] += 1
            if s["financial_support_needed"] == 1:
                factor_counts["Financial Hardship Reported"] += 1

        factors_summary = [
            {"factor": k, "count": v} for k, v in factor_counts.items()
        ]
        factors_summary.sort(key=lambda x: x["count"], reverse=True)

        # 9. Priority Attention List: High Risk students with low attendance
        priority_attention = cursor.execute("""
            SELECT s.student_id, s.first_name, s.last_name, s.department, s.semester,
                   s.attendance_pct, s.gpa, p.risk_score, p.risk_category,
                   (SELECT COUNT(*) FROM counseling_sessions cs WHERE cs.student_id = s.student_id) as session_count
            FROM students s
            JOIN (
                SELECT p1.student_id, p1.risk_score, p1.risk_category
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            WHERE p.risk_category = 'HIGH RISK'
            ORDER BY p.risk_score DESC, s.attendance_pct ASC
            LIMIT 6;
        """).fetchall()

        # 10. Recent Activity Timeline
        recent_activity = cursor.execute("""
            SELECT action, user_name, entity_type, details, timestamp
            FROM audit_logs
            ORDER BY id DESC
            LIMIT 8;
        """).fetchall()

        result = {
            "kpis": {
                "total_students": total_students,
                "high_risk": high_risk_count,
                "medium_risk": medium_risk_count,
                "low_risk": low_risk_count,
                "awaiting_counseling": awaiting_counseling,
                "followups_due": followups_due
            },
            "risk_distribution": [
                {"name": "Low Risk", "value": low_risk_count, "color": "#10b981"},
                {"name": "Medium Risk", "value": medium_risk_count, "color": "#f59e0b"},
                {"name": "High Risk", "value": high_risk_count, "color": "#ef4444"}
            ],
            "department_breakdown": dept_risk,
            "scatter_plot": scatter_data,
            "semester_trends": sem_trends,
            "risk_factors": factors_summary,
            "priority_attention": priority_attention,
            "recent_activity": recent_activity
        }
        _dashboard_cache = result
        _dashboard_cache_time = now
        return result

@router.get("/risk-analysis")
def get_risk_analysis(
    department: Optional[str] = Query(None),
    semester: Optional[int] = Query(None)
):
    global _risk_cache
    cache_key = f"{department}:{semester}"
    now = time.time()
    if cache_key in _risk_cache:
        cached_data, cached_time = _risk_cache[cache_key]
        if (now - cached_time) < _CACHE_TTL:
            return cached_data
    with get_db() as conn:
        cursor = conn.cursor()

        where_clauses = ["1=1"]
        params = []
        if department and department != "All":
            where_clauses.append("s.department = ?")
            params.append(department)
        if semester:
            where_clauses.append("s.semester = ?")
            params.append(semester)

        where_sql = " AND ".join(where_clauses)

        students = cursor.execute(f"""
            SELECT s.*, p.risk_score, p.risk_category, p.factors_json, p.recommendations_json
            FROM students s
            JOIN (
                SELECT p1.*
                FROM predictions p1
                INNER JOIN (SELECT student_id, MAX(id) as max_id FROM predictions GROUP BY student_id) p2 ON p1.id = p2.max_id
            ) p ON s.student_id = p.student_id
            WHERE {where_sql}
            ORDER BY p.risk_score DESC;
        """, params).fetchall()

        # Attendance brackets
        att_brackets = {"< 60%": 0, "60-74%": 0, "75-84%": 0, "85-100%": 0}
        gpa_brackets = {"< 5.0": 0, "5.0-6.4": 0, "6.5-7.9": 0, ">= 8.0": 0}

        for st in students:
            att = st["attendance_pct"]
            if att < 60.0:
                att_brackets["< 60%"] += 1
            elif att < 75.0:
                att_brackets["60-74%"] += 1
            elif att < 85.0:
                att_brackets["75-84%"] += 1
            else:
                att_brackets["85-100%"] += 1

            gpa = st["gpa"]
            if gpa < 5.0:
                gpa_brackets["< 5.0"] += 1
            elif gpa < 6.5:
                gpa_brackets["5.0-6.4"] += 1
            elif gpa < 8.0:
                gpa_brackets["6.5-7.9"] += 1
            else:
                gpa_brackets[">= 8.0"] += 1

        result = {
            "total_analyzed": len(students),
            "attendance_brackets": [{"bracket": k, "students": v} for k, v in att_brackets.items()],
            "gpa_brackets": [{"bracket": k, "students": v} for k, v in gpa_brackets.items()],
            "students": students[:20]  # Top at-risk students for preview table
        }
        _risk_cache[cache_key] = (result, now)
        return result
