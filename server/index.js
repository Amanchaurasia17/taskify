const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
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
    cors: 'enabled'
  };
  
  console.log('Health check requested:', healthCheck);
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
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 TASKIFY Server Starting...');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API info: http://localhost:${PORT}/api`);
  console.log('✅ Server ready to handle requests with CORS enabled');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
