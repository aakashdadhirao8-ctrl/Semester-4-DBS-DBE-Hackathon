@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File .\run-ml.ps1
pause
