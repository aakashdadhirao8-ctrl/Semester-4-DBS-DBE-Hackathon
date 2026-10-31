# Windows PowerShell Runner for React Frontend
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    & npm.cmd install
}

Write-Host "Starting React Frontend on http://localhost:5173 ..." -ForegroundColor Green
& npm.cmd run dev
