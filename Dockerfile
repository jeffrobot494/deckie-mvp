# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Sharp
RUN apk add --no-cache \
    libc6-compat \
    vips-dev

# Copy root package.json and install concurrently
COPY package*.json ./
RUN npm ci --only=production

# Copy server package.json and install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy client package.json and install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy all source code
COPY . .

# Build the client
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]