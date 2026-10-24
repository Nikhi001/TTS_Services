@echo off
echo ========================================================
echo Starting OmniVoice Web Application (Backend + Frontend)
echo ========================================================

:: 1. Start FastAPI Backend in a new window
echo Starting FastAPI Backend on http://127.0.0.1:8000...
start "OmniVoice Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate.bat && uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 2. Start React Frontend in a new window
echo Starting React Frontend on http://localhost:5173...
start "OmniVoice Frontend" cmd /k "cd /d "%~dp0frontend" && set PATH=C:\Users\Acer\scoop\apps\nodejs-lts\current;%PATH% && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo Web UI: http://localhost:5173
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
