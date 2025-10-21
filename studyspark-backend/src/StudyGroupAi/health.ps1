param(
    [string]$Url = 'http://127.0.0.1:5000/health'
)

$ErrorActionPreference = 'SilentlyContinue'
try {
    $res = Invoke-RestMethod -UseBasicParsing -Uri $Url -TimeoutSec 5
    $res | ConvertTo-Json -Depth 5
} catch {
    Write-Output ("ERROR: " + $_.Exception.Message)
}
