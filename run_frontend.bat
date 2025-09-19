@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Start Next.js dev server for basic_ui on http://localhost:3000
pushd "%~dp0basic_ui"
echo Installing Node dependencies (if needed) and starting Next.js dev server at http://localhost:3000 ...
start "Next Dev Server" cmd /c "call npm install && npm run dev"
popd

echo Frontend launched at http://localhost:3000 . Open /login/index.html to sign in.
exit /b 0
