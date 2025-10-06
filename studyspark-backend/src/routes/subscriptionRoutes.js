import express from 'express';
import {
  getSubscriptionPlans,
  getMySubscription,
  subscribe,
  cancelSubscription,
  checkExpiredSubscriptions,
  getAllSubscriptions,
  updateUserSubscription,
  getSubscriptionStatistics
} from '../controllers/subscriptionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - get available plans
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(protect);

// User routes
router.get('/my-subscription', getMySubscription);
router.post('/subscribe', subscribe);
router.post('/cancel', cancelSubscription);

// Admin only routes
router.get('/all', authorizeRoles('admin'), getAllSubscriptions);
router.get('/statistics', authorizeRoles('admin'), getSubscriptionStatistics);
router.put('/user/:userId', authorizeRoles('admin'), updateUserSubscription);
router.post('/check-expired', authorizeRoles('admin'), checkExpiredSubscriptions);

export default router;
