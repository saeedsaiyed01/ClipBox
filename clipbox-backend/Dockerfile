# 1. Start with a Node.js image
# 'alpine' is a small, secure version of Linux
FROM node:20-alpine

# 2. Install ffmpeg
# This is the key step. 'apk' is the Alpine package manager.
RUN apk add --no-cache ffmpeg

# 3. Set up the app directory inside the container
WORKDIR /app

# 4. Copy package files and install dependencies
# This is done first so Docker can cache it.
COPY package*.json ./
RUN npm install

# 5. Copy the rest of your backend code
COPY . .

# The 'command' (npm run api/worker) will be run by docker-compose