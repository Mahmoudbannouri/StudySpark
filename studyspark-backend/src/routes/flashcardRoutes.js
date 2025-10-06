import express from 'express';
import {
  generateFlashcards,
  getDocumentFlashcards,
  getFlashcardById,
  deleteFlashcard
} from '../controllers/flashcardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateFlashcards);
router.get('/document/:documentId', getDocumentFlashcards);
router.get('/:id', getFlashcardById);
router.delete('/:id', deleteFlashcard);

export default router;
