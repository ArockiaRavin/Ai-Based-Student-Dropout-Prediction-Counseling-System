# EduRetain AI - Local Startup Script (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Starting EduRetain AI Platform (Local Environment)   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in separate window
Write-Host "[1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 2

# 2. Start Frontend in separate window
Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev"

Start-Sleep -Seconds 3

# 3. Open default browser
Write-Host ""
Write-Host "Launching Application in default browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173/"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Both services are now running!" -ForegroundColor Green
Write-Host "   Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "   Backend  : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   API Docs : http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
