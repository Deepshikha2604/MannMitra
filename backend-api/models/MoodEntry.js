const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MoodEntry = sequelize.define('MoodEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  mood_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  mood_emoji: {
    type: DataTypes.ENUM('😊', '😐', '😔', '😢', '😡', '😰', '😴', '🤗'),
    allowNull: false
  },
  primary_emotion: {
    type: DataTypes.ENUM('happy', 'sad', 'angry', 'anxious', 'stressed', 'lonely', 'hopeful', 'confused'),
    allowNull: false
  },
  secondary_emotion: {
    type: DataTypes.ENUM('happy', 'sad', 'angry', 'anxious', 'stressed', 'lonely', 'hopeful', 'confused'),
    allowNull: true
  },
  energy_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  sleep_quality: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  stress_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  triggers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  activities_done: {
    type: DataTypes.JSON,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  weather: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ai_insights: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'mood_entries',
  indexes: [
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = MoodEntry;
