import mongoose from "mongoose";

// Connect to MongoDB and handle connection errors
export const connectDB = async (connectionUrl) => {
  try {
    await mongoose.connect(connectionUrl);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    // Log error and exit if connection fails (fail-fast approach)
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};
