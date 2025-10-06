import express from 'express';
import {
  upload,
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  extractText
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Document CRUD
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getUserDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);
router.post('/:id/extract-text', extractText);

export default router;
