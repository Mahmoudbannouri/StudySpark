# Start the StudyGroupAi Flask service (Windows PowerShell)
param(
    [string]$BindHost = '127.0.0.1',
    [int]$Port = 5000,
    [switch]$Debug
)

$ErrorActionPreference = 'Stop'

# Move to this script's directory
Set-Location -LiteralPath $PSScriptRoot

# Ensure venv exists
if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Python venv not found at .venv. Creating..."
    python -m venv .venv
}

# Install/upgrade pinned requirements on each run to ensure correct versions
Write-Host "Installing Python packages from requirements.txt (pinned)..."
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

$env:FLASK_HOST = $BindHost
$env:FLASK_PORT = "$Port"
$env:FLASK_DEBUG = $(if ($Debug) { '1' } else { '0' })

Write-Host ("Starting Flask app on http://{0}:{1} (Debug={2})..." -f $BindHost, $Port, $Debug.IsPresent)
.\.venv\Scripts\python.exe app.py
