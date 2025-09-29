const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { User, MoodEntry } = require('../models');
const aiService = require('../services/aiService');

// Get personalized activities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent mood entries for context
    const recentMoods = await MoodEntry.findAll({
      where: { user_id: req.user.userId },
      order: [['created_at', 'DESC']],
      limit: 7
    });

    const activities = await aiService.getPersonalizedActivities(user, recentMoods);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get activities by category
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['mindfulness', 'exercise', 'creative', 'social', 'learning', 'relaxation'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Get user context if authenticated
    let user = null;
    if (req.user) {
      user = await User.findByPk(req.user.userId);
    }

    const activities = await aiService.getActivitiesByCategory(category, user);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get quick activities (5-minute or less)
router.get('/quick', optionalAuth, async (req, res) => {
  try {
    let user = null;
    if (req.user) {
      user = await User.findByPk(req.user.userId);
    }

    const quickActivities = await aiService.getQuickActivities(user);

    res.json({
      success: true,
      data: quickActivities
    });
  } catch (error) {
    console.error('Get quick activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark activity as completed
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { activity_id, duration, notes, mood_after } = req.body;

    // Log the activity completion (could be stored in a separate table)
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Activity marked as completed',
      data: {
        activity_id,
        completed_at: new Date(),
        duration,
        notes,
        mood_after
      }
    });
  } catch (error) {
    console.error('Complete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get activity recommendations based on mood
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get today's mood if available
    const todayMood = await MoodEntry.findOne({
      where: { 
        user_id: req.user.userId,
        created_at: {
          [require('sequelize').Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      },
      order: [['created_at', 'DESC']]
    });

    const recommendations = await aiService.getMoodBasedRecommendations(user, todayMood);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;














