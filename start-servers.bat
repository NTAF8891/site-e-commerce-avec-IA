@echo off
echo ==========================================
echo    LANCEMENT DU SITE E-COMMERCE
echo ==========================================

echo 1. Lancement du Frontend (React)...
start "Frontend React" cmd /k "cd frontend && npm run dev"

echo 2. Lancement du Backend (Spring Boot - Mode Portable)...
echo Le premier lancement peut etre long (telechargement de Maven).
echo.
cd backend
powershell -ExecutionPolicy Bypass -File run-backend-portable.ps1

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERREUR] Le backend n'a pas pu demarrer.
    echo.
    pause
)
