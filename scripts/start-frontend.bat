@echo off
echo ===================================================
echo  CYBER FLOCK DEFENSE HUB - Starting Frontend Server
echo ===================================================
cd /d "%~dp0\..\frontend"
echo Frontend UI listening at http://localhost:5173
call npm.cmd run dev
pause
