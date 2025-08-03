#!/bin/bash

echo "=== Starting Frontend Build ==="

# Show current directory
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found!"
    exit 1
fi

echo "✅ Frontend directory found"

# Go to frontend directory
cd frontend

echo "Frontend directory contents:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory!"
    exit 1
fi

echo "✅ package.json found"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the app
echo "Building the app..."
echo "API URL: $REACT_APP_API_URL"
REACT_APP_API_URL=https://property-aggregator-backend.onrender.com/api npm run build

echo "✅ Build completed successfully!"
echo "Build output directory:"
ls -la build/ 