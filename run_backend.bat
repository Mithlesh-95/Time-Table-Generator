@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Change to the backend API directory
pushd "%~dp0api"

REM Optional: ensure dependencies are installed
echo Installing Python dependencies (if needed)...
python -m pip install -r requirements.txt >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [warn] Could not install dependencies. Continuing...
)

REM Apply database migrations
echo Applying database migrations...
python manage.py migrate
if %ERRORLEVEL% NEQ 0 (
  echo [error] Migrations failed. Press any key to exit.
  pause >nul
  popd
  exit /b 1
)

REM Start Django development server on port 8000
echo Starting Django server at http://127.0.0.1:8000 ...
start "Django Server" cmd /c "python manage.py runserver"

popd

echo Backend server launched. You can close this window.
exit /b 0
