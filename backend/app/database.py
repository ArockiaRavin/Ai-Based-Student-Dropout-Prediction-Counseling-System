import sqlite3
import os
import re
from contextlib import contextmanager
from typing import Generator, Any, Optional

try:
    from dotenv import load_dotenv
    # Search for .env in backend directory, then project root
    for p in [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    ]:
        if os.path.exists(p):
            load_dotenv(p)
except ImportError:
    pass

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    RealDictCursor = None

DATABASE_URL = os.getenv("DATABASE_URL", "")
IS_POSTGRES = PSYCOPG2_AVAILABLE and (
    DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")
)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "student_retention.db")

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

class PostgresCursorWrapper:
    """
    Adapter cursor providing SQLite-compatible API over psycopg2 RealDictCursor:
    - Translates SQLite '?' parameter markers to PostgreSQL '%s'
    - Translates 'INSERT OR IGNORE' to PostgreSQL 'ON CONFLICT DO NOTHING'
    - Populates cursor.lastrowid via automatic RETURNING id
    - Supports method chaining: cursor.execute(...).fetchone() / fetchall()
    - Returns rows as standard Python dictionaries
    - Ignores SQLite PRAGMAs gracefully
    """
    def __init__(self, cur):
        self._cur = cur
        self.lastrowid: Optional[int] = None

    @property
    def description(self):
        return self._cur.description

    @property
    def rowcount(self):
        return self._cur.rowcount

    def _convert_sql(self, sql: str) -> tuple[str, bool]:
        s = sql.strip()
        if s.upper().startswith("PRAGMA"):
            return "SELECT 1;", False

        # Replace ? with %s outside string literals
        pattern = r"('(?:''|[^'])*'|\?(?!'))"
        def repl(match):
            token = match.group(0)
            if token == "?":
                return "%s"
            return token
        converted = re.sub(pattern, repl, s)

        # Handle INSERT OR REPLACE syntax
        if "INSERT OR REPLACE INTO system_settings" in converted:
            converted = converted.replace("INSERT OR REPLACE INTO system_settings", "INSERT INTO system_settings")
            if "ON CONFLICT" not in converted.upper():
                converted = converted.rstrip("; ") + " ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value"
        elif "INSERT OR REPLACE INTO students" in converted:
            converted = converted.replace("INSERT OR REPLACE INTO students", "INSERT INTO students")
            if "ON CONFLICT" not in converted.upper():
                converted = converted.rstrip("; ") + " ON CONFLICT (student_id) DO NOTHING"
        elif "INSERT OR REPLACE INTO" in converted:
            converted = converted.replace("INSERT OR REPLACE INTO", "INSERT INTO")
            if "ON CONFLICT" not in converted.upper():
                converted = converted.rstrip("; ") + " ON CONFLICT DO NOTHING"

        # Handle INSERT OR IGNORE syntax
        if "INSERT OR IGNORE INTO system_settings" in converted:
            converted = converted.replace("INSERT OR IGNORE INTO system_settings", "INSERT INTO system_settings")
            if "ON CONFLICT" not in converted.upper():
                converted = converted.rstrip("; ") + " ON CONFLICT (key) DO NOTHING"
        elif "INSERT OR IGNORE INTO users" in converted:
            converted = converted.replace("INSERT OR IGNORE INTO users", "INSERT INTO users")
            if "ON CONFLICT" not in converted.upper():
                converted = converted.rstrip("; ") + " ON CONFLICT (username) DO NOTHING"
        elif "INSERT OR IGNORE INTO students" in converted:
            converted = converted.replace("INSERT OR IGNORE INTO students", "INSERT INTO students")
            if "ON CONFLICT" not in converted.upper():
                converted = converted.rstrip("; ") + " ON CONFLICT (student_id) DO NOTHING"
        elif "INSERT OR IGNORE INTO" in converted:
            converted = converted.replace("INSERT OR IGNORE INTO", "INSERT INTO")
            if "ON CONFLICT" not in converted.upper():
                converted = converted.rstrip("; ") + " ON CONFLICT DO NOTHING"

        # Convert SQLite datetime('now') to PostgreSQL timestamp
        converted = re.sub(r"datetime\(\s*'now'\s*\)", "to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')", converted, flags=re.IGNORECASE)

        # Ensure ROUND(AVG(...), N) casts to numeric in PostgreSQL
        converted = re.sub(
            r"ROUND\(\s*(AVG\([^)]+\))\s*,\s*(\d+)\s*\)",
            r"ROUND(CAST(\1 AS numeric), \2)",
            converted,
            flags=re.IGNORECASE
        )

        # Check if we should append RETURNING id for lastrowid
        has_returning = False
        upper = converted.upper()
        if upper.startswith("INSERT INTO") and "RETURNING" not in upper and "ON CONFLICT" not in upper:
            converted = converted.rstrip("; ") + " RETURNING id;"
            has_returning = True

        return converted, has_returning

    def execute(self, sql: str, params=None):
        converted_sql, has_returning = self._convert_sql(sql)
        if params is not None:
            if isinstance(params, (list, tuple)):
                self._cur.execute(converted_sql, params)
            else:
                self._cur.execute(converted_sql, (params,))
        else:
            self._cur.execute(converted_sql)

        if has_returning:
            try:
                row = self._cur.fetchone()
                if row:
                    self.lastrowid = row["id"] if isinstance(row, dict) else row[0]
            except Exception:
                self.lastrowid = None

        return self

    def executemany(self, sql: str, seq_of_params):
        converted_sql, _ = self._convert_sql(sql)
        self._cur.executemany(converted_sql, seq_of_params)
        return self

    def fetchone(self):
        row = self._cur.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self):
        rows = self._cur.fetchall()
        return [dict(r) for r in rows]

    def close(self):
        self._cur.close()

    def __iter__(self):
        for r in self._cur:
            yield dict(r)

