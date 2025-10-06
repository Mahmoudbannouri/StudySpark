// models/Quota.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Quota = sequelize.define("Quota", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Document uploads
  maxUploads: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  usedUploads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Summaries
  summaries: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  // Flashcards
  flashcards: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  // Quizzes
  quizzes: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  // Chat messages
  chats: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
  },
  // Study plans
  studyPlans: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  // Reset date
  resetDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Quota;
