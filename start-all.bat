@echo off
echo ================================================================
echo  CYBER FLOCK DEFENSE HUB - Starting Complete Localhost Platform
echo ================================================================

echo Starting Backend in separate window...
start "Cyber Flock Backend [Port 8000]" cmd /k "%~dp0scripts\start-backend.bat"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Frontend in separate window...
start "Cyber Flock Frontend [Port 5173]" cmd /k "%~dp0scripts\start-frontend.bat"

echo ================================================================
echo  Platform Initialized:
echo    - Frontend UI:  http://localhost:5173
echo    - Backend API:  http://127.0.0.1:8000
echo    - API Docs:     http://127.0.0.1:8000/docs
echo.
echo  Role-Based Credentials (Pre-Seeded):
echo    - Super Admin:  admin@cyberflock.defense     / AdminSecurePassword123!
echo    - Analyst:      analyst@cyberflock.defense   / AnalystSecurePassword123!
echo    - Executive:    executive@cyberflock.defense / ExecutiveSecurePassword123!
echo    - Auditor:      auditor@cyberflock.defense   / AuditorSecurePassword123!
echo ================================================================
pause
