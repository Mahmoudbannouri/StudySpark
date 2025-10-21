param(
  [string]$BaseUrl = 'http://localhost:5000',
  [string]$Topic = 'calculus'
)

Write-Output '--- Issue Dev Token ---'
$issueBody = @{ userId = 2 } | ConvertTo-Json
$dev = Invoke-RestMethod -Method POST -Uri "$BaseUrl/api/dev/issue-token" -Body $issueBody -ContentType 'application/json'
$token = $dev.token
if (-not $token) { throw 'Failed to obtain dev token' }
Write-Output ('Token (truncated): ' + $token.Substring(0,20) + '...')

$headers = @{ Authorization = ('Bearer ' + $token) }

Write-Output "--- Ensure groups exist for topic: $Topic ---"
try {
  $formBody = @{ topic = $Topic } | ConvertTo-Json
  $form = Invoke-RestMethod -Method POST -Uri "$BaseUrl/api/group-formation/form" -Headers $headers -Body $formBody -ContentType 'application/json'
  $form | ConvertTo-Json -Depth 6
} catch {
  Write-Output ('FORM ERROR: ' + $_.Exception.Message)
}

Write-Output "--- GET /api/group-formation/list?topic=$Topic ---"
try {
  $list = Invoke-RestMethod -Method GET -Uri "$BaseUrl/api/group-formation/list?topic=$Topic" -Headers $headers
  $list | ConvertTo-Json -Depth 6
  $firstGroupId = $list.groups | Select-Object -First 1 | ForEach-Object { $_.group.id }
  if ($firstGroupId) {
    Write-Output ("First group id: " + $firstGroupId)
    Write-Output ("--- POST /api/study-groups/" + $firstGroupId + "/join ---")
    try {
      $join = Invoke-RestMethod -Method POST -Uri "$BaseUrl/api/study-groups/$firstGroupId/join" -Headers $headers -ContentType 'application/json'
      $join | ConvertTo-Json -Depth 6
    } catch {
      if ($_.Exception.Response) {
        Write-Output ('JOIN FAILED: ' + $_.Exception.Response.StatusCode.value__ + ' ' + $_.Exception.Response.StatusDescription)
        try {
          $stream = $_.Exception.Response.GetResponseStream()
          if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            $errBody = $reader.ReadToEnd()
            if ($errBody) { Write-Output ('Body: ' + $errBody) }
          }
        } catch {
          Write-Output 'Body: <unreadable>'
        }
      } else {
        Write-Output ('JOIN ERROR: ' + $_.Exception.Message)
      }
    }
  } else {
    Write-Output 'No groups found to join.'
  }
} catch {
  Write-Output ('LIST ERROR: ' + $_.Exception.Message)
}

Write-Output "--- POST /api/recommendation-groups (topic:calculus) ---"
try {
  $recBody = @{ item = 'topic:calculus' } | ConvertTo-Json
  $rec = Invoke-RestMethod -Method POST -Uri "$BaseUrl/api/recommendation-groups" -Headers $headers -Body $recBody -ContentType 'application/json'
  $rec | ConvertTo-Json -Depth 6
} catch {
  Write-Output ('RECOMMEND ERROR: ' + $_.Exception.Message)
}

Write-Output "--- GET /api/study-groups/mine ---"
try {
  $mine = Invoke-RestMethod -Method GET -Uri "$BaseUrl/api/study-groups/mine" -Headers $headers
  $mine | ConvertTo-Json -Depth 6
} catch {
  Write-Output ('MINE ERROR: ' + $_.Exception.Message)
}
