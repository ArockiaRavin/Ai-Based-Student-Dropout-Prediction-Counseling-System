import urllib.request, json, sys

BASE = 'http://127.0.0.1:8000/api'

def call(path, method='GET', data=None, token=None):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, method=method, headers=headers)
    if data is not None:
        req.data = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body

print('--- RUNNING FULL RBAC SUITE ---')

# 1. Reject Admin Registration
code, res = call('/auth/register', 'POST', {
    'email': 'evil_admin@test.edu',
    'name': 'Hacker',
    'password': 'password123',
    'role': 'Administrator'
})
assert code == 400, f'Expected 400 for Admin registration, got {code}: {res}'
print('PASS 1: Admin self-registration blocked (HTTP 400)')

# 2. Register Counselor
unique_counselor = f'counselor_suite_test@college.edu'
code, res = call('/auth/register', 'POST', {
    'email': unique_counselor,
    'name': 'Dr. Suite Counselor',
    'password': 'Password123!',
    'role': 'Counselor',
    'department': 'Computer Science & Engineering'
})
if code == 400 and ('already exists' in str(res) or 'already registered' in str(res)):
    print('PASS 2: Counselor account already exists, handled gracefully')
else:
    assert code == 200, f'Expected 200, got {code}: {res}'
    print('PASS 2: Counselor registration succeeded')

# 3. Register Viewer
unique_viewer = f'viewer_suite_test@college.edu'
code, res = call('/auth/register', 'POST', {
    'email': unique_viewer,
    'name': 'Dean Viewer',
    'password': 'Password123!',
    'role': 'Viewer'
})
if code == 400 and ('already exists' in str(res) or 'already registered' in str(res)):
    print('PASS 3: Viewer account already exists, handled gracefully')
else:
    assert code == 200, f'Expected 200, got {code}: {res}'
    print('PASS 3: Viewer registration succeeded')

# 4. Admin Login
code, res = call('/auth/login', 'POST', {'username': 'director.ravin@institution.edu', 'password': 'SecureAdmin2026!'})
if code != 200:
    code, res = call('/auth/login', 'POST', {'username': 'admin', 'password': 'password123'})
if code != 200:
    code, res = call('/auth/login', 'POST', {'username': 'admin', 'password': 'admin123'})
assert code == 200, f'Admin login failed: {res}'
admin_token = res.get('token') or res.get('access_token')
print('PASS 4: Admin login succeeded, token issued')

# 5. Counselor Login
code, res = call('/auth/login', 'POST', {'username': 'counselor', 'password': 'counselor123'})
assert code == 200, f'Counselor login failed: {res}'
counselor_token = res.get('token') or res.get('access_token')
print('PASS 5: Counselor login succeeded')

# 6. Viewer Login
code, res = call('/auth/login', 'POST', {'username': 'faculty', 'password': 'faculty123'})
assert code == 200, f'Viewer login failed: {res}'
viewer_token = res.get('token') or res.get('access_token')
print('PASS 6: Viewer login succeeded')

# 7. Role Enforcement: Viewer cannot delete students
code, res = call('/students/1', 'DELETE', token=viewer_token)
assert code == 403, f'Expected 403 for Viewer delete, got {code}: {res}'
print('PASS 7: Viewer student deletion blocked (HTTP 403)')

# 8. Role Enforcement: Counselor cannot access user management
code, res = call('/users', 'GET', token=counselor_token)
assert code == 403, f'Expected 403 for Counselor list users, got {code}: {res}'
print('PASS 8: Counselor user management blocked (HTTP 403)')

# 9. Admin can access user management and audit logs
code, res = call('/users', 'GET', token=admin_token)
assert code == 200 and 'users' in res, f'Admin user list failed: {res}'
users_count = len(res['users'])
print(f'PASS 9: Admin listed {users_count} users successfully')

# 10. Student Email Masking for Viewer
code, res = call('/students?limit=5', 'GET', token=viewer_token)
assert code == 200, f'Viewer get students failed: {res}'
students = res['students']
if students:
    st = students[0]
    email = st.get('email', '')
    print(f'PASS 10: Viewer student email masked: {email}')
    assert '***' in email, f'Email not masked for viewer: {email}'

print('\nALL 10 RBAC API SECURITY SUITE TESTS PASSED PERFECTLY!')
