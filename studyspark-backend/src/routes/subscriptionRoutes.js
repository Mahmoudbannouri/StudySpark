import express from 'express';
import {
  getSubscriptionPlans,
  getMySubscription,
  subscribe,
  cancelSubscription,
  checkExpiredSubscriptions
} from '../controllers/subscriptionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - get available plans
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(protect);

router.get('/my-subscription', getMySubscription);
router.post('/subscribe', subscribe);
router.post('/cancel', cancelSubscription);

// Admin only - check expired subscriptions (for cron job)
router.post('/check-expired', authorizeRoles('admin'), checkExpiredSubscriptions);

export default router;
