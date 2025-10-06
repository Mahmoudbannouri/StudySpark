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
  maxUploads: {
    type: DataTypes.INTEGER,
    defaultValue: 10, // number of files allowed
  },
  usedUploads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxAIRequests: {
    type: DataTypes.INTEGER,
    defaultValue: 100, // limit for AI generation (summary/quiz)
  },
  usedAIRequests: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  resetDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Quota;
