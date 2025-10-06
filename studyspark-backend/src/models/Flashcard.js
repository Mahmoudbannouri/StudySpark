import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Flashcard = sequelize.define('Flashcard', {
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
  setName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cards: {
    type: DataTypes.JSON, // Array of {question, answer, difficulty}
    allowNull: false
  },
  totalCards: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'flashcards',
  timestamps: true
});

export default Flashcard;
