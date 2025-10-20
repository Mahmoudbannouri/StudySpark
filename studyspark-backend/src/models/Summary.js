// models/Summary.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Summary = sequelize.define('Summary', {
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
  
  // Type de résumé (remplace "length")
  type: {
    type: DataTypes.ENUM('short', 'medium', 'detailed'),
    allowNull: false,
    defaultValue: 'medium'
  },
  
  // Contenu du résumé
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  
  // Points clés extraits
  keyPoints: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  
  // ========================================
  // 🆕 CHAMPS RAG AVANCÉS
  // ========================================
  
  // Métadonnées IA complètes
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Stocke toutes les métriques IA (modèle, tokens, language, etc.)'
  },
  
  // RAG activé ?
  ragEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indique si RAG a été utilisé pour ce résumé'
  },
  
  // Nombre de chunks utilisés
  chunksUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Nombre de chunks de texte utilisés par RAG'
  },
  
  // Score de pertinence moyen
  avgRelevanceScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Score de pertinence moyen des chunks (0-1)'
  },
  
  // Couverture du contexte
  contextCoverage: {
    type: DataTypes.STRING,
    defaultValue: '0%',
    comment: 'Pourcentage du document couvert par les chunks'
  },
  
  // ========================================
  // 🆕 MÉTRIQUES NLP AVANCÉES
  // ========================================
  
  // Nombre de mots
  wordCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nombre de mots dans le résumé'
  },
  
  // Score de lisibilité (Flesch)
  readabilityScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Score de lisibilité Flesch (0-100)'
  },
  
  // Mots-clés extraits
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Mots-clés principaux extraits par TF-IDF'
  },
  
  // Analyse de sentiment
  sentiment: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Score de sentiment et ton du texte'
  },
  
  // Langue détectée
  language: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Code langue détecté (eng, fra, etc.)'
  },
  
  // Niveau de lecture
  readingLevel: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Niveau de lecture estimé (Grade 5, College, etc.)'
  },
  
  // ========================================
  // 🆕 MÉTRIQUES D'UTILISATION
  // ========================================
  
  // Tokens utilisés (coût)
  tokensUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Nombre de tokens OpenAI utilisés'
  },
  
  // Coût estimé
  estimatedCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Coût estimé en USD'
  },
  
  // Modèle IA utilisé
  aiModel: {
    type: DataTypes.STRING(50),
    defaultValue: 'gpt-4-turbo',
    comment: 'Modèle OpenAI utilisé'
  },
  
  // Temps de génération
  generationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Temps de génération en millisecondes'
  },
  
  // Date de génération
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'summaries',
  timestamps: true,
  indexes: [
    { fields: ['documentId'] },
    { fields: ['userId'] },
    { fields: ['ragEnabled'] },
    { fields: ['generatedAt'] }
  ]
});

// ========================================
// MÉTHODES D'INSTANCE
// ========================================

// Calculer le ratio de compression
Summary.prototype.getCompressionRatio = function() {
  if (!this.metadata || !this.metadata.wordCount || !this.wordCount) {
    return 0;
  }
  return ((this.wordCount / this.metadata.wordCount) * 100).toFixed(1);
};

// Obtenir un résumé des métriques
Summary.prototype.getMetricsSummary = function() {
  return {
    basic: {
      type: this.type,
      wordCount: this.wordCount,
      readingLevel: this.readingLevel,
      language: this.language
    },
    rag: {
      enabled: this.ragEnabled,
      chunksUsed: this.chunksUsed,
      relevance: this.avgRelevanceScore,
      coverage: this.contextCoverage
    },
    nlp: {
      readability: this.readabilityScore,
      keywords: this.keywords,
      sentiment: this.sentiment
    },
    cost: {
      tokens: this.tokensUsed,
      estimatedCost: `$${this.estimatedCost}`,
      model: this.aiModel,
      generationTime: `${this.generationTime}ms`
    }
  };
};

// Vérifier si le résumé est de haute qualité
Summary.prototype.isHighQuality = function() {
  const checks = {
    hasContent: this.content && this.content.length > 50,
    hasKeyPoints: this.keyPoints && this.keyPoints.length > 0,
    goodRelevance: this.ragEnabled ? this.avgRelevanceScore > 0.7 : true,
    goodReadability: this.readabilityScore ? this.readabilityScore > 30 : true
  };
  
  return Object.values(checks).every(check => check === true);
};

export default Summary;