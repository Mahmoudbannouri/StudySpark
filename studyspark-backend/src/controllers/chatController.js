import ChatMessage from '../models/ChatMessage.js';
import Document from '../models/Document.js';
import ChatSession from '../models/ChatSession.js';
import axios from 'axios';

export const askQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { question, documentId, sessionId } = req.body;

    const response = await axios.post('http://localhost:5004/ask', {
      user_id: userId,  // ✅ send plain numeric ID
      question
    });
    

    const answer = response.data.answer || 'No answer generated.';
    const confidence = response.data.confidence || null;
    const sources = response.data.sources || null;

    // Save in your chat_messages table
    const chat = await ChatMessage.create({
      userId,
      documentId,
      sessionId: sessionId || null,
      question,
      answer,
      sources,
      confidence
    });

    res.json({ ok: true, chat });
  } catch (error) {
    console.error('Chat Error:', error.message);
    res.status(500).json({ ok: false, error: error.message });
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

// Sessions
export const listSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });
    res.json(sessions);
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createSession = async (req, res) => {
  try {
    const session = await ChatSession.create({
      userId: req.user.id,
      title: req.body?.title || 'New session'
    });
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSessionMessages = async (req, res) => {
  try {
    const items = await ChatMessage.findAll({
      where: { userId: req.user.id, sessionId: req.params.sessionId },
      order: [['createdAt', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/chat/sessions/:sessionId
export const renameSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'No title provided' });
    const session = await ChatSession.findOne({ where: { id: sessionId, userId: req.user.id } });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.title = title;
    await session.save();
    res.json(session);
  } catch (error) {
    console.error('Rename session error:', error);
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
