@echo off
echo ==================================================
echo         STARTING BHRMSHREE SAAS PLATFORM
echo ==================================================
echo.

:: Navigate to the Bhrmshree directory
cd /d "%~dp0"

echo Starting Next.js Dashboard on Port 4004...
start "Bhrmshree Dashboard (Next.js)" cmd /k "cd dashboard && npm run dev"

echo Starting Backend Engine API on Port 4005...
start "Bhrmshree Engine (Node.js)" cmd /k "npx tsx bhrmshree.ts serve"

echo.
echo The Platform will be available at: http://localhost:4004
echo (A browser window will open automatically in a moment...)
echo.

:: Automatically open the browser after a 5 second delay to let servers start
timeout /t 5 /nobreak
start "" http://localhost:4004

:: Keep the main window open
echo Both servers are running in separate windows.
echo Close this window and the other command prompts to stop the platform.
pause