class PostgresConnectionWrapper:
    """Connection wrapper ensuring psycopg2 compatibility with SQLite code."""
    def __init__(self, conn):
        self._conn = conn

    def cursor(self):
        return PostgresCursorWrapper(self._conn.cursor(cursor_factory=RealDictCursor))

    def execute(self, sql: str, params=None):
        cur = self.cursor()
        return cur.execute(sql, params)

    def executemany(self, sql: str, seq_of_params):
        cur = self.cursor()
        return cur.executemany(sql, seq_of_params)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

_pg_pool: Optional[Any] = None

def _get_pg_pool():
    global _pg_pool
    if _pg_pool is None and IS_POSTGRES:
        try:
            from psycopg2 import pool
            _pg_pool = pool.ThreadedConnectionPool(
                minconn=2,
                maxconn=10,
                dsn=DATABASE_URL,
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=5
            )
        except Exception as e:
            print(f"Warning: Failed to initialize ThreadedConnectionPool: {e}")
            _pg_pool = None
    return _pg_pool

@contextmanager
def get_db() -> Generator[Any, None, None]:
    if IS_POSTGRES:
        pool_inst = _get_pg_pool()
        conn = None
        is_from_pool = False

        if pool_inst is not None:
            try:
                conn = pool_inst.getconn()
                if conn.closed != 0:
                    conn = pool_inst.getconn()
                is_from_pool = True
            except Exception:
                conn = psycopg2.connect(DATABASE_URL)
                is_from_pool = False
        else:
            conn = psycopg2.connect(DATABASE_URL)

        wrapped_conn = PostgresConnectionWrapper(conn)
        try:
            yield wrapped_conn
            wrapped_conn.commit()
        except Exception:
            wrapped_conn.rollback()
            raise
        finally:
            if is_from_pool and pool_inst is not None and conn is not None:
                try:
                    pool_inst.putconn(conn)
                except Exception:
                    try:
                        conn.close()
                    except Exception:
                        pass
            elif conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass
    else:
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
    if IS_POSTGRES:
        _init_postgres_db()
    else:
        _init_sqlite_db()

def _init_postgres_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 0. PostgreSQL round(double precision, integer) compatibility function
        cursor.execute("""
        CREATE OR REPLACE FUNCTION round(val double precision, places integer)
        RETURNS numeric AS $$
        BEGIN
            RETURN round(val::numeric, places);
        END;
        $$ LANGUAGE plpgsql IMMUTABLE;
        """)

        # 1. Users table
        cursor.execute("""
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
            created_at TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
        );
        """)

        # 2. Students table
        cursor.execute("""
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
        """)

        # 3. Predictions table
        cursor.execute("""
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
        """)

        # 4. Counseling Sessions table
        cursor.execute("""
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
        """)

        # 5. Interventions table
        cursor.execute("""
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
        """)

        # 6. Notifications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
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
        """)

        # 8. Audit Logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
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

        cursor.executemany("""
            INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING;
        """, [
            ("require_admin_approval", "0"),
            ("allow_public_registration", "1"),
            ("institution_name", "EduRetain Institute of Technology"),
            ("auto_assign_counselors", "1"),
            ("retention_threshold", "65.0"),
            ("initial_admin_claimed", "0")
        ])

        # Indices for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_student ON predictions(student_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_counseling_student ON counseling_sessions(student_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);")

def _init_sqlite_db():
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
            status TEXT NOT NULL DEFAULT 'active',
            email_verified INTEGER NOT NULL DEFAULT 1,
            verification_token TEXT,
            reset_token TEXT,
            reset_token_expires TEXT,
            last_login TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Migration: Ensure all auth columns exist in existing users table
        existing_cols = [row["name"] for row in cursor.execute("PRAGMA table_info(users);").fetchall()]
        if "status" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';")
        if "email_verified" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1;")
        if "verification_token" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN verification_token TEXT;")
        if "reset_token" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token TEXT;")
        if "reset_token_expires" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expires TEXT;")
        if "last_login" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN last_login TEXT;")

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

        cursor.executemany("""
            INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?);
        """, [
            ("require_admin_approval", "0"),
            ("allow_public_registration", "1"),
            ("institution_name", "EduRetain Institute of Technology"),
            ("auto_assign_counselors", "1"),
            ("retention_threshold", "65.0"),
            ("initial_admin_claimed", "0")
        ])

        # Indices for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_student ON predictions(student_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_counseling_student ON counseling_sessions(student_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);")
