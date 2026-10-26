from fastapi import APIRouter, HTTPException, Depends, status, Header
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import secrets

from app.models import (
    UserLogin, UserResponse, UserRegister, UserCreateAdmin, UserEditAdmin, UserProfileUpdate,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest,
    UserStatusUpdate, UserRoleUpdate, SetupAdminRequest
)
from app.database import get_db
from app.departments import normalize_department
from app.auth_utils import (
    hash_password, verify_password, create_access_token,
    generate_random_token, log_audit, get_current_user, require_role,
    is_initial_admin_setup_available, mark_initial_admin_claimed,
    verify_admin_setup_key, get_or_create_admin_setup_key
)

router = APIRouter(prefix="", tags=["auth_and_users"])

# ==========================================
# 0. INITIAL ADMINISTRATOR SETUP ENDPOINTS
# ==========================================

@router.get("/auth/setup-admin/status")
def get_setup_admin_status():
    """Checks whether initial administrator bootstrap is permitted."""
    with get_db() as conn:
        available = is_initial_admin_setup_available(conn)
        if available:
            get_or_create_admin_setup_key()
        return {
            "setup_available": available,
            "message": "Initial administrator setup is active. Enter the Server Setup Key to proceed." if available else "Initial administrator setup has already been completed and is permanently locked."
        }


