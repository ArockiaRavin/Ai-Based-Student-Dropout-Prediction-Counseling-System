import json
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, Dict, Any
from app.database import get_db
from app.models import PredictionRequest, PredictionResponse
from app.ml.pipeline import ml_system
from app.auth_utils import get_optional_user, log_audit
from app.routes.analytics import invalidate_analytics_cache

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("")
def list_predictions(
    student_id: Optional[str] = Query(None),
    risk_category: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT p.*, s.first_name, s.last_name, s.department, s.attendance_pct, s.gpa
            FROM predictions p
            LEFT JOIN students s ON p.student_id = s.student_id
            WHERE 1=1
        """
        params = []
        if student_id:
            query += " AND p.student_id = ?"
            params.append(student_id)
        if risk_category and risk_category != "All":
            query += " AND p.risk_category = ?"
            params.append(risk_category)

        query += " ORDER BY p.id DESC LIMIT ?"
        params.append(limit)

        rows = cursor.execute(query, params).fetchall()

        results = []
        for r in rows:
            results.append({
                "id": r["id"],
                "student_id": r["student_id"],
                "student_name": f"{r['first_name']} {r['last_name']}" if r["first_name"] else "Ad-hoc Prediction",
                "department": r["department"],
                "model_used": r["model_used"],
                "risk_score": r["risk_score"],
                "risk_category": r["risk_category"],
                "factors": json.loads(r["factors_json"]) if r["factors_json"] else [],
                "positive_indicators": json.loads(r["positive_indicators_json"]) if r["positive_indicators_json"] else [],
                "recommendations": json.loads(r["recommendations_json"]) if r["recommendations_json"] else [],
                "created_at": r["created_at"],
                "attendance_pct": r["attendance_pct"],
                "gpa": r["gpa"]
            })

        return {"predictions": results, "total": len(results)}

@router.post("")
def run_prediction(
    payload: PredictionRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    # Viewer restriction: cannot write or modify predictions on student profiles
    if payload.student_id and current_user and current_user.get("role") == "Viewer":
        raise HTTPException(
            status_code=403,
            detail="Viewer accounts are strictly read-only and cannot record predictions to student records."
        )

    # Execute prediction with requested model or active model
    pred_result = ml_system.predict_student(payload.model_dump(), model_name=payload.model_name)

    # Save prediction to DB if student_id is provided or generated
    student_id = payload.student_id
    if student_id:
        with get_db() as conn:
            cursor = conn.cursor()
            # Verify if student exists; if so, save
            student = cursor.execute("SELECT first_name, last_name FROM students WHERE student_id = ?;", (student_id,)).fetchone()
            
            cursor.execute("""
                INSERT INTO predictions (
                    student_id, model_used, risk_score, risk_category,
                    factors_json, positive_indicators_json, recommendations_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (
                student_id,
                pred_result["model_used"],
                pred_result["risk_score"],
                pred_result["risk_category"],
                json.dumps(pred_result["factors"]),
                json.dumps(pred_result["positive_indicators"]),
                json.dumps(pred_result["recommendations"])
            ))

            # If High Risk, trigger a notification for counselors
            if pred_result["risk_category"] == "HIGH RISK":
                st_name = f"{student['first_name']} {student['last_name']}" if student else student_id
                cursor.execute("""
                    INSERT INTO notifications (title, message, type, student_id)
                    VALUES (?, ?, 'alert', ?);
                """, (
                    f"High Risk Prediction Alert: {st_name}",
                    f"Assessment using {pred_result['model_used']} flagged risk score {pred_result['risk_score']}%. Early counseling recommended.",
                    student_id
                ))

            cursor.execute("""
                INSERT INTO audit_logs (user_name, action, entity_type, entity_id, details)
                VALUES (?, ?, ?, ?, ?);
            """, ("System User", "RUN_PREDICTION", "Prediction", student_id, f"Risk: {pred_result['risk_category']} ({pred_result['risk_score']}%) via {pred_result['model_used']}"))

            invalidate_analytics_cache()

    return {
        "student_id": student_id,
        "model_used": pred_result["model_used"],
        "risk_score": pred_result["risk_score"],
        "risk_category": pred_result["risk_category"],
        "factors": pred_result["factors"],
        "positive_indicators": pred_result["positive_indicators"],
        "recommendations": pred_result["recommendations"],
        "explanation": pred_result["explanation"],
        "student_inputs": pred_result["student_inputs"]
    }

@router.get("/{prediction_id}")
def get_prediction_detail(prediction_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        p = cursor.execute("""
            SELECT p.*, s.first_name, s.last_name, s.department, s.email, s.semester
            FROM predictions p
            LEFT JOIN students s ON p.student_id = s.student_id
            WHERE p.id = ?;
        """, (prediction_id,)).fetchone()

        if not p:
            raise HTTPException(status_code=404, detail="Prediction record not found")

        return {
            "id": p["id"],
            "student_id": p["student_id"],
            "student_name": f"{p['first_name']} {p['last_name']}" if p["first_name"] else "Ad-hoc Assessment",
            "department": p["department"],
            "semester": p["semester"],
            "email": p["email"],
            "model_used": p["model_used"],
            "risk_score": p["risk_score"],
            "risk_category": p["risk_category"],
            "factors": json.loads(p["factors_json"]) if p["factors_json"] else [],
            "positive_indicators": json.loads(p["positive_indicators_json"]) if p["positive_indicators_json"] else [],
            "recommendations": json.loads(p["recommendations_json"]) if p["recommendations_json"] else [],
            "created_at": p["created_at"]
        }
