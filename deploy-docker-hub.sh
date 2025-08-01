#!/bin/bash

# 🚀 TASKIFY - Quick Docker Hub Deployment Script
# This script deploys TASKIFY using pre-built images from Docker Hub

echo "🚀 TASKIFY - Docker Hub Deployment"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed and running${NC}"
echo ""

# Create network if it doesn't exist
echo -e "${BLUE}🔗 Creating Docker network...${NC}"
docker network create taskify-network 2>/dev/null || echo -e "${YELLOW}⚠️  Network already exists${NC}"
echo ""

# Pull latest images
echo -e "${BLUE}📦 Pulling latest images from Docker Hub...${NC}"
echo "   Frontend: aman947/taskify:frontend"
echo "   Backend:  aman947/taskify:backend"
echo "   Database: mongo:latest"
echo ""

docker pull aman947/taskify:frontend
docker pull aman947/taskify:backend
docker pull mongo:latest

echo ""

# Stop and remove existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker stop taskify-frontend taskify-backend taskify-mongo 2>/dev/null || true
docker rm taskify-frontend taskify-backend taskify-mongo 2>/dev/null || true
echo ""

# Start MongoDB
echo -e "${BLUE}🗄️  Starting MongoDB...${NC}"
docker run -d \
  --name taskify-mongo \
  --network taskify-network \
  -p 27017:27017 \
  -v taskify-mongo-data:/data/db \
  --restart unless-stopped \
  mongo:latest

# Wait for MongoDB to start
echo -e "${YELLOW}⏳ Waiting for MongoDB to start...${NC}"
sleep 10

# Start Backend
echo -e "${BLUE}⚙️  Starting Backend API...${NC}"
docker run -d \
  --name taskify-backend \
  --network taskify-network \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://taskify-mongo:27017/taskify \
  -e JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_for_production \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MAX_FILE_SIZE=10485760 \
  --restart unless-stopped \
  aman947/taskify:backend

# Wait for Backend to start
echo -e "${YELLOW}⏳ Waiting for Backend to start...${NC}"
sleep 5

# Start Frontend
echo -e "${BLUE}🌐 Starting Frontend...${NC}"
docker run -d \
  --name taskify-frontend \
  --network taskify-network \
  -p 3000:80 \
  --restart unless-stopped \
  aman947/taskify:frontend

echo ""
echo -e "${GREEN}🎉 TASKIFY is now running!${NC}"
echo ""
echo "📋 Access Information:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   API Docs:  http://localhost:5000/api"
echo "   MongoDB:   mongodb://localhost:27017"
echo ""
echo "🔧 Management Commands:"
echo "   View logs:     docker logs -f <container-name>"
echo "   Stop all:      docker stop taskify-frontend taskify-backend taskify-mongo"
echo "   Remove all:    docker rm taskify-frontend taskify-backend taskify-mongo"
echo "   Remove data:   docker volume rm taskify-mongo-data"
echo ""
echo "📊 Container Status:"
docker ps --filter "name=taskify" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "🔐 Default Admin Account:"
echo "   Email:    admin@taskify.com"
echo "   Password: admin123"
echo ""
echo "💡 Tip: Change the default admin credentials after first login!"
