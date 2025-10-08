import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extract text content from different file types
 * @param {string} filePath - Path to the file
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<{text: string, wordCount: number}>}
 */
export const extractTextFromFile = async (filePath, fileType) => {
  try {
    let text = '';

    if (fileType === 'application/pdf') {
      // Extract text from PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (fileType === 'text/plain') {
      // Read text file directly
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      // For audio/video files, return empty text (will be transcribed separately)
      return { text: '', wordCount: 0 };
    }

    // Clean up text
    text = text.trim();

    // Count words (split by whitespace and filter empty strings)
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    return { text, wordCount };
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

/**
 * Get file type category
 * @param {string} mimeType - MIME type of the file
 * @returns {string} - Category: 'pdf', 'text', 'audio', 'video'
 */
export const getFileCategory = (mimeType) => {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/plain') return 'text';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  return 'unknown';
};
