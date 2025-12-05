// ==========================================
// SERVER SETUP - TOPTUTOR 2.0
// ==========================================

// ⚠️ LOAD .env FIRST - before all imports
import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/student.js";
import pageRoutes from "./routes/pageRoutes.js";
import materieRoutes from "./routes/materieRoutes.js";
import verificheRoutes from "./routes/verificheRoutes.js";
import adminTutorRoutes from "./routes/adminTutorRoutes.js";
import adminStudentRoutes from "./routes/adminStudentRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";

// ===== CONFIGURATION =====
const app = express();
const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;

// ES6 modules workaround: get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== MIDDLEWARE (order matters) =====
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Allow cross-origin requests
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve static files
app.set("view engine", "ejs"); // Template engine
app.set("views", "../frontend/views");

// ===== ROUTES =====
app.use("/", pageRoutes); // Static & protected pages
app.use("/auth", authRoutes); // Login, signup, password reset
app.use("/student", studentRoutes); // Student profile & data
app.use("/subject", materieRoutes); // Subject management
app.use("/test", verificheRoutes); // Test management
app.use("/tutor", tutorRoutes); // Tutor profile & students
app.use("/admin/tutor", adminTutorRoutes); // Admin tutor management
app.use("/admin/student", adminStudentRoutes); // Admin student management

// ===== DATABASE CONNECTION & START SERVER =====
// Connect DB first, start server only if successful
connectDB(CONNECTION_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Server startup failed:", error);
    process.exit(1); // Exit if DB connection fails
  });
