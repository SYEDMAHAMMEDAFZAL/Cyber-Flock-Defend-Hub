@echo off
echo ===================================================
echo  CYBER FLOCK DEFENSE HUB - Re-seeding Synthetic DB
echo ===================================================
cd /d "%~dp0\..\backend"
call venv\Scripts\activate.bat
set PYTHONPATH=%cd%
python -m app.services.fake_data_generator
echo Synthetic data generation complete.
pause
