const express = require('express');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Mock user data
const mockUsers = [
  {
    id: 'user-1',
    name: 'Test User',
    phone: '9876543210',
    age: 25,
    gender: 'other',
    location: 'Test City',
    education_level: 'graduate',
    occupation: 'student',
    preferred_language: 'hindi',
    comfort_level: 'text',
    emergency_contact: '9876543211',
    onboarding_completed: true
  }
];

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { name, phone } = req.body;
  
  console.log(`🔍 Login attempt: ${name} - ${phone}`);
  
  const user = mockUsers.find(u => u.name === name && u.phone === phone);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: 'No account found with this name and phone number. Please register first.',
      requiresRegistration: true
    });
  }
  
  // Generate OTP
  const otp = '123456'; // Fixed OTP for testing
  req.session[`${name}_${phone}`] = {
    otp,
    attempts: 0,
    expiresAt: Date.now() + 10 * 60 * 1000,
    isRegistration: false,
    userId: user.id
  };
  
  console.log(`📱 OTP sent: ${otp}`);
  
  res.json({
    success: true,
    message: 'OTP sent successfully',
    phone: phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
    requiresRegistration: false
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, phone, age, gender, location, education_level, occupation, preferred_language, comfort_level, emergency_contact } = req.body;
  
  console.log(`📝 Registration attempt: ${name} - ${phone}`);
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.name === name && u.phone === phone);
  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists',
      message: 'An account with this name and phone number already exists. Please login instead.',
      requiresRegistration: false
    });
  }
  
  // Generate OTP
  const otp = '123456'; // Fixed OTP for testing
  req.session[`${name}_${phone}`] = {
    otp,
    attempts: 0,
    expiresAt: Date.now() + 10 * 60 * 1000,
    isRegistration: true,
    userData: {
      name,
      phone,
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
  
  console.log(`📱 Registration OTP sent: ${otp}`);
  
  res.json({
    success: true,
    message: 'OTP sent successfully. Please verify to complete registration.',
    phone: phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
    requiresRegistration: false
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { name, phone, otp } = req.body;
  
  console.log(`🔐 OTP verification: ${name} - ${phone} - ${otp}`);
  
  const sessionKey = `${name}_${phone}`;
  const sessionData = req.session[sessionKey];
  
  if (!sessionData) {
    return res.status(400).json({
      error: 'Session expired',
      message: 'Please request a new OTP'
    });
  }
  
  if (sessionData.otp !== otp) {
    return res.status(400).json({
      error: 'Invalid OTP',
      message: 'Invalid OTP. Please try again.'
    });
  }
  
  let user;
  let isNewUser = false;
  
  if (sessionData.isRegistration) {
    // Create new user
    user = {
      id: `user-${Date.now()}`,
      ...sessionData.userData,
      onboarding_completed: true
    };
    mockUsers.push(user);
    isNewUser = true;
    console.log(`✅ New user registered: ${user.name}`);
  } else {
    // Login existing user
    user = mockUsers.find(u => u.id === sessionData.userId);
    console.log(`✅ User logged in: ${user.name}`);
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, phone: user.phone },
    'test-secret',
    { expiresIn: '30d' }
  );
  
  // Clear session
  delete req.session[sessionKey];
  
  res.json({
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
  });
});

// Health check
app.get('/api/test/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📱 Test OTP: 123456`);
  console.log(`👤 Test user: Test User / 9876543210`);
  console.log(`🔗 Server is listening for requests...`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Keep the server running
server.on('close', () => {
  console.log('❌ Server closed unexpectedly');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});
