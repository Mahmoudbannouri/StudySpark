# Quota and Subscription Management API Documentation

## Overview
This document provides comprehensive documentation for the enhanced quota and subscription management system in StudySpark.

## Table of Contents
- [Models](#models)
- [Quota API Endpoints](#quota-api-endpoints)
- [Subscription API Endpoints](#subscription-api-endpoints)
- [Subscription Plans](#subscription-plans)
- [Usage Examples](#usage-examples)

---

## Models

### Quota Model
Tracks usage limits and current usage for each user.

**Fields:**
- `id` - Primary key
- `userId` - Foreign key to User
- `maxUploads` - Maximum allowed uploads
- `usedUploads` - Current upload count
- `summaries` - Maximum summaries allowed
- `usedSummaries` - Current summaries count
- `flashcards` - Maximum flashcards allowed
- `usedFlashcards` - Current flashcards count
- `quizzes` - Maximum quizzes allowed
- `usedQuizzes` - Current quizzes count
- `chats` - Maximum chat messages allowed
- `usedChats` - Current chat messages count
- `studyPlans` - Maximum study plans allowed
- `usedStudyPlans` - Current study plans count
- `resetDate` - Last quota reset date

**Instance Methods:**
- `canUseFeature(feature)` - Check if user can use a specific feature
- `incrementUsage(feature, amount)` - Increment usage for a feature
- `getRemainingQuota(feature)` - Get remaining quota for a feature
- `getUsagePercentage(feature)` - Get usage percentage for a feature
- `resetUsage()` - Reset all usage counters to 0
- `getTotalUsage()` - Get complete usage summary

### Subscription Model
Tracks user subscription history and details.

**Fields:**
- `id` - Primary key
- `userId` - Foreign key to User
- `plan` - Subscription plan (free, basic, premium, enterprise)
- `status` - Status (active, expired, cancelled)
- `startDate` - Subscription start date
- `endDate` - Subscription end date
- `price` - Subscription price
- `features` - JSON object with plan features
- `paymentMethod` - Payment method used
- `transactionId` - Transaction reference ID
- `autoRenew` - Auto-renewal flag
- `cancelledAt` - Cancellation date
- `notes` - Additional notes

---

## Quota API Endpoints

### 1. Get My Quota
Get current user's quota information.

**Endpoint:** `GET /api/quotas/me`

**Authentication:** Required (any authenticated user)

**Response:**
```json
{
  "id": 1,
  "userId": 5,
  "maxUploads": 25,
  "usedUploads": 10,
  "summaries": 50,
  "usedSummaries": 25,
  "totalUsage": {
    "uploads": { "used": 10, "max": 25, "remaining": 15 },
    "summaries": { "used": 25, "max": 50, "remaining": 25 }
  },
  "percentages": {
    "uploads": 40,
    "summaries": 50,
    "flashcards": 20,
    "quizzes": 10,
    "chats": 5,
    "studyPlans": 15
  }
}
```

### 2. Get All Quotas
Get all user quotas with pagination (Admin only).

**Endpoint:** `GET /api/quotas`

**Authentication:** Required (admin only)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)

**Response:**
```json
{
  "quotas": [
    {
      "id": 1,
      "userId": 5,
      "User": {
        "id": 5,
        "fullname": "John Doe",
        "email": "john@example.com",
        "subscriptionTier": "premium"
      },
      "totalUsage": { ... }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### 3. Get Quota by User ID
Get quota information for a specific user.

**Endpoint:** `GET /api/quotas/:id`

**Authentication:** Required

**Response:** Same as Get My Quota

### 4. Update Quota
Update quota values for a specific user.

**Endpoint:** `PUT /api/quotas/:id`

**Authentication:** Required

**Request Body:**
```json
{
  "maxUploads": 50,
  "summaries": 100,
  "flashcards": 200,
  "usedUploads": 0
}
```

**Response:**
```json
{
  "message": "Quota updated successfully",
  "quota": { ... }
}
```

### 5. Get Quota Statistics (Admin)
Get overall quota usage statistics for admin dashboard.

**Endpoint:** `GET /api/quotas/statistics`

**Authentication:** Required (admin only)

**Response:**
```json
{
  "overview": {
    "totalUsers": 500,
    "activeUsers": 350,
    "inactiveUsers": 150
  },
  "usageBreakdown": {
    "uploads": {
      "total": 10000,
      "used": 5000,
      "remaining": 5000,
      "percentage": 50
    },
    "summaries": { ... },
    "flashcards": { ... },
    "quizzes": { ... },
    "chats": { ... },
    "studyPlans": { ... }
  },
  "utilizationPercentage": {
    "uploads": 50,
    "summaries": 45,
    "flashcards": 60
  },
  "topUsers": [
    {
      "userId": 5,
      "userName": "John Doe",
      "email": "john@example.com",
      "subscriptionTier": "premium",
      "totalUsed": 500,
      "totalMax": 1000,
      "usagePercentage": 50
    }
  ]
}
```

### 6. Get User Quota History (Admin)
Get quota usage history for a specific user.

**Endpoint:** `GET /api/quotas/user/:userId/history`

**Authentication:** Required (admin only)

**Query Parameters:**
- `days` (optional) - Number of days to look back (default: 30)

**Response:**
```json
{
  "userId": 5,
  "userName": "John Doe",
  "email": "john@example.com",
  "subscriptionTier": "premium",
  "period": {
    "startDate": "2025-09-06T00:00:00.000Z",
    "endDate": "2025-10-06T00:00:00.000Z",
    "days": 30
  },
  "currentUsage": { ... },
  "resetDate": "2025-09-15T00:00:00.000Z",
  "percentages": { ... }
}
```

### 7. Reset User Quota (Admin)
Reset all usage counters for a specific user to 0.

**Endpoint:** `POST /api/quotas/user/:userId/reset`

**Authentication:** Required (admin only)

**Response:**
```json
{
  "message": "Quota reset successfully for user John Doe",
  "quota": { ... }
}
```

### 8. Bulk Update Quotas (Admin)
Update quotas for multiple users based on subscription plan or user IDs.

**Endpoint:** `PUT /api/quotas/bulk-update`

**Authentication:** Required (admin only)

**Request Body (by subscription tier):**
```json
{
  "subscriptionTier": "premium",
  "quotaUpdates": {
    "summaries": 200,
    "flashcards": 500,
    "quizzes": 100
  }
}
```

**Request Body (by user IDs):**
```json
{
  "userIds": [1, 2, 3, 4, 5],
  "quotaUpdates": {
    "summaries": 150,
    "flashcards": 300
  }
}
```

**Response:**
```json
{
  "message": "Successfully updated quotas for 25 users",
  "updatedCount": 25,
  "updates": {
    "summaries": 200,
    "flashcards": 500
  }
}
```

---

## Subscription API Endpoints

### 1. Get Subscription Plans
Get all available subscription plans (Public).

**Endpoint:** `GET /api/subscriptions/plans`

**Authentication:** Not required

**Response:**
```json
{
  "plans": {
    "free": {
      "name": "Free",
      "price": 0,
      "quotas": {
        "summaries": 10,
        "flashcards": 20,
        "quizzes": 5,
        "chats": 50,
        "studyPlans": 2,
        "maxUploads": 5
      },
      "duration": null,
      "features": { ... }
    },
    "basic": { ... },
    "premium": { ... },
    "enterprise": { ... }
  }
}
```

### 2. Get My Subscription
Get current user's subscription information.

**Endpoint:** `GET /api/subscriptions/my-subscription`

**Authentication:** Required

**Response:**
```json
{
  "tier": "premium",
  "status": "active",
  "startDate": "2025-09-06T00:00:00.000Z",
  "endDate": "2025-10-06T00:00:00.000Z",
  "plan": {
    "name": "Premium",
    "price": 19.99,
    "quotas": { ... },
    "features": { ... }
  },
  "quota": { ... },
  "subscription": { ... }
}
```

### 3. Subscribe to Plan
Subscribe to a new plan or upgrade/downgrade existing subscription.

**Endpoint:** `POST /api/subscriptions/subscribe`

**Authentication:** Required

**Request Body:**
```json
{
  "tier": "premium",
  "paymentMethod": "credit_card",
  "transactionId": "txn_12345"
}
```

**Response:**
```json
{
  "message": "Successfully subscribed to Premium plan!",
  "subscription": { ... },
  "tier": "premium",
  "endDate": "2025-10-06T00:00:00.000Z",
  "quota": { ... }
}
```

### 4. Cancel Subscription
Cancel current subscription and downgrade to free plan.

**Endpoint:** `POST /api/subscriptions/cancel`

**Authentication:** Required

**Response:**
```json
{
  "message": "Subscription cancelled. You are now on the Free plan.",
  "tier": "free",
  "quota": { ... }
}
```

### 5. Get All Subscriptions (Admin)
Get all user subscriptions with pagination and statistics.

**Endpoint:** `GET /api/subscriptions/all`

**Authentication:** Required (admin only)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)
- `status` (optional) - Filter by status (active, expired, cancelled)

**Response:**
```json
{
  "subscriptions": [ ... ],
  "statistics": {
    "totalActive": 250,
    "totalExpired": 50,
    "totalCancelled": 100,
    "total": 400
  },
  "pagination": {
    "total": 400,
    "page": 1,
    "limit": 50,
    "totalPages": 8
  }
}
```

### 6. Update User Subscription (Admin)
Admin can change a user's subscription plan and auto-update their quotas.

**Endpoint:** `PUT /api/subscriptions/user/:userId`

**Authentication:** Required (admin only)

**Request Body:**
```json
{
  "tier": "premium",
  "duration": 30,
  "notes": "Promotional upgrade for loyal customer"
}
```

**Response:**
```json
{
  "message": "Successfully updated subscription for user John Doe to Premium plan",
  "subscription": { ... },
  "user": {
    "id": 5,
    "fullname": "John Doe",
    "email": "john@example.com",
    "subscriptionTier": "premium",
    "subscriptionStatus": "active",
    "subscriptionEndDate": "2025-11-05T00:00:00.000Z"
  },
  "quota": { ... }
}
```

### 7. Get Subscription Statistics (Admin)
Get comprehensive subscription analytics and revenue metrics.

**Endpoint:** `GET /api/subscriptions/statistics`

**Authentication:** Required (admin only)

**Response:**
```json
{
  "planDistribution": {
    "free": 300,
    "basic": 100,
    "premium": 75,
    "enterprise": 25
  },
  "statusDistribution": {
    "active": 350,
    "expired": 50,
    "cancelled": 100
  },
  "revenue": {
    "monthly": 5000.00,
    "annual": 60000.00,
    "currency": "USD"
  },
  "metrics": {
    "totalUsers": 500,
    "paidUsers": 200,
    "freeUsers": 300,
    "conversionRate": 40.00,
    "totalSubscriptions": 450,
    "expiredSubscriptions": 50,
    "recentSubscriptions": 25,
    "expiringSoon": 10
  }
}
```

### 8. Check Expired Subscriptions (Admin)
Cron job endpoint to check and expire subscriptions that have passed their end date.

**Endpoint:** `POST /api/subscriptions/check-expired`

**Authentication:** Required (admin only)

**Response:**
```json
{
  "message": "15 subscriptions expired and downgraded to free",
  "count": 15
}
```

---

## Subscription Plans

### Free Plan
- **Price:** $0/month
- **Duration:** Unlimited
- **Quotas:**
  - Summaries: 10
  - Flashcards: 20
  - Quizzes: 5
  - Chats: 50
  - Study Plans: 2
  - Max Uploads: 5

### Basic Plan
- **Price:** $9.99/month
- **Duration:** 30 days
- **Quotas:**
  - Summaries: 50
  - Flashcards: 100
  - Quizzes: 25
  - Chats: 200
  - Study Plans: 10
  - Max Uploads: 25
- **Features:** Chat support included

### Premium Plan
- **Price:** $19.99/month
- **Duration:** 30 days
- **Quotas:**
  - Summaries: 200
  - Flashcards: 500
  - Quizzes: 100
  - Chats: 1000
  - Study Plans: 50
  - Max Uploads: 100
- **Features:** Chat support, Advanced analytics, Custom study plans

### Enterprise Plan
- **Price:** $49.99/month
- **Duration:** 30 days
- **Quotas:** Unlimited (represented as -1 in code, stored as 999999)
- **Features:** All premium features + API access + Dedicated support

---

## Usage Examples

### Example 1: Check if User Can Use Feature
```javascript
const quota = await Quota.findOne({ where: { userId: user.id } });
if (quota.canUseFeature('summaries')) {
  // User can create summary
  await quota.incrementUsage('summaries');
} else {
  return res.status(403).json({ message: 'Quota exceeded for summaries' });
}
```

### Example 2: Admin Bulk Update for Premium Users
```bash
curl -X PUT http://localhost:5000/api/quotas/bulk-update \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionTier": "premium",
    "quotaUpdates": {
      "summaries": 300,
      "flashcards": 600
    }
  }'
```

### Example 3: User Subscribes to Premium
```bash
curl -X POST http://localhost:5000/api/subscriptions/subscribe \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "premium",
    "paymentMethod": "stripe",
    "transactionId": "ch_abc123"
  }'
```

### Example 4: Admin Gets Quota Statistics
```bash
curl -X GET http://localhost:5000/api/quotas/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK** - Request succeeded
- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - User doesn't have permission
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

Error response format:
```json
{
  "message": "Error description"
}
```

---

## Notes

1. **Authentication**: All protected routes require a valid JWT token in the Authorization header.
2. **Admin Access**: Admin-only routes require the user to have role="admin".
3. **Transactions**: Subscription updates use database transactions to ensure data consistency.
4. **Quota Reset**: User quotas are automatically reset when subscription is renewed or changed.
5. **Unlimited Quotas**: Enterprise plan uses 999999 as unlimited quota representation.
6. **Cron Jobs**: Set up a scheduled task to call `/api/subscriptions/check-expired` daily.

---

## Database Migrations

After deploying these changes, ensure your database schema is updated:

```bash
# The Sequelize models will auto-sync on server start
# Or manually run migrations if using migration files
```

Required schema updates:
- Add usage tracking fields to Quota table
- Create Subscription table
- Update User.subscriptionTier enum to include 'basic', 'premium', 'enterprise'

---

## Future Enhancements

Potential improvements:
1. Create QuotaHistory table for detailed historical tracking
2. Add webhook support for payment processing
3. Implement automatic renewal system
4. Add usage alerts when approaching quota limits
5. Create subscription analytics dashboard
6. Add proration support for mid-cycle upgrades/downgrades
