import express from 'express';
import {
  askQuestion,
  getDocumentChat,
  getAllUserChats,
  deleteChatMessage
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/ask', askQuestion);
router.get('/document/:documentId', getDocumentChat);
router.get('/all', getAllUserChats);
router.delete('/:id', deleteChatMessage);

export default router;
