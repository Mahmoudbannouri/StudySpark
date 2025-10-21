import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Summary from '../models/Summary.js';
import Document from '../models/Document.js';

const upload = multer();

/**
 * POST /api/summaries/generate/upload
 * Generates summary from uploaded file (no document ID needed)
 */
export const generateSummaryFromUpload = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { length, userId } = req.body;

      console.log('📤 Generate from upload:', { length, userId });

      // Validation
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      if (!['short', 'medium', 'detailed'].includes(length)) {
        return res.status(400).json({ message: 'Invalid length type' });
      }

      // Prepare FormData with uploaded file buffer
      const formData = new FormData();
      formData.append('file', req.file.buffer, req.file.originalname);
      formData.append('level', length);

      console.log('🚀 Sending to FastAPI...');

      // Call FastAPI microservice
      const response = await axios.post('http://localhost:8000/summarize', formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000
      });

      console.log('✅ FastAPI response received:', response.data);

      const { summary: summaryText, keyPoints, metrics } = response.data;

      // Create summary in database (no documentId - it's an ad-hoc summary)
      const summary = await Summary.create({
        documentId: null, // No document associated
        userId,
        type: length,
        content: summaryText,
        keyPoints: keyPoints || [],
        metadata: metrics || {}, // Store FastAPI metrics
        wordCount: metrics?.wordCount || 0,
        readabilityScore: metrics?.readabilityScore || null,
        language: metrics?.language || null,
        readingLevel: metrics?.readingLevel || null,
        sentiment: metrics?.sentiment || {},
        keywords: metrics?.keywords || [],
        aiModel: metrics?.aiModel || 'facebook/bart-large-cnn',
        chunksUsed: metrics?.chunksUsed || 0,
        generatedAt: new Date()
      });

      console.log('💾 Summary saved:', summary.id);

      res.status(201).json({
        message: 'Summary generated successfully',
        summary: {
          id: summary.id,
          type: summary.type,
          length: summary.type,
          content: summary.content,
          keyPoints: summary.keyPoints,
          generatedAt: summary.generatedAt,
          metadata: summary.metadata
        }
      });
    } catch (error) {
      console.error('❌ Generate from upload error:', error.stack);
      if (error.response) {
        return res.status(error.response.status).json({
          message: 'FastAPI service error',
          error: error.response.data
        });
      }
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }
];

/**
 * POST /api/summaries/generate/document
 * Generates summary from existing document in storage
 */
export const generateSummaryFromDocument = async (req, res) => {
  try {
    const { documentId, length, userId } = req.body;

    console.log('📄 Generate from document:', { documentId, length, userId });

    // Validation
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    if (!documentId) {
      return res.status(400).json({ message: 'Document ID is required' });
    }
    if (!['short', 'medium', 'detailed'].includes(length)) {
      return res.status(400).json({ message: 'Invalid length type' });
    }

    // Fetch document from database
    const document = await Document.findOne({
      where: { id: documentId, userId }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if file exists
    const filePath = path.resolve(document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document file not found on server' });
    }

    console.log('📂 File found:', filePath);

    // Create FormData with file stream
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: document.originalName || document.name,
      contentType: document.fileType || 'application/octet-stream'
    });
    formData.append('level', length);

    console.log('🚀 Sending to FastAPI...');

    // Call FastAPI microservice
    const response = await axios.post('http://localhost:8000/summarize', formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000
    });

    console.log('✅ FastAPI response received:', response.data);

    const { summary: summaryText, keyPoints, metrics } = response.data;

    // Create summary in database
    const summary = await Summary.create({
      documentId,
      userId,
      type: length,
      content: summaryText,
      keyPoints: keyPoints || [],
      metadata: metrics || {},
      wordCount: metrics?.wordCount || 0,
      readabilityScore: metrics?.readabilityScore || null,
      language: metrics?.language || null,
      readingLevel: metrics?.readingLevel || null,
      sentiment: metrics?.sentiment || {},
      keywords: metrics?.keywords || [],
      aiModel: metrics?.aiModel || 'facebook/bart-large-cnn',
      chunksUsed: metrics?.chunksUsed || 0,
      generatedAt: new Date()
    });

    console.log('💾 Summary saved:', summary.id);

    res.status(201).json({
      message: 'Summary generated successfully',
      summary: {
        id: summary.id,
        documentId: summary.documentId,
        type: summary.type,
        length: summary.type,
        content: summary.content,
        keyPoints: summary.keyPoints,
        generatedAt: summary.generatedAt,
        metadata: summary.metadata
      }
    });
  } catch (error) {
    console.error('❌ Generate from document error:', error.stack);
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'FastAPI service error',
        error: error.response.data
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * GET /api/summaries/document/:documentId
 * Returns all summaries for a document
 */
export const getDocumentSummaries = async (req, res) => {
  try {
    const { userId } = req.query;
    const { documentId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const summaries = await Summary.findAll({
      where: {
        documentId,
        userId
      },
      order: [['generatedAt', 'DESC']]
    });

    const formattedSummaries = summaries.map(s => ({
      id: s.id,
      documentId: s.documentId,
      length: s.type,
      type: s.type,
      content: s.content,
      keyPoints: s.keyPoints,
      generatedAt: s.generatedAt,
      createdAt: s.createdAt,
      metadata: s.metadata
    }));

    res.json(formattedSummaries);
  } catch (error) {
    console.error('Get summaries error:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/summaries/:id
 * Returns a single summary by ID
 */
export const getSummaryById = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const summary = await Summary.findOne({
      where: { id, userId }
    });

    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    res.json({
      id: summary.id,
      documentId: summary.documentId,
      length: summary.type,
      type: summary.type,
      content: summary.content,
      keyPoints: summary.keyPoints,
      generatedAt: summary.generatedAt,
      metadata: summary.metadata
    });
  } catch (error) {
    console.error('Get summary error:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/summaries/:id
 * Deletes a summary
 */
export const deleteSummary = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const summary = await Summary.findOne({
      where: { id, userId }
    });

    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    await summary.destroy();
    res.json({ message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete summary error:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};