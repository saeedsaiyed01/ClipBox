# Clipbox Deployment Guide

## Overview
Clipbox is a video processing application with:
- **Frontend**: Next.js React app
- **Backend**: Node.js/Express API with Redis job queues
- **Database**: Redis for job management
- **Processing**: ffmpeg for video processing

## Prerequisites
- Node.js 18+
- Git repository
- Redis instance (managed service or self-hosted)

## Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd clipbox-frontend
vercel --prod
```

**Environment Variables for Vercel:**
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app/api
```

#### Backend on Railway
1. Push code to GitHub
2. Connect Railway to your repository
3. Deploy the `clipbox-backend` folder

**Environment Variables for Railway:**
```
PORT=4000
NODE_ENV=production
BASE_URL=https://your-backend-url.railway.app
FRONTEND_URL=https://your-frontend-url.vercel.app
REDIS_HOST=your-redis-host
REDIS_PORT=6379
MAX_FILE_SIZE=100000000
UPLOAD_DIR=uploads
PUBLIC_DIR=public
LOG_LEVEL=info
```

**Redis Setup:**
- Use Railway Redis addon or external service like Redis Cloud
- Update REDIS_HOST and REDIS_PORT accordingly

### Option 2: Heroku Deployment

#### Setup Heroku Apps
```bash
# Create apps
heroku create clipbox-backend
heroku create clipbox-frontend

# Add Redis addon to backend
heroku addons:create heroku-redis:mini -a clipbox-backend
```

#### Backend Deployment
```bash
cd clipbox-backend

# Update package.json start script for production
# "start": "node dist/server.js" (after building)

git subtree push --prefix clipbox-backend heroku main
```

#### Frontend Deployment
```bash
cd clipbox-frontend

# Create production environment file
echo "NEXT_PUBLIC_API_BASE_URL=https://clipbox-backend.herokuapp.com/api" > .env.production

git subtree push --prefix clipbox-frontend heroku main
```

### Option 3: Docker Deployment

#### Quick Start with Docker Compose
```bash
# From project root
docker-compose up --build

# Access app at http://localhost:3000
```

#### Manual Docker Build
```bash
# Backend
cd clipbox-backend
docker build -t clipbox-backend .
docker run -p 4000:4000 -e REDIS_HOST=your-redis-host clipbox-backend

# Frontend
cd clipbox-frontend
docker build -t clipbox-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api clipbox-frontend
```

### Option 4: DigitalOcean App Platform

1. **Create new app** from GitHub repository
2. **Configure components:**
   - Backend: Node.js, port 4000
   - Frontend: Static Site, build command `npm run build`
3. **Add environment variables** for both components
4. **Add managed Redis database**

### Option 5: AWS/GCP/Azure

#### AWS Deployment
- **Frontend**: Deploy to S3 + CloudFront
- **Backend**: Deploy to Elastic Beanstalk or EC2
- **Redis**: ElastiCache or Redis Cloud
- **Database**: RDS if needed

#### GCP Deployment
- **Frontend**: Cloud Storage + Cloud CDN
- **Backend**: Cloud Run or App Engine
- **Redis**: Memorystore

## Environment Variables Reference

### Frontend (.env)
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (.env)
```bash
# Server Configuration
PORT=4000
NODE_ENV=production
BASE_URL=https://your-backend-url.com

# CORS Configuration
FRONTEND_URL=https://your-frontend-url.com

# Redis Configuration
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# File Upload Configuration
MAX_FILE_SIZE=100000000
UPLOAD_DIR=uploads
PUBLIC_DIR=public

# Logging
LOG_LEVEL=info
```

## File Storage Considerations

### Current Implementation (Local Storage)
- Videos stored in `backend/uploads/`
- Processed videos in `backend/public/`
- **Limitation**: Not scalable for production

### Production Recommendations

#### Option A: Cloud Storage Integration
Modify backend to use:
- **AWS S3** with `@aws-sdk/client-s3`
- **Google Cloud Storage** with `@google-cloud/storage`
- **Cloudinary** for video processing

#### Option B: Persistent Volumes (Docker/K8s)
- Mount persistent volumes for uploads and public directories
- Suitable for self-hosted deployments

## Redis Setup

### Managed Redis Services
1. **Redis Cloud** (Free tier available)
2. **AWS ElastiCache**
3. **Google Memorystore**
4. **Azure Cache for Redis**
5. **Railway Redis** (if using Railway)

### Self-Hosted Redis
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Using system installation
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Windows
# Download from https://redis.io/download
```

## SSL/HTTPS Configuration

### Frontend (Vercel/Netlify)
- Automatic SSL certificates
- Redirect HTTP to HTTPS

### Backend
- Use reverse proxy (Nginx) for SSL termination
- Or use platform-specific SSL (Railway, Heroku)

### CORS Configuration
Ensure backend CORS allows your frontend domain:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
```

## Monitoring and Logging

### Backend Logging
- Winston logger already configured
- Set `LOG_LEVEL=info` for production

### Application Monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Full observability
- **New Relic**: APM

### Health Checks
Add health check endpoints:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Scaling Considerations

### Video Processing
- Current setup processes one video at a time
- **Scale option**: Use multiple worker instances with Redis clustering
- **Queue management**: Consider job priority and rate limiting

### File Storage
- Implement cloud storage for better scalability
- Add CDN for processed video delivery

### Database
- Redis clustering for high availability
- Connection pooling for better performance

## Troubleshooting

### Common Issues
1. **Redis Connection**: Ensure Redis is accessible from deployment environment
2. **CORS Errors**: Verify frontend URL in backend CORS configuration
3. **File Upload Limits**: Adjust `MAX_FILE_SIZE` for larger videos
4. **ffmpeg Issues**: `ffmpeg-static` should handle this automatically

### Debug Commands
```bash
# Check Redis connection
redis-cli ping

# Check environment variables
echo $NEXT_PUBLIC_API_BASE_URL

# View application logs
# Platform-specific commands for viewing logs
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **File Validation**: Validate uploaded video files
3. **Rate Limiting**: Implement API rate limiting
4. **CORS**: Restrict CORS to known origins
5. **Input Sanitization**: Sanitize all user inputs
6. **HTTPS**: Always use HTTPS in production

## Cost Optimization

### Free Tiers
- **Vercel**: Generous free tier for Next.js
- **Railway**: Free tier with usage limits
- **Redis Cloud**: 30MB free tier
- **Netlify**: Free tier for static sites

### Production Costs
- **Vercel Pro**: $20/month
- **Railway**: Pay-per-use
- **Redis Cloud**: $7/month for 1GB
- **AWS/GCP**: Usage-based pricing

## Recommended Production Setup

### For Small-Medium Scale
1. **Frontend**: Vercel (free tier)
2. **Backend**: Railway ($5-20/month)
3. **Redis**: Redis Cloud ($7/month)
4. **Total**: ~$12-27/month

### For Large Scale
1. **Frontend**: Vercel Pro ($20/month)
2. **Backend**: AWS EC2/Beanstalk
3. **Redis**: AWS ElastiCache
4. **Storage**: AWS S3 + CloudFront
5. **Total**: $50-200+/month depending on usage