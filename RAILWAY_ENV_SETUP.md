# 🚂 Railway Environment Variables Setup Guide

## Critical Environment Variables for Railway

Copy these variables to your Railway project dashboard:

### 🗄️ Database Configuration
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/taskify?retryWrites=true&w=majority
```
**How to get this:**
1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Create a cluster (free tier available)
3. Create a database user
4. Get connection string from "Connect" button
5. Replace `your-username`, `your-password`, and `your-cluster`

### 🔐 Authentication Configuration
```
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters-long
```
**Generate a secure secret:**
- Use: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- Select: 256-bit key
- Or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 🌐 Production Configuration
```
NODE_ENV=production
FRONTEND_URL=https://taskifyma.netlify.app
```

### 📁 File Upload Configuration (Optional)
```
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 🔒 Security Configuration (Optional)
```
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🚀 Railway Deployment Steps

1. **In Railway Dashboard:**
   - Go to your project
   - Click "Variables" tab
   - Add each environment variable above

2. **Required Variables (Must Set):**
   - ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
   - ✅ `JWT_SECRET` - Secure random string (32+ characters)
   - ✅ `NODE_ENV` - Set to `production`
   - ✅ `FRONTEND_URL` - Set to `https://taskifyma.netlify.app`

3. **After setting variables:**
   - Railway will automatically redeploy
   - Check logs for successful connection
   - Test health endpoint: `https://your-app.up.railway.app/health`

## 🩺 Health Check Commands

Test your deployment:

```bash
# Check if server is responding
curl https://your-app.up.railway.app/health

# Check API status
curl https://your-app.up.railway.app/api

# Check root endpoint
curl https://your-app.up.railway.app/
```

## 🔍 Common Issues & Solutions

### Issue: "Healthcheck failed!"
**Solution:** 
- Ensure all required environment variables are set
- Check that MongoDB URI is correct and accessible
- Verify Railway logs for specific error messages

### Issue: "MongoDB connection error"
**Solution:**
- Verify MongoDB Atlas cluster is running
- Check database user credentials
- Ensure network access is set to 0.0.0.0/0 (allow all)
- Test connection string in MongoDB Compass

### Issue: "Route not found" errors
**Solution:**
- Check that all route files exist in `server/routes/`
- Verify model files exist in `server/models/`
- Check Railway build logs for missing dependencies

## 📞 Need Help?

If deployment still fails:
1. Check Railway logs in the dashboard
2. Copy error messages
3. Verify all environment variables are set correctly
4. Test MongoDB connection separately

**Contact:**
- GitHub: https://github.com/Amanchaurasia17/taskify
- Email: amanchaurasiya92@gmail.com
