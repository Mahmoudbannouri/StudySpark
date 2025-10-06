import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for general chat
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  sources: {
    type: DataTypes.JSON, // Array of web sources if web search was used
    allowNull: true
  },
  useWebSearch: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confidence: {
    type: DataTypes.FLOAT, // AI confidence score
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'chat_messages',
  timestamps: true
});

export default ChatMessage;
