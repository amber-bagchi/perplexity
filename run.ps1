# Perplexity Clone - Run Backend and Frontend
# Environment variables are loaded from .env files automatically

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Perplexity Clone - Full Stack Application" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if Python venv exists
if (-not (Test-Path "server\venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    Set-Location server
    python -m venv venv
    Set-Location ..
}

# Check if node_modules exist
if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "[1/2] Starting Backend (FastAPI) on http://localhost:8000" -ForegroundColor Green
Write-Host ""

# Start Backend in a new PowerShell window
$backendScript = @"
cd '$scriptDir\server'
& '.\venv\Scripts\Activate.ps1'
python -u -m uvicorn app:app --host 127.0.0.1 --port 8000
Read-Host 'Press Enter to close'
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

Write-Host "[2/2] Starting Frontend (Next.js) on http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Start Frontend in a new PowerShell window
$frontendScript = @"
cd '$scriptDir\client'
npm run dev
Read-Host 'Press Enter to close'
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Both services are starting!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening browser in 3 seconds..." -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 3

# Open browser
Start-Process "http://localhost:3000"

Write-Host "Done! Check your browser." -ForegroundColor Green
