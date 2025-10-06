import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';

// Generate quiz (Rihem's AI module)
export const generateQuiz = async (req, res) => {
  try {
    const { documentId, count = 10 } = req.body;

    const document = await Document.findOne({
      where: { id: documentId, userId: req.user.id }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // TODO: Call Rihem's AI quiz generator
    // const aiQuiz = await aiQuizGenerator.generate(document.extractedText, count);

    // Mock quiz questions
    const questions = Array.from({ length: count }, (_, i) => ({
      question: `Question ${i + 1} from the document?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is the explanation for question ${i + 1}.`
    }));

    const quiz = await Quiz.create({
      documentId,
      userId: req.user.id,
      title: `${document.name} - Quiz`,
      questions,
      totalQuestions: questions.length
    });

    res.status(201).json({
      message: 'Quiz generated successfully',
      quiz
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit quiz answers and calculate score
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers = [0, 2, 1, 3, ...] (indices)

    const quiz = await Quiz.findOne({
      where: { id: quizId, userId: req.user.id }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    quiz.score = score;
    quiz.completed = true;
    quiz.completedAt = new Date();
    await quiz.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      correctCount,
      totalQuestions: quiz.totalQuestions
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all quizzes for a document
export const getDocumentQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      where: {
        documentId: req.params.documentId,
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single quiz
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.destroy();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
