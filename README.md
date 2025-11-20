# 🎬 Clipbox

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)

A modern, full-stack video processing application built with React, Next.js, Node.js, and TypeScript. Transform your videos with custom backgrounds, aspect ratios, zoom levels, and border radius effects through an intuitive web interface.

![Clipbox Preview](./preview.png)

## ✨ Features

- 🎨 **Custom Backgrounds**: Solid colors, gradients, and image backgrounds
- 📐 **Aspect Ratio Control**: Support for 1:1, 4:5, 9:16, and 16:9 ratios
- 🔍 **Zoom Control**: Scale videos from 50% to 200%
- 🎭 **Border Radius**: Add rounded corners with customizable radius
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Processing**: Asynchronous video processing with progress tracking
- 🎯 **Modern UI**: Clean, professional interface with dark theme
- 🔒 **Production Ready**: Environment configuration, logging, and error handling

## 📁 Project Structure

```
clipbox/
├── clipbox-backend/          # Node.js/TypeScript backend
│   ├── src/
│   │   ├── api/routes/       # API endpoints
│   │   ├── jobs/            # Video processing jobs
│   │   ├── queues/          # BullMQ job queues
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Express middleware
│   └── uploads/             # Temporary file storage
├── clipbox-frontend/         # Next.js React frontend
│   ├── app/
│   │   ├── components/      # React components
│   │   ├── lib/            # API utilities
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT license
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **Redis Server** (required for job queue)
- **Git** (for version control)
- **npm** or **yarn** (package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clipbox.git
   cd clipbox
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd clipbox-backend
   npm install

   # Frontend dependencies
   cd ../clipbox-frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend
   cd clipbox-backend
   cp .env.example .env
   # Edit .env with your configuration

   # Frontend
   cd ../clipbox-frontend
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start Redis**
   ```bash
   # Using Docker (recommended)
   docker run -d -p 6379:6379 --name clipbox-redis redis:alpine

   # Or using local Redis installation
   redis-server
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd clipbox-backend
   npm run dev

   # Terminal 2 - Worker
   cd clipbox-backend
   npm run worker

   # Terminal 3 - Frontend
   cd clipbox-frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health

## Installation & Setup

### 1. Start Redis Server

**Option A: Install Redis Locally (Windows)**

1. **Download Redis for Windows:**
   - Get Redis from: https://github.com/microsoftarchive/redis/releases
   - Download the latest `.msi` installer or `.zip` version
   - Run installer or extract to a folder like `C:\redis`

2. **Start Redis Server:**
   ```bash
   # If installed via installer:
   redis-server

   # If using extracted folder:
   cd C:\redis
   redis-server.exe
   ```

**Option B: Use Redis in Docker (Recommended)**
```bash
# Pull and run Redis in Docker
docker run -d -p 6379:6379 --name clipbox-redis redis:alpine

# To stop Redis container later:
# docker stop clipbox-redis
# docker rm clipbox-redis
```

**Option C: Use Docker Desktop**
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Run the Docker command above

### 2. Environment Configuration

**Backend:**
```bash
cd clipbox-backend
# Copy environment template
copy .env.example .env
# Edit .env with your settings if needed
```

**Frontend:**
```bash
cd clipbox-frontend
# Copy environment template
copy .env.local.example .env.local
# Edit .env.local with your settings if needed
```

### 3. Install Dependencies

**Backend:**
```bash
cd clipbox-backend
npm install
```

**Frontend:**
```bash
cd clipbox-frontend
npm install
```

## Running the Application

### Development Setup

You'll need to run **3 terminal windows** concurrently:

#### Terminal 1 - Backend API Server
```bash
cd clipbox-backend
npm run dev
```
- Starts Express API server on `http://localhost:4000` (or configured PORT)
- Serves static files and API routes
- Includes health check endpoint at `/health`

#### Terminal 2 - Video Processing Worker
```bash
cd clipbox-backend
npm run worker
```
- Starts BullMQ worker for video processing jobs
- Listens to Redis queue (configurable via environment)
- Processes video transformation jobs asynchronously

#### Terminal 3 - Frontend Application
```bash
cd clipbox-frontend
npm run dev
```
- Starts Next.js development server on `http://localhost:3000`
- Connects to backend API (configurable via environment)

## Access Points

- **Frontend App**: http://localhost:3000 (configurable)
- **Backend API**: http://localhost:4000 (configurable)
- **API Health Check**: http://localhost:4000/health
- **API Documentation**: RESTful endpoints at `/api/*`

## Features

- **Video Upload & Processing**: Upload videos with size limits and validation
- **Asynchronous Processing**: Redis-powered BullMQ job queue
- **Video Transformations**: Background, aspect ratio, zoom, border radius
- **Real-time Status**: Polling-based job status updates
- **Structured Logging**: Winston-based logging with configurable levels
- **Environment Configuration**: Configurable via environment variables
- **Health Monitoring**: Health check endpoints for monitoring
- **File Management**: Configurable upload limits and directories

## Troubleshooting

### Redis Connection Issues (Most Common Error)
The error `ECONNREFUSED ::1:6379` means Redis server is not running:

**Solution:**
1. **Verify Redis is running:**
   ```bash
   # Check if Redis is listening on port 6379
   netstat -an | findstr 6379
   ```

2. **Start Redis using one of these methods:**
   - Windows: Run `redis-server` or `redis-server.exe`
   - Docker: `docker run -d -p 6379:6379 redis:alpine`

3. **Test Redis connection:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Path Not Found Error
If you see "The system cannot find the path specified":
- Make sure you're in the correct directory: `D:\clipbox\clipbox-backend`
- Run `pwd` to verify your current directory
- Use `cd clipbox-backend` to navigate properly

### Port Conflicts
If ports 3000, 4000, or 6379 are in use:
- **Frontend**: Use `npm run dev -- -p 3001`
- **Backend**: Modify `PORT` in `src/server.ts` (line 8)
- **Redis**: Stop conflicting service or use Docker with different port mapping

### TypeScript Compilation
- Backend uses `tsx` for on-the-fly TypeScript execution
- No separate build step required during development

### CORS Issues
- Backend is configured to accept requests from `http://localhost:3000`
- Modify CORS settings in `src/server.ts` if needed

## Technology Stack

**Backend:**
- Node.js with TypeScript
- Express.js for API server
- BullMQ for job queue management
- Redis for queue storage and persistence
- ffmpeg-static for video processing
- Winston for structured logging
- Multer for file uploads with validation
- dotenv for environment configuration

**Frontend:**
- Next.js 16 with React
- TypeScript
- Tailwind CSS
- Modern React features (React 19)
- Environment-based API configuration

## 🚢 Deployment

### Environment Variables

Create `.env` files based on the examples:

**Backend (.env)**
```env
PORT=4000
NODE_ENV=production
BASE_URL=https://yourdomain.com
REDIS_HOST=localhost
REDIS_PORT=6379
MAX_FILE_SIZE=100000000
UPLOAD_DIR=uploads
PUBLIC_DIR=public
LOG_LEVEL=info
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

### Production Deployment

1. **Build the frontend**
   ```bash
   cd clipbox-frontend
   npm run build
   npm start
   ```

2. **Deploy backend**
   ```bash
   cd clipbox-backend
   npm run start
   ```

3. **Set up Redis** (use Redis Cloud or AWS ElastiCache for production)

4. **Configure reverse proxy** (nginx/Caddy) for SSL and load balancing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Video processing powered by [FFmpeg](https://ffmpeg.org/)
- Job queue managed by [BullMQ](https://docs.bullmq.io/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)