import Document from '../models/Document.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|txt|mp3|wav|mp4|mpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, TXT, MP3, WAV, and MP4 files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// @route   POST /api/documents/upload
// @desc    Upload a new document
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    // Create document record
    const document = await Document.create({
      userId: req.user.id,
      name: originalname,
      originalName: originalname,
      filePath: filePath,
      fileType: mimetype,
      fileSize: size,
      status: 'processing'
    });

    // TODO: Process file based on type
    // - If PDF/TXT: Extract text and count words
    // - If audio/video: Queue for transcription (Hadil's module)
    // For now, mark as ready
    document.status = 'ready';
    document.wordCount = 0; // Will be updated after processing
    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        name: document.name,
        fileType: document.fileType,
        wordCount: document.wordCount,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// @route   GET /api/documents
// @desc    Get all documents for current user
// @access  Private
export const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      order: [['uploadedAt', 'DESC']],
      attributes: ['id', 'name', 'fileType', 'wordCount', 'status', 'uploadedAt']
    });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/documents/:id
// @desc    Get single document by ID
// @access  Private
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete physical file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/documents/:id/extract-text
// @desc    Extract text from PDF/TXT (called after upload)
// @access  Private
export const extractText = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // TODO: Implement text extraction based on file type
    // For PDF: use pdf-parse or similar
    // For TXT: just read file
    // Example:
    // const extractedText = await extractTextFromFile(document.filePath, document.fileType);
    // const wordCount = extractedText.split(/\s+/).length;

    const extractedText = 'Sample extracted text'; // Placeholder
    const wordCount = 100; // Placeholder

    document.extractedText = extractedText;
    document.wordCount = wordCount;
    await document.save();

    res.json({
      message: 'Text extracted successfully',
      wordCount
    });
  } catch (error) {
    console.error('Extract text error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
