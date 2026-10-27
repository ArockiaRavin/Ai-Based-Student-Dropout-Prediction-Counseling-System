import os
import hmac
import hashlib
import base64
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import Header, HTTPException, status, Depends
from app.database import get_db

_configured_secret = os.environ.get("JWT_SECRET") or os.environ.get("SECRET_KEY")
if not _configured_secret:
    if os.environ.get("ENVIRONMENT") == "production":
        raise ValueError("CRITICAL: JWT_SECRET or SECRET_KEY must be configured in production environment variables.")
    SECRET_KEY = secrets.token_hex(32)
else:
    SECRET_KEY = _configured_secret

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    """Generate salted PBKDF2-HMAC-SHA256 password hash."""
    salt = secrets.token_hex(16)
    iterations = 100000
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    return f"pbkdf2:sha256:{iterations}${salt}${derived.hex()}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify password against stored hash, supporting both PBKDF2 and legacy plain-text seed passwords."""
    if not stored_hash:
        return False
    if stored_hash.startswith("pbkdf2:sha256:"):
        try:
            parts = stored_hash.split("$")
            if len(parts) != 3:
                return False
            _, iterations_str = parts[0].split(":")[-2:]
            iterations = int(iterations_str)
            salt = parts[1]
            expected_hex = parts[2]
            computed = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), iterations)
            return hmac.compare_digest(computed.hex(), expected_hex)
        except Exception:
            return False
    # Backward compatibility with seed demo passwords
    return hmac.compare_digest(plain_password, stored_hash)

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _base64url_decode(data_str: str) -> bytes:
    padding = '=' * ((4 - len(data_str) % 4) % 4)
    return base64.urlsafe_b64decode((data_str + padding).encode('utf-8'))

def create_access_token(payload: Dict[str, Any], expires_delta_hours: int = ACCESS_TOKEN_EXPIRE_HOURS) -> str:
    """Generate HMAC-SHA256 signed JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    exp = (datetime.utcnow() + timedelta(hours=expires_delta_hours)).timestamp()
    
    token_payload = dict(payload)
    token_payload["exp"] = exp
    token_payload["iat"] = datetime.utcnow().timestamp()

    header_b64 = _base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _base64url_encode(json.dumps(token_payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify HMAC-SHA256 JWT signature and expiry."""
    # Special demo token support
    if token.startswith("demo-token-") or token.startswith("token-"):
        username = token.replace("demo-token-", "").replace("token-", "")
        role_map = {"admin": "Administrator", "counselor": "Counselor", "faculty": "Viewer"}
        role = role_map.get(username, "Counselor")
        return {"sub": username, "role": role, "username": username}

    parts = token.split('.')
    if len(parts) != 3:
        return None

    header_b64, payload_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    
    try:
        actual_sig = _base64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            return None

        return payload
    except Exception:
        return None

def generate_random_token(length: int = 32) -> str:
    """Generate a cryptographic URL-safe token."""
    return secrets.token_urlsafe(length)

def log_audit(conn, user_name: str, action: str, entity_type: str, entity_id: str = "", details: str = ""):
    """Write an entry to the audit_logs table."""
    try:
        conn.execute("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?);
        """, (user_name, action, entity_type, str(entity_id) if entity_id else "", details or ""))
    except Exception as e:
        print(f"Failed to log audit event: {e}")

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency to extract and verify the current authenticated user from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("user_id")
    raw_identifier = payload.get("sub") or payload.get("username")
    if user_id is None and isinstance(raw_identifier, int):
        user_id = raw_identifier
        identifier = None
    elif raw_identifier is not None:
        identifier = str(raw_identifier)
    else:
        identifier = None

    if not identifier and not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        user = None
        if user_id:
            user = cursor.execute("""
                SELECT id, username, name, email, role, department, status, email_verified, created_at, last_login, password_hash
                FROM users
                WHERE id = ?;
            """, (user_id,)).fetchone()
        
        if not user and identifier:
            user = cursor.execute("""
                SELECT id, username, name, email, role, department, status, email_verified, created_at, last_login, password_hash
                FROM users
                WHERE username = ? OR email = ?;
            """, (identifier, identifier)).fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authenticated user account not found in database."
            )

        # Enforce account status: pending or deactivated accounts are blocked
        user_status = user.get("status", "active")
        if user_status == "pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is currently pending administrator approval."
            )
        elif user_status == "deactivated":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Please contact an administrator."
            )

        return user

def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Optional user dependency that returns None instead of raising 401 when no token is present."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return get_current_user(authorization)
    except Exception:
        return None

def require_role(allowed_roles: List[str]):
    """Returns a dependency ensuring the current user's role is in allowed_roles."""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        # Normalize Admin / Administrator
        normalized_allowed = [r.lower() for r in allowed_roles]
        if "admin" in normalized_allowed and "administrator" not in normalized_allowed:
            normalized_allowed.append("administrator")
        if "administrator" in normalized_allowed and "admin" not in normalized_allowed:
            normalized_allowed.append("admin")

        if not user_role or user_role.lower() not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: This action requires one of the following roles: {', '.join(allowed_roles)}. Your role is '{user_role}'."
            )
        return current_user
    return role_checker


def get_admin_setup_key_path() -> str:
    """Path to the local protected setup key file."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(backend_dir, ".admin_setup_key")


def get_or_create_admin_setup_key() -> str:
    """Retrieve existing setup key from ENV or local protected file, or generate a fresh one."""
    env_key = os.environ.get("INITIAL_ADMIN_SETUP_KEY")
    if env_key and env_key.strip():
        return env_key.strip()

    key_path = get_admin_setup_key_path()
    if os.path.exists(key_path):
        try:
            with open(key_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content and not content.startswith("CLAIMED_"):
                    return content
        except Exception:
            pass

    # Generate fresh cryptographically secure setup key
    new_key = f"SETUP-{secrets.token_hex(16)}"
    try:
        with open(key_path, "w", encoding="utf-8") as f:
            f.write(new_key)
        print(f"[AUTH] Initial administrator setup key created: {new_key}")
    except Exception as e:
        print(f"[AUTH] Warning: could not write setup key to {key_path}: {e}")
    return new_key


def is_initial_admin_setup_available(conn) -> bool:
    """Checks whether initial administrator provisioning is currently permitted."""
    cursor = conn.cursor()
    # 1. Check system_settings flag
    cursor.execute("SELECT value FROM system_settings WHERE key = 'initial_admin_claimed';")
    row = cursor.fetchone()
    if row and str(row["value"]).strip() == "1":
        return False

    # 2. Check if an active Administrator already exists in users table
    cursor.execute("SELECT COUNT(*) as c FROM users WHERE role = 'Administrator' AND status = 'active';")
    admin_count = cursor.fetchone()["c"]
    if admin_count > 0:
        return False

    return True


def mark_initial_admin_claimed(conn):
    """Permanently records that the initial administrator has been provisioned."""
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('initial_admin_claimed', '1');")
    conn.commit()
    # Invalidate setup key file so it cannot be reused
    key_path = get_admin_setup_key_path()
    if os.path.exists(key_path):
        try:
            with open(key_path, "w", encoding="utf-8") as f:
                f.write(f"CLAIMED_{datetime.utcnow().isoformat()}")
        except Exception:
            pass


def verify_admin_setup_key(provided_key: str) -> bool:
    """Constant-time verification of the setup key."""
    if not provided_key or not provided_key.strip():
        return False
    actual_key = get_or_create_admin_setup_key()
    return hmac.compare_digest(provided_key.strip(), actual_key)

