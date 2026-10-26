#!/usr/bin/env python3
"""
Server CLI Utility: Provision or Reset Initial Administrator Account
This command-line tool allows the project owner to securely create, claim, or reset
the primary Administrator account directly on the host machine without web exposure.

Usage:
    python setup_admin.py
    python setup_admin.py --email admin@institution.edu --name "Director Sharma" --password "SecurePass123!" --department "Computer Science and Engineering (CSE)"
    python setup_admin.py --show-key
"""

import sys
import os
import argparse
import getpass
import sqlite3
from datetime import datetime

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.auth_utils import (
    hash_password, get_or_create_admin_setup_key,
    get_admin_setup_key_path, mark_initial_admin_claimed
)
from app.departments import normalize_department, DEPARTMENT_CATEGORIES
from app.database import get_db, init_db

def main():
    parser = argparse.ArgumentParser(description="EduRetain Administrator Provisioning CLI")
    parser.add_argument("--name", help="Full name of administrator")
    parser.add_argument("--email", help="Institutional email address")
    parser.add_argument("--password", help="Administrator password (min 8 characters)")
    parser.add_argument("--department", default="Administration", help="Academic Department")
    parser.add_argument("--show-key", action="store_true", help="Display the web Server Setup Key")
    parser.add_argument("--force-unlock", action="store_true", help="Force unlock setup if previously claimed")

    args = parser.parse_args()

    # Ensure DB is initialized
    init_db()

    if args.show_key:
        key = get_or_create_admin_setup_key()
        print("\n=======================================================")
        print("          EDURETAIN SERVER SETUP KEY")
        print("=======================================================")
        print(f"Key: {key}")
        print(f"Key File: {get_admin_setup_key_path()}")
        print("Use this key at http://localhost:5173/setup-admin to securely")
        print("provision the administrator account in the web browser.")
        print("=======================================================\n")
        return

    print("\n=======================================================")
    print("      EduRetain Administrator Account Setup CLI")
    print("=======================================================")

    with get_db() as conn:
        cursor = conn.cursor()

        if args.force_unlock:
            cursor.execute("UPDATE system_settings SET value = '0' WHERE key = 'initial_admin_claimed';")
            conn.commit()
            print("[INFO] Initial administrator setup has been unlocked.")

        # Interactive prompts if not provided via args
        name = args.name
        while not name or not name.strip():
            name = input("Enter Administrator Full Name (e.g. Dr. Rajesh Sharma): ").strip()

        email = args.email
        while not email or "@" not in email:
            email = input("Enter Institutional Email Address: ").strip().lower()

        department = args.department
        if not args.department or args.department == "Administration":
            dept_input = input("Enter Academic Department [Default: Administration]: ").strip()
            if dept_input:
                department = dept_input

        department = normalize_department(department)

        password = args.password
        while not password or len(password) < 8:
            if sys.stdin.isatty():
                password = getpass.getpass("Enter Administrator Password (min 8 chars): ")
                confirm = getpass.getpass("Confirm Administrator Password: ")
                if password != confirm:
                    print("[ERROR] Passwords do not match. Try again.\n")
                    password = None
                    continue
            else:
                password = input("Enter Administrator Password (min 8 chars): ").strip()

        username = email.split("@")[0]
        hashed_pw = hash_password(password)

        # Check existing administrator accounts
        cursor.execute("SELECT id, username, email FROM users WHERE role = 'Administrator';")
        existing_admins = cursor.fetchall()

        # If seeded demo admin exists (username='admin', email='admin@eduretain.edu'), replace it
        demo_admin = next((a for a in existing_admins if a["username"] == "admin" and a["email"] == "admin@eduretain.edu"), None)

        if demo_admin:
            admin_id = demo_admin["id"]
            cursor.execute("""
                UPDATE users SET
                    username = ?,
                    password_hash = ?,
                    name = ?,
                    email = ?,
                    department = ?,
                    status = 'active',
                    email_verified = 1,
                    last_login = datetime('now')
                WHERE id = ?;
            """, (username, hashed_pw, name, email, department, admin_id))
            print(f"\n[SUCCESS] Seeded administrator account upgraded to primary administrator.")
        else:
            # Check if user with this email/username already exists
            existing_user = cursor.execute("SELECT id FROM users WHERE LOWER(email) = ? OR username = ?;", (email, username)).fetchone()
            if existing_user:
                admin_id = existing_user["id"]
                cursor.execute("""
                    UPDATE users SET
                        password_hash = ?,
                        role = 'Administrator',
                        name = ?,
                        department = ?,
                        status = 'active',
                        email_verified = 1,
                        last_login = datetime('now')
                    WHERE id = ?;
                """, (hashed_pw, name, department, admin_id))
                print(f"\n[SUCCESS] Existing account upgraded to Administrator.")
            else:
                cursor.execute("""
                    INSERT INTO users (username, password_hash, role, name, email, department, status, email_verified, created_at, last_login)
                    VALUES (?, ?, 'Administrator', ?, ?, ?, 'active', 1, datetime('now'), datetime('now'));
                """, (username, hashed_pw, name, email, department))
                admin_id = cursor.lastrowid
                print(f"\n[SUCCESS] New Administrator account created.")

        # Record claimed status and log audit
        mark_initial_admin_claimed(conn)

        cursor.execute("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, 'CLI_ADMIN_PROVISIONED', 'users', ?, ?);
        """, (name, str(admin_id), f"Administrator {email} provisioned directly via CLI utility."))
        conn.commit()

        print("-------------------------------------------------------")
        print(f" Administrator ID : {admin_id}")
        print(f" Name             : {name}")
        print(f" Username         : {username}")
        print(f" Email            : {email}")
        print(f" Role             : Administrator")
        print(f" Department       : {department}")
        print(f" Status           : active (Verified)")
        print("-------------------------------------------------------")
        print("You may now log in at: http://localhost:5173/login")
        print("=======================================================\n")

if __name__ == "__main__":
    main()
