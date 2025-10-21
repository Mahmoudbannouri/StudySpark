// Rabie: New model for Study Groups (Phase 2 groundwork)
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const StudyGroup = sequelize.define('StudyGroup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  topic: { type: DataTypes.STRING(100), allowNull: false },
  difficulty: { type: DataTypes.STRING(30), allowNull: true },
  scheduleSlot: { type: DataTypes.STRING(100), allowNull: true },
  // Cluster label assigned by ML: 'structured' or 'flexible' (optional for legacy rows)
  cluster: { type: DataTypes.STRING(20), allowNull: true },
  status: { type: DataTypes.ENUM('active', 'archived'), defaultValue: 'active' },
}, {
  tableName: 'study_groups',
  timestamps: true,
  indexes: [ { fields: ['topic'] }, { fields: ['status'] }, { fields: ['cluster'] } ]
});

export default StudyGroup;
