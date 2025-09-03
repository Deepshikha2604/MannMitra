const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MannMitra API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API endpoints for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: {
      server: 'MannMitra Backend',
      version: '1.0.0',
      status: 'operational'
    }
  });
});

// Mock auth endpoint
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  // Mock OTP generation
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  res.json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      phone: phone,
      otp: otp, // In real app, this wouldn't be returned
      expires_in: 600 // 10 minutes
    }
  });
});

// Mock OTP verification endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and OTP are required'
    });
  }

  // Mock verification - accept any 6-digit OTP
  if (otp.length === 6 && /^\d+$/.test(otp)) {
    const mockUser = {
      id: 'user_' + Date.now(),
      phone: phone,
      name: 'Test User',
      onboarding_completed: false
    };

    const mockToken = 'mock_jwt_token_' + Date.now();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token: mockToken,
        user: mockUser
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  }
});

// Mock mood logging endpoint
app.post('/api/mood/log', (req, res) => {
  const { mood_score, primary_emotion, notes } = req.body;
  
  res.json({
    success: true,
    message: 'Mood logged successfully',
    data: {
      id: Date.now().toString(),
      mood_score,
      primary_emotion,
      notes,
      logged_at: new Date().toISOString()
    }
  });
});

// Mock chat endpoint
app.post('/api/chat/send', (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  // Mock AI response
  const responses = [
    "I understand how you're feeling. Can you tell me more about what's on your mind?",
    "It sounds like you're going through a challenging time. Remember, it's okay to feel this way.",
    "Thank you for sharing that with me. How can I help you feel better today?",
    "I'm here to listen and support you. What would make you feel more comfortable right now?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    success: true,
    data: {
      message: randomResponse,
      timestamp: new Date().toISOString(),
      session_id: Date.now().toString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MannMitra Simple API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/test - Test endpoint`);
  console.log(`   POST /api/auth/send-otp - Send OTP (mock)`);
  console.log(`   POST /api/mood/log - Log mood (mock)`);
  console.log(`   POST /api/chat/send - Send chat message (mock)`);
});

module.exports = app;
