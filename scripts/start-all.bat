@echo off
echo ================================================================
echo  CYBER FLOCK DEFENSE HUB - Starting Complete Localhost Platform
echo ================================================================

echo Starting Backend in separate window...
start "Cyber Flock Backend [Port 8000]" cmd /k "%~dp0start-backend.bat"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Frontend in separate window...
start "Cyber Flock Frontend [Port 5173]" cmd /k "%~dp0start-frontend.bat"

echo ================================================================
echo  Platform Initialized:
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://127.0.0.1:8000
echo    - Interactive Swagger Docs: http://127.0.0.1:8000/docs
echo    - Default Admin: admin@cyberflock.defense / AdminSecurePassword123!
echo ================================================================
