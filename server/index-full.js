const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes (with error handling)
let authRoutes, taskRoutes, userRoutes, notificationRoutes;
try {
  authRoutes = require('./routes/auth');
  taskRoutes = require('./routes/tasks');
  userRoutes = require('./routes/users');
  notificationRoutes = require('./routes/notifications');
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.warn('⚠️ Some routes failed to load:', error.message);
  // Create dummy routes to prevent crashes
  authRoutes = require('express').Router();
  taskRoutes = require('express').Router();
  userRoutes = require('express').Router();
  notificationRoutes = require('express').Router();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Debug logging for Railway
console.log('\n🔧 TASKIFY SERVER INITIALIZATION');
console.log('====================================');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);
console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('====================================\n');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://taskifyma.netlify.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskify';
    
    console.log('🔄 Attempting MongoDB connection...');
    console.log('MongoDB URI:', mongoURI ? '✅ Set' : '❌ Not set');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // In production, continue without database for health check
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Continuing without database connection for health check...');
      // Don't exit, let the server start for health check
    } else {
      process.exit(1);
    }
  }
};

// Create database indexes
const createIndexes = async () => {
  try {
    // Only create indexes if models load successfully
    const User = require('./models/User');
    const Task = require('./models/Task');
    const Notification = require('./models/Notification');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    
    // Task indexes
    await Task.collection.createIndex({ createdBy: 1 });
    await Task.collection.createIndex({ assignedTo: 1 });
    await Task.collection.createIndex({ status: 1 });
    await Task.collection.createIndex({ priority: 1 });
    await Task.collection.createIndex({ dueDate: 1 });
    await Task.collection.createIndex({ createdAt: -1 });
    
    // Notification indexes
    await Notification.collection.createIndex({ userId: 1 });
    await Notification.collection.createIndex({ isRead: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.log('ℹ️ Skipping index creation:', error.message);
  }
};

// Connect to MongoDB
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    version: '1.0.0',
    // Debug info for Railway
    env_vars: {
      PORT: process.env.PORT ? '✅ Set' : '❌ Not set',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    }
  };
  
  console.log('Health check requested');
  console.log('Health status:', healthStatus);
  res.status(200).json(healthStatus);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TASKIFY API Server',
    status: 'Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      users: '/api/users',
      notifications: '/api/notifications'
    },
    documentation: 'https://github.com/Amanchaurasia17/taskify',
    frontend: 'https://taskifyma.netlify.app'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'TASKIFY API v1.0.0',
    status: 'Active',
    endpoints: [
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login',
      'GET /api/auth/me - Get current user',
      'GET /api/tasks - Get all tasks',
      'POST /api/tasks - Create new task',
      'GET /api/tasks/:id - Get specific task',
      'PUT /api/tasks/:id - Update task',
      'DELETE /api/tasks/:id - Delete task',
      'GET /api/users - Get all users',
      'GET /api/notifications - Get notifications',
      'PUT /api/notifications/:id/read - Mark notification as read'
    ]
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error('❌ Global error handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Handle 404 for all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    suggestion: 'Visit /api for available endpoints'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 TASKIFY SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API documentation: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend URL: https://taskifyma.netlify.app`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log('='.repeat(50) + '\n');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server startup error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
  }
  process.exit(1);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async (error) => {
    if (error) {
      console.error('❌ Error during server shutdown:', error);
      process.exit(1);
    }
    
    console.log('✅ HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (dbError) {
      console.error('❌ Error closing MongoDB:', dbError);
    }
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
