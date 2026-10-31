# Windows PowerShell Runner for Python ML Service
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

$PythonExe = $null
$CandidatePaths = @(
    "C:\Users\aakas\AppData\Local\Programs\Python\Python314\python.exe",
    (Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
    (Get-Command py -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)
)

foreach ($path in $CandidatePaths) {
    if ($path -and (Test-Path $path) -and ($path -notlike "*WindowsApps*")) {
        $PythonExe = $path
        break
    }
}

if (-not $PythonExe) {
    Write-Host "Python not found in standard paths. Falling back to py launcher..." -ForegroundColor Yellow
    $PythonExe = "py"
}

Write-Host "Using Python binary: $PythonExe" -ForegroundColor Cyan

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    & $PythonExe -m venv venv
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
& .\venv\Scripts\pip.exe install -r requirements.txt

Write-Host "Starting FastAPI ML Engine on http://localhost:8000 ..." -ForegroundColor Green
& .\venv\Scripts\uvicorn.exe app:app --host 0.0.0.0 --port 8000 --reload
