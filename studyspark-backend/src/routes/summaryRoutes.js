import express from 'express';
import {
  generateSummaryFromUpload,
  generateSummaryFromDocument,
  getDocumentSummaries,
  getSummaryById,
  deleteSummary
} from '../controllers/summaryController.js';

const router = express.Router();

// ✅ Generate summary from uploaded file (new file)
router.post('/generate/upload', generateSummaryFromUpload);

// ✅ Generate summary from existing document
router.post('/generate/document', generateSummaryFromDocument);

// Get summaries for a document
router.get('/document/:documentId', getDocumentSummaries);

// Get single summary
router.get('/:id', getSummaryById);

// Delete summary
router.delete('/:id', deleteSummary);

export default router;