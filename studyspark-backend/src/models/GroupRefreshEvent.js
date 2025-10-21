// Rabie: New model for group refresh audit events
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const GroupRefreshEvent = sequelize.define('GroupRefreshEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  trigger: { type: DataTypes.ENUM('exam', 'schedule', 'manual'), allowNull: false },
  topic: { type: DataTypes.STRING(100), allowNull: true },
  beforeSnapshot: { type: DataTypes.JSON, allowNull: true },
  afterSnapshot: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'group_refresh_events',
  timestamps: true,
  indexes: [ { fields: ['trigger'] }, { fields: ['topic'] } ]
});

export default GroupRefreshEvent;
