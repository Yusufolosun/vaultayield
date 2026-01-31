@echo off
echo ========================================
echo VaultaYield Testnet Deployment
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Run the TypeScript deployment script with error output
echo Running deployment script...
echo.
call npx ts-node scripts\deploy-testnet.ts 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERROR: Deployment script failed!
    echo Error code: %ERRORLEVEL%
    echo ========================================
)

echo.
pause
