const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    /\.netlify\.app$/,
    /\.railway\.app$/
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'TASKIFY API Server is running!' });
});

// Health check endpoint for Docker and monitoring
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'TASKIFY API Server is healthy',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  // Check if database is connected
  if (mongoose.connection.readyState !== 1) {
    healthCheck.status = 'ERROR';
    healthCheck.message = 'Database connection failed';
    return res.status(503).json(healthCheck);
  }
  
  res.status(200).json(healthCheck);
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TASKIFY Task Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      tasks: '/api/tasks',
      notifications: '/api/notifications'
    },
    documentation: 'https://github.com/Amanchaurasia17/taskify'
  });
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskify';

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', mongoUri ? 'URI provided' : 'No URI provided');

mongoose.connect(mongoUri)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TASKIFY Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
});
