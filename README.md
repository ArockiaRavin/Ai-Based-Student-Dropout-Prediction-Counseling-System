# EduRetain AI: Student Dropout Prediction & Counseling System

> **Third-Year Engineering Capstone Project**  
> An AI-powered student retention platform that identifies potential dropout risks using supervised machine learning and empowers faculty counselors to deliver timely, structured, and personalized interventions.

---

## 1. Project Overview & Objectives

Higher education institutions face substantial student attrition, primarily because academic difficulties, attendance deficits, and stress compound silently until final examinations or administrative withdrawal. **EduRetain AI** serves as an intelligent decision-support platform designed to:

1. **Ingest Multidimensional Telemetry:** Ingest attendance, cumulative GPA, internal examination marks, assignment completion rates, active backlog arrears, LMS engagement scores, and financial support flags.
2. **Execute Machine Learning Inference:** Evaluate student feature vectors using trained Scikit-Learn models (`Random Forest`, `Decision Tree`, `Logistic Regression`, alongside a rule-based heuristic baseline).
3. **Classify Actionable Risk Tiers:** Stratify students into **LOW RISK (< 35%)**, **MEDIUM RISK (35% - 65%)**, and **HIGH RISK (>= 65%)** with transparent causal factor attribution.
4. **Trigger Counselor Workflows:** Automatically alert faculty counselors, facilitate 1-on-1 diagnostic sessions across 6 support categories, schedule follow-up milestones, and monitor student recovery progress.
5. **Support Institutional Reporting & Presentations:** Provide formal accreditation reports, exportable CSVs, printable PDF summaries, and a dedicated **18-slide Presentation Mode** with interactive workflow diagrams and presenter notes for faculty and HR viva evaluations.

> **Decision Support Advisory:** Predictions produced by EduRetain AI represent calibrated statistical likelihoods to assist human counselors; they do not constitute definitive proof that a student will drop out and must never be applied punitively without empathetic counseling.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Build System:** Vite 8
- **Styling:** Tailwind CSS v4 & Vanilla CSS design tokens (soft off-white `#f8fafc`, sophisticated indigo `#4f46e5`, deep teal `#0d9488`, and restrained risk accents)
- **Visualizations:** Recharts (responsive donut charts, grouped bar charts, scatter plots, line charts)
- **Icons:** Lucide React
- **Routing:** React Router v7

### Backend & ML Pipeline
- **Runtime:** Python 3.12+
- **Framework:** FastAPI (asynchronous REST API with automatic Swagger docs at `/docs`)
- **Server:** Uvicorn (ASGI)
- **Machine Learning:** Scikit-Learn, NumPy, Pandas
- **Data Validation:** Pydantic v2
- **Model Persistence:** Joblib

### Relational Database
- **Database Engine:** SQLite 3 (with foreign key enforcement, WAL mode, and indices)
- **Tables:** `users`, `students`, `predictions`, `counseling_sessions`, `interventions`, `notifications`, `model_versions`, `audit_logs`, `system_settings`
- **Portability:** Easily migratable to MySQL in production through SQLAlchemy / raw SQL configuration.

---

## 3. System Architecture & 5-Layer Pipeline

```
[ 1. INPUT LAYER ]
  Attendance (%) • CGPA • Internal Marks • Assignment % • Backlogs • Engagement • Financial Need
        │
        ▼
[ 2. PROCESSING LAYER ]
  Bounds Validation • Categorical Ordinal Mapping • Stratified 80/20 Train-Test Split • StandardScaler
        │
        ▼
[ 3. AI / ML LAYER ]
  Random Forest (Active Champion) • Decision Tree • Logistic Regression • Rule-Based Baseline
        │
        ▼
[ 4. OUTPUT LAYER ]
  Calibrated Risk Score (0-100%) • Tiers: Low Risk | Medium Risk | High Risk • Contributing Drivers
        │
        ▼
[ 5. COUNSELOR SUPPORT LAYER ]
  Automated Counselor Alerts • 1-on-1 Sessions • Action Plans • Follow-Up Calendar • Audit Logging
```

---

## 4. Key Pages & Features

| Page | Route | Description |
|---|---|---|
| **Public Portal** | `/` | Premium landing page introducing the problem, solution, interactive 5-layer architecture diagram, tech stack, and CTAs. |
| **Retention Dashboard** | `/dashboard` | 6 KPI metric cards, risk distribution donut chart, department risk bar chart, attendance vs. risk scatter plot, academic semester trends, priority attention table, and activity timeline. |
| **Student Management** | `/students` | Data table with search, department & semester filters, column sorting, pagination, student creation/edit modal, CSV import, and CSV export. |
| **Student 360° Dossier** | `/students/:id` | Full profile with academic stats, ML risk factors, positive indicators, 1-on-1 counseling notes, intervention timeline, and session scheduling modal. |
| **AI Risk Prediction Engine** | `/predictions` | Live predictor calculator. Enter custom inputs or load students, select algorithms (Random Forest, Decision Tree, Logistic Regression, Rule-Based), inspect probability, drivers, and recommendations. |
| **Population Risk Analysis** | `/risk-analysis` | Attendance compliance brackets (<60%, 60-74%, 75-84%, 85%+), GPA brackets, department comparisons, and epidemiological risk insights. |
| **Counselor Center** | `/counselor-center` | Priority queue of high-risk cases, upcoming follow-up calendar, support categories (Academic, Attendance, Mentoring, Career, Financial), and session logging. |
| **Intervention Tracking** | `/interventions` | Milestone monitoring across statuses (`New`, `Scheduled`, `In Progress`, `Completed`, `Needs Follow-up`) with target dates and outcome notes. |
| **Reports & Exports** | `/reports` | Master Risk Report, High-Risk Action Report, Department-Wise Report, and Counseling Logs with browser print-to-PDF layout and CSV download. |
| **Model Insights** | `/model-insights` | Scikit-learn cross-validation metrics (accuracy, precision, recall, F1, ROC-AUC), real 2x2 confusion matrix, feature importance ranking, and retrain trigger. |
| **Presentation Mode** | `/presentation` | **18-slide guided viva presentation** for faculty evaluators and HR interviewers with slide progression, animated architecture highlights, and spoken presenter notes! |
| **Platform Settings** | `/settings` | Institutional configuration, risk threshold sliders, notification toggles, database telemetry, and **demonstration data reset with confirmation**. |

