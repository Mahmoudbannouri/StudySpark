import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RecommendationFeedback = sequelize.define('RecommendationFeedback', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  groupId: { type: DataTypes.INTEGER, allowNull: true },
  subject: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.ENUM('impression','click','join','dismiss'), allowNull: false },
  meta: { type: DataTypes.JSON, allowNull: true }
}, {
  tableName: 'recommendation_feedback',
  timestamps: true
});

export default RecommendationFeedback;