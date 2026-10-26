export interface DepartmentCategory {
  category: string;
  departments: string[];
}

export const DEPARTMENT_CATEGORIES: DepartmentCategory[] = [
  {
    category: "Engineering & Technology",
    departments: [
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
      "Production Engineering"
    ]
  },
  {
    category: "Science & Computer Applications",
    departments: [
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
      "Artificial Intelligence"
    ]
  },
  {
    category: "Arts & Humanities",
    departments: [
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
      "Languages"
    ]
  },
  {
    category: "Commerce & Management",
    departments: [
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
      "Tourism and Travel Management"
    ]
  },
  {
    category: "Medical & Allied Health Sciences",
    departments: [
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
      "Health Information Management"
    ]
  },
  {
    category: "Education, Law & Other Fields",
    departments: [
      "Education (B.Ed / M.Ed)",
      "Law (LLB / LLM)",
      "Architecture",
      "Planning",
      "Design",
      "Agriculture",
      "Fisheries Science",
      "Food Science and Technology",
      "Library and Information Science",
      "Other"
    ]
  }
];

export const ALL_DEPARTMENTS: string[] = DEPARTMENT_CATEGORIES.flatMap(c => c.departments);
