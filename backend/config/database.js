import mongoose from "mongoose";

export const connectDB = async (connectionUrl) => {
  try {
    await mongoose.connect(connectionUrl);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Termina il processo se non riesce a connettersi
  }
};
