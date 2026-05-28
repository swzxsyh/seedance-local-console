$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example. Please fill SEEDANCE_API_KEY first." -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting SeeDance gateway at http://127.0.0.1:8000" -ForegroundColor Green
python main.py
