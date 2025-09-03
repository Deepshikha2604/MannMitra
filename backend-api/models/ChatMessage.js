const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
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
  session_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  message_type: {
    type: DataTypes.ENUM('user', 'ai', 'system'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  content_type: {
    type: DataTypes.ENUM('text', 'voice', 'image', 'audio'),
    defaultValue: 'text'
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'hindi'
  },
  sentiment_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -1,
      max: 1
    }
  },
  emotion_detected: {
    type: DataTypes.ENUM('happy', 'sad', 'angry', 'anxious', 'stressed', 'lonely', 'hopeful', 'confused', 'neutral'),
    allowNull: true
  },
  crisis_detected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  crisis_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: true
  },
  ai_response_time: {
    type: DataTypes.INTEGER, // milliseconds
    allowNull: true
  },
  user_satisfaction: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  context_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'chat_messages',
  indexes: [
    {
      fields: ['user_id', 'session_id', 'created_at']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['crisis_detected']
    }
  ]
});

module.exports = ChatMessage;
