# Use Node.js LTS
FROM node:18-slim

# Install basic dependencies including Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Create src directory structure
RUN mkdir -p src/models src/repositories src/services src/controllers src/routes src/config src/middleware src/utils src/dto

# Copy source files
COPY src/ src/

# Copy other files
COPY server-structured.js .
COPY env.production .env

# Set environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Debug: List files to verify structure
RUN echo "=== /app contents ===" && \
    ls -la /app && \
    echo "=== /app/src contents ===" && \
    ls -la /app/src && \
    echo "=== /app/src/models contents ===" && \
    ls -la /app/src/models && \
    echo "=== /app/src/repositories contents ===" && \
    ls -la /app/src/repositories

# Expose port
EXPOSE 5001

# Start command
CMD ["node", "server-structured.js"]