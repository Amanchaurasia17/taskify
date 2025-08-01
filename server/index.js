const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced CORS middleware for Netlify frontend
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow Netlify domains and localhost
  const allowedOrigins = [
    'https://taskifyma.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'TASKIFY API Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint - CRITICAL for Railway deployment
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'TASKIFY API Server is healthy and ready',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    port: PORT,
    cors: 'enabled',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    serverReady: true
  };
  
  console.log('✅ Health check requested - Server is healthy');
  res.status(200).json(healthCheck);
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TASKIFY Task Management API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: ['/', '/health', '/api', '/auth/*']
  });
});

// Basic auth endpoints for testing
app.post('/auth/register', (req, res) => {
  console.log('Register request received:', req.body);
  res.json({
    success: true,
    message: 'Registration endpoint working!',
    data: {
      user: { id: 1, email: req.body.email },
      token: 'fake-jwt-token'
    }
  });
});

app.post('/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({
    success: true,
    message: 'Login endpoint working!',
    data: {
      user: { id: 1, email: req.body.email },
      token: 'fake-jwt-token'
    }
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    server: 'TASKIFY',
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: ['/', '/health', '/api', '/test', '/auth/register', '/auth/login']
  });
});

// Error handler
app.use((error, req, res, _next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server with enhanced Railway compatibility
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 TASKIFY Server Starting...');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💚 Health check: /health`);
  console.log(`🔗 API endpoints: /, /api, /auth/*`);
  console.log('✅ Server ready to handle requests with CORS enabled');
  console.log('🛡️  Railway deployment optimized');
  
  // Test the health endpoint internally
  setTimeout(() => {
    console.log('🔍 Testing internal health check...');
    // This helps Railway detect the server is ready
  }, 1000);
});

// Enhanced error handling for Railway
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

server.on('listening', () => {
  console.log(`🎯 Server successfully bound to port ${PORT}`);
});

// Graceful shutdown for Railway deployments
const gracefulShutdown = (signal) => {
  console.log(`📴 ${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('❌ Force closing server');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
