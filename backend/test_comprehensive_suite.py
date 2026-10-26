import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== 1. Testing Unauthenticated / Public Endpoints ===")
health_res = client.get("/api/health")
assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
print("[PASS] /api/health -> 200 OK")

admin_status_res = client.get("/api/auth/setup-admin/status")
assert admin_status_res.status_code == 200, f"Setup admin status failed: {admin_status_res.text}"
print("[PASS] /api/auth/setup-admin/status -> 200 OK")

print("\n=== 2. Testing Dashboard Summary & Telemetry ===")
dash_res = client.get("/api/analytics/dashboard-summary")
assert dash_res.status_code == 200, f"Dashboard summary failed: {dash_res.text}"
dash_data = dash_res.json()
assert "kpis" in dash_data, "Missing kpis in dashboard summary"
assert "semester_trends" in dash_data, "Missing semester_trends in dashboard summary"
assert "department_breakdown" in dash_data, "Missing department_breakdown"
print(f"[PASS] /api/analytics/dashboard-summary -> 200 OK (Total Students: {dash_data['kpis']['total_students']}, High Risk: {dash_data['kpis']['high_risk']})")

print("\n=== 3. Testing Authentication & Session Management ===")
# Login as Counselor demo account
login_res = client.post("/api/auth/login", json={"username": "counselor", "password": "counselor123"})
assert login_res.status_code == 200, f"Counselor login failed: {login_res.text}"
token = login_res.json()["token"]
user = login_res.json()["user"]
print(f"[PASS] /api/auth/login -> 200 OK (Authenticated as: {user['name']}, Role: {user['role']})")

# Test /api/auth/me (Session restoration)
headers = {"Authorization": f"Bearer {token}"}
me_res = client.get("/api/auth/me", headers=headers)
assert me_res.status_code == 200, f"Session restoration failed: {me_res.text}"
me_user = me_res.json()["user"]
assert me_user["username"] == "counselor", "User mismatch in /auth/me"
print(f"[PASS] /api/auth/me -> 200 OK (Session validated successfully)")

print("\n=== 4. Testing Students & Dossier Endpoints ===")
students_res = client.get("/api/students", headers=headers)
assert students_res.status_code == 200, f"Students list failed: {students_res.text}"
students_list = students_res.json()["students"]
assert len(students_list) > 0, "No students returned"
sample_student_id = students_list[0]["student_id"]
print(f"[PASS] /api/students -> 200 OK ({len(students_list)} students retrieved)")

# Test individual student dossier
student_detail_res = client.get(f"/api/students/{sample_student_id}", headers=headers)
assert student_detail_res.status_code == 200, f"Student detail failed: {student_detail_res.text}"
print(f"[PASS] /api/students/{sample_student_id} -> 200 OK (Dossier retrieved with prediction & session history)")

print("\n=== 5. Testing Risk Analysis & Predictions ===")
risk_res = client.get("/api/analytics/risk-analysis", headers=headers)
assert risk_res.status_code == 200, f"Risk analysis failed: {risk_res.text}"
print(f"[PASS] /api/analytics/risk-analysis -> 200 OK ({len(risk_res.json().get('students', []))} students evaluated)")

pred_res = client.get("/api/predictions", headers=headers)
assert pred_res.status_code == 200, f"Predictions list failed: {pred_res.text}"
print(f"[PASS] /api/predictions -> 200 OK ({pred_res.json().get('total', 0)} total predictions)")

print("\n=== 6. Testing Counselor Hub & Interventions ===")
sessions_res = client.get("/api/counseling/sessions", headers=headers)
assert sessions_res.status_code == 200, f"Counseling sessions failed: {sessions_res.text}"
print(f"[PASS] /api/counseling/sessions -> 200 OK ({sessions_res.json().get('total', 0)} sessions recorded)")

overview_res = client.get("/api/counseling/overview", headers=headers)
assert overview_res.status_code == 200, f"Counselor overview failed: {overview_res.text}"
print(f"[PASS] /api/counseling/overview -> 200 OK ({len(overview_res.json().get('priority_cases', []))} priority cases)")

int_res = client.get("/api/interventions", headers=headers)
assert int_res.status_code == 200, f"Interventions failed: {int_res.text}"
print(f"[PASS] /api/interventions -> 200 OK ({len(int_res.json().get('interventions', []))} active interventions)")

print("\n=== 7. Testing Reports Generation ===")
rep_overall = client.get("/api/reports/generate?report_type=overall_risk", headers=headers)
assert rep_overall.status_code == 200, f"Overall risk report failed: {rep_overall.text}"
print(f"[PASS] /api/reports/generate (overall_risk) -> 200 OK")

rep_dept = client.get("/api/reports/generate?report_type=department_wise", headers=headers)
assert rep_dept.status_code == 200, f"Department-wise report failed: {rep_dept.text}"
print(f"[PASS] /api/reports/generate (department_wise) -> 200 OK")

rep_high = client.get("/api/reports/generate?report_type=high_risk", headers=headers)
assert rep_high.status_code == 200, f"High risk report failed: {rep_high.text}"
print(f"[PASS] /api/reports/generate (high_risk) -> 200 OK")

print("\n=== 8. Testing Model Insights ===")
insights_res = client.get("/api/model/insights", headers=headers)
assert insights_res.status_code == 200, f"Model insights failed: {insights_res.text}"
print(f"[PASS] /api/model/insights -> 200 OK (Active Model: {insights_res.json().get('active_model')})")

print("\n=== 9. Testing Security & Unauthorized Access Controls ===")
# Accessing /api/auth/me without token MUST return 401
unauth_res = client.get("/api/auth/me")
assert unauth_res.status_code == 401, f"Expected 401 but got: {unauth_res.status_code}"
print("[PASS] Unauthorized access to /api/auth/me rejected with 401")

# Non-admin trying to update settings MUST return 403
forbidden_res = client.put("/api/settings", json={"institution_name": "Test"}, headers=headers)
assert forbidden_res.status_code == 403, f"Expected 403 but got: {forbidden_res.status_code}"
print("[PASS] Non-administrator modification of system settings rejected with 403")

print("\n=== ALL 10 TESTS PASSED CLEANLY! ===")
