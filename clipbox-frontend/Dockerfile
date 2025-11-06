# 1. Start with a Node.js image
FROM node:20-alpine

# 2. Set up the app directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of your frontend code
COPY . .

# 5. Build your Next.js app for production
RUN npm run build

# 6. Expose the port Next.js runs on (default 3000)
EXPOSE 3000

# 7. The command to start the production server
CMD ["npm", "start"]