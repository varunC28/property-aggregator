const mongoose = require('mongoose');

// Replace with your actual connection string
const MONGODB_URI = 'mongodb+srv://property-user:potro5-wezfuR-kekqyx@property-agregator.mxho0nz.mongodb.net/property-aggregator?retryWrites=true&w=majority&appName=Property-Agregator';

async function testConnection() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();