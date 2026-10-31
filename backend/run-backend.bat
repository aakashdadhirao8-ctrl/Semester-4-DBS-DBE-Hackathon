@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File .\run-backend.ps1
pause
