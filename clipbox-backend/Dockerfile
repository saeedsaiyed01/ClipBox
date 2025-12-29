FROM node:18-alpine

WORKDIR /app

# Install ffmpeg
RUN apk add --no-cache ffmpeg

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