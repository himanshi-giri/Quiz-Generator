require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const quizRoutes = require("./routes/quizRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { verifyToken } = require("./middleware/authMiddleware");

const app = express();

// Enhanced CORS for production
app.use(cors({
  origin: '*', // Ideally, restrict this to your frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database connection cache for serverless environment
let isConnected = false;

// Connection handler
const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    if (process.env.NODE_ENV !== 'production') {
      // In development, exit on connection failure
      process.exit(1);
    }
    throw new Error("Failed to connect to database");
  }
};

// In development, connect immediately at startup
if (process.env.NODE_ENV !== 'production') {
  connectToDatabase()
    .then(() => console.log("Initial database connection successful"))
    .catch(err => console.error("Initial database connection failed:", err));
}

// In production, ensure connection on each request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: "Database connection failed", 
      message: error.message 
    });
  }
});

// Health check route - essential for Vercel
app.get("/", (req, res) => {
  res.json({ 
    message: "Quiz App API is running", 
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quiz", verifyToken, quizRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Something went wrong", 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server in development, export for Vercel in production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;