@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Change to the login-module directory inside the repo
pushd "%~dp0login-module"

echo Starting static server at http://127.0.0.1:5500 ...
start "Frontend Server" cmd /c "python -m http.server 5500"

popd

echo Frontend server launched. You can close this window.
exit /b 0
