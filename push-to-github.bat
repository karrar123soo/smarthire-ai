@echo off
title SmartHire AI - Push to GitHub
color 0B
echo ===================================================================
echo               SmartHire AI - GitHub Push Launcher
echo ===================================================================
echo.
echo Remote URL: https://github.com/Karrar123/smarthire-ai.git
echo Branch:     main
echo.
echo Pushing your code to GitHub...
echo (If prompted, enter your GitHub Username and Personal Access Token)
echo.

set "PATH=C:\Users\Hp\.tools\git\cmd;%PATH%"

cd /d "C:\Users\Hp\.gemini\antigravity\scratch\smarthire-ai"
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    color 0A
    echo ===================================================================
    echo      SUCCESS! SmartHire AI has been pushed to GitHub!
    echo      Repository: https://github.com/Karrar123/smarthire-ai
    echo ===================================================================
) else (
    color 0C
    echo ===================================================================
    echo      Push failed or was cancelled. Please check your credentials.
    echo ===================================================================
)
echo.
pause
