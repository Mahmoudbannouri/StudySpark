import express from 'express';
import {
  generateQuiz,
  submitQuiz,
  getDocumentQuizzes,
  getQuizById,
  deleteQuiz
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateQuiz);
router.post('/submit', submitQuiz);
router.get('/document/:documentId', getDocumentQuizzes);
router.get('/:id', getQuizById);
router.delete('/:id', deleteQuiz);

export default router;
