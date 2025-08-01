# 🐳 Docker Deployment Guide
## TASKIFY - Complete Docker Setup & Docker Hub Images

## 📦 **Docker Hub Repository**

**Repository**: [aman947/taskify](https://hub.docker.com/r/aman947/taskify)

### **Available Images**

| Image Tag | Purpose | Description | Size |
|-----------|---------|-------------|------|
| `aman947/taskify:frontend` | **Web Interface** | React app with Nginx server | 79.7MB |
| `aman947/taskify:backend` | **API Server** | Node.js REST API with Express | 274MB |

### **Image Details**

#### 🌐 Frontend Image (`aman947/taskify:frontend`)
```bash
# Pull the image
docker pull aman947/taskify:frontend

# Run standalone
docker run -d -p 3000:80 aman947/taskify:frontend

# What's included:
- React 19 production build
- Nginx Alpine server
- Optimized static file serving
- Environment variable support
```

#### ⚙️ Backend Image (`aman947/taskify:backend`)
```bash
# Pull the image  
docker pull aman947/taskify:backend

# Run with environment variables
docker run -d -p 5000:5000 \
  -e MONGODB_URI=mongodb://localhost:27017/taskify \
  -e JWT_SECRET=your_secret_key \
  aman947/taskify:backend

# What's included:
- Node.js 18+ runtime
- Express.js API server
- All backend dependencies
- File upload handling
- Health check endpoints
```

---

## 🚀 **Quick Deployment Options**

### **Option 1: Using Our Docker Hub Images** ⭐
```bash
# Create network
docker network create taskify-network

# 1. Start MongoDB
docker run -d \
  --name taskify-mongo \
  --network taskify-network \
  -p 27017:27017 \
  mongo:latest

# 2. Start Backend (using our Docker Hub image)
docker run -d \
  --name taskify-backend \
  --network taskify-network \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://taskify-mongo:27017/taskify \
  -e JWT_SECRET=your_super_secret_jwt_key_here \
  aman947/taskify:backend

# 3. Start Frontend (using our Docker Hub image)
docker run -d \
  --name taskify-frontend \
  --network taskify-network \
  -p 3000:80 \
  aman947/taskify:frontend
```

### **Option 2: Docker Compose with Hub Images**
```bash
# Create docker-compose.hub.yml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: taskify-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - taskify-network

  backend:
    image: aman947/taskify:backend  # Using Docker Hub image
    container_name: taskify-backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/taskify
      JWT_SECRET: your_super_secret_jwt_key_minimum_32_characters
      NODE_ENV: production
    depends_on:
      - mongodb
    networks:
      - taskify-network

  frontend:
    image: aman947/taskify:frontend  # Using Docker Hub image
    container_name: taskify-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - taskify-network

volumes:
  mongo-data:

networks:
  taskify-network:

# Run it
docker-compose -f docker-compose.hub.yml up -d
```

### **Option 3: Build from Source**
```bash
# Clone repository
git clone https://github.com/Amanchaurasia17/taskify.git
cd taskify

# Copy environment file
cp .env.docker .env

# Start the entire application
docker-compose up -d
```

---

## 🌍 **Production Deployment**

### **For Production Use**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo-data:/data/db
    networks:
      - taskify-network
    restart: unless-stopped

  backend:
    image: aman947/taskify:backend
    environment:
      MONGODB_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/taskify?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      PORT: 5000
    depends_on:
      - mongodb
    networks:
      - taskify-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: aman947/taskify:frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - taskify-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongo-data:

networks:
  taskify-network:
```

---

## 🚀 **One-Command Deployment**

```bash
# Copy environment file
cp .env.docker .env

# Start the entire application
docker-compose up -d
```

**That's it! Your application is now running at:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

---

## 📋 **What Gets Deployed**

### **Services**
1. **MongoDB** (Port 27017) - Database with initialization
2. **Backend** (Port 5000) - Node.js API server
3. **Frontend** (Port 3000) - React app with Nginx

### **Features**
- ✅ **Health Checks** - All services monitored
- ✅ **Auto-restart** - Services restart on failure
- ✅ **Data Persistence** - MongoDB data and uploads persist
- ✅ **Network Security** - Internal Docker network
- ✅ **Production Ready** - Optimized for performance

---

## 🛠️ **Docker Commands**

### **Start Application**
```bash
# Start all services (detached)
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up mongodb
```

### **Stop Application**
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (DANGER: deletes data)
docker-compose down -v
```

### **View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### **Restart Services**
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

---

## 🔧 **Configuration**

### **Environment Variables (.env)**
```bash
# Database
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password
MONGO_DATABASE=taskify

# Security
JWT_SECRET=your_super_secret_jwt_key_32_chars_min

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### **Custom Ports**
Edit `docker-compose.yml` to change ports:
```yaml
ports:
  - "8080:80"    # Frontend on port 8080
  - "4000:5000"  # Backend on port 4000
  - "27018:27017" # MongoDB on port 27018
```

---

## 📊 **Health Monitoring**

### **Check Service Status**
```bash
# View all containers
docker-compose ps

# Check health status
docker-compose exec backend curl http://localhost:5000/
docker-compose exec frontend curl http://localhost:80/
```

### **Database Access**
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password123

# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/taskify"
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Kill the process or change port in docker-compose.yml
```

#### **Database Connection Failed**
```bash
# Check MongoDB is running
docker-compose logs mongodb

# Wait for MongoDB to fully start
docker-compose up mongodb
# Wait for "waiting for connections on port 27017"
```

#### **Build Failed**
```bash
# Clean build cache
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down
docker system prune -f
docker-compose up --build
```

### **Reset Everything**
```bash
# Nuclear option - removes everything
docker-compose down -v
docker system prune -af
docker-compose up --build -d
```

---

## 🚀 **Production Deployment**

### **For Production Use:**

1. **Change default passwords** in `.env`
2. **Use environment-specific configs**
3. **Enable SSL/HTTPS**
4. **Set up proper monitoring**
5. **Configure backup strategy**

### **Production Environment File**
```bash
# .env.production
MONGO_USERNAME=prod_admin
MONGO_PASSWORD=ultra_secure_password_2025
MONGO_DATABASE=taskify_prod
JWT_SECRET=production_jwt_secret_minimum_32_characters_long
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

---

## ✅ **Verification Steps**

1. **Start services**: `docker-compose up -d`
2. **Check status**: `docker-compose ps`
3. **Test frontend**: Visit http://localhost:3000
4. **Test backend**: Visit http://localhost:5000
5. **Register user**: Create account in the app
6. **Create task**: Test full functionality

**Total setup time: 5 minutes!** 🎉

---

## 📞 **Support**

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify ports are free: `netstat -tulpn`
3. Ensure Docker is running: `docker --version`
4. Try clean rebuild: `docker-compose down && docker-compose up --build`
