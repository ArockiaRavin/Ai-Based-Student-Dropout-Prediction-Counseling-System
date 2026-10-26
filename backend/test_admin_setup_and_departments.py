import urllib.request, json, sys, os

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

print('=== TESTING FIRST ADMINISTRATOR SETUP & DEPARTMENT SELECTION ===')

# Read current setup key
key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.admin_setup_key')
assert os.path.exists(key_path), f'Expected {key_path} to exist'
with open(key_path, 'r', encoding='utf-8') as f:
    valid_key = f.read().strip()
print(f'Read setup key from server: {valid_key[:12]}...')

# 1. Check Setup Status
code, res = call('/auth/setup-admin/status')
assert code == 200, f'Status check failed: {res}'
available_status = res.get('setup_available')
print(f'PASS 1: Setup status check -> available={available_status}')

# 2. Reject setup with invalid key
code, res = call('/auth/setup-admin', 'POST', {
    'setup_key': 'WRONG-KEY-12345',
    'name': 'Attacker',
    'email': 'attacker@bad.com',
    'password': 'Password123!',
    'department': 'Cyber Security'
})
assert code == 401, f'Expected 401 for wrong key, got {code}: {res}'
print('PASS 2: Setup rejected with invalid key (HTTP 401)')

# 3. Successful First-Administrator Setup
code, res = call('/auth/setup-admin', 'POST', {
    'setup_key': valid_key,
    'name': 'Dr. Ravin Administrator',
    'email': 'director.ravin@institution.edu',
    'password': 'SecureAdmin2026!',
    'department': 'Artificial Intelligence and Data Science (AI & DS)'
})
assert code == 200, f'Setup failed: {res}'
assert res['user']['role'] == 'Administrator', f'Role not Administrator: {res}'
assert res['user']['department'] == 'Artificial Intelligence and Data Science (AI & DS)', f'Department mismatch: {res}'
token = res['token']
admin_email = res['user']['email']
admin_role = res['user']['role']
print(f'PASS 3: Primary Administrator successfully provisioned! (User: {admin_email}, Role: {admin_role})')

# 4. Atomic Lock: Second setup attempt must be PERMANENTLY BLOCKED
code, res = call('/auth/setup-admin', 'POST', {
    'setup_key': valid_key,
    'name': 'Second Admin Attempt',
    'email': 'second.admin@institution.edu',
    'password': 'Password123!',
    'department': 'Computer Science'
})
assert code == 403, f'Expected 403 on second setup attempt, got {code}: {res}'
print('PASS 4: Initial setup permanently locked after first provision (HTTP 403)')

# 5. Check Setup Status now shows locked
code, res = call('/auth/setup-admin/status')
assert code == 200 and res.get('setup_available') is False, f'Setup should be unavailable: {res}'
print('PASS 5: Status endpoint correctly reflects setup_available=False')

# 6. Public registration with new department
code, res = call('/auth/register', 'POST', {
    'name': 'Prof. Data Science',
    'email': 'ds.prof@institution.edu',
    'password': 'Password123!',
    'role': 'Counselor',
    'department': 'Artificial Intelligence and Machine Learning (AI & ML)'
})
if code == 200 or (code == 400 and 'already exists' in str(res)):
    print('PASS 6: Counselor registered with AI & ML department')
else:
    raise AssertionError(f'Expected 200, got {code}: {res}')

# 7. Public registration with custom "Other" department
code, res = call('/auth/register', 'POST', {
    'name': 'Dr. Bio Mind',
    'email': 'biomind@institution.edu',
    'password': 'Password123!',
    'role': 'Viewer',
    'department': 'Other: Cognitive Neuroscience'
})
if code == 200 or (code == 400 and 'already exists' in str(res)):
    print('PASS 7: Viewer registered with custom Other: Cognitive Neuroscience department')
else:
    raise AssertionError(f'Expected 200, got {code}: {res}')

# 8. Check Administrator can log in with new credentials
code, res = call('/auth/login', 'POST', {
    'username': 'director.ravin@institution.edu',
    'password': 'SecureAdmin2026!'
})
assert code == 200, f'Admin login failed: {res}'
assert res['user']['role'] == 'Administrator', f'Role not Administrator: {res}'
print('PASS 8: Administrator logged in with newly provisioned credentials')

print('\nALL VERIFICATION TESTS FOR FIRST ADMIN SETUP & DEPARTMENTS PASSED!')
