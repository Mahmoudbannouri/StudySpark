import express from 'express';
import { generateSummary, getDocumentSummaries, getSummaryById, deleteSummary } from '../controllers/summaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateSummary); // multer gère le fichier directement ici
router.get('/document/:documentId', getDocumentSummaries);
router.get('/:id', getSummaryById);
router.delete('/:id', deleteSummary);

export default router;
