# 🚂 Railway Environment Variables - Complete Setup

## 📋 Environment Variables to Set in Railway Dashboard

Copy and paste these into your Railway project's Variables section:

### 🔧 Required Variables (MUST SET)

#### Database Configuration
```
MONGODB_URI
```
**Value:** `mongodb+srv://username:password@cluster.mongodb.net/taskify?retryWrites=true&w=majority`
**How to get:**
1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Create free cluster
3. Create database user with password
4. Get connection string from "Connect" button
5. Replace username/password with your credentials

#### Authentication
```
JWT_SECRET
```
**Value:** `taskify-production-jwt-secret-2025-super-secure-minimum-32-characters-long`
**Generate secure secret:** Run this command locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Environment Type
```
NODE_ENV
```
**Value:** `production`

#### CORS Configuration
```
FRONTEND_URL
```
**Value:** `https://taskifyma.netlify.app`

---

### 🔧 Optional Variables (Recommended)

#### File Upload Configuration
```
MAX_FILE_SIZE
```
**Value:** `10485760`
**Description:** 10MB file upload limit

```
UPLOAD_PATH
```
**Value:** `./uploads`
**Description:** Upload directory path

#### Security Configuration
```
RATE_LIMIT_WINDOW
```
**Value:** `900000`
**Description:** 15 minutes in milliseconds

```
RATE_LIMIT_MAX
```
**Value:** `100`
**Description:** Max requests per window

#### JWT Configuration
```
JWT_EXPIRES_IN
```
**Value:** `30d`
**Description:** Token expiration time

#### Security Settings
```
BCRYPT_ROUNDS
```
**Value:** `12`
**Description:** Password hashing rounds

---

## 🚀 Quick Setup Commands

### Step 1: Set Required Variables in Railway
Copy these commands and replace with your actual values:

```bash
# In Railway Dashboard > Variables section, add:

# 1. MongoDB Atlas Connection (REQUIRED)
MONGODB_URI = mongodb+srv://your-username:your-password@your-cluster.mongodb.net/taskify?retryWrites=true&w=majority

# 2. JWT Secret (REQUIRED) - Generate a secure one
JWT_SECRET = your-generated-32-character-secret-here

# 3. Environment (REQUIRED)
NODE_ENV = production

# 4. Frontend URL (REQUIRED)
FRONTEND_URL = https://taskifyma.netlify.app
```

### Step 2: Optional Performance Variables
```bash
# File Upload
MAX_FILE_SIZE = 10485760
UPLOAD_PATH = ./uploads

# Security
RATE_LIMIT_WINDOW = 900000
RATE_LIMIT_MAX = 100
JWT_EXPIRES_IN = 30d
BCRYPT_ROUNDS = 12
```

---

## 🎯 Priority Order

### 🚨 Critical (Set These First)
1. **MONGODB_URI** - Without this, database won't connect
2. **JWT_SECRET** - Without this, authentication fails
3. **NODE_ENV** - Set to `production` for proper behavior
4. **FRONTEND_URL** - For CORS to work with your Netlify frontend

### 🔧 Important (Set After Critical)
5. **MAX_FILE_SIZE** - For file uploads
6. **RATE_LIMIT_WINDOW** - For API protection
7. **RATE_LIMIT_MAX** - For API protection

### 📝 Optional (Nice to Have)
8. **UPLOAD_PATH** - Server will create default if not set
9. **JWT_EXPIRES_IN** - Has sensible default
10. **BCRYPT_ROUNDS** - Has sensible default

---

## 🔍 How to Generate Secure JWT_SECRET

### Option 1: Using Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Online Generator
Go to: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- Select: 256-bit
- Copy the generated key

### Option 3: Manual Secure String
Use a string like this format:
```
taskify-prod-jwt-[RANDOM-32-CHARS]-2025
```

---

## 🗄️ MongoDB Atlas Setup

### Quick MongoDB Atlas Setup:
1. **Sign up:** https://cloud.mongodb.com
2. **Create Cluster:** Choose M0 (Free)
3. **Create User:**
   - Database Access → Add New User
   - Username: `taskify-user`
   - Password: Generate secure password
4. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
5. **Get Connection String:**
   - Cluster → Connect → Connect Application
   - Copy the connection string
   - Replace `<username>` and `<password>`

### Example Connection String:
```
mongodb+srv://taskify-user:SecurePass123@cluster0.abc123.mongodb.net/taskify?retryWrites=true&w=majority
```

---

## 🚀 Deployment Verification

After setting variables, Railway will redeploy. Check:

### 1. Health Check
```bash
curl https://your-app.up.railway.app/health
```

### 2. Expected Response
```json
{
  "status": "OK",
  "mongodb": "connected",
  "env_vars": {
    "PORT": "✅ Set",
    "MONGODB_URI": "✅ Set",
    "JWT_SECRET": "✅ Set",
    "NODE_ENV": "production"
  }
}
```

### 3. API Test
```bash
curl https://your-app.up.railway.app/api
```

---

## ⚠️ Common Issues & Solutions

### Issue: "MONGODB_URI ❌ Not set"
**Solution:** Add MongoDB Atlas connection string to Railway variables

### Issue: "JWT_SECRET ❌ Not set"
**Solution:** Generate and add secure JWT secret to Railway variables

### Issue: "MongoDB connection error"
**Solutions:**
- Check MongoDB Atlas cluster is running
- Verify username/password in connection string
- Ensure network access allows 0.0.0.0/0
- Test connection string in MongoDB Compass

### Issue: CORS errors from frontend
**Solution:** Ensure `FRONTEND_URL` is exactly `https://taskifyma.netlify.app`

---

## 🎉 Success Checklist

After setting all variables:
- [ ] Railway deployment succeeds
- [ ] Health check returns "OK"
- [ ] MongoDB shows "connected"
- [ ] All env_vars show "✅ Set"
- [ ] API endpoints respond
- [ ] Frontend can connect to backend

---

## 📱 Frontend Configuration

After Railway backend is deployed, update Netlify:

### Netlify Environment Variable:
```
VITE_API_URL = https://your-railway-app.up.railway.app/api
```

Replace `your-railway-app` with your actual Railway app URL.

---

## 🆘 Need Help?

If you're still having issues:
1. Check Railway logs for specific errors
2. Verify all required variables are set
3. Test MongoDB connection separately
4. Contact support with specific error messages

**Resources:**
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Project GitHub: https://github.com/Amanchaurasia17/taskify
