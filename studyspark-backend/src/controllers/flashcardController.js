import Flashcard from '../models/Flashcard.js';
import Document from '../models/Document.js';

// Generate flashcards (Imen's AI module)
export const generateFlashcards = async (req, res) => {
  try {
    const { documentId, count = 10 } = req.body;

    const document = await Document.findOne({
      where: { id: documentId, userId: req.user.id }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // TODO: Call AI flashcard generator (Imen)
    // const aiCards = await aiFlashcardGenerator.generate(document.extractedText, count);

    // Mock flashcards
    const cards = Array.from({ length: count }, (_, i) => ({
      question: `Question ${i + 1} about the document?`,
      answer: `Answer to question ${i + 1}.`,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    }));

    const flashcard = await Flashcard.create({
      documentId,
      userId: req.user.id,
      setName: `${document.name} - Flashcards`,
      cards,
      totalCards: cards.length
    });

    res.status(201).json({
      message: 'Flashcards generated successfully',
      flashcard
    });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all flashcard sets for a document
export const getDocumentFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.findAll({
      where: {
        documentId: req.params.documentId,
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(flashcards);
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single flashcard set
export const getFlashcardById = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }

    res.json(flashcard);
  } catch (error) {
    console.error('Get flashcard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete flashcard set
export const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }

    await flashcard.destroy();
    res.json({ message: 'Flashcard set deleted successfully' });
  } catch (error) {
    console.error('Delete flashcard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
