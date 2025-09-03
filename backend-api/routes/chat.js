const express = require('express');
const { ChatMessage, User } = require('../models');
const aiService = require('../services/aiService');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Start a new chat session
router.post('/start-session', async (req, res) => {
  try {
    const { userId } = req.user;
    const sessionId = uuidv4();

    // Create initial system message
    const user = await User.findByPk(userId);
    const welcomeMessage = getWelcomeMessage(user.preferred_language);

    await ChatMessage.create({
      user_id: userId,
      session_id: sessionId,
      message_type: 'system',
      content: welcomeMessage,
      language: user.preferred_language
    });

    res.json({
      sessionId,
      welcomeMessage,
      message: 'Chat session started successfully'
    });

  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({
      error: 'Failed to start chat session',
      message: 'Please try again later'
    });
  }
});

// Send message to AI
router.post('/send', async (req, res) => {
  try {
    const { userId } = req.user;
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Message and session ID are required'
      });
    }

    // Process message through AI service
    const aiResponse = await aiService.processMessage({
      userId,
      message,
      sessionId
    });

    res.json({
      message: 'Message sent successfully',
      response: aiResponse,
      sessionId
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: 'Please try again later'
    });
  }
});

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { sessionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const messages = await ChatMessage.findAll({
      where: {
        user_id: userId,
        session_id: sessionId
      },
      order: [['created_at', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await ChatMessage.count({
      where: {
        user_id: userId,
        session_id: sessionId
      }
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history',
      message: 'Please try again later'
    });
  }
});

// Get all chat sessions for user
router.get('/sessions', async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Get unique sessions with latest message
    const sessions = await ChatMessage.findAll({
      attributes: [
        'session_id',
        'created_at',
        'content',
        'message_type',
        'crisis_detected'
      ],
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      group: ['session_id']
    });

    // Get session summaries
    const sessionSummaries = await Promise.all(
      sessions.map(async (session) => {
        const sessionMessages = await ChatMessage.findAll({
          where: {
            user_id: userId,
            session_id: session.session_id
          },
          order: [['created_at', 'ASC']],
          limit: 5 // Get first 5 messages for summary
        });

        const userMessages = sessionMessages.filter(msg => msg.message_type === 'user');
        const aiMessages = sessionMessages.filter(msg => msg.message_type === 'ai');
        const crisisDetected = sessionMessages.some(msg => msg.crisis_detected);

        return {
          sessionId: session.session_id,
          startTime: session.created_at,
          messageCount: sessionMessages.length,
          userMessageCount: userMessages.length,
          aiMessageCount: aiMessages.length,
          lastMessage: sessionMessages[sessionMessages.length - 1]?.content || '',
          crisisDetected,
          summary: generateSessionSummary(userMessages, aiMessages)
        };
      })
    );

    res.json({
      sessions: sessionSummaries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sessionSummaries.length
      }
    });

  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({
      error: 'Failed to fetch chat sessions',
      message: 'Please try again later'
    });
  }
});

// Delete chat session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { sessionId } = req.params;

    const deletedCount = await ChatMessage.destroy({
      where: {
        user_id: userId,
        session_id: sessionId
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session does not exist'
      });
    }

    res.json({
      message: 'Chat session deleted successfully',
      deletedCount
    });

  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      error: 'Failed to delete chat session',
      message: 'Please try again later'
    });
  }
});

// Rate message response
router.post('/rate', async (req, res) => {
  try {
    const { userId } = req.user;
    const { messageId, rating } = req.body;

    if (!messageId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Please provide a valid rating (1-5)'
      });
    }

    const message = await ChatMessage.findOne({
      where: {
        id: messageId,
        user_id: userId,
        message_type: 'ai'
      }
    });

    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'AI message does not exist'
      });
    }

    await message.update({ user_satisfaction: rating });

    res.json({
      message: 'Rating saved successfully',
      rating
    });

  } catch (error) {
    console.error('Error rating message:', error);
    res.status(500).json({
      error: 'Failed to save rating',
      message: 'Please try again later'
    });
  }
});

// Get chat analytics
router.get('/analytics', async (req, res) => {
  try {
    const { userId } = req.user;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const messages = await ChatMessage.findAll({
      where: {
        user_id: userId,
        created_at: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      attributes: [
        'message_type',
        'emotion_detected',
        'crisis_detected',
        'sentiment_score',
        'created_at'
      ]
    });

    const analytics = {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.message_type === 'user').length,
      aiMessages: messages.filter(m => m.message_type === 'ai').length,
      averageSentiment: messages.length > 0 ? 
        messages.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / messages.length : 0,
      emotionBreakdown: getEmotionBreakdown(messages),
      crisisDetected: messages.filter(m => m.crisis_detected).length,
      dailyActivity: getDailyActivity(messages, parseInt(days))
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching chat analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'Please try again later'
    });
  }
});

// Helper functions
function getWelcomeMessage(language) {
  const messages = {
    hindi: 'नमस्ते! मैं आपका MannMitra हूं। आज आप कैसे महसूस कर रहे हैं?',
    english: 'Hello! I am your MannMitra. How are you feeling today?',
    bengali: 'হ্যালো! আমি আপনার MannMitra। আজ আপনি কেমন অনুভব করছেন?',
    tamil: 'வணக்கம்! நான் உங்கள் MannMitra. இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?'
  };
  return messages[language] || messages.hindi;
}

function generateSessionSummary(userMessages, aiMessages) {
  if (userMessages.length === 0) return 'No conversation yet';
  
  const firstUserMessage = userMessages[0].content;
  if (firstUserMessage.length > 50) {
    return firstUserMessage.substring(0, 50) + '...';
  }
  return firstUserMessage;
}

function getEmotionBreakdown(messages) {
  const emotions = {};
  messages.forEach(message => {
    if (message.emotion_detected) {
      emotions[message.emotion_detected] = (emotions[message.emotion_detected] || 0) + 1;
    }
  });
  return emotions;
}

function getDailyActivity(messages, days) {
  const activity = {};
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    activity[dateStr] = 0;
  }

  messages.forEach(message => {
    const dateStr = message.created_at.toISOString().split('T')[0];
    if (activity[dateStr] !== undefined) {
      activity[dateStr]++;
    }
  });

  return activity;
}

module.exports = router;
