const mongoose = require("mongoose");

// Cache the database connection
let cachedConnection = null;

const connectDB = async () => {
  // If a connection exists, reuse it
  if (cachedConnection) {
    console.log("Using existing database connection");
    return cachedConnection;
  }

  // Otherwise create a new connection
  try {
    // Connect with optimized settings
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Register connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
      cachedConnection = null;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cachedConnection = null;
    });
    
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;