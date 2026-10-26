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

        # Database statistics
        student_count = cursor.execute("SELECT COUNT(*) as c FROM students;").fetchone()["c"]
        pred_count = cursor.execute("SELECT COUNT(*) as c FROM predictions;").fetchone()["c"]
        session_count = cursor.execute("SELECT COUNT(*) as c FROM counseling_sessions;").fetchone()["c"]
        int_count = cursor.execute("SELECT COUNT(*) as c FROM interventions;").fetchone()["c"]
        user_count = cursor.execute("SELECT COUNT(*) as c FROM users;").fetchone()["c"]

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
