const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const smsService = require('../services/smsService');

const router = express.Router();

// Login endpoint - Check if user exists with name + phone
router.post('/login', async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validate input
    if (!name || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and phone number are required'
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number',
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    const trimmedName = name.trim();

    // Check if user exists with name + phone combination
    const user = await User.findByNameAndPhone(trimmedName, normalizedPhone);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this name and phone number. Please register first.',
        requiresRegistration: true
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in session
    req.session[`${trimmedName}_${normalizedPhone}`] = {
      otp,
      attempts: 0,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      isRegistration: false,
      userId: user.id
    };

    // Send OTP via SMS
    await smsService.sendOTP(normalizedPhone, otp);

    console.log(`📱 Login OTP sent to ${normalizedPhone} for user: ${trimmedName}`);
    console.log(`🔑 OTP: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      phone: normalizedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
      requiresRegistration: false
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Please try again later'
    });
  }
});

// Registration endpoint - Create new user with complete profile
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      age, 
      gender, 
      location, 
      education_level, 
      occupation, 
      preferred_language,
      comfort_level,
      emergency_contact 
    } = req.body;

    // Validate input
    if (!name || !phone || !age || !gender || !location || !education_level || !occupation) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'All profile fields are required for registration'
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number',
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    const trimmedName = name.trim();

    // Check if user already exists
    const existingUser = await User.findByNameAndPhone(trimmedName, normalizedPhone);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this name and phone number already exists. Please login instead.',
        requiresRegistration: false
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP and user data in session
    req.session[`${trimmedName}_${normalizedPhone}`] = {
      otp,
      attempts: 0,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      isRegistration: true,
      userData: {
        name: trimmedName,
        phone: normalizedPhone,
        age,
        gender,
        location,
        education_level,
        occupation,
        preferred_language: preferred_language || 'hindi',
        comfort_level: comfort_level || 'text',
        emergency_contact
      }
    };

    // Send OTP via SMS
    await smsService.sendOTP(normalizedPhone, otp);

    console.log(`📱 Registration OTP sent to ${normalizedPhone} for user: ${trimmedName}`);
    console.log(`🔑 OTP: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully. Please verify to complete registration.',
      phone: normalizedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
      requiresRegistration: false
    });

  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Please try again later'
    });
  }
});

// Verify OTP endpoint - Works for both login and registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { name, phone, otp } = req.body;

    if (!name || !phone || !otp) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, phone number, and OTP are required'
      });
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    const trimmedName = name.trim();
    const sessionKey = `${trimmedName}_${normalizedPhone}`;

    // Get session data
    const sessionData = req.session[sessionKey];
    if (!sessionData) {
      return res.status(400).json({
        error: 'Session expired',
        message: 'Please request a new OTP'
      });
    }

    // Check OTP attempts
    if (sessionData.attempts >= 3) {
      return res.status(429).json({
        error: 'Too many attempts',
        message: 'Maximum OTP attempts exceeded. Please request a new OTP'
      });
    }

    // Check OTP expiry
    if (Date.now() > sessionData.expiresAt) {
      delete req.session[sessionKey];
      return res.status(400).json({
        error: 'OTP expired',
        message: 'OTP has expired. Please request a new OTP'
      });
    }

    // Verify OTP
    if (sessionData.otp !== otp) {
      sessionData.attempts += 1;
      return res.status(400).json({
        error: 'Invalid OTP',
        message: `Invalid OTP. ${3 - sessionData.attempts} attempts remaining`
      });
    }

    let user;
    let isNewUser = false;

    if (sessionData.isRegistration) {
      // Create new user
      try {
        user = await User.create(sessionData.userData);
        isNewUser = true;
        console.log(`✅ New user registered: ${user.name} (${user.id})`);
      } catch (error) {
        console.error('Error creating user:', error);
        const errorMessage = (error && error.errors && error.errors[0] && error.errors[0].message)
          || error.message
          || 'Failed to create user account. Please try again.';
        return res.status(400).json({
          error: 'Registration failed',
          message: errorMessage
        });
      }
    } else {
      // Login existing user
      user = await User.findByPk(sessionData.userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found. Please register first.'
        });
      }
      console.log(`✅ User logged in: ${user.name} (${user.id})`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET || 'mannmitra-secret',
      { expiresIn: '30d' }
    );

    // Update last login
    await user.update({ last_login: new Date() });

    // Clear OTP session
    delete req.session[sessionKey];

    const response = {
      success: true,
      message: isNewUser ? 'Registration successful' : 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        location: user.location,
        education_level: user.education_level,
        occupation: user.occupation,
        preferred_language: user.preferred_language,
        comfort_level: user.comfort_level,
        emergency_contact: user.emergency_contact,
        onboarding_completed: user.onboarding_completed
      },
      isNewUser
    };

    console.log(`📤 Authentication successful for: ${user.name}`);
    res.json(response);

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Please try again later'
    });
  }
});

// Complete onboarding (for backward compatibility)
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
      success: true,
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
      success: true,
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
    res.json({
      success: true,
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