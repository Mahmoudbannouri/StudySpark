import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Summary = sequelize.define('Summary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  length: {
    type: DataTypes.ENUM('short', 'medium', 'detailed'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  keyPoints: {
    type: DataTypes.JSON, // Array of key points
    allowNull: true
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'summaries',
  timestamps: true
});



export default Summary;
