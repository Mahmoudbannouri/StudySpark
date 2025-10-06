import Summary from '../models/Summary.js';
import Document from '../models/Document.js';

// @route   POST /api/summaries/generate
// @desc    Generate summary for a document (Imen's AI module)
// @access  Private
export const generateSummary = async (req, res) => {
  try {
    const { documentId, length } = req.body;

    if (!['short', 'medium', 'detailed'].includes(length)) {
      return res.status(400).json({ message: 'Invalid length type' });
    }

    const document = await Document.findOne({
      where: { id: documentId, userId: req.user.id }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // TODO: Call Imen's AI summarization model
    // const aiSummary = await aiSummarizer.generate(document.extractedText, length);

    // Placeholder AI response
    const mockSummaries = {
      short: 'This is a short summary of the document covering main points.',
      medium: 'This is a medium-length summary providing more context and details about the key concepts discussed in the document.',
      detailed: 'This is a detailed summary that thoroughly explains all major topics, subtopics, and important details found throughout the document. It provides comprehensive coverage of the material.'
    };

    const content = mockSummaries[length];
    const keyPoints = [
      'Main concept 1',
      'Important idea 2',
      'Key takeaway 3'
    ];

    // Save summary to database
    const summary = await Summary.create({
      documentId,
      userId: req.user.id,
      length,
      content,
      keyPoints
    });

    res.status(201).json({
      message: 'Summary generated successfully',
      summary: {
        id: summary.id,
        length: summary.length,
        content: summary.content,
        keyPoints: summary.keyPoints,
        generatedAt: summary.generatedAt
      }
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/summaries/document/:documentId
// @desc    Get all summaries for a document
// @access  Private
export const getDocumentSummaries = async (req, res) => {
  try {
    const summaries = await Summary.findAll({
      where: {
        documentId: req.params.documentId,
        userId: req.user.id
      },
      order: [['generatedAt', 'DESC']]
    });

    res.json(summaries);
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/summaries/:id
// @desc    Get single summary
// @access  Private
export const getSummaryById = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/summaries/:id
// @desc    Delete a summary
// @access  Private
export const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    await summary.destroy();
    res.json({ message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
