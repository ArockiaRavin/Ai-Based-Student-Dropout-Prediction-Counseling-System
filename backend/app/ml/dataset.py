import numpy as np
import pandas as pd

def generate_student_ml_dataset(n_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic student academic and engagement dataset modeled on
    empirical higher education retention factors (Tinto's Student Retention Model).
    Features:
    - attendance_pct: float (35.0 - 100.0)
    - gpa: float (2.0 - 10.0)
    - internal_marks: float (20.0 - 100.0)
    - assignment_completion_pct: float (20.0 - 100.0)
    - backlogs_count: int (0 - 5)
    - engagement_score: int (1=Low, 2=Medium, 3=High)
    - financial_support_needed: int (0=No, 1=Yes)
    - semester: int (1 - 8)
    
    Target:
    - dropout_risk: int (0=Retained / Low Risk, 1=At-Risk of Drop-out)
    """
    rng = np.random.default_rng(random_state)
    
    # 70% standard distribution, 30% struggling population
    is_struggling = rng.binomial(1, p=0.30, size=n_samples)
    
    attendance = np.where(
        is_struggling == 1,
        rng.normal(loc=58.0, scale=12.0, size=n_samples),
        rng.normal(loc=84.0, scale=8.0, size=n_samples)
    )
    attendance = np.clip(attendance, 35.0, 99.5)
    
    gpa = np.where(
        is_struggling == 1,
        rng.normal(loc=5.1, scale=1.1, size=n_samples),
        rng.normal(loc=7.8, scale=1.0, size=n_samples)
    )
    gpa = np.clip(gpa, 2.5, 9.8)
    
    internal_marks = np.where(
        is_struggling == 1,
        rng.normal(loc=42.0, scale=12.0, size=n_samples),
        rng.normal(loc=76.0, scale=11.0, size=n_samples)
    )
    internal_marks = np.clip(internal_marks, 20.0, 98.0)
    
    assignment_pct = np.where(
        is_struggling == 1,
        rng.normal(loc=48.0, scale=15.0, size=n_samples),
        rng.normal(loc=85.0, scale=10.0, size=n_samples)
    )
    assignment_pct = np.clip(assignment_pct, 20.0, 100.0)
    
    backlogs = np.where(
        is_struggling == 1,
        rng.choice([1, 2, 3, 4], p=[0.45, 0.30, 0.15, 0.10], size=n_samples),
        rng.choice([0, 1], p=[0.90, 0.10], size=n_samples)
    )
    
    engagement = np.where(
        is_struggling == 1,
        rng.choice([1, 2, 3], p=[0.60, 0.30, 0.10], size=n_samples),
        rng.choice([1, 2, 3], p=[0.05, 0.35, 0.60], size=n_samples)
    )
    
    financial = np.where(
        is_struggling == 1,
        rng.choice([0, 1], p=[0.55, 0.45], size=n_samples),
        rng.choice([0, 1], p=[0.80, 0.20], size=n_samples)
    )
    
    semester = rng.integers(1, 9, size=n_samples)
    
    # Calculate calibrated risk index: 0 to 1
    # Normalized risk formula:
    norm_att = (100.0 - attendance) / 65.0       # Higher is worse
    norm_gpa = (10.0 - gpa) / 7.5                 # Higher is worse
    norm_internal = (100.0 - internal_marks) / 80.0
    norm_assignment = (100.0 - assignment_pct) / 80.0
    norm_backlogs = backlogs / 4.0
    norm_engagement = (3 - engagement) / 2.0
    
    risk_index = (
        0.25 * norm_att +
        0.22 * norm_gpa +
        0.18 * norm_backlogs +
        0.14 * norm_internal +
        0.11 * norm_assignment +
        0.06 * norm_engagement +
        0.04 * financial
    )
    # Add small noise
    risk_index = risk_index + rng.normal(0, 0.05, size=n_samples)
    dropout_risk = (risk_index >= 0.50).astype(int)
    
    df = pd.DataFrame({
        "attendance_pct": np.round(attendance, 1),
        "gpa": np.round(gpa, 2),
        "internal_marks": np.round(internal_marks, 1),
        "assignment_completion_pct": np.round(assignment_pct, 1),
        "backlogs_count": backlogs,
        "engagement_score": engagement,
        "financial_support_needed": financial,
        "semester": semester,
        "dropout_risk": dropout_risk
    })
    
    return df
