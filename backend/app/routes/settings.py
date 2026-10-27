from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, Any, Optional
from app.database import get_db, init_db
from app.seed import seed_database
from app.auth_utils import require_role, log_audit, get_optional_user
import os

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("")
def get_settings(current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("SELECT key, value FROM system_settings;").fetchall()
        settings_dict = {r["key"]: r["value"] for r in rows}

        # Restrict administrative audit logs to Administrator role
        is_admin = current_user and current_user.get("role") == "Administrator"
        audit_logs = []
        if is_admin:
            audit_logs = cursor.execute("""
                SELECT id, user_name, action, entity_type, entity_id, details, timestamp
                FROM audit_logs
                ORDER BY id DESC
                LIMIT 50;
            """).fetchall()

        # Database statistics in a single batched query
        stats = cursor.execute("""
            SELECT 
                (SELECT COUNT(*) FROM students) as student_count,
                (SELECT COUNT(*) FROM predictions) as pred_count,
                (SELECT COUNT(*) FROM counseling_sessions) as session_count,
                (SELECT COUNT(*) FROM interventions) as int_count,
                (SELECT COUNT(*) FROM users) as user_count;
        """).fetchone() or {}

        student_count = stats.get("student_count", 0)
        pred_count = stats.get("pred_count", 0)
        session_count = stats.get("session_count", 0)
        int_count = stats.get("int_count", 0)
        user_count = stats.get("user_count", 0)

        return {
            "settings": settings_dict,
            "audit_logs": audit_logs,
            "database_stats": {
                "total_students": student_count,
                "total_predictions": pred_count,
                "counseling_sessions": session_count,
                "interventions": int_count,
                "total_users": user_count,
                "db_engine": "SQLite 3 (Development Fallback)",
                "storage_mode": "Persistent Local Relational DB"
            }
        }

@router.put("")
def update_settings(
    payload: Dict[str, Any] = Body(...),
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        for k, v in payload.items():
            cursor.execute("""
                INSERT OR REPLACE INTO system_settings (key, value)
                VALUES (?, ?);
            """, (str(k), str(v)))

        log_audit(conn, current_user["name"], "UPDATE_SETTINGS", "SystemSettings", "config", f"Updated system configuration: {list(payload.keys())}")

    return {"message": "Settings updated successfully"}

@router.post("/reset-demo-data")
def reset_demo_data(
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    """
    Cleans all operational tables and re-executes seed_database.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM interventions;")
        cursor.execute("DELETE FROM counseling_sessions;")
        cursor.execute("DELETE FROM predictions;")
        cursor.execute("DELETE FROM notifications;")
        cursor.execute("DELETE FROM audit_logs;")
        cursor.execute("DELETE FROM students;")
        cursor.execute("DELETE FROM users;")

    # Reseed
    seed_database()

    return {"message": "Demonstration database successfully reset and re-seeded with 60 students and fresh predictions."}
