const OpenAI = require('openai');
const { User, ChatMessage, MoodEntry } = require('../models');
const { sequelize } = require('../config/database');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIService {
  constructor() {
    this.crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
      'harm myself', 'self harm', 'cut myself', 'overdose', 'jump off',
      'hanging', 'poison', 'gun', 'weapon', 'death', 'die'
    ];
    
    this.languagePrompts = {
      hindi: 'You are MannMitra, a compassionate AI mental health companion. Respond in simple, warm Hindi. Be empathetic and culturally relevant.',
      english: 'You are MannMitra, a compassionate AI mental health companion. Respond in simple, warm English. Be empathetic and culturally relevant.',
      bengali: 'You are MannMitra, a compassionate AI mental health companion. Respond in simple, warm Bengali. Be empathetic and culturally relevant.',
      tamil: 'You are MannMitra, a compassionate AI mental health companion. Respond in simple, warm Tamil. Be empathetic and culturally relevant.'
    };
  }

  async processMessage(data) {
    const { userId, message, sessionId, language = 'hindi' } = data;
    const startTime = Date.now();

    try {
      // Get user context
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Analyze sentiment and detect crisis
      const sentiment = await this.analyzeSentiment(message);
      const crisisLevel = this.detectCrisis(message);
      const emotion = this.detectEmotion(message);

      // Save user message
      await ChatMessage.create({
        user_id: userId,
        session_id: sessionId,
        message_type: 'user',
        content: message,
        language: user.preferred_language,
        sentiment_score: sentiment.score,
        emotion_detected: emotion,
        crisis_detected: crisisLevel !== 'none',
        crisis_level: crisisLevel
      });

      // Generate AI response
      const aiResponse = await this.generateResponse({
        message,
        user,
        sentiment,
        emotion,
        crisisLevel,
        language: user.preferred_language
      });

      const responseTime = Date.now() - startTime;

      // Save AI response
      await ChatMessage.create({
        user_id: userId,
        session_id: sessionId,
        message_type: 'ai',
        content: aiResponse.content,
        language: user.preferred_language,
        ai_response_time: responseTime,
        context_data: aiResponse.context
      });

      return {
        content: aiResponse.content,
        crisisLevel,
        emotion,
        responseTime,
        context: aiResponse.context
      };

    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async analyzeSentiment(text) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of this text and return only a JSON object with 'score' (float between -1 and 1, where -1 is very negative, 0 is neutral, 1 is very positive) and 'label' (positive, negative, neutral)."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { score: 0, label: 'neutral' };
    }
  }

  detectCrisis(text) {
    const lowerText = text.toLowerCase();
    const crisisWords = this.crisisKeywords.filter(word => 
      lowerText.includes(word.toLowerCase())
    );

    if (crisisWords.length === 0) return 'none';
    if (crisisWords.length >= 3) return 'critical';
    if (crisisWords.length >= 2) return 'high';
    return 'medium';
  }

  detectEmotion(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('great')) return 'happy';
    if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('unhappy')) return 'sad';
    if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('furious')) return 'angry';
    if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous')) return 'anxious';
    if (lowerText.includes('stressed') || lowerText.includes('pressure') || lowerText.includes('tension')) return 'stressed';
    if (lowerText.includes('lonely') || lowerText.includes('alone') || lowerText.includes('isolated')) return 'lonely';
    if (lowerText.includes('hope') || lowerText.includes('better') || lowerText.includes('improve')) return 'hopeful';
    
    return 'neutral';
  }

  async generateResponse({ message, user, sentiment, emotion, crisisLevel, language }) {
    const basePrompt = this.languagePrompts[language] || this.languagePrompts.hindi;
    
    let systemPrompt = basePrompt;
    
    // Add crisis handling
    if (crisisLevel !== 'none') {
      systemPrompt += `\n\nCRISIS DETECTED: The user may be in crisis. Provide immediate emotional support and crisis resources. Include helpline numbers and encourage professional help.`;
    }

    // Add user context
    systemPrompt += `\n\nUser Context:
    - Age: ${user.age}
    - Occupation: ${user.occupation}
    - Education: ${user.education_level}
    - Location: ${user.location}
    - Preferred Language: ${user.preferred_language}
    - Comfort Level: ${user.comfort_level}`;

    // Add recent mood context
    const recentMood = await MoodEntry.findOne({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']]
    });

    if (recentMood) {
      systemPrompt += `\nRecent Mood: ${recentMood.primary_emotion} (score: ${recentMood.mood_score}/10)`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const content = response.choices[0].message.content;

      return {
        content,
        context: {
          userAge: user.age,
          occupation: user.occupation,
          language: user.preferred_language,
          sentiment: sentiment.label,
          emotion,
          crisisLevel
        }
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        content: 'माफ़ करें, मैं अभी आपकी मदद नहीं कर पा रहा हूं। कृपया थोड़ी देर बाद फिर से कोशिश करें।',
        context: { error: true }
      };
    }
  }

  async getPersonalizedActivities(userId, emotion) {
    const user = await User.findByPk(userId);
    if (!user) return [];

    const activities = {
      happy: [
        { type: 'breathing', title: 'Deep Breathing', duration: '3 min', description: 'सांस लेने का व्यायाम' },
        { type: 'gratitude', title: 'Gratitude Journal', duration: '5 min', description: 'धन्यवाद की डायरी' },
        { type: 'music', title: 'Happy Music', duration: '10 min', description: 'खुशी का संगीत' }
      ],
      sad: [
        { type: 'breathing', title: 'Calming Breath', duration: '5 min', description: 'शांत करने वाली सांस' },
        { type: 'story', title: 'Inspirational Story', duration: '3 min', description: 'प्रेरणादायक कहानी' },
        { type: 'exercise', title: 'Light Exercise', duration: '10 min', description: 'हल्का व्यायाम' }
      ],
      anxious: [
        { type: 'meditation', title: 'Quick Meditation', duration: '5 min', description: 'त्वरित ध्यान' },
        { type: 'grounding', title: 'Grounding Exercise', duration: '3 min', description: 'जमीन से जुड़ने का व्यायाम' },
        { type: 'breathing', title: 'Box Breathing', duration: '4 min', description: 'बॉक्स ब्रीदिंग' }
      ],
      stressed: [
        { type: 'progressive_relaxation', title: 'Progressive Relaxation', duration: '8 min', description: 'क्रमिक विश्राम' },
        { type: 'walking', title: 'Mindful Walking', duration: '15 min', description: 'सचेत चलना' },
        { type: 'journaling', title: 'Stress Journal', duration: '10 min', description: 'तनाव की डायरी' }
      ]
    };

    return activities[emotion] || activities.sad;
  }

  async generateMoodInsights(userId) {
    const moodEntries = await MoodEntry.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 7
    });

    if (moodEntries.length === 0) {
      return { message: 'Start tracking your mood to get personalized insights!' };
    }

    const avgMood = moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length;
    const commonEmotion = this.getMostCommonEmotion(moodEntries);

    return {
      averageMood: Math.round(avgMood * 10) / 10,
      commonEmotion,
      trend: this.calculateTrend(moodEntries),
      suggestions: this.getMoodSuggestions(avgMood, commonEmotion)
    };
  }

  getMostCommonEmotion(entries) {
    const emotions = entries.map(entry => entry.primary_emotion);
    const counts = {};
    emotions.forEach(emotion => {
      counts[emotion] = (counts[emotion] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  calculateTrend(entries) {
    if (entries.length < 2) return 'stable';
    const recent = entries.slice(0, 3);
    const older = entries.slice(3, 6);
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood_score, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.mood_score, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  getMoodSuggestions(avgMood, emotion) {
    if (avgMood < 4) {
      return [
        'Consider talking to a counselor',
        'Try daily breathing exercises',
        'Connect with friends or family'
      ];
    } else if (avgMood < 6) {
      return [
        'Keep up with your positive activities',
        'Try new relaxation techniques',
        'Maintain a gratitude practice'
      ];
    } else {
      return [
        'Great job maintaining positive mood!',
        'Share your positivity with others',
        'Continue your current practices'
      ];
    }
  }
}

module.exports = new AIService();
