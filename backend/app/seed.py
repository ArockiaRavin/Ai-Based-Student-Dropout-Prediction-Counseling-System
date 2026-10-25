import json
import random
from app.database import get_db, init_db
from app.ml.pipeline import ml_system

DEPARTMENTS = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical & Electronics",
    "Mechanical Engineering"
]

FIRST_NAMES = [
    "Aarav", "Aditi", "Ananya", "Arjun", "Deepak", "Divya", "Gautam", "Harini",
    "Ishaan", "Kavya", "Madhav", "Meera", "Nikhil", "Pooja", "Pranav", "Priya",
    "Rahul", "Rohan", "Sanjay", "Sneha", "Tarun", "Varun", "Vignesh", "Yamini",
    "Abhishek", "Bhavna", "Chirag", "Dinesh", "Esha", "Farhan", "Geeta", "Hari",
    "Indira", "Jatin", "Kiran", "Lakshmi", "Manish", "Neha", "Omkar", "Pavithra",
    "Raghav", "Ritu", "Sameer", "Tanvi", "Uday", "Vidya", "Yash", "Zoya",
    "Karthik", "Swathi", "Akash", "Shreya", "Naveen", "Archana", "Suresh", "Gayathri",
    "Manoj", "Keerthi", "Balaji", "Deepika"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Iyer", "Nair", "Rao", "Kumar",
    "Singh", "Chopra", "Menon", "Joshi", "Deshmukh", "Pillai", "Gupta", "Bose",
    "Banerjee", "Chatterjee", "Mishra", "Pandey", "Kulkarni", "Shenoy", "Bhat", "Hegde"
]

