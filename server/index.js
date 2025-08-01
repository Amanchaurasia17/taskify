const express = require('express');

// Ultra-minimal server for Railway
const app = express();
const PORT = process.env.PORT || 3000;

// Basic JSON middleware
app.use(express.json());

// Ultra-simple CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'TASKIFY API Server Running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth endpoints
app.post('/auth/register', (req, res) => {
  console.log('Register:', req.body);
  res.json({
    success: true,
    message: 'Registration working',
    user: { email: req.body.email || 'test@example.com' }
  });
});

app.post('/auth/login', (req, res) => {
  console.log('Login:', req.body);
  res.json({
    success: true,
    message: 'Login working',
    user: { email: req.body.email || 'test@example.com' }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.originalUrl
  });
});

// Start server
console.log('Starting TASKIFY server...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ TASKIFY Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`� Health: /health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => process.exit(0));
});
