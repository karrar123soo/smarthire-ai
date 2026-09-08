@echo off
setlocal enabledelayedexpansion
title SmartHire AI - Universal Server Launcher
color 0A

echo ===================================================================
echo               SmartHire AI - Server Launcher
echo ===================================================================
echo.

:: 1. Detect base project directory dynamically
set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

:: 2. Configure Environment PATH with auto-fallback
if exist "C:\Program Files\Java\jdk-17\bin" set "PATH=C:\Program Files\Java\jdk-17\bin;%PATH%"
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin" set "PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin;%PATH%"
if exist "%USERPROFILE%\.tools\apache-maven-3.9.9\bin" set "PATH=%USERPROFILE%\.tools\apache-maven-3.9.9\bin;%PATH%"
if exist "%USERPROFILE%\.tools\node-v20.18.0-win-x64" set "PATH=%USERPROFILE%\.tools\node-v20.18.0-win-x64;%PATH%"
if exist "%USERPROFILE%\.tools\git\cmd" set "PATH=%USERPROFILE%\.tools\git\cmd;%PATH%"

:: 3. Check for Backend JAR, build if missing
if not exist "%PROJECT_DIR%\backend\target\smarthire-backend-1.0.0-SNAPSHOT.jar" (
    echo [Setup] Backend JAR not found. Building Spring Boot application with Maven...
    cd /d "%PROJECT_DIR%\backend"
    call mvn clean package -DskipTests
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] Maven build failed. Please ensure JDK 17 and Maven are installed.
        pause
        exit /b 1
    )
)

:: 4. Check for Frontend node_modules, install if missing
if not exist "%PROJECT_DIR%\frontend\node_modules" (
    echo [Setup] Frontend node_modules not found. Installing dependencies with npm...
    cd /d "%PROJECT_DIR%\frontend"
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] npm install failed. Please ensure Node.js is installed.
        pause
        exit /b 1
    )
)

:: 5. Detect local network IP for mobile access
for /f "tokens=*" %%a in ('powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { .InterfaceAlias -notmatch 'Loopback' -and .IPAddress -notmatch '^169\.' } | Select-Object -First 1).IPAddress"') do set "LOCAL_IP=%%a"
if "%LOCAL_IP%"=="" set "LOCAL_IP=localhost"

:: 6. Launch Backend Server (Port 8080)
echo [1/2] Launching Spring Boot Backend on port 8080...
start "SmartHire AI Backend (Port 8080)" cmd /k "cd /d "%PROJECT_DIR%\backend" && java -jar target\smarthire-backend-1.0.0-SNAPSHOT.jar"

echo Waiting 7 seconds for Spring Boot initialization...
timeout /t 7 /nobreak >nul

:: 7. Launch Frontend Server (Port 5173 on 0.0.0.0)
echo [2/2] Launching React Vite Frontend on port 5173...
start "SmartHire AI Frontend (Port 5173)" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo ===================================================================
echo      SmartHire AI is LIVE and running in dedicated windows!
echo.
echo      Desktop URL:    http://localhost:5173
echo      Mobile URL:     http://%LOCAL_IP%:5173  (Open on phone browser)
echo      Backend API:    http://localhost:8080
echo      Swagger UI:     http://localhost:8080/swagger-ui.html
echo ===================================================================
echo.
echo Press any key to open the web application in your default browser...
pause >nul
start http://localhost:5173
