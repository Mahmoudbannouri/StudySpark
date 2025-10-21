// Rabie: Routes for recommendation groups (health, single, batch). Mounted at /api/recommendation-groups
import express from 'express';
import {
  recommendGroups,
  recommendGroupsBatch,
  mlHealth,
  feedback,
} from '../controllers/recommendationgroupsController.js';
import { protect as authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Health proxy (no auth required)
router.get('/health', mlHealth);

// Single item recommendation
router.post('/', authMiddleware, recommendGroups);

// Batch recommendations
router.post('/batch', authMiddleware, recommendGroupsBatch);

// Feedback
router.post('/feedback', authMiddleware, feedback);

export default router;
