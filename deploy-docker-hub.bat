@echo off
REM 🚀 TASKIFY - Quick Docker Hub Deployment Script for Windows
REM This script deploys TASKIFY using pre-built images from Docker Hub

echo 🚀 TASKIFY - Docker Hub Deployment
echo ==================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running
echo.

REM Create network if it doesn't exist
echo 🔗 Creating Docker network...
docker network create taskify-network >nul 2>&1
echo.

REM Pull latest images
echo 📦 Pulling latest images from Docker Hub...
echo    Frontend: aman947/taskify:frontend
echo    Backend:  aman947/taskify:backend  
echo    Database: mongo:latest
echo.

docker pull aman947/taskify:frontend
docker pull aman947/taskify:backend
docker pull mongo:latest

echo.

REM Stop and remove existing containers
echo 🛑 Stopping existing containers...
docker stop taskify-frontend taskify-backend taskify-mongo >nul 2>&1
docker rm taskify-frontend taskify-backend taskify-mongo >nul 2>&1
echo.

REM Start MongoDB
echo 🗄️ Starting MongoDB...
docker run -d ^
  --name taskify-mongo ^
  --network taskify-network ^
  -p 27017:27017 ^
  -v taskify-mongo-data:/data/db ^
  --restart unless-stopped ^
  mongo:latest

REM Wait for MongoDB to start
echo ⏳ Waiting for MongoDB to start...
timeout /t 10 /nobreak >nul

REM Start Backend
echo ⚙️ Starting Backend API...
docker run -d ^
  --name taskify-backend ^
  --network taskify-network ^
  -p 5000:5000 ^
  -e MONGODB_URI=mongodb://taskify-mongo:27017/taskify ^
  -e JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_for_production ^
  -e NODE_ENV=production ^
  -e PORT=5000 ^
  -e MAX_FILE_SIZE=10485760 ^
  --restart unless-stopped ^
  aman947/taskify:backend

REM Wait for Backend to start
echo ⏳ Waiting for Backend to start...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo 🌐 Starting Frontend...
docker run -d ^
  --name taskify-frontend ^
  --network taskify-network ^
  -p 3000:80 ^
  --restart unless-stopped ^
  aman947/taskify:frontend

echo.
echo 🎉 TASKIFY is now running!
echo.
echo 📋 Access Information:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:5000
echo    API Docs:  http://localhost:5000/api
echo    MongoDB:   mongodb://localhost:27017
echo.
echo 🔧 Management Commands:
echo    View logs:     docker logs -f ^<container-name^>
echo    Stop all:      docker stop taskify-frontend taskify-backend taskify-mongo
echo    Remove all:    docker rm taskify-frontend taskify-backend taskify-mongo
echo    Remove data:   docker volume rm taskify-mongo-data
echo.
echo 📊 Container Status:
docker ps --filter "name=taskify" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
echo ✅ Deployment completed successfully!
echo.
echo 🔐 Default Admin Account:
echo    Email:    admin@taskify.com
echo    Password: admin123
echo.
echo 💡 Tip: Change the default admin credentials after first login!
echo.
pause
