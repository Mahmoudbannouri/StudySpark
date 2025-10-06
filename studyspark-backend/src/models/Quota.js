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

  // Summaries quota
  summaries: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  usedSummaries: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Flashcards quota
  flashcards: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  usedFlashcards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Quizzes quota
  quizzes: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  usedQuizzes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Chat messages quota
  chats: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
  },
  usedChats: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Study plans quota
  studyPlans: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  usedStudyPlans: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Reset date
  resetDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] }
  ]
});

// Instance methods for quota management
Quota.prototype.canUseFeature = function(feature) {
  const featureMap = {
    'uploads': { used: this.usedUploads, max: this.maxUploads },
    'summaries': { used: this.usedSummaries, max: this.summaries },
    'flashcards': { used: this.usedFlashcards, max: this.flashcards },
    'quizzes': { used: this.usedQuizzes, max: this.quizzes },
    'chats': { used: this.usedChats, max: this.chats },
    'studyPlans': { used: this.usedStudyPlans, max: this.studyPlans }
  };

  const featureData = featureMap[feature];
  if (!featureData) return false;

  return featureData.used < featureData.max;
};

Quota.prototype.incrementUsage = async function(feature, amount = 1) {
  const featureMap = {
    'uploads': 'usedUploads',
    'summaries': 'usedSummaries',
    'flashcards': 'usedFlashcards',
    'quizzes': 'usedQuizzes',
    'chats': 'usedChats',
    'studyPlans': 'usedStudyPlans'
  };

  const field = featureMap[feature];
  if (!field) {
    throw new Error(`Invalid feature: ${feature}`);
  }

  this[field] = (this[field] || 0) + amount;
  await this.save();
  return this;
};

Quota.prototype.getRemainingQuota = function(feature) {
  const featureMap = {
    'uploads': { used: this.usedUploads, max: this.maxUploads },
    'summaries': { used: this.usedSummaries, max: this.summaries },
    'flashcards': { used: this.usedFlashcards, max: this.flashcards },
    'quizzes': { used: this.usedQuizzes, max: this.quizzes },
    'chats': { used: this.usedChats, max: this.chats },
    'studyPlans': { used: this.usedStudyPlans, max: this.studyPlans }
  };

  const featureData = featureMap[feature];
  if (!featureData) return 0;

  return Math.max(0, featureData.max - featureData.used);
};

Quota.prototype.getUsagePercentage = function(feature) {
  const featureMap = {
    'uploads': { used: this.usedUploads, max: this.maxUploads },
    'summaries': { used: this.usedSummaries, max: this.summaries },
    'flashcards': { used: this.usedFlashcards, max: this.flashcards },
    'quizzes': { used: this.usedQuizzes, max: this.quizzes },
    'chats': { used: this.usedChats, max: this.chats },
    'studyPlans': { used: this.usedStudyPlans, max: this.studyPlans }
  };

  const featureData = featureMap[feature];
  if (!featureData || featureData.max === 0) return 0;

  return Math.round((featureData.used / featureData.max) * 100);
};

Quota.prototype.resetUsage = async function() {
  this.usedUploads = 0;
  this.usedSummaries = 0;
  this.usedFlashcards = 0;
  this.usedQuizzes = 0;
  this.usedChats = 0;
  this.usedStudyPlans = 0;
  this.resetDate = new Date();
  await this.save();
  return this;
};

Quota.prototype.getTotalUsage = function() {
  return {
    uploads: { used: this.usedUploads, max: this.maxUploads, remaining: this.getRemainingQuota('uploads') },
    summaries: { used: this.usedSummaries, max: this.summaries, remaining: this.getRemainingQuota('summaries') },
    flashcards: { used: this.usedFlashcards, max: this.flashcards, remaining: this.getRemainingQuota('flashcards') },
    quizzes: { used: this.usedQuizzes, max: this.quizzes, remaining: this.getRemainingQuota('quizzes') },
    chats: { used: this.usedChats, max: this.chats, remaining: this.getRemainingQuota('chats') },
    studyPlans: { used: this.usedStudyPlans, max: this.studyPlans, remaining: this.getRemainingQuota('studyPlans') }
  };
};

export default Quota;
