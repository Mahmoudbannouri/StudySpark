# Developer Quick Reference Guide

## Using Quota Management in Your Code

### Check if User Can Use a Feature
```javascript
import Quota from '../models/Quota.js';

// In your controller
const quota = await Quota.findOne({ where: { userId: req.user.id } });

if (!quota.canUseFeature('summaries')) {
  return res.status(403).json({
    message: 'Quota exceeded for summaries',
    remaining: quota.getRemainingQuota('summaries'),
    percentage: quota.getUsagePercentage('summaries')
  });
}
```

### Increment Usage After Feature Use
```javascript
// After successfully creating a summary
await quota.incrementUsage('summaries');

// Or increment by multiple
await quota.incrementUsage('chats', 5);
```

### Get Remaining Quota
```javascript
const remaining = quota.getRemainingQuota('flashcards');
console.log(`User has ${remaining} flashcards remaining`);
```

### Get Usage Percentage
```javascript
const percentage = quota.getUsagePercentage('quizzes');
if (percentage > 90) {
  // Send warning email
}
```

### Reset User Quota
```javascript
await quota.resetUsage();
```

---

## Using Subscription Management

### Get Current User's Subscription
```javascript
import User from '../models/userModel.js';
import Quota from '../models/Quota.js';

const user = await User.findByPk(userId, {
  include: [Quota]
});

console.log(user.subscriptionTier); // 'free', 'basic', 'premium', 'enterprise'
console.log(user.subscriptionStatus); // 'active', 'expired', 'cancelled'
```

### Check Subscription Features
```javascript
import { SUBSCRIPTION_PLANS } from '../controllers/subscriptionController.js';

const userPlan = SUBSCRIPTION_PLANS[user.subscriptionTier];

if (userPlan.features.advancedAnalytics) {
  // Show advanced analytics
}
```

### Subscribe User to Plan
```javascript
// User subscribes via API endpoint
// POST /api/subscriptions/subscribe
// Body: { tier: 'premium', paymentMethod: 'stripe', transactionId: 'txn_123' }
```

---

## Admin Operations

### Bulk Update Quotas by Tier
```javascript
// PUT /api/quotas/bulk-update
{
  "subscriptionTier": "premium",
  "quotaUpdates": {
    "summaries": 300,
    "flashcards": 600,
    "quizzes": 150
  }
}
```

### Update Specific User's Subscription
```javascript
// PUT /api/subscriptions/user/5
{
  "tier": "premium",
  "duration": 30,
  "notes": "Promotional upgrade"
}
```

### Reset User's Quota
```javascript
// POST /api/quotas/user/5/reset
```

---

## Middleware Usage

### Protect Routes with Authentication
```javascript
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

// User must be authenticated
router.get('/protected', protect, handler);

// User must be admin
router.get('/admin-only', protect, authorizeRoles('admin'), handler);
```

---

## Common Patterns

