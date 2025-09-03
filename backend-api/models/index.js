const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const MoodEntry = require('./MoodEntry');
const ChatMessage = require('./ChatMessage');

// Initialize models with sequelize instance
const models = {
  User,
  MoodEntry,
  ChatMessage,
  sequelize,
  Sequelize
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
