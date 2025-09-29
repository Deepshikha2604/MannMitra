const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/api/test/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', message: 'Simple test server is running' });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  const { name, phone } = req.body;
  
  if (name === 'Test User' && phone === '9876543210') {
    res.json({
      success: true,
      message: 'OTP sent successfully',
      phone: '987***3210',
      requiresRegistration: false
    });
  } else {
    res.status(404).json({
      error: 'User not found',
      message: 'No account found with this name and phone number. Please register first.',
      requiresRegistration: true
    });
  }
});

// Verify OTP route
app.post('/api/auth/verify-otp', (req, res) => {
  console.log('OTP verification request:', req.body);
  const { name, phone, otp } = req.body;
  
  if (otp === '123456') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'test-token-123',
      user: {
        id: 'test-user-1',
        name: name,
        phone: phone,
        onboarding_completed: true
      },
      isNewUser: false
    });
  } else {
    res.status(400).json({
      error: 'Invalid OTP',
      message: 'Invalid OTP. Please try again.'
    });
  }
});

// Start server
console.log('Starting simple test server...');
app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on http://localhost:${PORT}`);
  console.log(`📱 Test OTP: 123456`);
  console.log(`👤 Test user: Test User / 9876543210`);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});
