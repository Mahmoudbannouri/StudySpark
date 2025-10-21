# Proxy test script: issue a dev token and POST a proxied recommendation request
try {
    Write-Output '--- ISSUE TOKEN ---'
    $t = Invoke-RestMethod -Method POST -Uri 'http://localhost:5002/api/dev/issue-token' -ContentType 'application/json' -Body (ConvertTo-Json @{ userId = 1 }) -TimeoutSec 10
    $t | ConvertTo-Json -Depth 5 | Write-Output

    $token = $t.token
    Write-Output '--- PROXY RECOMMEND (single) ---'
    $body = @{ item = 'document:123' } | ConvertTo-Json
    $hdr = @{ Authorization = 'Bearer ' + $token }
    $r = Invoke-RestMethod -Method POST -Uri 'http://localhost:5002/api/recommendation-groups' -Headers $hdr -ContentType 'application/json' -Body $body -TimeoutSec 20
    $r | ConvertTo-Json -Depth 5 | Write-Output
} catch {
    Write-Error "ERROR: $($_.Exception.Message)"
    exit 1
}
