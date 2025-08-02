# Build stage
FROM node:20-slim as build

# Set working directory
WORKDIR /app

# Debug: Show what's in the build context
RUN ls -la

# Try multiple approaches to find and copy package.json
RUN echo "=== Attempting to find package.json ===" && \
    find / -name "package.json" 2>/dev/null | head -10

# Copy package files from frontend directory (explicit path)
COPY frontend/package*.json ./

# Debug: Verify package.json was copied
RUN ls -la package*.json

# Install dependencies
RUN npm install

# Copy frontend source (explicit path)
COPY frontend/ .

# Debug: Show final structure
RUN ls -la

# Build app
RUN npm run build

# Production stage
FROM nginx:stable-slim

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config from frontend directory (explicit path)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]