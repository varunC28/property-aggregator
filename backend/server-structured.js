#!/usr/bin/env node

/**
 * Property Aggregator API Server
 * 
 * Main entry point for the structured backend application
 * This file initializes and starts the Express server with proper configuration
 */

const App = require('./src/app');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Initialize and start the application
async function startServer() {
  try {
    const app = new App();
    await app.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();