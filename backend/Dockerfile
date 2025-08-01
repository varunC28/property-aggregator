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

# Create and set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p src/models src/repositories src/services src/controllers src/routes src/config src/middleware src/utils

# Move files to correct locations
RUN mv src/models/* src/models/ 2>/dev/null || true && \
    mv src/repositories/* src/repositories/ 2>/dev/null || true && \
    mv src/services/* src/services/ 2>/dev/null || true && \
    mv src/controllers/* src/controllers/ 2>/dev/null || true && \
    mv src/routes/* src/routes/ 2>/dev/null || true && \
    mv src/config/* src/config/ 2>/dev/null || true && \
    mv src/middleware/* src/middleware/ 2>/dev/null || true && \
    mv src/utils/* src/utils/ 2>/dev/null || true

# Set environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port
EXPOSE 5001

# Start command
CMD ["node", "server-structured.js"]