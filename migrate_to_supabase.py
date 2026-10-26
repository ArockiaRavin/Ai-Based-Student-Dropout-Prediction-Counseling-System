import os
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
import json

try:
    from dotenv import load_dotenv
    for p in [
        os.path.join(os.path.dirname(__file__), "backend", ".env"),
        os.path.join(os.path.dirname(__file__), ".env")
    ]:
        if os.path.exists(p):
            load_dotenv(p)
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is missing. "
        "Please provide DATABASE_URL in your backend/.env file before running migration."
    )
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "backend", "student_retention.db")


SCHEMA_SQL = """
-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Counselor',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    email_verified INTEGER NOT NULL DEFAULT 1,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires TEXT,
    last_login TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
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

-- 3. Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
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

-- 4. Counseling Sessions table
CREATE TABLE IF NOT EXISTS counseling_sessions (
    id SERIAL PRIMARY KEY,
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

-- 5. Interventions table
CREATE TABLE IF NOT EXISTS interventions (
    id SERIAL PRIMARY KEY,
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

-- 6. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'alert',
    is_read INTEGER NOT NULL DEFAULT 0,
    student_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Model Versions table
CREATE TABLE IF NOT EXISTS model_versions (
    id SERIAL PRIMARY KEY,
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

-- 8. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_predictions_student ON predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_counseling_student ON counseling_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);
"""

TABLES_ORDER = [
    "system_settings",
    "users",
    "students",
    "predictions",
    "counseling_sessions",
    "interventions",
    "notifications",
    "model_versions",
    "audit_logs"
]

def migrate():
    print(f"Connecting to Supabase Postgres: {DATABASE_URL[:45]}...")
    pg_conn = psycopg2.connect(DATABASE_URL)
    pg_cur = pg_conn.cursor()

    print("Creating schema in Supabase Postgres...")
    pg_cur.execute(SCHEMA_SQL)
    pg_conn.commit()
    print("Schema created successfully!")

    if not os.path.exists(SQLITE_DB_PATH):
        print(f"No SQLite file found at {SQLITE_DB_PATH}, nothing to migrate.")
        pg_conn.close()
        return

    print(f"Connecting to local SQLite DB: {SQLITE_DB_PATH}...")
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    for table in TABLES_ORDER:
        # Check SQLite row count
        sqlite_cur.execute(f"SELECT * FROM {table}")
        rows = sqlite_cur.fetchall()
        if not rows:
            print(f"  [-] Table '{table}': 0 rows in SQLite (Skipping)")
            continue

        columns = [col[0] for col in sqlite_cur.description]
        col_names = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))

        # Check existing rows in Postgres
        pg_cur.execute(f"SELECT COUNT(*) FROM {table}")
        pg_cnt = pg_cur.fetchone()[0]

        if pg_cnt > 0:
            print(f"  [i] Table '{table}' already has {pg_cnt} rows in Supabase. Skipping insert.")
        else:
            insert_sql = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
            if table == "system_settings":
                insert_sql += " ON CONFLICT (key) DO NOTHING"
            elif "id" in columns:
                insert_sql += " ON CONFLICT (id) DO NOTHING"
            
            data_to_insert = [tuple(r[c] for c in columns) for r in rows]
            pg_cur.executemany(insert_sql, data_to_insert)
            pg_conn.commit()
            print(f"  [+] Table '{table}': Successfully migrated {len(rows)} rows to Supabase!")

            # Reset auto-increment sequence if id column exists
            if "id" in columns:
                try:
                    pg_cur.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE((SELECT MAX(id) FROM {table}), 1), true);")
                    pg_conn.commit()
                except Exception as e:
                    print(f"      (Sequence reset note for {table}: {e})")

    # Verify counts in Supabase
    print("\n--- Verifying Supabase Tables and Counts ---")
    for table in TABLES_ORDER:
        pg_cur.execute(f"SELECT COUNT(*) FROM {table}")
        cnt = pg_cur.fetchone()[0]
        print(f"  * {table}: {cnt} rows")

    pg_cur.close()
    pg_conn.close()
    sqlite_conn.close()
    print("\nAll data successfully migrated and verified in Supabase!")

if __name__ == "__main__":
    migrate()
