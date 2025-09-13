const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');

// Analyze text sentiment
router.post('/analyze-sentiment', optionalAuth, async (req, res) => {
  try {
    const { text, language = 'hindi' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const analysis = await aiService.analyzeSentiment(text, language);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Detect emotions from text
router.post('/detect-emotion', optionalAuth, async (req, res) => {
  try {
    const { text, language = 'hindi' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const emotion = await aiService.detectEmotion(text, language);

    res.json({
      success: true,
      data: emotion
    });
  } catch (error) {
    console.error('Emotion detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate personalized insights
router.post('/insights', authenticateToken, async (req, res) => {
  try {
    const { mood_data, chat_history, time_period = 'week' } = req.body;

    const insights = await aiService.generateMoodInsights(mood_data, chat_history, time_period);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get AI conversation suggestions
router.post('/conversation-suggestions', authenticateToken, async (req, res) => {
  try {
    const { context, mood, language = 'hindi' } = req.body;

    const suggestions = await aiService.getConversationSuggestions(context, mood, language);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get conversation suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate motivational content
router.get('/motivational-content', optionalAuth, async (req, res) => {
  try {
    const { language = 'hindi', type = 'quote' } = req.query;

    const content = await aiService.generateMotivationalContent(language, type);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Generate motivational content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get AI health tips
router.get('/health-tips', optionalAuth, async (req, res) => {
  try {
    const { category = 'general', language = 'hindi' } = req.query;

    const tips = await aiService.getHealthTips(category, language);

    res.json({
      success: true,
      data: tips
    });
  } catch (error) {
    console.error('Get health tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Process voice message (placeholder)
router.post('/process-voice', authenticateToken, async (req, res) => {
  try {
    // This would integrate with speech-to-text services
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Voice processing not yet implemented',
      data: {
        transcribed_text: 'Voice processing feature coming soon',
        confidence: 0.95
      }
    });
  } catch (error) {
    console.error('Process voice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get AI model status
router.get('/status', (req, res) => {
  try {
    const status = {
      ai_service: 'operational',
      openai_connected: !!process.env.OPENAI_API_KEY,
      last_updated: new Date(),
      version: '1.0.0'
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get AI status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;










