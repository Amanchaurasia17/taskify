# 🚀 TASKIFY Deployment Guide

This guide will help you deploy your TASKIFY application with the frontend already deployed at https://taskifyma.netlify.app/

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Railway CLI installed (`npm install -g @railway/cli`)
- ✅ MongoDB Atlas account (free tier available)
- ✅ Frontend already deployed on Netlify (✅ Complete - https://taskifyma.netlify.app/)

## 🗄️ Step 1: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (free M0 tier)

2. **Configure Database Access**
   - Go to Database Access
   - Add a new database user
   - Choose password authentication
   - Save username and password

3. **Configure Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow access from anywhere)
   - This is needed for Railway deployment

4. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `taskify`

Example connection string:
```
mongodb+srv://username:password@cluster0.mongodb.net/taskify?retryWrites=true&w=majority
```

## 🚂 Step 2: Deploy Backend to Railway

### Option A: Using Railway Dashboard

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Navigate to Server Directory**
   ```bash
   cd server
   ```

3. **Initialize Railway Project**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Set Environment Variables in Railway Dashboard**
   - Go to your Railway project dashboard
   - Click on your service
   - Go to Variables tab
   - Add these variables:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/taskify?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025
   NODE_ENV=production
   FRONTEND_URL=https://taskifyma.netlify.app
   PORT=5000
   ```

### Option B: Using Deployment Scripts

#### Windows (PowerShell):
```powershell
.\deploy.ps1
```

#### Linux/macOS (Bash):
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🌐 Step 3: Update Frontend Configuration

After your backend is deployed to Railway, you'll get a URL like:
`https://your-project-name.up.railway.app`

1. **Update Netlify Environment Variables**
   - Go to your Netlify site dashboard
   - Go to Site Settings → Environment Variables
   - Add or update:
   ```env
   VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
   ```

2. **Redeploy Frontend**
   - In Netlify dashboard, go to Deploys
   - Click "Trigger deploy" → "Deploy site"
   - Or push changes to your GitHub repository (if connected)

## 🔧 Step 4: Verify Deployment

1. **Check Backend Health**
   ```bash
   curl https://your-railway-backend-url.up.railway.app/health
   ```

2. **Check API Endpoints**
   ```bash
   curl https://your-railway-backend-url.up.railway.app/api
   ```

3. **Test Frontend**
   - Visit https://taskifyma.netlify.app/
   - Try to register a new account
   - Test login functionality
   - Create and manage tasks

## 🛠️ Environment Variables Reference

### Backend (Railway)
```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskify?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
FRONTEND_URL=https://taskifyma.netlify.app

# Optional (with defaults)
PORT=5000
JWT_EXPIRES_IN=30d
MAX_FILE_SIZE=10485760
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Frontend (Netlify)
```env
VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
```

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in Railway matches your Netlify URL exactly
   - Check browser console for specific CORS errors

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes 0.0.0.0/0
   - Ensure database user has read/write permissions

3. **Authentication Not Working**
   - Verify `JWT_SECRET` is set and long enough (32+ characters)
   - Check if frontend is sending requests to correct API URL

4. **File Upload Issues**
   - Railway has ephemeral file system
   - Files uploaded will be lost on restart
   - Consider using cloud storage (AWS S3, Cloudinary) for production

### Debug Commands:

```bash
# Check Railway logs
railway logs

# Check Railway service status
railway status

# Open Railway dashboard
railway open
```

## 📊 Performance Optimization

1. **Database Indexes** - Already configured in the server code
2. **Rate Limiting** - Configured to prevent abuse
3. **Compression** - Enabled for API responses
4. **Security Headers** - Helmet.js configured

## 🔒 Security Checklist

- ✅ JWT secrets are secure and random
- ✅ CORS is properly configured
- ✅ Rate limiting is enabled
- ✅ Input validation is implemented
- ✅ Password hashing with bcrypt
- ✅ Security headers with Helmet
- ✅ File upload restrictions

## 📈 Monitoring

### Health Check Endpoints:
- Backend: `https://your-railway-url.up.railway.app/health`
- API Status: `https://your-railway-url.up.railway.app/api`

### Metrics to Monitor:
- Response times
- Database connection status
- Memory usage
- Error rates

## 🎉 Success!

Once deployed successfully, you should have:

1. ✅ **Frontend**: https://taskifyma.netlify.app/
2. ✅ **Backend**: https://your-railway-url.up.railway.app/
3. ✅ **Database**: MongoDB Atlas
4. ✅ **Health Check**: Working endpoints
5. ✅ **Authentication**: JWT-based login/register
6. ✅ **Task Management**: Full CRUD operations
7. ✅ **File Uploads**: Attachment functionality
8. ✅ **Notifications**: Real-time updates

## 🆘 Need Help?

If you encounter issues:

1. Check Railway logs: `railway logs`
2. Verify environment variables in Railway dashboard
3. Test API endpoints with curl or Postman
4. Check browser network tab for frontend issues
5. Review this deployment guide step by step

## 📞 Support

- 📧 Email: amanchaurasiya92@gmail.com
- 🐙 GitHub: [Amanchaurasia17/taskify](https://github.com/Amanchaurasia17/taskify)
- 💼 LinkedIn: [Aman Chaurasiya](https://www.linkedin.com/in/amanchaurasiya14/)

Happy deploying! 🚀
