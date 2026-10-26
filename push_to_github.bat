@echo off
setlocal
echo ========================================================
echo   EduRetain AI - GitHub Push & Render Deployment Helper
echo ========================================================
echo.

set "GIT_EXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if not exist "%GIT_EXE%" set "GIT_EXE=git.exe"
set "GH_EXE=gh.exe"


echo [1/3] Checking GitHub authorization...
"%GH_EXE%" auth status >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo Please authenticate with GitHub in the browser window that appears.
    echo Press any key to open GitHub login...
    pause >nul
    "%GH_EXE%" auth login --hostname github.com --git-protocol https --web
)

echo.
echo [2/3] Configuring Git credentials via GitHub CLI...
"%GH_EXE%" auth setup-git

echo.
echo [3/3] Pushing project files to GitHub...
cd /d "%~dp0"
"%GIT_EXE%" remote set-url origin https://github.com/ArockiaRavin/Ai-Based-Student-Dropout-Prediction-Counseling-System.git
"%GIT_EXE%" push -u origin main --force

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! All project files are live on GitHub!
    echo ========================================================
    echo.
    echo Opening Render to deploy with 1-click...
    start https://dashboard.render.com/blueprints/new
) else (
    echo.
    echo [ERROR] Git push failed. Please check your GitHub account permissions.
)

echo.
pause
