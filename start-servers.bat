@echo off
title SmartHire AI - Server Launcher
color 0A
echo ===================================================================
echo             SmartHire AI - Automated Server Launcher
echo ===================================================================
echo.

set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=C:\Program Files\Java\jdk-17\bin;C:\Program Files\MySQL\MySQL Server 8.0\bin;C:\Users\Hp\.tools\apache-maven-3.9.9\bin;C:\Users\Hp\.tools\node-v20.18.0-win-x64;%PATH%"

echo [1/2] Launching Spring Boot Backend on http://localhost:8080 ...
start "SmartHire AI Backend (Port 8080)" cmd /k "cd /d C:\Users\Hp\.gemini\antigravity\scratch\smarthire-ai\backend && set PATH=C:\Program Files\Java\jdk-17\bin;%%PATH%% && java -jar target\smarthire-backend-1.0.0-SNAPSHOT.jar"

echo Waiting 8 seconds for Backend to initialize...
timeout /t 8 /nobreak >nul

echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
start "SmartHire AI Frontend (Port 5173)" cmd /k "cd /d C:\Users\Hp\.gemini\antigravity\scratch\smarthire-ai\frontend && set PATH=C:\Users\Hp\.tools\node-v20.18.0-win-x64;%%PATH%% && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo ===================================================================
echo      SmartHire AI is now LIVE and running in dedicated windows!
echo      Frontend: http://localhost:5173
echo      Backend:  http://localhost:8080
echo      Swagger:  http://localhost:8080/swagger-ui.html
echo ===================================================================
echo.
echo Press any key to open the web application in your default browser...
pause >nul
start http://localhost:5173
