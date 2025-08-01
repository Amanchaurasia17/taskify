// Ultra minimal server for Railway debugging
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Ultra minimal server starting...');
console.log('Port:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.get('/health', (req, res) => {
  console.log('Health check received');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  console.log('Root request received');
  res.json({ message: 'Ultra minimal TASKIFY server running', status: 'OK' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Server listening on port ${PORT}`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

module.exports = app;
