# 🚀 Deployment Guide

This comprehensive guide covers deploying TASKIFY to various platforms including Railway, Netlify, and Docker.

---

## 📋 Pre-deployment Checklist

### ✅ Required Setup
- [ ] MongoDB Atlas database configured
- [ ] Environment variables prepared
- [ ] Production build tested locally
- [ ] SSL certificates ready (if custom domain)
- [ ] Domain DNS configured (if applicable)

### 🔐 Security Requirements
- [ ] Strong JWT secret generated
- [ ] Database credentials secured
- [ ] CORS origins configured
- [ ] File upload limits set
- [ ] Rate limiting enabled

---

## ☁️ Cloud Deployment Options

## 🚂 Railway Deployment (Backend)

### Step 1: Prepare Railway Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Create New Project**
   ```bash
   railway init
   ```

### Step 2: Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskify?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.netlify.app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Step 3: Deploy to Railway

1. **Connect Repository**
   ```bash
   railway link
   ```

2. **Deploy Application**
   ```bash
   railway up
   ```

3. **Set Custom Domain (Optional)**
   - Go to Railway dashboard
   - Navigate to your project
   - Add custom domain in settings

### Step 4: Configure Build Settings

Create `railway.toml` in project root:

```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build:server"

[deploy]
startCommand = "npm run start:server"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
```

---

## 🌐 Netlify Deployment (Frontend)

### Step 1: Prepare Build Configuration

Create `netlify.toml` in project root:

```toml
[build]
  base = "."
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-api-domain.railway.app;"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Step 2: Configure Environment Variables

In Netlify dashboard, add these variables:

```env
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_APP_NAME=TASKIFY
VITE_ENVIRONMENT=production
```

### Step 3: Deploy Methods

#### Method 1: Git Integration (Recommended)
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Enable automatic deploys

#### Method 2: Manual Deploy
1. Build locally:
   ```bash
   npm run build
   ```
2. Drag `dist` folder to Netlify deploy area

#### Method 3: CLI Deploy
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login and deploy:
   ```bash
   netlify login
   netlify deploy --prod --dir=dist
   ```

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create new project: "TASKIFY-Production"
3. Create cluster (M0 Sandbox for free tier)
4. Choose cloud provider and region

### Step 2: Configure Database Access

1. **Create Database User**
   - Username: `taskify-user`
   - Password: Generate secure password
   - Roles: `Atlas admin` or `readWriteAnyDatabase`

2. **Set Network Access**
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

### Step 3: Get Connection String

```
mongodb+srv://taskify-user:<password>@cluster0.abcde.mongodb.net/taskify?retryWrites=true&w=majority
```

### Step 4: Initialize Database

Run initialization script:

```javascript
// Connect to MongoDB and create indexes
use taskify

// Create users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "isActive": 1, "createdAt": -1 })

// Create tasks collection indexes
db.tasks.createIndex({ "assignedTo": 1, "status": 1, "createdAt": -1 })
db.tasks.createIndex({ "status": 1, "priority": 1 })
db.tasks.createIndex({ "createdBy": 1, "createdAt": -1 })

// Create notifications collection indexes
db.notifications.createIndex({ "recipient": 1, "isRead": 1, "createdAt": -1 })
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Create sessions collection indexes
db.sessions.createIndex({ "userId": 1, "isActive": 1, "lastActivity": -1 })
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

---

## 🐳 Docker Deployment

### Step 1: Build Docker Images

#### Backend Image
```bash
# Build backend image
docker build -f docker/Dockerfile.backend -t taskify-backend .

# Or using docker-compose
docker-compose build backend
```

#### Frontend Image
```bash
# Build frontend image
docker build -f docker/Dockerfile.frontend -t taskify-frontend .

# Or using docker-compose
docker-compose build frontend
```

### Step 2: Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - taskify-network

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - taskify-network

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - taskify-network

networks:
  taskify-network:
    driver: bridge

volumes:
  uploads:
```

### Step 3: Deploy with Docker

```bash
# Set environment variables
export MONGODB_URI="your-mongodb-uri"
export JWT_SECRET="your-jwt-secret"
export FRONTEND_URL="https://your-domain.com"

# Deploy stack
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

---

## 🔧 Server Configuration

### Step 1: System Requirements

**Minimum Requirements:**
- CPU: 1 vCPU
- RAM: 1GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04 LTS

**Recommended Requirements:**
- CPU: 2 vCPU
- RAM: 4GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS

### Step 2: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (if not using Docker)
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Step 3: SSL Configuration

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add line: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚦 Environment Configuration

### Development Environment

```env
# .env.development
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskify-dev
JWT_SECRET=dev-secret-key
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
```

### Staging Environment

```env
# .env.staging
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskify-staging
JWT_SECRET=staging-secret-key
FRONTEND_URL=https://taskify-staging.netlify.app
LOG_LEVEL=info
```

### Production Environment

```env
# .env.production
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskify-production
JWT_SECRET=super-secure-production-secret
FRONTEND_URL=https://taskify.netlify.app
LOG_LEVEL=error
RATE_LIMIT_ENABLED=true
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```javascript
// Backend health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  })
})

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping()
    res.status(200).json({ status: 'OK', database: 'connected' })
  } catch (error) {
    res.status(503).json({ status: 'ERROR', database: 'disconnected' })
  }
})
```

### Monitoring Setup

```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# Setup startup script
pm2 startup
pm2 save
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'taskify-backend',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
}
```

---

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application port (if needed)
sudo ufw allow 5000/tcp

# Check status
sudo ufw status
```

### 2. Nginx Security Headers

```nginx
# /etc/nginx/sites-available/taskify
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/taskify;
        index index.html;
    }
}
```

### 3. Application Security

```javascript
// Security middleware configuration
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

app.use('/api/', limiter)
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
mongo "mongodb+srv://cluster.mongodb.net/test" --username username

# Check firewall rules
telnet cluster.mongodb.net 27017
```

#### 3. CORS Issues
```javascript
// Update CORS configuration
const cors = require('cors')

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Test renewal
sudo certbot renew --dry-run
```

### Performance Optimization

#### 1. Database Optimization
```javascript
// Connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})

// Indexes for common queries
db.tasks.createIndex({ assignedTo: 1, status: 1, createdAt: -1 })
```

#### 2. Caching Strategy
```javascript
const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL)

// Cache middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl
    const cached = await client.get(key)
    
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    res.sendResponse = res.json
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body))
      res.sendResponse(body)
    }
    
    next()
  }
}
```

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Netlify Documentation](https://docs.netlify.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

## 📞 Support

If you encounter issues during deployment:

1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Test the application locally first
5. Check the troubleshooting section above

For additional support, please open an issue in the GitHub repository.
