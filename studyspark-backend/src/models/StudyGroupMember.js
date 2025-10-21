// Rabie: New model for Study Group memberships
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const StudyGroupMember = sequelize.define('StudyGroupMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  groupId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'study_groups', key: 'id' } },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  role: { type: DataTypes.ENUM('member'), defaultValue: 'member' },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  leftAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'study_group_members',
  timestamps: true,
  indexes: [ { fields: ['groupId'] }, { fields: ['userId'] } ]
});

export default StudyGroupMember;
