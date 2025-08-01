# TASKIFY Deployment Script for Windows PowerShell
# This script helps deploy the TASKIFY application

Write-Host "🚀 TASKIFY Deployment Helper" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Railway
try {
    railway whoami | Out-Null
    Write-Host "✅ Railway authenticated" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Railway:" -ForegroundColor Yellow
    railway login
}

Write-Host "📦 Deploying Backend to Railway..." -ForegroundColor Blue
Set-Location server

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found in server directory" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Initialize Railway project if needed
if (-not (Test-Path ".railway")) {
    Write-Host "🔧 Initializing Railway project..." -ForegroundColor Yellow
    railway init
}

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Blue
railway up

# Get project info
try {
    $railwayStatus = railway status --json | ConvertFrom-Json
    $backendUrl = $railwayStatus.url
    
    if ($backendUrl) {
        Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
        Write-Host "🌐 Backend URL: $backendUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Update your frontend environment variables:" -ForegroundColor White
        Write-Host "   VITE_API_URL=$backendUrl/api" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Set these environment variables in Railway dashboard:" -ForegroundColor White
        Write-Host "   - MONGODB_URI (your MongoDB Atlas connection string)" -ForegroundColor Cyan
        Write-Host "   - JWT_SECRET (a secure random string)" -ForegroundColor Cyan
        Write-Host "   - NODE_ENV=production" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "3. Redeploy your frontend on Netlify with the new API URL" -ForegroundColor White
    } else {
        Write-Host "❌ Could not retrieve deployment URL. Please check Railway dashboard." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not get deployment status. Please check Railway dashboard." -ForegroundColor Red
}

Set-Location ..
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
