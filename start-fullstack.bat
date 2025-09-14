@echo off
echo Starting Time Table Generator Full Stack Application...
echo.

REM Start Django Backend
echo Starting Django Backend...
start /B "Django Backend" cmd /c "cd /d D:\SIH\Time-Table-Generator\api && D:\SIH\Time-Table-Generator\api\.venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start Next.js Frontend
echo Starting Next.js Frontend...
cd /d "D:\SIH\Time-Table-Generator\Frontend\basic_ui"
npm run dev

echo.
echo Both servers are now running!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop the frontend. You may need to manually stop the backend.
pause
