# ============================================================
# CODESPARK HACKATHON 2026 • Master Launch Script
# Problem Statement 28: Corporate Asset Management
# ============================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " CODESPARK 2026: Corporate Asset Management (Problem 28) " -ForegroundColor Yellow
Write-Host " KL University & Yellowspot Technologies " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Start Python ML Microservice
Write-Host "[1/3] Launching Python ML Engine (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File `"$Root\ml-service\run-ml.ps1`""

Start-Sleep -Seconds 2

# 2. Start Java Spring Boot Backend
Write-Host "[2/3] Launching Java Spring Boot Backend (Port 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File `"$Root\backend\run-backend.ps1`""

Start-Sleep -Seconds 3

# 3. Start React Frontend
Write-Host "[3/3] Launching React Frontend (Port 5173)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File `"$Root\frontend\run-frontend.ps1`""

Write-Host "`nAll 3 services have been initiated in dedicated terminals!" -ForegroundColor Green
Write-Host "------------------------------------------------------------"
Write-Host " 🌐 React Frontend:      http://localhost:5173" -ForegroundColor Yellow
Write-Host " ☕ Spring Boot API:     http://localhost:8080/api/dashboard/summary" -ForegroundColor Cyan
Write-Host " 🗄️ H2 Database Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:camdb)" -ForegroundColor White
Write-Host " 🐍 Python ML Swagger:   http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------"
