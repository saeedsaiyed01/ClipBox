#!/bin/bash

# Clipbox Deployment Script
# Run this to prepare your codebase for deployment

echo "🚀 Preparing Clipbox for deployment..."

# Create .env.production for backend
echo "Creating backend environment file..."
cat > clipbox-backend/.env.production << EOF
# Server Configuration
PORT=4000
NODE_ENV=production
BASE_URL=https://your-app.railway.app

# CORS Configuration (update after frontend deployment)
FRONTEND_URL=https://your-app.vercel.app

# Redis Configuration (replace with your Redis Cloud details)
REDIS_HOST=redis-12345.c12345.c0001.us1-1.rl.rlcloud.net
REDIS_PORT=12345
REDIS_PASSWORD=your_secure_password

# File Upload Configuration
MAX_FILE_SIZE=100000000
UPLOAD_DIR=uploads
PUBLIC_DIR=public

# Logging
LOG_LEVEL=info
EOF

# Create .env.production for frontend
echo "Creating frontend environment file..."
cat > clipbox-frontend/.env.production << EOF
# Backend API URL (update after backend deployment)
NEXT_PUBLIC_API_BASE_URL=https://your-app.railway.app/api
EOF

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Prepare for deployment to Vercel + Railway"
    echo "❗ Don't forget to create a GitHub repository and run:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/clipbox.git"
    echo "git branch -M main"
    echo "git push -u origin main"
else
    echo "Updating git repository..."
    git add .
    git commit -m "Prepare for deployment to Vercel + Railway"
    echo "Run 'git push' to update your GitHub repository"
fi

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Update Redis Cloud details in clipbox-backend/.env.production"
echo "2. Push code to GitHub: git push"
echo "3. Follow the step-by-step guide in STEP_BY_STEP_DEPLOYMENT.md"
echo ""
echo "Platforms to visit:"
echo "- Redis Cloud: https://redis.com/try-free/"
echo "- Railway: https://railway.app"
echo "- Vercel: https://vercel.com"