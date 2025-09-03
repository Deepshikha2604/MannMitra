const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const smsService = require('../services/smsService');

const router = express.Router();

// Generate OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number',
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    const normalizedPhone = phone.replace(/\D/g, ''); // Normalize phone number

    // Check if user exists
    // const hashedPhone = await bcrypt.hash(normalizedPhone, 10);
    // const existingUser = await User.findOne({
    //   where: { phone: hashedPhone }
    // });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in session (in production, use Redis)
    req.session[normalizedPhone] = {
      otp,
      attempts: 0,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      hashedPhone: await bcrypt.hash(normalizedPhone, 10) // Store hashed phone for verification
    };
    
    // Debug logging
    console.log('📱 OTP Sent Debug:');
    console.log('  - Phone number:', phone);
    console.log('  - Normalized phone:', normalizedPhone);
    console.log('  - OTP generated:', otp);
    console.log('  - Session keys after storing:', Object.keys(req.session));
    console.log('  - Session data stored:', req.session[normalizedPhone]);

    // Send OTP via SMS
    await smsService.sendOTP(normalizedPhone, otp);

    res.json({
      message: 'OTP sent successfully',
      phone: normalizedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'), // Mask phone
      userExists: false // Temporarily set to false for testing
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      error: 'Failed to send OTP',
      message: 'Please try again later'
    });
  }
});

// Verify OTP and register/login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, userData } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Phone number and OTP are required'
      });
    }

    const normalizedPhone = phone.replace(/\D/g, ''); // Normalize phone number
    
    // Debug logging
    console.log('🔍 OTP Verification Debug:');
    console.log('  - Original phone:', phone);
    console.log('  - Normalized phone:', normalizedPhone);
    console.log('  - Session keys:', Object.keys(req.session));
    console.log('  - Session data for normalized phone:', req.session[normalizedPhone]);
    console.log('  - OTP received:', otp);

    // Verify OTP
    const sessionData = req.session[normalizedPhone];
    if (!sessionData || sessionData.otp !== otp || Date.now() > sessionData.expiresAt) {
      console.log('❌ OTP Verification Failed:');
      console.log('  - Session data exists:', !!sessionData);
      console.log('  - OTP matches:', sessionData ? sessionData.otp === otp : 'N/A');
      console.log('  - OTP expired:', sessionData ? Date.now() > sessionData.expiresAt : 'N/A');
      
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'OTP is invalid or expired'
      });
    }
    
    console.log('✅ OTP Verification Successful!');
    console.log('  - OTP matched:', sessionData.otp === otp);
    console.log('  - OTP not expired:', Date.now() <= sessionData.expiresAt);

    // Check if user exists (temporarily commented out for testing)
    const hashedPhone = sessionData.hashedPhone;
    // let user = await User.findOne({ where: { phone: hashedPhone } });

    // For testing, create a mock user
    let user = {
      id: 'test-user-' + Date.now(),
      phone: hashedPhone,
      onboarding_completed: false
    };

    // if (!user) {
    //   // New user registration
    //   if (!userData) {
    //     return res.status(400).json({
    //       error: 'User data required',
    //       message: 'Please provide user information for registration'
    //     });
    //   }

    //   // Validate user data
    //   const validation = validateRegistration(userData);
    //   if (!validation.isValid) {
    //     return res.status(400).json({
    //       error: 'Invalid user data',
    //       message: validation.message
    //     });
    //   }

    //   // Create new user
    //   user = await User.create({
    //     ...userData,
    //     phone: hashedPhone,
    //     onboarding_completed: false
    //   });

    //   console.log('New user registered:', user.id);
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone },
      process.env.JWT_SECRET || 'mannmitra-secret',
      { expiresIn: '30d' }
    );

    // Update last login (temporarily commented out for testing)
    // await user.update({ last_login: new Date() });

    // Clear OTP session
    delete req.session[normalizedPhone];

    const response = {
      message: user.onboarding_completed ? 'Login successful' : 'Registration successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        onboarding_completed: user.onboarding_completed
      },
      requiresOnboarding: !user.onboarding_completed
    };
    
    console.log('📤 Sending Success Response:');
    console.log('  - Response data:', response);
    
    res.json(response);

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Please try again later'
    });
  }
});

// Complete onboarding
router.post('/onboarding', async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware
    const { 
      age, 
      gender, 
      location, 
      education_level, 
      occupation, 
      preferred_language,
      comfort_level,
      emergency_contact 
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Update user with onboarding data
    await user.update({
      age,
      gender,
      location,
      education_level,
      occupation,
      preferred_language,
      comfort_level,
      emergency_contact,
      onboarding_completed: true
    });

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        occupation: user.occupation,
        preferred_language: user.preferred_language,
        onboarding_completed: true
      }
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      error: 'Failed to complete onboarding',
      message: 'Please try again later'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        message: 'Please provide a valid token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mannmitra-secret');
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user.id, phone: decoded.phone },
      process.env.JWT_SECRET || 'mannmitra-secret',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: 'Please login again'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Please try again later'
    });
  }
});

module.exports = router;
