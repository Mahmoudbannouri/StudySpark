# Admin Quota Management System - Complete Guide

## Overview
The admin can now fully manage student quotas and subscriptions with a comprehensive dashboard that includes statistics and detailed quota control.

---

## Features Implemented

### 1. **Statistics Dashboard**
Located at the top of the admin panel showing:
- **Total Users** - Count of all users in the system
- **Active Subscriptions** - Number of users with active subscriptions
- **Total Quotas** - Sum of all quota limits across all features
- **Average Usage %** - Average percentage of quota usage across all features

### 2. **User Management Table**
Lists all users with:
- User ID, Name, Email
- Role (Admin/Student)
- **View/Edit Button** - Opens quota management modal
- Role management buttons

### 3. **Quota Management Modal**
Opens when clicking "View/Edit" button, featuring:

#### **User Information Bar**
- Email address
- Current subscription plan (free/basic/premium/enterprise)
- Subscription status

#### **Three Management Tabs:**

##### Tab 1: Apply Plan
- Dropdown to select subscription plan (free/basic/premium/enterprise)
- One-click button to apply plan quotas
- Warning about changes
- Automatically sets quotas based on plan:
  - **Free**: 5 uploads, 10 summaries, 20 flashcards, 5 quizzes, 50 chats, 2 study plans
  - **Basic**: 25 uploads, 50 summaries, 100 flashcards, 25 quizzes, 200 chats, 10 study plans
  - **Premium**: 100 uploads, 200 summaries, 500 flashcards, 100 quizzes, 1000 chats, 50 study plans
  - **Enterprise**: Unlimited (999999) for all features

##### Tab 2: Custom Quotas
- Manual input fields for each quota limit:
  - Max Uploads
  - Summaries
  - Flashcards
  - Quizzes
  - Chats
  - Study Plans
- "Apply Custom Quotas" button to save changes

##### Tab 3: Usage Control
- View and modify current usage counters:
  - Used Uploads
  - Used Summaries
  - Used Flashcards
  - Used Quizzes
  - Used Chats
  - Used Study Plans
- Two action buttons:
  - **Reset All Usage** - Sets all usage counters to 0
  - **Save Usage Changes** - Saves modified usage values

#### **Current Quota Overview**
Displays real-time cards for each feature showing:
- Feature name
- Used / Max values
- Remaining quota

---

## Backend API Endpoints

### Admin Quota Management
All endpoints require admin authentication (`protect` + `authorizeRoles("admin")`)

#### 1. Get Admin Quota Details
```
GET /api/quotas/admin/details/:userId
```
Returns complete quota information including:
- User details (id, name, email, subscription tier/status)
- Quota limits and usage for all features
- Total usage breakdown
- Percentage usage for each feature
- Active subscription info (if exists)
- Available plans list

#### 2. Apply Subscription Plan
```
POST /api/quotas/admin/apply-plan/:userId
Body: {
  plan: "free" | "basic" | "premium" | "enterprise",
  customQuotas?: {
    maxUploads?: number,
    summaries?: number,
    flashcards?: number,
    quizzes?: number,
    chats?: number,
    studyPlans?: number
  },
  resetUsage?: boolean
}
```
Applies subscription plan quotas with optional custom overrides.

#### 3. Customize User Quota
```
PUT /api/quotas/admin/customize/:userId
Body: {
  maxUploads?: number,
  summaries?: number,
  flashcards?: number,
  quizzes?: number,
  chats?: number,
  studyPlans?: number,
  usedUploads?: number,
  usedSummaries?: number,
  usedFlashcards?: number,
  usedQuizzes?: number,
  usedChats?: number,
  usedStudyPlans?: number,
  resetDate?: string
}
```
Allows complete customization of all quota attributes.

#### 4. Reset User Quota
```
POST /api/quotas/user/:userId/reset
```
Resets all usage counters to 0 and updates reset date.

#### 5. Get Quota Statistics
```
GET /api/quotas/statistics
```
Returns comprehensive statistics:
- Total and active user counts
- Usage breakdown by feature
- Utilization percentages
- Top users by quota usage

---

## Frontend Services

### QuotaService Methods
Located in: `studyspark-frontend/src/app/services/quota.service.ts`

