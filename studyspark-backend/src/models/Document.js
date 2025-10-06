import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING, // pdf, txt, mp3, mp4, etc
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER, // in bytes
    allowNull: false
  },
  wordCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  extractedText: {
    type: DataTypes.TEXT('long'), // For PDF/TXT content
    allowNull: true
  },
  transcription: {
    type: DataTypes.TEXT('long'), // For audio/video transcription
    allowNull: true
  },
  isTranscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('processing', 'ready', 'error'),
    defaultValue: 'processing'
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'documents',
  timestamps: true
});

export default Document;
