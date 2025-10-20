import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import Summary from '../models/Summary.js';
import Document from '../models/Document.js';

const upload = multer(); // middleware pour gérer les fichiers

/**
 * POST /api/summaries/generate
 * Reçoit un fichier, length et documentId
 * Appelle le microservice FastAPI pour générer le résumé
 * Sauvegarde le résumé dans la DB
 */
export const generateSummary = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { documentId, length } = req.body;

      // Vérification du fichier
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Vérification du length
      if (!['short', 'medium', 'detailed'].includes(length)) {
        return res.status(400).json({ message: 'Invalid length type' });
      }

      // Vérifier si le document existe et appartient à l'utilisateur
      const document = await Document.findOne({
        where: { id: documentId, userId: req.user.id }
      });

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Préparer FormData pour FastAPI
      const formData = new FormData();
      formData.append('file', req.file.buffer, req.file.originalname);
      formData.append('level', length);

      // Appel au microservice FastAPI
      const response = await axios.post('http://localhost:8000/summarize', formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000 // 2 minutes
      });

      const { summary: summaryText, keyPoints } = response.data;

      // Créer le résumé dans la DB
      const summary = await Summary.create({
        documentId,
        userId: req.user.id,
        length, 
        content: summaryText,
        keyPoints: JSON.stringify(keyPoints || [])
      });

      // Réponse au front
      res.status(201).json({
        message: 'Summary generated successfully',
        summary: {
          id: summary.id,
          length: summary.length,
          content: summary.content,
          keyPoints: summary.keyPoints ? JSON.parse(summary.keyPoints) : [],
          generatedAt: summary.createdAt
        }
      });

    } catch (error) {
      console.error('Generate summary error:', error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    }
  }
];

/**
 * GET /api/summaries/document/:documentId
 * Retourne tous les résumés pour un document
 */
export const getDocumentSummaries = async (req, res) => {
  try {
    const summaries = await Summary.findAll({
      where: {
        documentId: req.params.documentId,
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']] // ⚠️ utiliser createdAt
    });

    res.json(summaries);
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/summaries/:id
 * Retourne un résumé par ID
 */
export const getSummaryById = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      where: { id: req.params.id, userId: req.user.id }
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

/**
 * DELETE /api/summaries/:id
 * Supprime un résumé
 */
export const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      where: { id: req.params.id, userId: req.user.id }
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
