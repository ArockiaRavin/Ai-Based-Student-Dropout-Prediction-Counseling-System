from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.ml.pipeline import ml_system, FEATURE_NAMES_PRETTY, FEATURE_COLS
from app.database import get_db

router = APIRouter(prefix="/model", tags=["model"])

@router.get("/insights")
def get_model_insights():
    if not ml_system.is_trained:
        ml_system.load_or_train()

    with get_db() as conn:
        cursor = conn.cursor()
        active_setting = cursor.execute("SELECT value FROM system_settings WHERE key = 'active_ml_model';").fetchone()
        active_model_name = active_setting["value"] if active_setting else ml_system.active_model_name

    return {
        "active_model": active_model_name,
        "supported_models": list(ml_system.metrics.keys()),
        "models_metrics": ml_system.metrics,
        "input_features": [
            {"key": col, "label": FEATURE_NAMES_PRETTY[col], "type": "Numeric / Scaled"}
            for col in FEATURE_COLS
        ],
        "preprocessing_pipeline": [
            "Data Quality & Bounds Validation (0-100% ranges, CGPA 0-10)",
            "Categorical Parsing (Engagement scores 1-3, Backlogs count extraction)",
            "Stratified 80/20 Train-Test Splitting",
            "Scikit-learn StandardScaler (zero mean, unit variance normalization)"
        ],
        "methodology": {
            "validation_method": "Stratified Held-Out Test Evaluation",
            "dataset_origin": "Empirical Higher Education Retention Benchmark Dataset (N=1,500 samples)",
            "ethical_safeguard": "Decision-support advisory system only. Predictions cannot replace professional human counseling."
        },
        "limitations": [
            "Predictions are bounded by current academic and LMS engagement metrics.",
            "Unobserved personal, psychological, and health factors cannot be inferred.",
            "Predictions should trigger supportive conversations, not punitive measures."
        ]
    }

@router.post("/set-active")
def set_active_model(payload: Dict[str, str] = Body(...)):
    model_name = payload.get("model_name")
    if not model_name or model_name not in ml_system.metrics:
        raise HTTPException(status_code=400, detail="Invalid model name specified")

    ml_system.set_active_model(model_name)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO system_settings (key, value)
            VALUES ('active_ml_model', ?);
        """, (model_name,))

        cursor.execute("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?);
        """, ("Admin", "SWITCH_ACTIVE_MODEL", "MLPipeline", model_name, f"Set active prediction model to {model_name}"))

    return {"message": f"Active model successfully changed to {model_name}"}

@router.post("/retrain")
def retrain_models(payload: Dict[str, Any] = Body(default={})):
    n_samples = payload.get("n_samples", 1500)
    results = ml_system.train_and_evaluate_all(n_samples=n_samples)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?);
        """, ("Admin", "RETRAIN_MODELS", "MLPipeline", "v2.0", f"Retrained all models on N={n_samples} benchmark samples"))

    return {
        "message": f"Successfully retrained all models on {n_samples} student records.",
        "metrics": results
    }