### Pattern 1: Feature with Quota Check
```javascript
export const createSummary = async (req, res) => {
  try {
    // 1. Get user's quota
    const quota = await Quota.findOne({ where: { userId: req.user.id } });

    // 2. Check if user can use feature
    if (!quota.canUseFeature('summaries')) {
      return res.status(403).json({
        message: 'Summary quota exceeded',
        remaining: quota.getRemainingQuota('summaries')
      });
    }

    // 3. Create the summary
    const summary = await Summary.create({
      userId: req.user.id,
      content: req.body.content
    });

    // 4. Increment usage
    await quota.incrementUsage('summaries');

    // 5. Return success
    res.json({
      summary,
      remainingQuota: quota.getRemainingQuota('summaries')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Pattern 2: Admin Statistics Endpoint
```javascript
export const getStatistics = async (req, res) => {
  try {
    // Aggregate data from multiple sources
    const totalUsers = await User.count();
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' }
    });

    const quotaStats = await Quota.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('usedSummaries')), 'totalSummaries'],
        [sequelize.fn('SUM', sequelize.col('usedFlashcards')), 'totalFlashcards']
      ]
    });

    res.json({
      totalUsers,
      activeSubscriptions,
      usage: quotaStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Pattern 3: Subscription Update with Transaction
```javascript
export const updateSubscription = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Update user
    await user.update({ subscriptionTier: newTier }, { transaction });

    // 2. Update quota
    await quota.update({ summaries: newQuotas.summaries }, { transaction });

    // 3. Create subscription record
    await Subscription.create({ userId: user.id, ... }, { transaction });

    // 4. Commit transaction
    await transaction.commit();

    res.json({ message: 'Updated successfully' });
  } catch (error) {
    // Rollback on error
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};
```

---

## Testing Examples

### Test Quota Methods
```javascript
import { expect } from 'chai';
import Quota from '../models/Quota.js';

describe('Quota Model', () => {
  it('should check if feature is available', async () => {
    const quota = await Quota.create({
      userId: 1,
      summaries: 10,
      usedSummaries: 5
    });

    expect(quota.canUseFeature('summaries')).to.be.true;
  });

  it('should increment usage', async () => {
    const quota = await Quota.create({
      userId: 1,
      summaries: 10,
      usedSummaries: 5
    });

    await quota.incrementUsage('summaries');
    expect(quota.usedSummaries).to.equal(6);
  });
});
```

### Test API Endpoints
```javascript
import request from 'supertest';
import app from '../app.js';

describe('Quota API', () => {
  it('should get user quota', async () => {
    const res = await request(app)
      .get('/api/quotas/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('summaries');
  });
});
```

---

## Debugging Tips

### Check Quota Status
```javascript
console.log('Quota Status:', {
  canUse: quota.canUseFeature('summaries'),
  remaining: quota.getRemainingQuota('summaries'),
  percentage: quota.getUsagePercentage('summaries'),
  usage: quota.getTotalUsage()
});
```

### Log Subscription Changes
```javascript
console.log('Subscription Change:', {
  userId: user.id,
  oldTier: user.subscriptionTier,
  newTier: newTier,
  oldQuotas: oldQuota.toJSON(),
  newQuotas: newQuota.toJSON()
});
```

---

## Environment Variables

Required variables in `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=studyspark
PORT=5000
JWT_SECRET=your_jwt_secret
```

---

## Common Issues and Solutions

### Issue: Quota not updating after subscription change
**Solution**: Ensure transaction is properly committed
```javascript
await transaction.commit();
```

### Issue: User can't access feature despite having quota
**Solution**: Check if subscription is active
```javascript
if (user.subscriptionStatus !== 'active') {
  return res.status(403).json({ message: 'Subscription not active' });
}
```

### Issue: Statistics endpoint timing out
**Solution**: Add pagination or caching
```javascript
const quotas = await Quota.findAll({
  limit: 100,
  offset: page * 100
});
```

---

## Performance Tips

1. **Use Indexes**: Ensure proper indexes on frequently queried fields
2. **Pagination**: Always paginate large result sets
3. **Caching**: Cache subscription plans (they rarely change)
4. **Batch Operations**: Use bulk updates when possible
5. **Lazy Loading**: Only include relations when needed

---

## Security Best Practices

1. **Validate Input**: Always validate user input
2. **Use Transactions**: For operations that modify multiple tables
3. **Check Authorization**: Verify user permissions before operations
4. **Sanitize Data**: Use Sequelize parameterized queries
5. **Rate Limiting**: Implement rate limiting on API endpoints

---

## Cron Job Setup

### Daily Subscription Check
```javascript
// Using node-cron
import cron from 'node-cron';
import axios from 'axios';

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await axios.post('http://localhost:5000/api/subscriptions/check-expired', {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Expired subscriptions checked');
  } catch (error) {
    console.error('Cron job failed:', error);
  }
});
```

---

## API Request Examples (cURL)

### Get My Quota
```bash
curl -X GET http://localhost:5000/api/quotas/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Subscribe to Premium
```bash
curl -X POST http://localhost:5000/api/subscriptions/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier":"premium","paymentMethod":"stripe","transactionId":"txn_123"}'
```

### Admin: Get Statistics
```bash
curl -X GET http://localhost:5000/api/quotas/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Admin: Bulk Update
```bash
curl -X PUT http://localhost:5000/api/quotas/bulk-update \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscriptionTier":"premium","quotaUpdates":{"summaries":300}}'
```

---

## Quick Reference Table

| Feature | Max (Free) | Max (Basic) | Max (Premium) | Max (Enterprise) |
|---------|-----------|-------------|---------------|-----------------|
| Uploads | 5 | 25 | 100 | Unlimited |
| Summaries | 10 | 50 | 200 | Unlimited |
| Flashcards | 20 | 100 | 500 | Unlimited |
| Quizzes | 5 | 25 | 100 | Unlimited |
| Chats | 50 | 200 | 1000 | Unlimited |
| Study Plans | 2 | 10 | 50 | Unlimited |

---

## Additional Resources

- **Sequelize Docs**: https://sequelize.org/docs/v6/
- **Express Docs**: https://expressjs.com/
- **JWT Docs**: https://jwt.io/
- **MySQL Docs**: https://dev.mysql.com/doc/

---

## Support

For questions or issues:
1. Check this guide first
2. Review `QUOTA_SUBSCRIPTION_API.md` for API details
3. Check `ENHANCEMENT_SUMMARY.md` for implementation details
4. Review code comments in controllers and models