@router.post("/auth/setup-admin")
def setup_initial_admin(payload: SetupAdminRequest):
    """
    Secure atomic one-time setup endpoint for the project owner to create their initial Administrator account.
    Enforces server setup key authorization and permanently disables further setup attempts.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Atomic check if setup is available
        if not is_initial_admin_setup_available(conn):
            log_audit(conn, "SYSTEM", "UNAUTHORIZED_ADMIN_SETUP_ATTEMPT", "system", None, f"Attempted admin setup on locked system from {payload.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Initial administrator setup has already been completed and is permanently locked."
            )

        # 2. Verify Server Setup Key
        if not verify_admin_setup_key(payload.setup_key):
            log_audit(conn, "SYSTEM", "INVALID_ADMIN_SETUP_KEY", "system", None, f"Invalid setup key attempt for {payload.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Server Setup Key. Please verify the key in 'backend/.admin_setup_key' or server console."
            )

        # 3. Validation
        email_clean = payload.email.strip().lower()
        if "@" not in email_clean or "." not in email_clean:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter a valid institutional email address.")

        if len(payload.password) < 8:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters long.")

        username_clean = payload.username.strip().lower() if payload.username and payload.username.strip() else email_clean.split("@")[0]
        dept_clean = normalize_department(payload.department)
        hashed_pw = hash_password(payload.password)

        # 4. Check if demo admin (id=1, username='admin') exists to upgrade/replace, or insert new
        existing_demo = cursor.execute("SELECT id FROM users WHERE username = 'admin' AND email = 'admin@eduretain.edu';").fetchone()

        if existing_demo:
            admin_id = existing_demo["id"]
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
            """, (username_clean, hashed_pw, payload.name.strip(), email_clean, dept_clean, admin_id))
        else:
            duplicate = cursor.execute("SELECT id FROM users WHERE LOWER(email) = ? OR username = ?;", (email_clean, username_clean)).fetchone()
            if duplicate:
                admin_id = duplicate["id"]
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
                """, (hashed_pw, payload.name.strip(), dept_clean, admin_id))
            else:
                cursor.execute("""
                    INSERT INTO users (username, password_hash, role, name, email, department, status, email_verified, created_at, last_login)
                    VALUES (?, ?, 'Administrator', ?, ?, ?, 'active', 1, datetime('now'), datetime('now'));
                """, (username_clean, hashed_pw, payload.name.strip(), email_clean, dept_clean))
                admin_id = cursor.lastrowid

        # 5. Permanently lock initial admin setup
        mark_initial_admin_claimed(conn)

        log_audit(conn, payload.name.strip(), "INITIAL_ADMIN_PROVISIONED", "users", str(admin_id), f"Primary administrator {email_clean} successfully provisioned via setup key.")

        # 6. Issue Administrator JWT token immediately
        token = create_access_token({
            "sub": username_clean,
            "user_id": admin_id,
            "role": "Administrator",
            "email": email_clean
        })

        return {
            "message": "Initial administrator account provisioned successfully! Administrator clearance active.",
            "token": token,
            "user": {
                "id": admin_id,
                "username": username_clean,
                "name": payload.name.strip(),
                "email": email_clean,
                "role": "Administrator",
                "department": dept_clean,
                "status": "active",
                "email_verified": 1
            }
        }


# ==========================================
# 1. AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/auth/register")
def register(payload: UserRegister):
    # Security Rule: Never allow public registration as Administrator
    requested_role = payload.role.strip()
    if requested_role.lower() in ["admin", "administrator"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin accounts cannot be self-registered. They must be provisioned by an authorized administrator."
        )

    # Valid public roles
    if requested_role not in ["Counselor", "Viewer"]:
        requested_role = "Counselor"

    email_clean = payload.email.strip().lower()
    username_clean = email_clean.split("@")[0]

    with get_db() as conn:
        cursor = conn.cursor()

        # Check existing email
        existing = cursor.execute("SELECT id FROM users WHERE LOWER(email) = ? OR username = ?;", (email_clean, username_clean)).fetchone()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please sign in instead."
            )

        # Check system settings for registration approval
        approval_setting = cursor.execute("SELECT value FROM system_settings WHERE key = 'require_admin_approval';").fetchone()
        require_approval = approval_setting["value"] == "1" if approval_setting else False

        user_status = "pending" if require_approval else "active"
        verification_token = generate_random_token(24)
        hashed_pw = hash_password(payload.password)

        cursor.execute("""
            INSERT INTO users (username, password_hash, role, name, email, department, status, email_verified, verification_token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
        """, (
            username_clean,
            hashed_pw,
            requested_role,
            payload.name.strip(),
            email_clean,
            normalize_department(payload.department),
            user_status,
            1 if not require_approval else 0,
            verification_token
        ))

        new_user_id = cursor.lastrowid
        log_audit(conn, payload.name, "USER_REGISTER", "users", str(new_user_id), f"Self-registered as {requested_role} (status: {user_status})")

        # Create access token if active
        token = None
        if user_status == "active":
            token = create_access_token({
                "sub": username_clean,
                "user_id": new_user_id,
                "role": requested_role,
                "email": email_clean
            })

        return {
            "message": "Registration successful!" if user_status == "active" else "Registration successful! Your account is pending administrator approval before you can sign in.",
            "status": user_status,
            "token": token,
            "verification_token": verification_token,
            "user": {
                "id": new_user_id,
                "username": username_clean,
                "name": payload.name.strip(),
                "email": email_clean,
                "role": requested_role,
                "department": payload.department.strip() or "Student Welfare",
                "status": user_status,
                "email_verified": 1 if not require_approval else 0
            }
        }

@router.post("/auth/login")
def login(payload: UserLogin):
    identifier = payload.username.strip()
    
    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("""
            SELECT id, username, name, email, role, department, password_hash, status, email_verified, created_at
            FROM users
            WHERE username = ? OR LOWER(email) = LOWER(?);
        """, (identifier, identifier)).fetchone()

        # If user identifier matches role alias, look up the actual registered account for that role
        if not user and identifier.lower() == "admin":
            user = cursor.execute("SELECT * FROM users WHERE role = 'Administrator' ORDER BY id ASC LIMIT 1;").fetchone()
        elif not user and identifier.lower() == "counselor":
            user = cursor.execute("SELECT * FROM users WHERE role = 'Counselor' ORDER BY id ASC LIMIT 1;").fetchone()
        elif not user and identifier.lower() == "faculty":
            user = cursor.execute("SELECT * FROM users WHERE role = 'Viewer' ORDER BY id ASC LIMIT 1;").fetchone()

        if not user or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password. Please verify your credentials."
            )

        # Enforce Account Status
        user_status = user.get("status", "active")
        if user_status == "pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is currently pending administrator approval. Please contact your institution administrator."
            )
        elif user_status == "deactivated":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated by an administrator. Please reach out for support."
            )

        # Update last login
        cursor.execute("UPDATE users SET last_login = datetime('now') WHERE id = ?;", (user["id"],))
        log_audit(conn, user["name"], "USER_LOGIN", "users", str(user["id"]), f"User logged in ({user['role']})")

        token = create_access_token({
            "sub": user["username"],
            "user_id": user["id"],
            "role": user["role"],
            "email": user["email"]
        })

        return {
            "token": token,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "department": user["department"],
                "status": user["status"],
                "email_verified": user.get("email_verified", 1),
                "created_at": user.get("created_at")
            }
        }

@router.get("/auth/me")
def get_current_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_safe = {k: v for k, v in current_user.items() if k != "password_hash"}
    return {"user": user_safe}

@router.put("/auth/me")
def update_current_profile(
    payload: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Allows the authenticated user to safely update their permitted profile fields (Name, Academic Department, Password).
    Role, Email, and Status are restricted from self-mutation and must be modified by an Administrator.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        user_id = current_user["id"]
        user = cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User profile not found in database.")

        updates = []
        params = []

        if payload.name is not None and payload.name.strip():
            updates.append("name = ?")
            params.append(payload.name.strip())

        if payload.department is not None and payload.department.strip():
            dept_normalized = normalize_department(payload.department.strip())
            updates.append("department = ?")
            params.append(dept_normalized)

        # Handle Password Change if requested
        if payload.new_password:
            if not payload.current_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to change your account password."
                )
            if not verify_password(payload.current_password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password does not match. Please verify your credentials."
                )
            if len(payload.new_password) < 8:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="New password must be at least 8 characters in length."
                )
            new_hash = hash_password(payload.new_password)
            updates.append("password_hash = ?")
            params.append(new_hash)

        if updates:
            params.append(user_id)
            cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?;", params)

        log_audit(
            conn,
            current_user["name"],
            "PROFILE_UPDATED",
            "users",
            str(user_id),
            f"User updated their profile details."
        )

        updated_user = cursor.execute("""
            SELECT id, username, name, email, role, department, status, email_verified, created_at, last_login
            FROM users WHERE id = ?;
        """, (user_id,)).fetchone()

        return {
            "message": "Your profile information was updated successfully.",
            "user": updated_user
        }

@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    email_clean = payload.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, name, email FROM users WHERE LOWER(email) = ?;", (email_clean,)).fetchone()
        
        if not user:
            # Prevent email enumeration: return standard response
            return {
                "message": "If this email address exists in our system, password reset instructions have been dispatched.",
                "reset_token": None
            }

        reset_token = generate_random_token(32)
        expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()

        cursor.execute("""
            UPDATE users
            SET reset_token = ?, reset_token_expires = ?
            WHERE id = ?;
        """, (reset_token, expires_at, user["id"]))

        log_audit(conn, user["name"], "PASSWORD_RESET_REQUEST", "users", str(user["id"]), f"Password reset requested for {user['email']}")

        return {
            "message": "Password reset instructions have been generated. Use the link or token below to set a new password.",
            "reset_token": reset_token,
            "expires_in": "1 hour"
        }

@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest):
    token = payload.reset_token.strip()
    new_pw = payload.new_password.strip()

    if len(new_pw) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters in length."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("""
            SELECT id, name, email, reset_token_expires
            FROM users
            WHERE reset_token = ?;
        """, (token,)).fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token."
            )

        if user.get("reset_token_expires"):
            try:
                exp_dt = datetime.fromisoformat(user["reset_token_expires"])
                if datetime.utcnow() > exp_dt:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="The password reset token has expired. Please request a new one."
                    )
            except ValueError:
                pass

        hashed_pw = hash_password(new_pw)
        cursor.execute("""
            UPDATE users
            SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL
            WHERE id = ?;
        """, (hashed_pw, user["id"]))

        log_audit(conn, user["name"], "PASSWORD_RESET_SUCCESS", "users", str(user["id"]), "Password successfully updated.")

        return {"message": "Your password has been successfully reset. You may now log in with your new credentials."}

@router.post("/auth/verify-email")
def verify_email(payload: VerifyEmailRequest):
    token = payload.token.strip()
    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, name, email FROM users WHERE verification_token = ?;", (token,)).fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token."
            )

        cursor.execute("UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?;", (user["id"],))
        log_audit(conn, user["name"], "EMAIL_VERIFIED", "users", str(user["id"]), f"Email {user['email']} verified.")

        return {"message": "Email address successfully verified! You may now sign in."}

@router.post("/auth/resend-verification")
def resend_verification(payload: ForgotPasswordRequest):
    email_clean = payload.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, name, email, email_verified FROM users WHERE LOWER(email) = ?;", (email_clean,)).fetchone()

        if not user:
            return {"message": "If the account exists, a verification link has been dispatched."}

        new_token = generate_random_token(24)
        cursor.execute("UPDATE users SET verification_token = ? WHERE id = ?;", (new_token, user["id"]))

        return {
            "message": "Verification email resent successfully.",
            "verification_token": new_token
        }

@router.post("/auth/logout")
def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        log_audit(conn, current_user["name"], "USER_LOGOUT", "users", str(current_user["id"]), "User signed out.")
    return {"message": "Signed out successfully."}

# ==========================================
# 2. USER MANAGEMENT ENDPOINTS (ADMIN ONLY)
# ==========================================

@router.get("/users")
def list_users(current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))):
    with get_db() as conn:
        cursor = conn.cursor()
        users = cursor.execute("""
            SELECT id, username, name, email, role, department, status, email_verified, created_at, last_login
            FROM users
            ORDER BY id ASC;
        """).fetchall()
        return {"users": users, "total": len(users)}

@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("""
            SELECT id, username, name, email, role, department, status, email_verified, created_at, last_login
            FROM users WHERE id = ?;
        """, (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")
        return {"user": user}

@router.put("/users/{user_id}")
def update_user_by_admin(
    user_id: int,
    payload: UserEditAdmin,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, name, email, role, status FROM users WHERE id = ?;", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        updates = []
        params = []
        if payload.name is not None and payload.name.strip():
            updates.append("name = ?")
            params.append(payload.name.strip())
        if payload.department is not None and payload.department.strip():
            dept_norm = normalize_department(payload.department.strip())
            updates.append("department = ?")
            params.append(dept_norm)
        if payload.status is not None:
            if payload.status not in ["active", "pending", "deactivated"]:
                raise HTTPException(status_code=400, detail="Invalid status. Must be 'active', 'pending', or 'deactivated'.")
            if user_id == current_user["id"] and payload.status == "deactivated":
                raise HTTPException(status_code=400, detail="You cannot deactivate your own administrator account.")
            updates.append("status = ?")
            params.append(payload.status)

        if updates:
            params.append(user_id)
            cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?;", params)

        log_audit(
            conn,
            current_user["name"],
            "ADMIN_EDIT_USER",
            "users",
            str(user_id),
            f"Admin modified user record for {user['name']}"
        )

        updated_user = cursor.execute("""
            SELECT id, username, name, email, role, department, status, email_verified, created_at, last_login
            FROM users WHERE id = ?;
        """, (user_id,)).fetchone()

        return {
            "message": "User details successfully updated.",
            "user": updated_user
        }

@router.post("/users")
def create_user_by_admin(
    payload: UserCreateAdmin,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    email_clean = payload.email.strip().lower()
    username_clean = payload.username.strip() if payload.username else email_clean.split("@")[0]

    # STRENGTHENED ADMIN SECURITY: Re-authentication verification for creating Administrator accounts
    if payload.role.strip() in ["Administrator", "Admin"]:
        if not payload.admin_password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security policy requires administrator password confirmation to provision an Administrator account."
            )
        if not verify_password(payload.admin_password, current_user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator verification failed: Incorrect administrator password. Administrator account creation denied."
            )

    if len(payload.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account initial password must be at least 8 characters in length."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        existing = cursor.execute("SELECT id FROM users WHERE LOWER(email) = ? OR username = ?;", (email_clean, username_clean)).fetchone()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address or username already exists in the system."
            )

        hashed_pw = hash_password(payload.password)
        cursor.execute("""
            INSERT INTO users (username, password_hash, role, name, email, department, status, email_verified, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'));
        """, (
            username_clean,
            hashed_pw,
            payload.role,
            payload.name.strip(),
            email_clean,
            normalize_department(payload.department),
            payload.status or "active"
        ))

        new_id = cursor.lastrowid
        log_audit(
            conn,
            current_user["name"],
            "ADMIN_CREATE_USER",
            "users",
            str(new_id),
            f"Admin {current_user['email']} created account {email_clean} with role '{payload.role}' in department '{payload.department}'"
        )

        return {
            "message": f"Account for {payload.name.strip()} ({payload.role}) provisioned successfully.",
            "user_id": new_id
        }

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    if payload.status not in ["active", "pending", "deactivated"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'active', 'pending', or 'deactivated'.")

    # Prevent admin from deactivating themselves
    if user_id == current_user["id"] and payload.status == "deactivated":
        raise HTTPException(status_code=400, detail="You cannot deactivate your own administrator account.")

    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, name, email, role, status FROM users WHERE id = ?;", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        cursor.execute("UPDATE users SET status = ? WHERE id = ?;", (payload.status, user_id))
        log_audit(conn, current_user["name"], "UPDATE_USER_STATUS", "users", str(user_id), f"Changed status of {user['name']} to '{payload.status}'")

        return {"message": f"User status updated to '{payload.status}'.", "status": payload.status}

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    if payload.role not in ["Administrator", "Counselor", "Viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'Administrator', 'Counselor', or 'Viewer'.")

    # STRENGTHENED ADMIN SECURITY: Re-authentication verification when promoting any user to Administrator
    if payload.role == "Administrator":
        if not payload.admin_password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security policy requires administrator password confirmation to promote a user to Administrator."
            )
        if not verify_password(payload.admin_password, current_user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator verification failed: Incorrect administrator password. Promotion to Administrator denied."
            )

    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, name, email, role FROM users WHERE id = ?;", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        # If demoting an admin, ensure at least one other admin exists
        if user["role"] == "Administrator" and payload.role != "Administrator":
            admin_count = cursor.execute("SELECT COUNT(*) as c FROM users WHERE role = 'Administrator';").fetchone()["c"]
            if admin_count <= 1:
                raise HTTPException(status_code=400, detail="Cannot demote the last administrator in the system.")

        cursor.execute("UPDATE users SET role = ? WHERE id = ?;", (payload.role, user_id))
        log_audit(
            conn,
            current_user["name"],
            "UPDATE_USER_ROLE",
            "users",
            str(user_id),
            f"Changed role of {user['name']} from '{user['role']}' to '{payload.role}'"
        )

        return {"message": f"User role successfully updated to '{payload.role}'.", "role": payload.role}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: Dict[str, Any] = Depends(require_role(["Administrator"]))
):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own active administrator account.")

    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, name, role FROM users WHERE id = ?;", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        if user["role"] == "Administrator":
            admin_count = cursor.execute("SELECT COUNT(*) as c FROM users WHERE role = 'Administrator';").fetchone()["c"]
            if admin_count <= 1:
                raise HTTPException(status_code=400, detail="Cannot delete the sole administrator account.")

        cursor.execute("DELETE FROM users WHERE id = ?;", (user_id,))
        log_audit(conn, current_user["name"], "DELETE_USER", "users", str(user_id), f"Deleted user {user['name']} ({user['role']})")

        return {"message": f"User {user['name']} was successfully deleted."}

# ==========================================
# 3. NOTIFICATIONS ENDPOINTS
# ==========================================

@router.get("/notifications")
def list_notifications():
    with get_db() as conn:
        cursor = conn.cursor()
        notes = cursor.execute("""
            SELECT id, title, message, type, is_read, student_id, created_at
            FROM notifications
            ORDER BY id DESC
            LIMIT 25;
        """).fetchall()

        unread_count = sum(1 for n in notes if not n["is_read"])

        return {
            "notifications": notes,
            "unread_count": unread_count
        }

@router.put("/notifications/{note_id}/read")
def mark_notification_read(note_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?;", (note_id,))
        return {"message": "Notification marked as read"}
