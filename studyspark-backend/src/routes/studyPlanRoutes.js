// routes/studyPlanRoutes.js
import express from 'express';
import { createOrUpdateStudyPlan, getStudyPlan } from '../controllers/studyPlanController.js';
import { protect as authMiddleware } from '../middleware/authMiddleware.js'; // your JWT/session middleware

const router = express.Router();

// Get user's study plan
router.get('/', authMiddleware, getStudyPlan);

// Create or update study plan
router.post('/', authMiddleware, createOrUpdateStudyPlan);

export default router;
