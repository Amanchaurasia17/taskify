const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
console.log('Frontend URL:', process.env.FRONTEND_URL || 'Not set');
console.log('====================================\n');

// Check if we have required environment variables
const hasMongoUri = !!process.env.MONGODB_URI;
const hasJwtSecret = !!process.env.JWT_SECRET;
const canEnableFullFeatures = hasMongoUri && hasJwtSecret;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'https://taskifyma.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Conditionally enable MongoDB connection
let mongoose;
if (hasMongoUri) {
  try {
    mongoose = require('mongoose');
    
    // Connect to MongoDB
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
      });
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.warn('⚠️ MongoDB setup failed:', error.message);
  }
} else {
  console.log('⚠️ Skipping MongoDB connection - MONGODB_URI not set');
}

// Health check endpoint - MUST WORK for Railway
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: {
      database: hasMongoUri ? 'Enabled' : 'Disabled - Set MONGODB_URI',
      authentication: hasJwtSecret ? 'Enabled' : 'Disabled - Set JWT_SECRET',
      fullAPI: canEnableFullFeatures ? 'Enabled' : 'Disabled - Set environment variables'
    },
    env_vars: {
      PORT: process.env.PORT ? '✅ Set' : '❌ Not set',
      MONGODB_URI: hasMongoUri ? '✅ Set' : '❌ Not set',
      JWT_SECRET: hasJwtSecret ? '✅ Set' : '❌ Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
    },
    railway_info: {
      deployment_url: 'web-production-84575.up.railway.app',
      status: 'Server started successfully',
      database_status: hasMongoUri ? (mongoose && mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...') : 'Not configured'
    }
  };
  
  console.log('Health check requested');
  res.status(200).json(healthStatus);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TASKIFY API Server',
    status: 'Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features_enabled: {
      database: hasMongoUri,
      authentication: hasJwtSecret,
      full_api: canEnableFullFeatures
    },
    setup_instructions: canEnableFullFeatures ? 
      'All features enabled!' : 
      [
        !hasMongoUri && '1. Set MONGODB_URI environment variable',
        !hasJwtSecret && '2. Set JWT_SECRET environment variable',
        '3. Set NODE_ENV=production',
        '4. Set FRONTEND_URL=https://taskifyma.netlify.app'
      ].filter(Boolean),
    railway_url: 'https://web-production-84575.up.railway.app',
    frontend: 'https://taskifyma.netlify.app',
    documentation: 'https://github.com/Amanchaurasia17/taskify'
  });
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'TASKIFY API v1.0.0',
    status: 'Active',
    features: {
      database: hasMongoUri ? 'Connected' : 'Not configured',
      authentication: hasJwtSecret ? 'Ready' : 'Not configured',
      cors: 'Enabled',
      file_upload: canEnableFullFeatures ? 'Ready' : 'Disabled'
    },
    available_endpoints: canEnableFullFeatures ? 
      ['/api/auth/register', '/api/auth/login', '/api/tasks', '/api/users', '/api/notifications'] :
      ['Limited - Set environment variables to enable full API'],
    required_env_vars: {
      MONGODB_URI: hasMongoUri ? '✅ Set' : '❌ Not set',
      JWT_SECRET: hasJwtSecret ? '✅ Set' : '❌ Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
    }
  });
});

// Conditionally load and mount routes
if (canEnableFullFeatures) {
  console.log('🔥 Loading full API routes...');
  
  try {
    // Import and mount auth routes
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
    
    // Import and mount task routes
    const taskRoutes = require('./routes/tasks');
    app.use('/api/tasks', taskRoutes);
    console.log('✅ Task routes loaded');
    
    // Import and mount user routes
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded');
    
    // Import and mount notification routes
    const notificationRoutes = require('./routes/notifications');
    app.use('/api/notifications', notificationRoutes);
    console.log('✅ Notification routes loaded');
    
    console.log('🎉 All API routes loaded successfully!');
    
  } catch (error) {
    console.warn('⚠️ Some routes failed to load:', error.message);
    console.log('Continuing with basic server functionality...');
  }
} else {
  console.log('⚠️ Full API disabled - Set MONGODB_URI and JWT_SECRET to enable');
  
  // Temporary auth endpoints for testing
  app.post('/api/auth/register', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Registration temporarily disabled',
      required: ['MONGODB_URI', 'JWT_SECRET'].filter(env => !process.env[env]),
      setup_url: 'https://railway.app - Add environment variables in your Railway project settings'
    });
  });

  app.post('/api/auth/login', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Login temporarily disabled',
      required: ['MONGODB_URI', 'JWT_SECRET'].filter(env => !process.env[env]),
      setup_url: 'https://railway.app - Add environment variables in your Railway project settings'
    });
  });

  // Temporary API endpoints
  app.use('/api/*', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'API temporarily disabled - environment variables required',
      path: req.originalUrl,
      method: req.method,
      required_env_vars: {
        MONGODB_URI: hasMongoUri ? '✅ Set' : '❌ Required for database connection',
        JWT_SECRET: hasJwtSecret ? '✅ Set' : '❌ Required for authentication'
      },
      setup_instructions: 'Add environment variables in Railway dashboard to enable full API',
      timestamp: new Date().toISOString()
    });
  });
}

// Handle 404 for all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    available_endpoints: ['/health', '/api', '/'],
    suggestion: 'Visit /health for server status or /api for API information'
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 TASKIFY SERVER STARTED');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API status: http://localhost:${PORT}/api`);
  console.log(`🌐 Railway URL: https://web-production-84575.up.railway.app`);
  console.log(`🎯 Frontend: https://taskifyma.netlify.app`);
  console.log('='.repeat(50));
  if (canEnableFullFeatures) {
    console.log('🎉 ALL FEATURES ENABLED');
  } else {
    console.log('⚠️  SET ENVIRONMENT VARIABLES TO ENABLE FULL FUNCTIONALITY');
  }
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    if (mongoose && mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    if (mongoose && mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
