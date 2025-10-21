param(
  [string]$BaseUrl = 'http://localhost:5002',
  [string]$Topic = 'calculus',
  [int]$GroupSize = 4,
  [int]$MinMembers = 3
)

Write-Output "--- Issue Dev Token ---"
$devBody = @{ userId = 2 } | ConvertTo-Json
$dev = Invoke-RestMethod -Method POST -Uri "$BaseUrl/api/dev/issue-token" -Body $devBody -ContentType 'application/json'
$token = $dev.token
if (-not $token) { throw 'Failed to obtain token' }
$headers = @{ Authorization = ("Bearer " + $token) }
Write-Output ("Token (truncated): " + $token.Substring(0,20) + '...')

Write-Output "--- Form groups for topic: $Topic ---"
$formBody = @{ topic = $Topic; groupSize = $GroupSize; minMembers = $MinMembers } | ConvertTo-Json
try {
  $res = Invoke-RestMethod -Method POST -Uri "$BaseUrl/api/group-formation/form" -Headers $headers -ContentType 'application/json' -Body $formBody
  $res | ConvertTo-Json -Depth 7
} catch {
  Write-Output ('FORM ERROR: ' + $_.Exception.Message)
}

Write-Output "--- List groups ---"
try {
  $list = Invoke-RestMethod -Method GET -Uri "$BaseUrl/api/group-formation/list?topic=$Topic" -Headers $headers
  $list | ConvertTo-Json -Depth 7
} catch {
  Write-Output ('LIST ERROR: ' + $_.Exception.Message)
}
