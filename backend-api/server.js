const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const moodRoutes = require('./routes/mood');
const activitiesRoutes = require('./routes/activities');
const counselorRoutes = require('./routes/counselors');
const crisisRoutes = require('./routes/crisis');
const aiRoutes = require('./routes/ai');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Session middleware for OTP storage
app.use(session({
  secret: process.env.SESSION_SECRET || 'mannmitra-session-secret',
  resave: true, // Changed to true to ensure session is saved
  saveUninitialized: true, // Changed to true to save new sessions
  cookie: {
    secure: false, // Set to false for development (HTTP)
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 minutes
    sameSite: 'lax' // Added for better compatibility
  },
  name: 'mannmitra-session' // Custom session name
}));

// Session debugging middleware
app.use((req, res, next) => {
  console.log('🔍 Session Debug - Request:', req.method, req.path);
  console.log('  - Session ID:', req.sessionID);
  console.log('  - Session keys:', Object.keys(req.session));
  console.log('  - Session data:', req.session);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MannMitra API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/mood', authenticateToken, moodRoutes);
app.use('/api/activities', authenticateToken, activitiesRoutes);
app.use('/api/counselors', authenticateToken, counselorRoutes);
app.use('/api/crisis', crisisRoutes); // No auth for crisis support
app.use('/api/ai', authenticateToken, aiRoutes);

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-chat', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined chat room`);
  });
  
  socket.on('send-message', async (data) => {
    try {
      // Handle AI chat message
      const aiResponse = await require('./services/aiService').processMessage(data);
      socket.emit('ai-response', aiResponse);
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 MannMitra API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
