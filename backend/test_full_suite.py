"""
FastAPI TestClient verification test for:
1. Profile management (GET /api/auth/me, PUT /api/auth/me)
2. Admin security & password verification for admin creation & promotion
3. RBAC role enforcement (Admin, Counselor, Viewer)
4. Initial admin setup lockout when admin exists
5. Audit logging verification
"""
import sys
import os
from starlette.testclient import TestClient

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from app.main import app

def run_tests():
    client = TestClient(app)
    print("=== STARTING BACKEND TEST VERIFICATION ===")
    
    # 1. Login as Director Ravin (Administrator)
    print("\n[Test 1] Authenticating as Administrator (director.ravin@institution.edu)...")
    res = client.post("/api/auth/login", json={
        "username": "director.ravin@institution.edu",
        "password": "SecureAdmin2026!"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    admin_token = res.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[OK] Admin logged in successfully.")

    # 2. Test GET /api/auth/me for Admin
    print("\n[Test 2] Fetching Profile (GET /api/auth/me)...")
    res = client.get("/api/auth/me", headers=admin_headers)
    assert res.status_code == 200, f"GET /api/auth/me failed: {res.text}"
    user_data = res.json()["user"]
    assert user_data["username"] == "director.ravin"
    assert user_data["role"] == "Administrator"
    assert "password" not in user_data
    assert "password_hash" not in user_data
    print(f"[OK] Profile loaded correctly: Name='{user_data['name']}', Role='{user_data['role']}', Email='{user_data['email']}'")

    # 3. Test Profile Update (PUT /api/auth/me)
    print("\n[Test 3] Updating Profile (PUT /api/auth/me)...")
    original_name = user_data["name"]
    res = client.put("/api/auth/me", headers=admin_headers, json={
        "name": "Dr. Ravin Administrator Updated",
        "department": "Computer Science & Engineering (CSE)"
    })
    assert res.status_code == 200, f"Update profile failed: {res.text}"
    updated_user = res.json()["user"]
    assert updated_user["name"] == "Dr. Ravin Administrator Updated"
    
    # Restore name
    client.put("/api/auth/me", headers=admin_headers, json={
        "name": original_name,
        "department": "Artificial Intelligence and Data Science (AI & DS)"
    })
    print("[OK] Profile successfully updated and database change verified.")

    # 4. Test Initial Admin Setup Lockout
    print("\n[Test 4] Verifying Initial Admin Setup is locked because admin exists...")
    res = client.get("/api/auth/setup-admin/status")
    assert res.status_code == 200
    assert res.json()["setup_available"] is False, "Setup should be locked!"

    res = client.post("/api/auth/setup-admin", json={
        "setup_key": "some_random_key_123",
        "name": "Hacker Admin",
        "email": "hacker@test.edu",
        "password": "Password123!",
        "department": "Computer Science"
    })
    assert res.status_code in [400, 401, 403], f"Initial admin setup should fail, got: {res.status_code}"
    print("[OK] Initial Admin setup is completely locked against unauthorized provisioning.")

    # 5. Test Non-Admin cannot create users or promote roles
    print("\n[Test 5] Authenticating as Counselor (ds.prof@institution.edu)...")
    res = client.post("/api/auth/login", json={
        "username": "ds.prof@institution.edu",
        "password": "Password123!"
    })
    assert res.status_code == 200, f"Counselor login failed: {res.text}"
    counselor_token = res.json()["token"]
    counselor_headers = {"Authorization": f"Bearer {counselor_token}"}
    
    # Counselor attempting to get all users
    res = client.get("/api/users", headers=counselor_headers)
    assert res.status_code == 403, f"Counselor should be forbidden from GET /api/users, got {res.status_code}"
    
    # Counselor attempting to create user
    res = client.post("/api/users", headers=counselor_headers, json={
        "username": "unauth_user",
        "email": "unauth@test.edu",
        "name": "Unauth User",
        "role": "Counselor",
        "department": "Computer Science & Engineering",
        "password": "Password123!"
    })
    assert res.status_code == 403, f"Counselor should be forbidden from POST /api/users, got {res.status_code}"
    print("[OK] Counselor is strictly forbidden from Admin user management (403 Forbidden).")

    # 6. Test Admin Creating Counselor (Works without admin password)
    print("\n[Test 6] Admin creating new Counselor account...")
    test_counselor_username = f"counselor_test_{os.getpid()}"
    res = client.post("/api/users", headers=admin_headers, json={
        "username": test_counselor_username,
        "email": f"{test_counselor_username}@test.edu",
        "name": "Test Counselor RBAC",
        "role": "Counselor",
        "department": "Information Technology (IT)",
        "password": "Password123!"
    })
    assert res.status_code in [201, 200], f"Create counselor failed: {res.text}"
    new_user_id = res.json()["user_id"]
    print("[OK] Counselor account creation verified.")

    # 7. Test Admin Creating Administrator WITHOUT admin password (Must be rejected)
    print("\n[Test 7] Admin creating Administrator WITHOUT admin password (Must fail)...")
    res = client.post("/api/users", headers=admin_headers, json={
        "username": "fake_admin_no_pw",
        "email": "fakeadmin@test.edu",
        "name": "Fake Admin",
        "role": "Administrator",
        "department": "Computer Science & Engineering",
        "password": "Password123!",
        "admin_password": "" # Missing or empty
    })
    assert res.status_code in [400, 403], f"Expected 400/403 for missing admin password, got {res.status_code}"
    assert "administrator password" in res.json().get("detail", "").lower()
    print("[OK] Administrator creation without password verification was blocked as required.")

    # 8. Test Admin Creating Administrator WITH WRONG admin password (Must be rejected)
    print("\n[Test 8] Admin creating Administrator WITH WRONG admin password (Must fail)...")
    res = client.post("/api/users", headers=admin_headers, json={
        "username": "fake_admin_wrong_pw",
        "email": "fakeadmin2@test.edu",
        "name": "Fake Admin 2",
        "role": "Administrator",
        "department": "Computer Science & Engineering",
        "password": "Password123!",
        "admin_password": "WrongPassword999!"
    })
    assert res.status_code == 403, f"Expected 403 for incorrect admin password, got {res.status_code}"
    assert "incorrect administrator password" in res.json().get("detail", "").lower()
    print("[OK] Administrator creation with incorrect password was rejected (403 Forbidden).")

    # 9. Test Role Promotion to Administrator without password (Must fail)
    print("\n[Test 9] Promoting user to Administrator without password (Must fail)...")
    res = client.put(f"/api/users/{new_user_id}/role", headers=admin_headers, json={
        "role": "Administrator",
        "admin_password": ""
    })
    assert res.status_code in [400, 403], f"Expected 400/403 for missing admin password on promotion, got {res.status_code}"
    assert "administrator password" in res.json().get("detail", "").lower()
    print("[OK] Role promotion to Administrator without password verification was rejected.")

    # 10. Test Role Promotion to Administrator WITH VALID password (Must succeed)
    print("\n[Test 10] Promoting user to Administrator WITH VALID password (Must succeed)...")
    res = client.put(f"/api/users/{new_user_id}/role", headers=admin_headers, json={
        "role": "Administrator",
        "admin_password": "SecureAdmin2026!"
    })
    assert res.status_code == 200, f"Role promotion with password failed: {res.text}"
    assert res.json()["role"] == "Administrator"
    print("[OK] Role promotion to Administrator with valid password succeeded.")

    # 11. Test Audit Logs in Settings
    print("\n[Test 11] Checking Audit Logs are recorded and accessible to Admin...")
    res = client.get("/api/settings", headers=admin_headers)
    assert res.status_code == 200
    audit_logs = res.json().get("audit_logs", [])
    assert len(audit_logs) > 0, "Audit logs should not be empty"
    print(f"[OK] Audit logs verified ({len(audit_logs)} logs found).")

    print("\n=== ALL 11 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
