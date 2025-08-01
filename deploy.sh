#!/bin/bash

# TASKIFY Deployment Script
# This script helps deploy the TASKIFY application

echo "🚀 TASKIFY Deployment Helper"
echo "============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

echo "📦 Deploying Backend to Railway..."
cd server

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in server directory"
    exit 1
fi

# Initialize Railway project if needed
if [ ! -f ".railway" ]; then
    echo "🔧 Initializing Railway project..."
    railway init
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

if [ -n "$BACKEND_URL" ]; then
    echo "✅ Backend deployed successfully!"
    echo "🌐 Backend URL: $BACKEND_URL"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your frontend environment variables:"
    echo "   VITE_API_URL=$BACKEND_URL/api"
    echo ""
    echo "2. Set these environment variables in Railway dashboard:"
    echo "   - MONGODB_URI (your MongoDB Atlas connection string)"
    echo "   - JWT_SECRET (a secure random string)"
    echo "   - NODE_ENV=production"
    echo ""
    echo "3. Redeploy your frontend on Netlify with the new API URL"
else
    echo "❌ Could not retrieve deployment URL. Please check Railway dashboard."
fi

cd ..
echo "🎉 Deployment complete!"
