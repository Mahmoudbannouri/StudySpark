import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Quiz = sequelize.define('Quiz', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  questions: {
    type: DataTypes.JSON, // Array of {question, options[], correctAnswer, explanation}
    allowNull: false
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER, // User's score if completed
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quizzes',
  timestamps: true
});

export default Quiz;
