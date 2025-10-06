import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const StudyPlan = sequelize.define('StudyPlan', {
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
    allowNull: false
  },
  examDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tasks: {
    type: DataTypes.JSON, // Array of {day, task, duration, completed}
    allowNull: false
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  progress: {
    type: DataTypes.INTEGER, // Percentage
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'study_plans',
  timestamps: true
});

export default StudyPlan;
