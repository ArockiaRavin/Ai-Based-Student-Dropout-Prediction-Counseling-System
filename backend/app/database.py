import sqlite3
import os
from contextlib import contextmanager
from typing import Generator

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "student_retention.db")

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Counselor',
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            department TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Students table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            department TEXT NOT NULL,
            semester INTEGER NOT NULL,
            attendance_pct REAL NOT NULL,
            gpa REAL NOT NULL,
            internal_marks REAL NOT NULL,
            assignment_completion_pct REAL NOT NULL,
            previous_semester_result TEXT NOT NULL,
            engagement_level TEXT NOT NULL,
            financial_support_needed INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Enrolled',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 3. Predictions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            model_used TEXT NOT NULL,
            risk_score REAL NOT NULL,
            risk_category TEXT NOT NULL,
            factors_json TEXT NOT NULL,
            positive_indicators_json TEXT NOT NULL,
            recommendations_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
        );
        """)

        # 4. Counseling Sessions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS counseling_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            counselor_name TEXT NOT NULL,
            session_date TEXT NOT NULL,
            support_category TEXT NOT NULL,
            notes TEXT NOT NULL,
            action_plan TEXT NOT NULL,
            follow_up_date TEXT,
            status TEXT NOT NULL DEFAULT 'Completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
        );
        """)

        # 5. Interventions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS interventions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            assigned_to TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'New',
            target_date TEXT NOT NULL,
            outcome_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
        );
        """)

        # 6. Notifications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'alert',
            is_read INTEGER NOT NULL DEFAULT 0,
            student_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 7. Model Versions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS model_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_name TEXT NOT NULL,
            algorithm TEXT NOT NULL,
            accuracy REAL NOT NULL,
            precision REAL NOT NULL,
            recall REAL NOT NULL,
            f1_score REAL NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 0,
            trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metrics_json TEXT NOT NULL
        );
        """)

        # 8. Audit Logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT,
            details TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 9. System Settings table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        """)

        # Indices for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_student ON predictions(student_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_counseling_student ON counseling_sessions(student_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);")
