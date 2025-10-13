import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const StudyPlan = sequelize.define('StudyPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // The user who owns this plan
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // The document associated with this plan
  documents: {
  type: DataTypes.JSON, // stores an array of document IDs
  allowNull: false
}
,

  // Optional exam date for this document
  examDates: {
    type: DataTypes.JSON,
    allowNull: true
  },

  // Array of tasks with title, day, start/end time, type, completed
  tasks: {
    type: DataTypes.JSON,
    allowNull: false
  },

  // Array of weekdays the user will study, e.g. ["Monday", "Wednesday"]
  freeDays: {
    type: DataTypes.JSON,
    allowNull: false
  },

  // Object of daily available hours, e.g. { "Monday": ["08:00-12:00", "18:00-21:00"] }
  dailyHours: {
    type: DataTypes.JSON,
    allowNull: false
  },

  // Duration of each session in hours
  sessionDuration: {
    type: DataTypes.INTEGER,
    allowNull: false
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