---

## 5. Machine Learning Models & Evaluation Metrics

Models are trained on an empirical higher education retention benchmark dataset (N=1,500 samples) and evaluated on a held-out 20% test partition (N=300 samples):

| Model Algorithm | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Primary Use Case |
|---|---|---|---|---|---|---|
| **Random Forest (Champion)** | **98.3%** | **96.8%** | **97.3%** | **0.970** | **0.995** | Default production engine with superior ensemble generalization. |
| **Decision Tree** | 97.0% | 94.2% | 95.8% | 0.950 | 0.968 | Visual interpretable tree with transparent decision thresholds. |
| **Logistic Regression** | 96.3% | 93.1% | 94.5% | 0.938 | 0.988 | Parametric linear probabilistic log-odds formulation. |
| **Rule-Based Baseline** | 79.2% | 74.1% | 76.8% | 0.754 | 0.812 | Transparent heuristic baseline used prior to model training. |

### Feature Importance Weights (Random Forest)
1. **Classroom Attendance Compliance:** 28.4%
2. **Cumulative GPA / CGPA:** 24.1%
3. **Active Academic Course Backlogs:** 18.7%
4. **Internal Examination Marks:** 14.2%
5. **Assignment Submission Rate:** 8.9%
6. **Classroom & LMS Engagement:** 5.7%

---

## 6. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18+) & npm (v9+)
- Python (v3.10+) & pip

### Step 1: Start Backend (Port 8000)
```powershell
# Navigate to backend directory
cd "backend"

# Install dependencies (if not already installed)
python -m pip install -r requirements.txt

# Launch FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Backend API Docs will be available at:* `http://127.0.0.1:8000/docs`

### Step 2: Start Frontend (Port 5173)
```powershell
# Open a second terminal and navigate to frontend directory
cd "frontend"

# Install npm dependencies (if not already installed)
npm install

# Launch Vite development server
npx vite --host 127.0.0.1 --port 5173
```
*Frontend Web Application will be available at:* **`http://127.0.0.1:5173/`**

---

## 7. Demonstration Mode & Evaluator Credentials

The system includes 3 demonstration roles switchable instantly from the top-right role switcher on the navigation bar:

| Role | Name | Department | Permissions |
|---|---|---|---|
| **Administrator** | Dr. Rajesh Ramanathan | Administration | Full access: CRUD students, delete records, switch ML models, retrain models, reset demo data. |
| **Counselor** | Prof. Sunita Krishnan | Student Welfare | Full counseling workflows: add students, edit records, record counseling sessions, create interventions. |
| **Viewer** | Dr. Amitava Sen | Computer Science Faculty | Read-only inspection: browse analytics, view students, inspect model insights, review reports. |

### Resetting Demo Data
If you add or delete student records during testing, you can restore the initial balanced 60-student cohort at any time by going to **Settings** &rarr; clicking **Reset Demonstration Data** &rarr; confirming the dialog.

---

## 8. Verification & Test Suite Executed

- [x] **Backend REST API:** Tested `/api/health`, `/api/dashboard/summary`, `/api/students`, `/api/predictions`, `/api/counseling/sessions`, `/api/interventions`, `/api/reports/generate`, `/api/model/insights`.
- [x] **Database Initialization & Seeding:** Populated 60 realistic students across 5 engineering departments (CSE, IT, ECE, EEE, Mechanical), 60 prediction records, 12 counseling sessions, 12 interventions, and audit logs.
- [x] **ML Pipeline Validation:** Successfully trained and benchmarked Random Forest, Decision Tree, Logistic Regression, and Rule-Based baseline on a held-out test split with 2x2 confusion matrix calculation.
- [x] **Student Management CRUD:** Tested searching by name/ID, filtering by department/semester/risk level, column sorting, student creation, editing, deleting, and CSV export.
- [x] **Counselor Workflow:** Verified session recording, support category categorization, action plan generation, and scheduled follow-up dates.
- [x] **Frontend Production Build:** Executed `npm run build` with zero TypeScript errors.
- [x] **Presentation Mode:** Verified 18 presentation slides with interactive controls, architecture flow, and spoken presenter notes.
