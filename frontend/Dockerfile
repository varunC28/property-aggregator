# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Debug: Show what's in the build context
RUN ls -la

# Copy package files (explicitly from frontend directory)
COPY frontend/package*.json ./

# Debug: Verify package.json was copied
RUN ls -la package*.json

# Install dependencies
RUN npm install

# Copy frontend source (explicitly from frontend directory)
COPY frontend/ .

# Debug: Show final structure
RUN ls -la

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config (explicitly from frontend directory)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]