def seed_database():
    init_db()
    ml_system.load_or_train()

    with get_db() as conn:
        cursor = conn.cursor()

        # Check if already seeded
        cursor.execute("SELECT COUNT(*) as cnt FROM students;")
        if cursor.fetchone()["cnt"] > 0:
            print("Database already has records. Skipping seed.")
            return

        print("Seeding database with realistic sample student records...")

        # 1. Users
        users = [
            ("admin", "admin123", "Administrator", "Dr. Rajesh Ramanathan", "admin@eduretain.edu", "Administration"),
            ("counselor", "counselor123", "Counselor", "Prof. Sunita Krishnan", "counselor@eduretain.edu", "Student Welfare"),
            ("faculty", "faculty123", "Viewer", "Dr. Amitava Sen", "faculty@eduretain.edu", "Academic Affairs")
        ]
        cursor.executemany("""
            INSERT INTO users (username, password_hash, role, name, email, department)
            VALUES (?, ?, ?, ?, ?, ?);
        """, users)

        # 2. Students & Predictions
        random.seed(42)
        total_students = 60

        student_records = []
        for i in range(total_students):
            first = FIRST_NAMES[i % len(FIRST_NAMES)]
            last = LAST_NAMES[(i * 3 + 7) % len(LAST_NAMES)]
            dept = DEPARTMENTS[i % len(DEPARTMENTS)]
            semester = (i % 8) + 1
            roll_no = f"STU{2022 + (semester // 2):04d}{dept[:2].upper()}{101 + i:03d}"
            email = f"{first.lower()}.{last.lower()}@eduretain.edu"

            # Profile archetypes:
            # First 18: High Risk
            # Next 18: Medium Risk
            # Remaining 24: Low Risk
            if i < 18:
                # High Risk
                attendance = round(random.uniform(42.0, 68.0), 1)
                gpa = round(random.uniform(3.8, 5.8), 2)
                internal = round(random.uniform(28.0, 48.0), 1)
                assignment = round(random.uniform(28.0, 56.0), 1)
                backlogs = random.choice([1, 2, 3])
                prev_res = f"Fail - {backlogs} Backlog{'s' if backlogs > 1 else ''}"
                engagement = random.choice(["Low", "Low", "Medium"])
                financial = random.choice([0, 1, 1])
            elif i < 36:
                # Medium Risk
                attendance = round(random.uniform(62.0, 73.5), 1)
                gpa = round(random.uniform(5.4, 6.5), 2)
                internal = round(random.uniform(45.0, 58.0), 1)
                assignment = round(random.uniform(52.0, 68.0), 1)
                backlogs = random.choice([1, 1, 2])
                prev_res = f"Pass - {backlogs} Backlog" if backlogs == 1 else f"Fail - {backlogs} Backlogs"
                engagement = random.choice(["Medium", "Medium", "Low"])
                financial = random.choice([0, 1])
            else:
                # Low Risk
                attendance = round(random.uniform(82.0, 97.0), 1)
                gpa = round(random.uniform(7.8, 9.6), 2)
                internal = round(random.uniform(72.0, 94.0), 1)
                assignment = round(random.uniform(85.0, 99.0), 1)
                prev_res = "Pass - Distinction" if gpa >= 8.5 else "Pass - First Class"
                engagement = random.choice(["High", "High", "Medium"])
                financial = 0

            cursor.execute("""
                INSERT INTO students (
                    student_id, first_name, last_name, email, department, semester,
                    attendance_pct, gpa, internal_marks, assignment_completion_pct,
                    previous_semester_result, engagement_level, financial_support_needed, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                roll_no, first, last, email, dept, semester,
                attendance, gpa, internal, assignment,
                prev_res, engagement, financial, "Enrolled"
            ))

            student_input = {
                "attendance_pct": attendance,
                "gpa": gpa,
                "internal_marks": internal,
                "assignment_completion_pct": assignment,
                "previous_semester_result": prev_res,
                "engagement_level": engagement,
                "financial_support_needed": financial,
                "semester": semester
            }

            pred = ml_system.predict_student(student_input, model_name="Random Forest")

            cursor.execute("""
                INSERT INTO predictions (
                    student_id, model_used, risk_score, risk_category,
                    factors_json, positive_indicators_json, recommendations_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (
                roll_no,
                pred["model_used"],
                pred["risk_score"],
                pred["risk_category"],
                json.dumps(pred["factors"]),
                json.dumps(pred["positive_indicators"]),
                json.dumps(pred["recommendations"])
            ))

            student_records.append((roll_no, f"{first} {last}", pred["risk_category"]))

        # 3. Counseling sessions & Interventions for High and Medium Risk students
        counselor_names = ["Prof. Sunita Krishnan", "Dr. Rajesh Ramanathan", "Dr. Amitava Sen"]
        
        # High risk students get counseling sessions & active interventions
        high_risk_students = [s for s in student_records if s[2] == "HIGH RISK"]
        med_risk_students = [s for s in student_records if s[2] == "MEDIUM RISK"]

        for idx, (s_id, name, cat) in enumerate(high_risk_students[:12]):
            counselor = counselor_names[idx % len(counselor_names)]
            cursor.execute("""
                INSERT INTO counseling_sessions (
                    student_id, counselor_name, session_date, support_category,
                    notes, action_plan, follow_up_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                s_id,
                counselor,
                f"2026-10-{10 + (idx % 12):02d}",
                "Attendance Improvement" if idx % 2 == 0 else "Academic Support",
                f"Conducted 1-on-1 diagnostic review with {name}. Discussed attendance deficits and exam preparation roadblocks. Student expressed willingness to attend remedial tutoring.",
                "1. Sign attendance commitment slip\n2. Attend 4 remedial sessions weekly in mathematics/circuits\n3. Bi-weekly review with department counselor.",
                f"2026-11-{5 + (idx % 15):02d}",
                "Completed"
            ))

            cursor.execute("""
                INSERT INTO interventions (
                    student_id, title, description, category,
                    assigned_to, status, target_date, outcome_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                s_id,
                "Remedial Tutoring & Faculty Mentor Assignment",
                f"Pair {name} with faculty tutor for high-backlog courses and monitor weekly assignment submissions.",
                "Academic Support",
                counselor,
                "In Progress" if idx % 2 == 0 else "Scheduled",
                f"2026-11-20",
                "Student attended 2 introductory tutoring sessions. Positive initial engagement."
            ))

            # Add notification
            cursor.execute("""
                INSERT INTO notifications (title, message, type, student_id)
                VALUES (?, ?, ?, ?);
            """, (
                f"High Dropout Risk Alert: {name}",
                f"{name} ({s_id}) flagged in High Risk category with attendance deficits. Counseling initiated.",
                "alert",
                s_id
            ))

        # Add some interventions for medium risk students
        for idx, (s_id, name, cat) in enumerate(med_risk_students[:8]):
            counselor = counselor_names[(idx + 1) % len(counselor_names)]
            cursor.execute("""
                INSERT INTO interventions (
                    student_id, title, description, category,
                    assigned_to, status, target_date, outcome_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                s_id,
                "Mid-Semester Engagement Check-in",
                f"Review internal test performance and lab submissions with {name}.",
                "Mentoring",
                counselor,
                "New" if idx % 2 == 0 else "Completed",
                f"2026-11-15",
                "Successfully met with student; identified time management as primary hurdle."
            ))

        # 4. Audit logs
        audit_entries = [
            ("admin", "INITIALIZE_SYSTEM", "System", "1", "Initialized database schema and seeded demonstration cohort"),
            ("admin", "TRAIN_MODELS", "MLPipeline", "v1.0", "Trained Random Forest, Decision Tree, and Logistic Regression on benchmark dataset"),
            ("counselor", "CREATE_SESSION", "CounselingSession", high_risk_students[0][0], f"Recorded counseling session for {high_risk_students[0][1]}"),
            ("counselor", "CREATE_INTERVENTION", "Intervention", high_risk_students[1][0], f"Created academic support intervention for {high_risk_students[1][1]}")
        ]
        cursor.executemany("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?);
        """, audit_entries)

        # 5. System settings
        settings = [
            ("institution_name", "National Institute of Engineering & Technology"),
            ("academic_year", "2026 - 2027"),
            ("active_ml_model", "Random Forest"),
            ("high_risk_threshold", "65.0"),
            ("medium_risk_threshold", "35.0"),
            ("email_notifications_enabled", "true"),
            ("auto_alert_counselor", "true")
        ]
        cursor.executemany("""
            INSERT OR REPLACE INTO system_settings (key, value)
            VALUES (?, ?);
        """, settings)

        print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
