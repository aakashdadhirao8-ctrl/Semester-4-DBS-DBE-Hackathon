@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File .\run-frontend.ps1
pause
