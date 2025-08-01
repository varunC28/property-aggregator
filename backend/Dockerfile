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

# Copy everything
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps

# Set environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Debug: List files to verify structure
RUN ls -la /app && \
    ls -la /app/src && \
    ls -la /app/src/models && \
    ls -la /app/src/repositories

# Expose port
EXPOSE 5001

# Start command
CMD ["node", "server-structured.js"]