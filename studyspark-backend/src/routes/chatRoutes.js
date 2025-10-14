import express from 'express';
import {
  askQuestion,
  getDocumentChat,
  getAllUserChats,
  deleteChatMessage,
  listSessions,
  createSession,
  getSessionMessages,
  renameSession
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/ask', askQuestion);
router.get('/document/:documentId', getDocumentChat);
router.get('/all', getAllUserChats);
router.delete('/:id', deleteChatMessage);
// Sessions
router.get('/sessions', listSessions);
router.post('/sessions', createSession);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.patch('/sessions/:sessionId', renameSession);

export default router;
