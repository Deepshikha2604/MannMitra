const express = require('express');
const { MoodEntry, User } = require('../models');
const aiService = require('../services/aiService');

const router = express.Router();

// Log mood entry
router.post('/log', async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      mood_score,
      mood_emoji,
      primary_emotion,
      secondary_emotion,
      energy_level,
      sleep_quality,
      stress_level,
      notes,
      triggers,
      activities_done,
      location,
      weather
    } = req.body;

    // Validate required fields
    if (!mood_score || !mood_emoji || !primary_emotion || !energy_level) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Mood score, emoji, primary emotion, and energy level are required'
      });
    }

    // Check if mood already logged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingEntry = await MoodEntry.findOne({
      where: {
        user_id: userId,
        created_at: {
          [require('sequelize').Op.gte]: today,
          [require('sequelize').Op.lt]: tomorrow
        }
      }
    });

    if (existingEntry) {
      return res.status(400).json({
        error: 'Mood already logged today',
        message: 'You have already logged your mood for today. You can update it instead.'
      });
    }

    // Generate AI insights
    const aiInsights = await generateMoodInsights({
      mood_score,
      primary_emotion,
      secondary_emotion,
      energy_level,
      sleep_quality,
      stress_level,
      notes,
      triggers
    });

    // Create mood entry
    const moodEntry = await MoodEntry.create({
      user_id: userId,
      mood_score,
      mood_emoji,
      primary_emotion,
      secondary_emotion,
      energy_level,
      sleep_quality,
      stress_level,
      notes,
      triggers,
      activities_done,
      location,
      weather,
      ai_insights: aiInsights
    });

    res.json({
      message: 'Mood logged successfully',
      moodEntry,
      insights: aiInsights
    });

  } catch (error) {
    console.error('Error logging mood:', error);
    res.status(500).json({
      error: 'Failed to log mood',
      message: 'Please try again later'
    });
  }
});

// Update mood entry
router.put('/update/:entryId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { entryId } = req.params;
    const updateData = req.body;

    const moodEntry = await MoodEntry.findOne({
      where: {
        id: entryId,
        user_id: userId
      }
    });

    if (!moodEntry) {
      return res.status(404).json({
        error: 'Mood entry not found',
        message: 'Mood entry does not exist'
      });
    }

    // Generate new AI insights if mood data changed
    if (updateData.mood_score || updateData.primary_emotion) {
      const aiInsights = await generateMoodInsights({
        mood_score: updateData.mood_score || moodEntry.mood_score,
        primary_emotion: updateData.primary_emotion || moodEntry.primary_emotion,
        secondary_emotion: updateData.secondary_emotion || moodEntry.secondary_emotion,
        energy_level: updateData.energy_level || moodEntry.energy_level,
        sleep_quality: updateData.sleep_quality || moodEntry.sleep_quality,
        stress_level: updateData.stress_level || moodEntry.stress_level,
        notes: updateData.notes || moodEntry.notes,
        triggers: updateData.triggers || moodEntry.triggers
      });
      updateData.ai_insights = aiInsights;
    }

    await moodEntry.update(updateData);

    res.json({
      message: 'Mood updated successfully',
      moodEntry: await moodEntry.reload()
    });

  } catch (error) {
    console.error('Error updating mood:', error);
    res.status(500).json({
      error: 'Failed to update mood',
      message: 'Please try again later'
    });
  }
});

// Get mood history
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 30, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { user_id: userId };

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.created_at = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const moodEntries = await MoodEntry.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await MoodEntry.count({ where: whereClause });

    res.json({
      moodEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({
      error: 'Failed to fetch mood history',
      message: 'Please try again later'
    });
  }
});

// Get mood analytics
router.get('/analytics', async (req, res) => {
  try {
    const { userId } = req.user;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moodEntries = await MoodEntry.findAll({
      where: {
        user_id: userId,
        created_at: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      order: [['created_at', 'ASC']]
    });

    if (moodEntries.length === 0) {
      return res.json({
        message: 'No mood data available',
        analytics: {
          averageMood: 0,
          moodTrend: 'stable',
          commonEmotions: {},
          weeklyPattern: {},
          recommendations: []
        }
      });
    }

    const analytics = {
      averageMood: calculateAverageMood(moodEntries),
      moodTrend: calculateMoodTrend(moodEntries),
      commonEmotions: getCommonEmotions(moodEntries),
      weeklyPattern: getWeeklyPattern(moodEntries),
      recommendations: generateRecommendations(moodEntries),
      moodRange: {
        min: Math.min(...moodEntries.map(e => e.mood_score)),
        max: Math.max(...moodEntries.map(e => e.mood_score))
      },
      consistency: calculateConsistency(moodEntries)
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching mood analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch mood analytics',
      message: 'Please try again later'
    });
  }
});

// Get today's mood
router.get('/today', async (req, res) => {
  try {
    const { userId } = req.user;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMood = await MoodEntry.findOne({
      where: {
        user_id: userId,
        created_at: {
          [require('sequelize').Op.gte]: today,
          [require('sequelize').Op.lt]: tomorrow
        }
      }
    });

    if (!todayMood) {
      return res.json({
        message: 'No mood logged today',
        todayMood: null
      });
    }

    res.json({
      todayMood
    });

  } catch (error) {
    console.error('Error fetching today\'s mood:', error);
    res.status(500).json({
      error: 'Failed to fetch today\'s mood',
      message: 'Please try again later'
    });
  }
});

