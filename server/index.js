const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple CORS - allow all origins for now
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'TASKIFY API Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'TASKIFY API Server is healthy',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  res.status(200).json(healthCheck);
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TASKIFY Task Management API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Try to load routes, but don't fail if they don't exist
try {
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const taskRoutes = require('./routes/tasks');
  const notificationRoutes = require('./routes/notifications');

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/notifications', notificationRoutes);
  
  console.log('Routes loaded successfully');
} catch (error) {
  console.log('Warning: Some routes could not be loaded:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: ['/', '/health', '/api']
  });
});

// Start server immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TASKIFY Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Try to connect to MongoDB after server starts
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message);
    });
  } else {
    console.log('No MONGODB_URI found, running without database');
  }
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
