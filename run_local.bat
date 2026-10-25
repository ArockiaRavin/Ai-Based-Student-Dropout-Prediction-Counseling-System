@echo off
echo ========================================================
echo   Starting EduRetain AI Platform (Local Environment)
echo ========================================================
echo.

echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "EduRetain AI - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "EduRetain AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Launching Application in default browser...
start http://localhost:5173/

echo.
echo ========================================================
echo   Both services are now running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://127.0.0.1:8000
echo   API Docs : http://127.0.0.1:8000/docs
echo ========================================================
