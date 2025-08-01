# 🚀 TASKIFY Railway Environment Setup Guide

## 📋 Required Environment Variables

To enable full MERN stack functionality on Railway, you need to set these environment variables in your Railway project dashboard:

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskify?retryWrites=true&w=majority
```
**How to get this:**
- Go to [MongoDB Atlas](https://cloud.mongodb.com/)
- Create a cluster (or use existing)
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<username>` and `<password>` with your MongoDB credentials

### 2. Authentication Secret
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```
**Generate a secure secret:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Option 3: Use a secure online generator
# Visit: https://randomkeygen.com/ (use "Fort Knox" level)
```

### 3. Environment & CORS
```
NODE_ENV=production
FRONTEND_URL=https://taskifyma.netlify.app
```

## 🎯 How to Set Environment Variables in Railway

### Step 1: Access Railway Dashboard
1. Go to [Railway.app](https://railway.app)
2. Sign in to your account
3. Select your TASKIFY project

### Step 2: Navigate to Variables
1. Click on your service/deployment
2. Go to the **"Variables"** tab
3. Click **"New Variable"**

### Step 3: Add Each Variable
Add these one by one:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `<32-char-random-string>` | Secret key for JWT tokens |
| `NODE_ENV` | `production` | Environment mode |
| `FRONTEND_URL` | `https://taskifyma.netlify.app` | Frontend URL for CORS |

### Step 4: Deploy
After adding all variables:
1. Click **"Deploy"** or wait for auto-deployment
2. Check the logs to confirm all variables are detected

## ✅ Verification

Once deployed with environment variables, visit:
- **Health Check**: https://web-production-84575.up.railway.app/health
- **API Status**: https://web-production-84575.up.railway.app/api

You should see:
```json
{
  "features": {
    "database": "Connected",
    "authentication": "Ready",
    "full_api": true
  }
}
```

## 🔧 Available API Endpoints (After Setup)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-read/:id` - Mark as read

## 🚨 Troubleshooting

### If deployment fails:
1. Check Railway logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from Railway IPs
4. Check if JWT_SECRET is at least 32 characters long

### If frontend can't connect:
1. Verify FRONTEND_URL matches your Netlify domain exactly
2. Check CORS settings in the server logs
3. Ensure Railway URL is accessible from browser

## 📞 Support

If you encounter issues:
1. Check the Railway deployment logs
2. Visit `/health` endpoint for status information
3. Review this guide for missing steps

---

**Frontend URL**: https://taskifyma.netlify.app  
**Backend URL**: https://web-production-84575.up.railway.app  
**Repository**: https://github.com/Amanchaurasia17/taskify
