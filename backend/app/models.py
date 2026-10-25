from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any

class StudentBase(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    email: str
    department: str
    semester: int = Field(..., ge=1, le=8)
    attendance_pct: float = Field(..., ge=0, le=100)
    gpa: float = Field(..., ge=0.0, le=10.0)
    internal_marks: float = Field(..., ge=0, le=100)
    assignment_completion_pct: float = Field(..., ge=0, le=100)
    previous_semester_result: str = "Pass - 0 Backlogs"
    engagement_level: str = "Medium"
    financial_support_needed: int = 0
    status: str = "Enrolled"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    attendance_pct: Optional[float] = None
    gpa: Optional[float] = None
    internal_marks: Optional[float] = None
    assignment_completion_pct: Optional[float] = None
    previous_semester_result: Optional[str] = None
    engagement_level: Optional[str] = None
    financial_support_needed: Optional[int] = None
    status: Optional[str] = None

class StudentResponse(StudentBase):
    id: int
    created_at: str
    updated_at: str
    latest_prediction: Optional[Dict[str, Any]] = None
    active_interventions_count: Optional[int] = 0
    counseling_sessions_count: Optional[int] = 0

class PredictionRequest(BaseModel):
    student_id: Optional[str] = None
    attendance_pct: float = Field(..., ge=0, le=100)
    gpa: float = Field(..., ge=0.0, le=10.0)
    internal_marks: float = Field(..., ge=0, le=100)
    assignment_completion_pct: float = Field(..., ge=0, le=100)
    previous_semester_result: str = "Pass - 0 Backlogs"
    engagement_level: str = "Medium"
    financial_support_needed: int = 0
    semester: int = Field(3, ge=1, le=8)
    model_name: Optional[str] = None

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    student_id: Optional[str] = None
    model_used: str
    risk_score: float
    risk_category: str
    factors: List[str]
    positive_indicators: List[str]
    recommendations: List[str]
    explanation: str
    student_inputs: Dict[str, Any]
    created_at: Optional[str] = None

class CounselingSessionCreate(BaseModel):
    student_id: str
    counselor_name: str
    session_date: str
    support_category: str
    notes: str
    action_plan: str
    follow_up_date: Optional[str] = None
    status: str = "Completed"

class CounselingSessionResponse(CounselingSessionCreate):
    id: int
    created_at: str
    student_name: Optional[str] = None

class InterventionCreate(BaseModel):
    student_id: str
    title: str
    description: str
    category: str
    assigned_to: str
    status: str = "New"
    target_date: str
    outcome_notes: Optional[str] = None

class InterventionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    assigned_to: Optional[str] = None
    status: Optional[str] = None
    target_date: Optional[str] = None
    outcome_notes: Optional[str] = None

class InterventionResponse(InterventionCreate):
    id: int
    created_at: str
    updated_at: str
    student_name: Optional[str] = None
    department: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    email: str
    role: str
    department: str