// Get mood insights from AI
router.get('/insights', async (req, res) => {
  try {
    const { userId } = req.user;
    const insights = await aiService.generateMoodInsights(userId);

    res.json(insights);

  } catch (error) {
    console.error('Error generating mood insights:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      message: 'Please try again later'
    });
  }
});

// Get personalized activities based on mood
router.get('/activities', async (req, res) => {
  try {
    const { userId } = req.user;
    const { emotion } = req.query;

    if (!emotion) {
      // Get user's recent mood to suggest activities
      const recentMood = await MoodEntry.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      if (!recentMood) {
        return res.json({
          message: 'No recent mood data available',
          activities: []
        });
      }

      const activities = await aiService.getPersonalizedActivities(userId, recentMood.primary_emotion);
      res.json({ activities });
    } else {
      const activities = await aiService.getPersonalizedActivities(userId, emotion);
      res.json({ activities });
    }

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      message: 'Please try again later'
    });
  }
});

// Helper functions
async function generateMoodInsights(moodData) {
  try {
    const insights = {
      moodLevel: getMoodLevel(moodData.mood_score),
      energyLevel: getEnergyLevel(moodData.energy_level),
      sleepQuality: getSleepQuality(moodData.sleep_quality),
      stressLevel: getStressLevel(moodData.stress_level),
      recommendations: generateRecommendations(moodData),
      patterns: detectPatterns(moodData)
    };

    return insights;
  } catch (error) {
    console.error('Error generating mood insights:', error);
    return { error: 'Failed to generate insights' };
  }
}

function getMoodLevel(score) {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'moderate';
  if (score >= 2) return 'poor';
  return 'very_poor';
}

function getEnergyLevel(score) {
  if (score >= 8) return 'high';
  if (score >= 6) return 'moderate';
  if (score >= 4) return 'low';
  return 'very_low';
}

function getSleepQuality(score) {
  if (!score) return 'unknown';
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'fair';
  return 'poor';
}

function getStressLevel(score) {
  if (!score) return 'unknown';
  if (score <= 3) return 'low';
  if (score <= 6) return 'moderate';
  if (score <= 8) return 'high';
  return 'very_high';
}

function calculateAverageMood(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.mood_score, 0);
  return Math.round((total / entries.length) * 10) / 10;
}

function calculateMoodTrend(entries) {
  if (entries.length < 2) return 'stable';
  
  const recent = entries.slice(0, 3);
  const older = entries.slice(-3);
  
  const recentAvg = recent.reduce((sum, entry) => sum + entry.mood_score, 0) / recent.length;
  const olderAvg = older.reduce((sum, entry) => sum + entry.mood_score, 0) / older.length;
  
  if (recentAvg > olderAvg + 0.5) return 'improving';
  if (recentAvg < olderAvg - 0.5) return 'declining';
  return 'stable';
}

function getCommonEmotions(entries) {
  const emotions = {};
  entries.forEach(entry => {
    emotions[entry.primary_emotion] = (emotions[entry.primary_emotion] || 0) + 1;
  });
  return emotions;
}

function getWeeklyPattern(entries) {
  const pattern = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  days.forEach(day => {
    pattern[day] = [];
  });

  entries.forEach(entry => {
    const day = days[entry.created_at.getDay()];
    pattern[day].push(entry.mood_score);
  });

  // Calculate average for each day
  Object.keys(pattern).forEach(day => {
    if (pattern[day].length > 0) {
      pattern[day] = Math.round((pattern[day].reduce((sum, score) => sum + score, 0) / pattern[day].length) * 10) / 10;
    } else {
      pattern[day] = null;
    }
  });

  return pattern;
}

function generateRecommendations(moodData) {
  const recommendations = [];
  
  if (moodData.mood_score < 4) {
    recommendations.push('Consider talking to a counselor or trusted friend');
    recommendations.push('Try some light physical activity');
    recommendations.push('Practice deep breathing exercises');
  }
  
  if (moodData.stress_level > 6) {
    recommendations.push('Take short breaks throughout the day');
    recommendations.push('Try progressive muscle relaxation');
    recommendations.push('Consider reducing caffeine intake');
  }
  
  if (moodData.sleep_quality < 6) {
    recommendations.push('Establish a regular sleep schedule');
    recommendations.push('Avoid screens before bedtime');
    recommendations.push('Create a relaxing bedtime routine');
  }
  
  return recommendations;
}

function detectPatterns(moodData) {
  const patterns = [];
  
  if (moodData.triggers && moodData.triggers.length > 0) {
    patterns.push(`Common triggers: ${moodData.triggers.join(', ')}`);
  }
  
  if (moodData.activities_done && moodData.activities_done.length > 0) {
    patterns.push(`Recent activities: ${moodData.activities_done.join(', ')}`);
  }
  
  return patterns;
}

function calculateConsistency(entries) {
  if (entries.length < 2) return 'insufficient_data';
  
  const scores = entries.map(e => e.mood_score);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev < 1) return 'very_consistent';
  if (stdDev < 2) return 'consistent';
  if (stdDev < 3) return 'moderate';
  return 'variable';
}

module.exports = router;
