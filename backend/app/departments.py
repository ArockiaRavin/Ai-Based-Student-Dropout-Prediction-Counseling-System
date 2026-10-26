"""
Comprehensive Academic Departments Catalog and Validation
Categorized by academic disciplines.
"""

from typing import Dict, List, Optional

DEPARTMENT_CATEGORIES: Dict[str, List[str]] = {
    "Engineering & Technology": [
        "Computer Science and Engineering (CSE)",
        "Information Technology (IT)",
        "Artificial Intelligence and Data Science (AI & DS)",
        "Artificial Intelligence and Machine Learning (AI & ML)",
        "Computer Science and Business Systems (CSBS)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering (MECH)",
        "Civil Engineering (CIVIL)",
        "Biomedical Engineering (BME)",
        "Biotechnology",
        "Chemical Engineering",
        "Mechatronics Engineering",
        "Robotics and Automation",
        "Cyber Security",
        "Computer Science and Engineering (Data Science)",
        "Internet of Things (IoT)",
        "Agricultural Engineering",
        "Automobile Engineering",
        "Aerospace Engineering",
        "Aeronautical Engineering",
        "Information Science and Engineering",
        "Electronics and Instrumentation Engineering",
        "Food Technology",
        "Textile Technology",
        "Production Engineering",
    ],
    "Science & Computer Applications": [
        "Computer Applications (BCA / MCA)",
        "Computer Science",
        "Information Systems",
        "Data Science",
        "Mathematics",
        "Statistics",
        "Physics",
        "Chemistry",
        "Biotechnology",
        "Microbiology",
        "Biochemistry",
        "Environmental Science",
        "Electronics",
        "Artificial Intelligence",
    ],
    "Arts & Humanities": [
        "English",
        "Tamil",
        "History",
        "Economics",
        "Political Science",
        "Sociology",
        "Psychology",
        "Journalism and Mass Communication",
        "Visual Communication",
        "Social Work",
        "Geography",
        "Philosophy",
        "Languages",
    ],
    "Commerce & Management": [
        "Commerce (B.Com)",
        "Accounting and Finance",
        "Corporate Secretaryship",
        "Business Administration (BBA / MBA)",
        "Business Management",
        "Human Resource Management",
        "Finance",
        "Marketing",
        "International Business",
        "Banking and Insurance",
        "Logistics and Supply Chain Management",
        "Hotel Management and Catering Technology",
        "Tourism and Travel Management",
    ],
    "Medical & Allied Health Sciences": [
        "Medicine (MBBS)",
        "Nursing",
        "Pharmacy",
        "Physiotherapy",
        "Medical Laboratory Technology",
        "Radiology and Imaging Technology",
        "Public Health",
        "Nutrition and Dietetics",
        "Optometry",
        "Occupational Therapy",
        "Dental Surgery (BDS)",
        "Veterinary Science",
        "Health Information Management",
    ],
    "Education, Law & Other Fields": [
        "Education (B.Ed / M.Ed)",
        "Law (LLB / LLM)",
        "Architecture",
        "Planning",
        "Design",
        "Agriculture",
        "Fisheries Science",
        "Food Science and Technology",
        "Library and Information Science",
        "Other",
    ],
}

# Flattened set for quick validation
ALL_KNOWN_DEPARTMENTS = set()
for dept_list in DEPARTMENT_CATEGORIES.values():
    ALL_KNOWN_DEPARTMENTS.update(dept_list)

# Also support legacy department values from previous seeds
LEGACY_DEPARTMENTS = {
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical & Electronics",
    "Mechanical Engineering",
    "Student Welfare & Guidance",
    "Administration",
    "Academic Affairs",
    "General"
}
ALL_KNOWN_DEPARTMENTS.update(LEGACY_DEPARTMENTS)


def normalize_department(dept: Optional[str]) -> str:
    """
    Validates and normalizes department names.
    Supports predefined options as well as custom names entered under 'Other'.
    """
    if not dept or not dept.strip():
        return "Computer Science and Engineering (CSE)"

    cleaned = dept.strip()

    # If it starts with "Other: ", extract clean custom name
    if cleaned.lower().startswith("other:"):
        custom = cleaned[6:].strip()
        return custom if custom else "Other"

    # Limit length for database sanity
    if len(cleaned) > 120:
        cleaned = cleaned[:120]

    return cleaned
