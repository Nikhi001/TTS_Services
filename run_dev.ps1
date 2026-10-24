# OmniVoice Full-Stack Development Runner
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting OmniVoice Full-Stack Web Application" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

# Launch Backend in separate PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; .\.venv\Scripts\Activate.ps1; Write-Host '--- OmniVoice FastAPI Backend ---' -ForegroundColor Green; uvicorn app.main:app --host 127.0.0.1 --port 8000"

# Launch Frontend in separate PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\Acer\scoop\apps\nodejs-lts\current;' + `$env:PATH; cd '$frontendDir'; Write-Host '--- OmniVoice React Frontend ---' -ForegroundColor Magenta; npm run dev"

Write-Host "`nServers launched in separate windows!" -ForegroundColor Green
Write-Host "  -> Web UI:    http://localhost:5173" -ForegroundColor Yellow
Write-Host "  -> API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan
