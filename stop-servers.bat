@echo off
title SmartHire AI - Stop Servers
echo Stopping SmartHire AI Servers...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /F /PID %%a 2>nul
)

echo SmartHire AI Servers Stopped.
