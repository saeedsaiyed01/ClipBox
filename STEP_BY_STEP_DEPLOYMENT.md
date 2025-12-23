# Step-by-Step Deployment: Vercel + Railway + Redis Cloud

## 🚀 Deployment Architecture
- **Frontend**: Vercel (Next.js optimized hosting)
- **Backend**: Railway (Full-stack deployment platform)
- **Redis**: Redis Cloud (Managed Redis service)
- **Total Cost**: ~$12-27/month

---

## 📋 Phase 1: Setup Redis Cloud (FREE - 5 minutes)

### Step 1.1: Create Redis Cloud Account
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Sign up with GitHub/Google or email
3. Complete account setup

### Step 1.2: Create Database
1. Click "New Database" in dashboard
2. Choose **Fixed plans** (Free tier)
3. Database name: `clipbox-production`
4. Select **Redis 6.x** (latest stable)
5. Click **Create**

### Step 1.3: Get Connection Details
After creation, you'll see:
- **Public endpoint**: `redis-12345.c12345.c0001.us1-1.rl.rlcloud.net`
- **Port**: `12345`
- **Default user**: `default`

⚠️ **Important**: You'll need to set a password by clicking "Edit" next to the database configuration.

### Step 1.4: Set Database Password
1. Click "Edit" on your database
2. Go to "Security" tab
3. Enable authentication
4. Set a strong password (save it!)
5. Save changes

**Save these values:**
```
REDIS_HOST=redis-12345.c12345.c0001.us1-1.rl.rlcloud.net
REDIS_PORT=12345
REDIS_PASSWORD=your_secure_password
```

---

## 📁 Phase 2: Prepare Your Codebase (10 minutes)

### Step 2.1: Push Code to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo first, then:
git remote add origin https://github.com/YOUR_USERNAME/clipbox.git
git branch -M main
git push -u origin main
```

### Step 2.2: Create Production Environment Files

Create `clipbox-backend/.env.production`:
```bash
# Server Configuration
PORT=4000
NODE_ENV=production
BASE_URL=https://your-app.railway.app

# CORS Configuration (update after frontend deployment)
FRONTEND_URL=https://your-app.vercel.app

# Redis Configuration (from Step 1.3)
REDIS_HOST=redis-12345.c12345.c0001.us1-1.rl.rlcloud.net
REDIS_PORT=12345
REDIS_PASSWORD=your_secure_password

# File Upload Configuration
MAX_FILE_SIZE=100000000
UPLOAD_DIR=uploads
PUBLIC_DIR=public

# Logging
LOG_LEVEL=info
```

Create `clipbox-frontend/.env.production`:
```bash
# Will be updated after backend deployment
NEXT_PUBLIC_API_BASE_URL=https://your-app.railway.app/api
```

---

## 🏗️ Phase 3: Deploy Backend to Railway (15 minutes)

### Step 3.1: Create Railway Account
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 3.2: Deploy Backend Service
1. Click "New Project" on Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your clipbox repository
4. **Important**: Select the `clipbox-backend` folder
5. Railway will detect it's a Node.js project

### Step 3.3: Configure Environment Variables
In Railway dashboard, go to your backend service:

1. Click "Variables" tab
2. Add these variables (copy from `.env.production`):
   ```
   PORT=4000
   NODE_ENV=production
   BASE_URL=${{Railway:Public Default URL}}
   FRONTEND_URL=https://your-frontend-url.vercel.app (temporary placeholder)
   REDIS_HOST=redis-12345.c12345.c0001.us1-1.rl.rlcloud.net
   REDIS_PORT=12345
   REDIS_PASSWORD=your_secure_password
   MAX_FILE_SIZE=100000000
   UPLOAD_DIR=uploads
   PUBLIC_DIR=public
   LOG_LEVEL=info
   ```

### Step 3.4: Build and Deploy
1. Railway will automatically start building
2. Monitor build logs in "Deployments" tab
3. Wait for successful deployment
4. Note the Railway-provided domain (e.g., `clipbox-backend-production-xyz.up.railway.app`)

---

## 🌐 Phase 4: Deploy Frontend to Vercel (10 minutes)

### Step 4.1: Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 4.2: Deploy Frontend Service
1. Click "New Project" on Vercel dashboard
2. Import your GitHub repository
3. **Framework Preset**: Select "Next.js"
4. **Root Directory**: Select `clipbox-frontend` folder
5. Click "Deploy"

### Step 4.3: Configure Environment Variables
1. After deployment, go to project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend-domain.railway.app/api
   ```

### Step 4.4: Get Frontend URL
1. Note your Vercel domain (e.g., `clipbox-frontend-xyz.vercel.app`)
2. Your app will be accessible at this URL

---

## 🔧 Phase 5: Final Configuration (5 minutes)

### Step 5.1: Update Railway CORS Settings
1. Go back to Railway backend service
2. Update the `FRONTEND_URL` variable to:
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
3. Trigger redeployment

### Step 5.2: Test Full Application Flow
1. Visit your Vercel frontend URL
2. Upload a test video file
3. Click "Export Video"
4. Check Railway logs to see processing
5. Download processed video

### Step 5.3: Verify CORS is Working
If you get CORS errors:
1. Check Railway logs for CORS warnings
2. Ensure `FRONTEND_URL` environment variable matches your Vercel domain exactly
3. Redeploy after making changes

---

## ✅ Final URLs (You'll Get These)

After successful deployment:

**Frontend**: `https://clipbox-frontend-abc123.vercel.app`
**Backend API**: `https://clipbox-backend-def456.railway.app/api`
**Health Check**: `https://clipbox-backend-def456.railway.app/health`

---

## 🛠️ Troubleshooting

### Redis Connection Issues
```bash
# Test Redis connection from Railway
redis-cli -h redis-12345.c12345.c0001.us1-1.rl.rlcloud.net -p 12345 -a your_password
```

### CORS Errors
- Verify `FRONTEND_URL` exactly matches your Vercel domain
- Include protocol (`https://`) and no trailing slash
- Check Railway logs for CORS error messages

### Build Failures
- Check build logs in Railway/Vercel dashboards
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version compatibility

### Video Processing Issues
- Check Railway worker logs
- Verify `ffmpeg-static` is included in dependencies
- Monitor Redis queue status in Redis Cloud

---

## 💰 Expected Monthly Costs

**Redis Cloud Free Tier**: $0/month
- 30MB memory
- 1 database
- Perfect for testing/small usage

**Railway**: $5-20/month
- Pro plan for better performance
- Pay per usage model

**Vercel**: Free tier
- Perfect for Next.js
- Automatic HTTPS and CDN

**Total**: ~$5-20/month for production use

---

## 🔒 Security Notes

1. **Never commit** environment files to Git
2. **Use strong passwords** for Redis
3. **Enable HTTPS** (both platforms provide it automatically)
4. **Monitor usage** to prevent unexpected charges
5. **Set up alerts** for Redis Cloud usage limits

---

## 📞 Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure monitoring** (Vercel Analytics, Railway Insights)
3. **Set up CI/CD** for automatic deployments
4. **Implement error tracking** (Sentry, etc.)
5. **Add rate limiting** for production usage

Your Clipbox app is now live! 🚀