FROM node:18-alpine

WORKDIR /app

# Install ffmpeg and build dependencies for canvas
RUN apk add --no-cache ffmpeg python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create required directories
RUN mkdir -p uploads public

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]