```typescript
// Get admin quota details with subscription info
getAdminQuotaDetails(userId: number): Observable<any>

// Apply subscription plan to user
applySubscriptionPlan(userId: number, data: {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  customQuotas?: {...};
  resetUsage?: boolean;
}): Observable<any>

// Customize all quota attributes
customizeUserQuota(userId: number, data: {...}): Observable<any>

// Reset user quota usage
resetUserQuota(userId: number): Observable<any>

// Get quota statistics
getQuotaStatistics(): Observable<any>
```

---

## How to Use

### Step 1: Access Admin Dashboard
1. Login as an admin user
2. Navigate to the admin dashboard

### Step 2: View Statistics
- Statistics cards are displayed at the top
- Shows real-time data about users, subscriptions, and quotas

### Step 3: Manage Student Quotas

#### Option A: Apply Subscription Plan
1. Click "View/Edit" on a user
2. Stay on "Apply Plan" tab
3. Select desired plan from dropdown
4. Click "Apply [Plan] Plan"
5. Confirm the action

#### Option B: Set Custom Quotas
1. Click "View/Edit" on a user
2. Navigate to "Custom Quotas" tab
3. Enter custom values for each quota limit
4. Click "Apply Custom Quotas"
5. Confirm the action

#### Option C: Control Usage
1. Click "View/Edit" on a user
2. Navigate to "Usage Control" tab
3. Either:
   - Click "Reset All Usage" to zero out counters
   - Or modify individual usage values and click "Save Usage Changes"

### Step 4: Review Changes
- The "Current Quota Overview" section updates automatically
- Shows used/max/remaining for each feature

---

## Troubleshooting

### View/Edit Button Not Working?
**Check these:**
1. Open browser console (F12) - look for error messages
2. Verify backend is running on port 5000
3. Check authentication token is valid
4. Look for console logs starting with "===" for debugging info

### Expected Console Logs:
```
=== Fetching quota for user ID: X
=== Received quota data: {...}
=== Selected user: {...}
=== Selected quota: {...}
=== Scrolling to quota editor
```

### Common Issues:

1. **401/403 Error**
   - Not logged in as admin
   - Token expired - try logging out and back in

2. **404 Error**
   - User or quota not found
   - User ID is invalid

3. **Modal Not Showing**
   - Check if `selectedUser` and `selectedQuota` are set (console logs)
   - Verify HTML template has `*ngIf="selectedQuota && selectedUser"`

4. **Statistics Not Loading**
   - Backend quota statistics endpoint may be failing
   - Check network tab for API call status

---

## Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 4200
- [ ] Login as admin
- [ ] See statistics dashboard at top
- [ ] Click "View/Edit" on a student
- [ ] Modal appears with user info
- [ ] All three tabs are visible and clickable
- [ ] Apply plan functionality works
- [ ] Custom quotas can be set
- [ ] Usage control works (reset + modify)
- [ ] Quota overview shows correct data
- [ ] Close button works
- [ ] Changes persist after refresh

---

## File Locations

### Backend Files Modified:
- `studyspark-backend/src/controllers/quotaController.js` - Added 3 new admin functions
- `studyspark-backend/src/routes/quotaRoutes.js` - Added 3 new routes

### Frontend Files Modified:
- `studyspark-frontend/src/app/services/quota.service.ts` - Added 5 new methods
- `studyspark-frontend/src/app/pages/admin/admin-dashboard/admin-dashboard.component.ts` - Enhanced with statistics and improved quota loading
- `studyspark-frontend/src/app/pages/admin/admin-dashboard/admin-dashboard.component.html` - Added statistics dashboard and improved quota modal

---

## Advanced Usage

### Bulk Operations
For bulk updates, use the existing endpoint:
```
PUT /api/quotas/bulk-update
Body: {
  subscriptionTier: "premium",  // or userIds: [1, 2, 3]
  quotaUpdates: {
    maxUploads: 100,
    summaries: 200,
    // etc.
  }
}
```

### Subscription Management
To fully change a user's subscription (with quota update):
```
PUT /api/subscriptions/user/:userId
Body: {
  tier: "premium",
  duration: 30,  // days
  notes: "Admin granted premium access"
}
```

---

## Support

If issues persist:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify database is synchronized
4. Review network tab for failed API calls
5. Ensure all models are imported in `server.js`

Backend is running on: http://localhost:5000
Frontend is running on: http://localhost:4200
