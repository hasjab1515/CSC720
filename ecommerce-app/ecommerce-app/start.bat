@echo off
REM One-click launcher for Windows.
REM Starts the backend API and the frontend static server together, then opens your browser.
REM
REM First-time use: make sure you have Node.js and MongoDB installed/running (or a MongoDB
REM Atlas URI ready), then see README.md for the one-time "npm run seed" step.

echo == Fashion ^& Apparel E-Commerce Platform — Launcher ==

cd /d "%~dp0backend"
if not exist node_modules (
  echo Installing backend dependencies ^(first run only^)...
  call npm install
)
if not exist .env (
  echo Creating .env from .env.example - edit backend\.env with your MongoDB URI if needed.
  copy .env.example .env >nul
)

echo Starting backend API on http://localhost:5000 ...
start "Backend API" cmd /k "npm run dev"

cd /d "%~dp0frontend"
echo Starting frontend on http://localhost:5173 ...
start "Frontend" cmd /k "npx --yes serve -l 5173 ."

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Two windows opened: Backend API and Frontend.
echo Close those windows to stop the servers.
pause
