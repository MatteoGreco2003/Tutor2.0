// ==========================================
// SERVER SETUP - TUTOR 2.0
// ==========================================

// 1️⃣ CARICA .env IMMEDIATAMENTE (PRIMA DI TUTTO!)
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

// ===== CONFIGURAZIONE BASE =====
const app = express();
const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(cors());
// app.use(express.static(path.join(__dirname, "../frontend")));
app.set("view engine", "ejs");
// app.set("views", "../frontend/views");

// ===== ROUTES =====
app.use("/", pageRoutes); // Pagine (pubbliche e protette)
app.use("/auth", authRoutes); // Autenticazione
app.use("/student", studentRoutes);
app.use("/subject", materieRoutes);
app.use("/test", verificheRoutes);
app.use("/tutor", tutorRoutes);
app.use("/admin/tutor", adminTutorRoutes);
app.use("/admin/student", adminStudentRoutes);

// ===== AVVIA SERVER =====
connectDB(CONNECTION_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  });
