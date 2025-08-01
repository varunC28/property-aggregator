require('dotenv').config();
const App = require('./src/app');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function startServer() {
  try {
    // Create app instance
    const app = new App();
    
    // Initialize app (connects to DB, etc)
    await app.start();
    
    // Get Express app instance
    const expressApp = app.getApp();
    
    // Add Docker health check endpoint
    expressApp.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    // Start server
    const PORT = process.env.PORT || 5001;
    expressApp.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();