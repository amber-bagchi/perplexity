@echo off
REM Perplexity Clone - Run Backend and Frontend
REM Environment variables are loaded from .env files automatically

setlocal enabledelayedexpansion

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Colors for output
color 0A

echo.
echo ===============================================
echo   Perplexity Clone - Full Stack Application
echo ===============================================
echo.
echo Starting Backend and Frontend...
echo.

REM Check if Python venv exists
if not exist "server\venv" (
    echo Creating Python virtual environment...
    cd server
    python -m venv venv
    cd ..
)

REM Check if node_modules exist
if not exist "client\node_modules" (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

REM Start Backend in a new window
echo.
echo [1/2] Starting Backend (FastAPI) on http://localhost:8000
echo.
start "Perplexity Backend" cmd /k "cd server && venv\Scripts\activate.bat && python -u -m uvicorn app:app --host 127.0.0.1 --port 8000"

REM Wait a bit for backend to start
timeout /t 5 /nobreak

REM Start Frontend in a new window
echo.
echo [2/2] Starting Frontend (Next.js) on http://localhost:3000
echo.
start "Perplexity Frontend" cmd /k "cd client && npm run dev"

echo.
echo ===============================================
echo   Both services are starting!
echo ===============================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Backend window:  Use Ctrl+C to stop
echo Frontend window: Use Ctrl+C to stop
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak

REM Try to open browser
start http://localhost:3000

echo.
echo Done! Check your browser.
echo.
pause
