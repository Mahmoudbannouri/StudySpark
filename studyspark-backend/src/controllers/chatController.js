import ChatMessage from '../models/ChatMessage.js';
import Document from '../models/Document.js';

// Ask question with RAG (Mahmoud's AI module - your chatbot!)
export const askQuestion = async (req, res) => {
  try {
    const { documentId, question, useWebSearch = false } = req.body;

    let document = null;
    if (documentId) {
      document = await Document.findOne({
        where: { id: documentId, userId: req.user.id }
      });

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
    }

    // TODO: Call your RAG chatbot model (Mahmoud)
    // const aiResponse = await ragChatbot.ask(question, document?.extractedText, useWebSearch);

    // Mock AI response
    const answer = document
      ? `Based on "${document.name}": This is an AI-generated answer to your question about the document content.`
      : 'This is a general AI response to your question.';

    const sources = useWebSearch ? [
      { title: 'Source 1', url: 'https://example.com/1' },
      { title: 'Source 2', url: 'https://example.com/2' }
    ] : null;

    // Save chat message
    const chatMessage = await ChatMessage.create({
      documentId: documentId || null,
      userId: req.user.id,
      question,
      answer,
      sources,
      useWebSearch,
      confidence: 0.85 // AI confidence score
    });

    res.status(201).json({
      message: 'Question answered successfully',
      chat: {
        id: chatMessage.id,
        question: chatMessage.question,
        answer: chatMessage.answer,
        sources: chatMessage.sources,
        confidence: chatMessage.confidence,
        createdAt: chatMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get chat history for a document
export const getDocumentChat = async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      where: {
        documentId: req.params.documentId,
        userId: req.user.id
      },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'question', 'answer', 'sources', 'confidence', 'createdAt']
    });

    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chat messages for user (general + document-specific)
export const getAllUserChats = async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50 // Last 50 messages
    });

    res.json(messages);
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete chat message
export const deleteChatMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.destroy();
    res.json({ message: 'Chat message deleted successfully' });
  } catch (error) {
    console.error('Delete chat message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
