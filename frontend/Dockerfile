# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Debug: Show what's in the build context
RUN ls -la

# Copy package files (build context is already frontend directory)
COPY package*.json ./

# Debug: Verify package.json was copied
RUN ls -la package*.json

# Install dependencies
RUN npm install

# Copy source (build context is already frontend directory)
COPY . .

# Debug: Show final structure
RUN ls -la

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config (build context is already frontend directory)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]