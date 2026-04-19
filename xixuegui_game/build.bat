@echo off
echo.
echo ========================================
echo     Capybara Adventure - Build Tool
echo ========================================
echo.

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js check... OK
echo.

REM Run build script
echo [2/3] Building...
echo.
node build.js

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo [3/3] Build complete!
echo.
echo Output files are in dist/ folder
echo.
pause
