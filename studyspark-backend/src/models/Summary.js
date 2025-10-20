// models/Summary.js
const Summary = sequelize.define('Summary', {
  // ...
  length: {
    type: DataTypes.ENUM('short', 'medium', 'detailed'),
    allowNull: false,
    defaultValue: 'medium'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  keyPoints: { // si tu veux sauvegarder keyPoints en JSON
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'summaries'
});
