from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.database import get_db, init_db
from app.seed import seed_database
import os

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("")
def get_settings():
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("SELECT key, value FROM system_settings;").fetchall()
        settings_dict = {r["key"]: r["value"] for r in rows}

        audit_logs = cursor.execute("""
            SELECT id, user_name, action, entity_type, entity_id, details, timestamp
            FROM audit_logs
            ORDER BY id DESC
            LIMIT 20;
        """).fetchall()

        # Database statistics
        student_count = cursor.execute("SELECT COUNT(*) as c FROM students;").fetchone()["c"]
        pred_count = cursor.execute("SELECT COUNT(*) as c FROM predictions;").fetchone()["c"]
        session_count = cursor.execute("SELECT COUNT(*) as c FROM counseling_sessions;").fetchone()["c"]
        int_count = cursor.execute("SELECT COUNT(*) as c FROM interventions;").fetchone()["c"]

        return {
            "settings": settings_dict,
            "audit_logs": audit_logs,
            "database_stats": {
                "total_students": student_count,
                "total_predictions": pred_count,
                "counseling_sessions": session_count,
                "interventions": int_count,
                "db_engine": "SQLite 3 (Development Fallback)",
                "storage_mode": "Persistent Local Relational DB"
            }
        }

@router.put("")
def update_settings(payload: Dict[str, Any] = Body(...)):
    with get_db() as conn:
        cursor = conn.cursor()
        for k, v in payload.items():
            cursor.execute("""
                INSERT OR REPLACE INTO system_settings (key, value)
                VALUES (?, ?);
            """, (str(k), str(v)))

        cursor.execute("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?);
        """, ("Admin", "UPDATE_SETTINGS", "SystemSettings", "config", f"Updated system configuration: {list(payload.keys())}"))

    return {"message": "Settings updated successfully"}

@router.post("/reset-demo-data")
def reset_demo_data():
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
