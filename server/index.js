const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Basic Middleware
app.use(express.json());

// ✅ CORS Middleware (ultra-minimal)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ✅ Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TASKIFY API Server Running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// ✅ Health route
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ Auth routes (dummy)
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

// ✅ 404 fallback
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl
  });
});

// ✅ Start server with crash guard
console.log('Starting TASKIFY server...');
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ TASKIFY Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`💓 Healthcheck: http://localhost:${PORT}/health`);
  });

  // ✅ Handle runtime errors
  server.on('error', (error) => {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  });

  // ✅ Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received');
    server.close(() => process.exit(0));
  });

} catch (error) {
  console.error('❌ Uncaught Startup Crash:', error.message);
  process.exit(1);
}
