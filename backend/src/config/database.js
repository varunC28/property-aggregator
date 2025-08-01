const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConfig {
  static async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property-aggregator';
      
      // Add retry logic
      let retries = 5;
      while (retries) {
        try {
          await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
          });
          break;
        } catch (error) {
          retries -= 1;
          if (!retries) throw error;
          console.log(`Failed to connect to MongoDB. Retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before retrying
        }
      }
      
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        // Try to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect to MongoDB...');
          mongoose.connect(mongoURI).catch(() => {});
        }, 5000);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        // Try to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect to MongoDB...');
          mongoose.connect(mongoURI).catch(() => {});
        }, 5000);
      });
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error; // Let the app handle the error
    }
  }
  
  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

module.exports = DatabaseConfig;