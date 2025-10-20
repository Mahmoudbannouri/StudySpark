// models/Summary.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Définition du modèle Summary : stocke les résumés générés par l'IA
const Summary = sequelize.define('Summary', {
  // Identifiant unique du résumé
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Référence au document source
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'documents', // Nom de la table liée
      key: 'id'
    }
  },

  // Référence à l'utilisateur qui a généré le résumé
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // Type de résumé : court, moyen ou détaillé
  type: {
    type: DataTypes.ENUM('short', 'medium', 'detailed'),
    allowNull: false,
    defaultValue: 'medium'
  },

  // Contenu du résumé généré
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // Date de création automatique
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  // Options du modèle
  timestamps: false, // Désactive createdAt/updatedAt automatiques si tu veux les gérer manuellement
  tableName: 'summaries' // Nom explicite de la table
});

export default Summary;
