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
console.log('====================================\n');

// Basic CORS configuration
const corsOptions = {
  origin: [
    'https://taskifyma.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint - MUST WORK for Railway
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    // Debug info for Railway
    env_vars: {
      PORT: process.env.PORT ? '✅ Set' : '❌ Not set',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    },
    railway_info: {
      deployment_url: 'web-production-84575.up.railway.app',
      status: 'Server started successfully',
      message: 'Basic server running - ready for environment variables'
    }
  };
  
  console.log('Health check requested');
  console.log('Health status:', healthStatus);
  res.status(200).json(healthStatus);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TASKIFY API Server - Minimal Version',
    status: 'Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    next_steps: [
      '1. Set MONGODB_URI environment variable',
      '2. Set JWT_SECRET environment variable', 
      '3. Set NODE_ENV=production',
      '4. Set FRONTEND_URL=https://taskifyma.netlify.app'
    ],
    railway_url: 'https://web-production-84575.up.railway.app',
    frontend: 'https://taskifyma.netlify.app',
    documentation: 'https://github.com/Amanchaurasia17/taskify'
  });
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'TASKIFY API v1.0.0 - Minimal Version',
    status: 'Active',
    note: 'Set environment variables to enable full functionality',
    required_env_vars: {
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
    }
  });
});

// Temporary auth endpoints for testing
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: false,
    message: 'Registration temporarily disabled - set JWT_SECRET environment variable',
    required: 'JWT_SECRET environment variable'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: false,
    message: 'Login temporarily disabled - set JWT_SECRET environment variable',
    required: 'JWT_SECRET environment variable'
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found - full API disabled until environment variables are set',
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
    suggestion: 'Visit /health or /api for status'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 TASKIFY MINIMAL SERVER STARTED');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API status: http://localhost:${PORT}/api`);
  console.log(`🌐 Railway URL: https://web-production-84575.up.railway.app`);
  console.log(`🎯 Frontend: https://taskifyma.netlify.app`);
  console.log('='.repeat(50));
  console.log('⚠️  SET ENVIRONMENT VARIABLES TO ENABLE FULL FUNCTIONALITY');
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
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
