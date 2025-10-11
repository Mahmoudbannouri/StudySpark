import express from 'express';
import Document from '../models/Document.js';
import Summary from '../models/Summary.js';
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
          'extractedText',
          'transcription',
          'status'
        ]
      }),

      // ✅ Summaries
      summaries: await Summary.findAll({
        where: { userId },
        attributes: ['id', 'userId', 'documentId', 'length', 'content', 'keyPoints']
      }),

      // ✅ Flashcards
      flashcards: await Flashcard.findAll({
        where: { userId },
        attributes: ['id', 'userId', 'setName', 'cards', 'totalCards']
      }),

      // ✅ Quizzes
      quiz: await Quiz.findAll({
        where: { userId },
        attributes: ['id', 'userId', 'title', 'questions', 'score', 'completed']
      }),

      // ✅ Study plans
      study_plans: await StudyPlan.findAll({
        where: { userId },
        attributes: ['id', 'userId', 'title', 'examDate', 'tasks', 'progress']
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
