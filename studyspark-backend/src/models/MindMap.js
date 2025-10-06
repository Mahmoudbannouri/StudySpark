import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const MindMap = sequelize.define('MindMap', {
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
  nodes: {
    type: DataTypes.JSON, // Hierarchical structure of topics
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mind_maps',
  timestamps: true
});

export default MindMap;
