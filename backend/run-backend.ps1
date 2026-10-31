# Windows PowerShell Runner for Spring Boot (Zero-Configuration)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

$MavenVersion = "3.9.9"
$MavenDir = Join-Path $ScriptDir ".maven"
$MavenHome = Join-Path $MavenDir "apache-maven-$MavenVersion"
$MvnExe = Join-Path $MavenHome "bin\mvn.cmd"

if (-not (Test-Path $MvnExe)) {
    Write-Host "Portable Maven not found. Downloading Apache Maven $MavenVersion..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $MavenDir | Out-Null
    $ZipFile = Join-Path $MavenDir "maven.zip"
    $Url = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
    Invoke-WebRequest -Uri $Url -OutFile $ZipFile -UseBasicParsing
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipFile -DestinationPath $MavenDir -Force
    Remove-Item $ZipFile -Force
    Write-Host "Maven installed successfully to $MavenHome" -ForegroundColor Green
}

Write-Host "Starting Spring Boot: Corporate Asset Management (Port 8080)..." -ForegroundColor Green
& $MvnExe spring-boot:run
