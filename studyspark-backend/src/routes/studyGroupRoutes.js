// Rabie: StudyGroup routes — join group
import express from 'express';
import { joinGroup, createGroupForUser, listMyGroups } from '../controllers/studyGroupController.js';
import { protect as authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:groupId/join', authMiddleware, joinGroup);
router.post('/', authMiddleware, createGroupForUser);
router.get('/mine', authMiddleware, listMyGroups);

export default router;
