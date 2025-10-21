# StudySpark Backend - Dev Notes

This file documents local development helpers added temporarily to support end-to-end testing of the StudyGroup AI integration.

IMPORTANT: These routes are for local development only. They are mounted at `/api/dev` and are enabled only when `NODE_ENV !== 'production'`.

## Dev auth bypass routes

- POST /api/dev/issue-token
  - Body: { userId?: number, email?: string }
  - Returns: { success: true, token: string, payload: { id, email, role } }
  - Description: Issues a JWT signed with `process.env.JWT_SECRET` (falls back to `dev-secret` if not set). Useful to obtain a token to call protected endpoints.

- POST /api/dev/login-as
  - Body: { userId: number }
  - Returns: { success: true, message, user }
  - Description: Convenience route to verify a user exists and to return their basic info. It does NOT create a session or mutate state.

## Example PowerShell usage

# Issue token for an existing user (id=1)
```
$resp = Invoke-RestMethod -Method POST -Uri 'http://localhost:5002/api/dev/issue-token' -ContentType 'application/json' -Body (ConvertTo-Json @{ userId = 1 })
$token = $resp.token
Write-Output $token
```

# Call protected recommendation endpoint with the token
```
$body = @{ item = 'document:123' } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri 'http://localhost:5002/api/recommendation-groups' -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 5
```

## Safety and cleanup

- These routes are mounted only when `NODE_ENV` is not `production`. Before pushing branches, remove these routes or ensure they are not deployed to any shared environment.
- After finishing local testing, you can remove `src/routes/devAuthBypass.js` and the conditional mount in `src/server.js`.

---
Added by Rabie: temporary dev auth helper for local testing of ML integration.