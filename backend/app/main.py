import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.seed import seed_database
from app.ml.pipeline import ml_system

from app.routes.students import router as students_router
from app.routes.predictions import router as predictions_router
from app.routes.counseling import router as counseling_router
from app.routes.interventions import router as interventions_router
from app.routes.analytics import router as analytics_router
from app.routes.model_insights import router as model_router
from app.routes.reports import router as reports_router
from app.routes.settings import router as settings_router
from app.routes.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    print("Initializing SQLite database & loading ML models...")
    init_db()
    seed_database()
    ml_system.load_or_train()
    print("Backend ready to accept connections.")
    yield
    print("Shutting down backend...")

app = FastAPI(
    title="AI-Based Student Dropout Prediction and Counseling System API",
    description="REST API for student retention analytics, ML risk classification, and counselor workflows.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth_router, prefix="/api")
app.include_router(students_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")
app.include_router(counseling_router, prefix="/api")
app.include_router(interventions_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(model_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(settings_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI-Based Dropout Prediction System",
        "ml_models_ready": ml_system.is_trained,
        "active_model": ml_system.active_model_name,
        "database": "SQLite (Development Mode)"
    }
