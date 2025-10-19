import express from 'express';
import Document from '../models/Document.js';
import Summary from '../models/Summary.js';
import ChatMessage from '../models/ChatMessage.js';
import ChatSession from '../models/ChatSession.js';
import Quiz from '../models/Quiz.js';
import Flashcard from '../models/Flashcard.js';
import StudyPlan from '../models/StudyPlan.js';

const router = express.Router();

router.get('/export/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const data = {
      users: [{ id: `u${userId}`, name: 'User', role: 'student' }],

      // ✅ Documents
      resources: await Document.findAll({
        where: { userId },
        attributes: [
          'id',
          'userId',
          'name',
          'originalName',
          'filePath',
          'fileType',
          'fileSize',
          'wordCount',
          'extractedText',
          'transcription',
          'isTranscribed',
          'status',
          'uploadedAt',
          'createdAt',
          'updatedAt'
        ]
      }),

      // ✅ Summaries
      summaries: await Summary.findAll({
        where: { userId },
        attributes: [
          'id',
          'userId',
          'documentId',
          'type',
          'content',
          'keyPoints',
          'generatedAt',
          'createdAt',
          'updatedAt'
        ]
      }),

      // ✅ Flashcards
      flashcards: await Flashcard.findAll({
        where: { userId },
        attributes: [
          'id',
          'userId',
          'setName',
          'cards',
          'totalCards',
          'createdAt',
          'updatedAt'
        ]
      }),

      // ✅ Quizzes
      quiz: await Quiz.findAll({
        where: { userId },
        attributes: [
          'id',
          'userId',
          'title',
          'questions',
          'score',
          'completed',
          'createdAt',
          'updatedAt'
        ]
      }),

      // ✅ Study plans
      study_plans: await StudyPlan.findAll({
        where: { userId },
        attributes: [
          'id',
          'userId',
          'documents',
          'tasks',
          'freeDays',
          'dailyHours',
          'sessionDuration',
          'createdAt',
          'updatedAt'
        ]
      }),

      // ✅ Chat history (last 200 messages across all contexts)
      chats: await ChatMessage.findAll({
        where: { userId },
        attributes: [
          'id',
          'userId',
          'sessionId',
          'documentId',
          'question',
          'answer',
          'sources',
          'confidence',
          'createdAt',
          'updatedAt'
        ],
        order: [['createdAt', 'DESC']],
        limit: 200
      }),

      // ✅ Chat sessions
      chat_sessions: await ChatSession.findAll({
        where: { userId },
        attributes: ['id', 'userId', 'title', 'createdAt', 'updatedAt'],
        order: [['updatedAt', 'DESC']]
      }),

      // No notes yet
      notes: [],
      qa_sessions: []
    };

    res.json(data);
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
