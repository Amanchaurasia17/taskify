# 🚀 Quick Deployment Guide - Docker Hub Images

This guide shows you how to deploy TASKIFY using our pre-built Docker Hub images without needing to build anything locally.

## 📦 Docker Hub Repository
**Repository**: [aman947/taskify](https://hub.docker.com/r/aman947/taskify)

## 🎯 What You Get

| Component | Docker Hub Image | Purpose | Size |
|-----------|------------------|---------|------|
| **Frontend** | `aman947/taskify:frontend` | React web interface | 79.7MB |
| **Backend** | `aman947/taskify:backend` | Node.js API server | 274MB |
| **Database** | `mongo:latest` | MongoDB database | ~420MB |

---

## 🚀 Quick Start (3 Options)

### Option 1: Automated Script ⭐ **Recommended**

#### For Linux/Mac:
```bash
# Download and run deployment script
curl -fsSL https://raw.githubusercontent.com/Amanchaurasia17/taskify/main/deploy-docker-hub.sh | bash
```

#### For Windows:
```powershell
# Download and run
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Amanchaurasia17/taskify/main/deploy-docker-hub.bat" -OutFile "deploy.bat"
.\deploy.bat
```

### Option 2: Docker Compose 🐳

```bash
# Download the compose file
curl -fsSL https://raw.githubusercontent.com/Amanchaurasia17/taskify/main/docker-compose.hub.yml -o docker-compose.yml

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Manual Docker Commands 🔧

```bash
# Create network
docker network create taskify-network

# Start MongoDB
docker run -d \
  --name taskify-mongo \
  --network taskify-network \
  -p 27017:27017 \
  -v taskify-mongo-data:/data/db \
  mongo:latest

# Start Backend
docker run -d \
  --name taskify-backend \
  --network taskify-network \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://taskify-mongo:27017/taskify \
  -e JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters \
  aman947/taskify:backend

# Start Frontend  
docker run -d \
  --name taskify-frontend \
  --network taskify-network \
  -p 3000:80 \
  aman947/taskify:frontend
```

---

## 🌐 Access Your Application

After deployment, access your TASKIFY application at:

- **Web Interface**: http://localhost:3000
- **API Server**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api
- **Database**: mongodb://localhost:27017

---

## 🔐 Default Login

```
Email:    admin@taskify.com
Password: admin123
```

**⚠️ Important**: Change these credentials immediately after first login!

---

## 🛠️ Management Commands

```bash
# View running containers
docker ps --filter "name=taskify"

# View logs
docker logs -f taskify-frontend
docker logs -f taskify-backend
docker logs -f taskify-mongo

# Stop all services
docker stop taskify-frontend taskify-backend taskify-mongo

# Remove containers (keeps data)
docker rm taskify-frontend taskify-backend taskify-mongo

# Remove data volumes (⚠️ deletes all data)
docker volume rm taskify-mongo-data
```

---

## 🔧 Environment Configuration

### Backend Environment Variables
```bash
# Required
MONGODB_URI=mongodb://taskify-mongo:27017/taskify
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Optional
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=10485760  # 10MB
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration
The frontend image is pre-configured to work with the backend on port 5000. For custom API URLs, rebuild the frontend image with your environment variables.

---

## 🌍 Production Deployment

### For Cloud Deployment

1. **Change the JWT Secret** to a secure random string
2. **Use a managed database** (MongoDB Atlas, AWS DocumentDB)
3. **Set up SSL/TLS** certificates
4. **Configure proper networking** and security groups
5. **Set up monitoring** and logging

### Environment Variables for Production
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskify
JWT_SECRET=your_highly_secure_production_jwt_secret_key_minimum_32_characters
NODE_ENV=production
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port already in use** | Change ports: `-p 3001:80` for frontend, `-p 5001:5000` for backend |
| **Cannot connect to MongoDB** | Ensure containers are on same network: `--network taskify-network` |
| **Images not found** | Pull manually: `docker pull aman947/taskify:frontend` |
| **Frontend can't reach backend** | Check backend is running: `docker logs taskify-backend` |
| **Permission denied** | On Linux: `sudo docker ...` or add user to docker group |

---

## 🔍 Health Checks

Check if services are healthy:

```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend
curl http://localhost:3000

# Check MongoDB
docker exec taskify-mongo mongosh --eval "db.adminCommand('ping')"
```

---

## 📊 Resource Requirements

| Service | CPU | Memory | Disk |
|---------|-----|--------|------|
| Frontend | 0.1 cores | 64MB | 80MB |
| Backend | 0.5 cores | 256MB | 300MB |
| MongoDB | 0.5 cores | 512MB | 1GB+ |
| **Total** | **1.1 cores** | **832MB** | **1.38GB+** |

---

## 🎉 You're All Set!

Your TASKIFY application is now running with:
- ✅ Professional task management interface
- ✅ Secure authentication and authorization  
- ✅ File upload and attachment support
- ✅ Real-time notifications
- ✅ Mobile-responsive design
- ✅ Production-ready Docker containers

**Happy task managing! 🚀**

---

## 📞 Support

- **Documentation**: [Full README](./README.md)
- **Docker Guide**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/Amanchaurasia17/taskify/issues)
- **Email**: amanchaurasiya92@gmail.com
