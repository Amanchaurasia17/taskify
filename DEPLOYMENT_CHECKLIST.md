# 📋 TASKIFY Deployment Checklist

## ✅ Prerequisites
- [ ] Node.js 18+ installed
- [ ] Railway CLI installed (`npm install -g @railway/cli`)
- [ ] MongoDB Atlas account created
- [ ] Frontend deployed (✅ **DONE** - https://taskifyma.netlify.app/)

## 🗄️ Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] Database named `taskify`

## 🚂 Backend Deployment
- [ ] Railway account created and CLI authenticated
- [ ] Navigate to `server` directory
- [ ] Run `railway init` to initialize project
- [ ] Run `railway up` to deploy
- [ ] Configure environment variables in Railway dashboard:
  - [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
  - [ ] `JWT_SECRET` - A secure random string (32+ characters)
  - [ ] `NODE_ENV` - Set to `production`
  - [ ] `FRONTEND_URL` - Set to `https://taskifyma.netlify.app`
  - [ ] `PORT` - Set to `5000` (optional, Railway sets this automatically)

## 🌐 Frontend Configuration
- [ ] Get Railway backend URL (e.g., `https://your-project.up.railway.app`)
- [ ] Update Netlify environment variables:
  - [ ] `VITE_API_URL` - Set to `https://your-railway-url.up.railway.app/api`
- [ ] Redeploy frontend on Netlify

## 🔍 Testing & Verification
- [ ] Backend health check: `https://your-railway-url.up.railway.app/health`
- [ ] API status check: `https://your-railway-url.up.railway.app/api`
- [ ] Frontend loads: `https://taskifyma.netlify.app/`
- [ ] User registration works
- [ ] User login works
- [ ] Task creation works
- [ ] File upload works
- [ ] Notifications work

## 🛠️ Troubleshooting
- [ ] Check Railway logs: `railway logs`
- [ ] Verify all environment variables are set correctly
- [ ] Test API endpoints individually
- [ ] Check browser network tab for CORS issues
- [ ] Verify MongoDB connection from Railway dashboard

## 📞 Support Resources
- 📋 [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 🐙 [GitHub Repository](https://github.com/Amanchaurasia17/taskify)
- 📧 Email: amanchaurasiya92@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/amanchaurasiya14/)

## 🎉 Success Criteria
When deployment is successful, you should have:
- ✅ Frontend running at: https://taskifyma.netlify.app/
- ✅ Backend running at: https://your-railway-url.up.railway.app/
- ✅ Health check responding: `/health` endpoint
- ✅ API responding: `/api` endpoint
- ✅ Database connected and accessible
- ✅ Authentication working (login/register)
- ✅ Task management functional
- ✅ File uploads working
- ✅ Notifications system active

---

💡 **Tip**: Keep your Railway backend URL handy - you'll need it for the frontend configuration!
