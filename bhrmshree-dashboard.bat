@echo off
echo ==================================================
echo         STARTING BHRMSHREE DASHBOARD SERVER
echo ==================================================
echo.

:: Navigate to the Bhrmshree directory
cd /d "c:\mini project\Bhrmshree"

:: Check if the dashboard has been built
if not exist "dashboard\.next\server\app\index.html" (
    echo [BUILD] Dashboard not built yet. Building now...
    echo.
    cd /d "c:\mini project\Bhrmshree\dashboard"
    call npm install
    call npm run build
    cd /d "c:\mini project\Bhrmshree"
    echo.
    echo [BUILD] Dashboard build complete!
    echo.
)

echo The Dashboard will be available at: http://localhost:4004
echo (A browser window will open automatically in a moment...)
echo.

:: Automatically open the browser after a 3 second delay
start "" http://localhost:4004

:: Run the CLI in serve mode
call npx tsx bhrmshree.ts serve

:: Keep the window open if the server crashes or is stopped
pause
