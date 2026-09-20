@echo off
echo ===================================================
echo  CYBER FLOCK DEFENSE HUB - Starting Backend Server
echo ===================================================
cd /d "%~dp0..\backend"
set PYTHONPATH=%cd%
echo Backend API listening at http://127.0.0.1:8000
"%~dp0..\backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
