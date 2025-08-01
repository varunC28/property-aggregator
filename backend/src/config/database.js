const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConfig {
  static async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property-aggregator';
      
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }
  
  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }
}

module.exports = DatabaseConfig;