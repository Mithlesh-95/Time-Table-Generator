# Time Table Generator - Full Stack Startup Script
Write-Host "Starting Time Table Generator Full Stack Application..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
$venvPath = "D:\SIH\Time-Table-Generator\api\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPath)) {
    Write-Host "Virtual environment not found at $venvPath" -ForegroundColor Red
    Write-Host "Please ensure the Django backend is properly set up." -ForegroundColor Red
    pause
    exit 1
}

# Start Django Backend in background
Write-Host "Starting Django Backend on port 8000..." -ForegroundColor Blue
$djangoJob = Start-Job -ScriptBlock {
    Set-Location "D:\SIH\Time-Table-Generator\api"
    & "D:\SIH\Time-Table-Generator\api\.venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000
}

# Wait for backend to start
Write-Host "Waiting for Django backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if Django is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Django backend started successfully!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not confirm Django backend status" -ForegroundColor Yellow
}

# Start Next.js Frontend
Write-Host "Starting Next.js Frontend on port 3000..." -ForegroundColor Blue
Set-Location "D:\SIH\Time-Table-Generator\Frontend\basic_ui"

Write-Host ""
Write-Host "=== SERVERS RUNNING ===" -ForegroundColor Green
Write-Host "Backend (Django):  http://localhost:8000" -ForegroundColor Blue
Write-Host "Frontend (Next.js): http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend." -ForegroundColor Yellow
Write-Host "Backend will continue running in background." -ForegroundColor Yellow
Write-Host ""

# Start frontend (this will block until stopped)
npm run dev

# Cleanup: Stop Django background job when frontend stops
Write-Host ""
Write-Host "Stopping Django backend..." -ForegroundColor Yellow
Stop-Job $djangoJob
Remove-Job $djangoJob
Write-Host "All services stopped." -ForegroundColor Green
