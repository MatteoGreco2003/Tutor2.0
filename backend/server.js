import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));
app.set("view engine", "ejs");
app.set("views", "../frontend/views");

// ===== ROUTE =====
app.get("/", (req, res) => {
  res.render("registrazione"); // render il file registrazione.ejs
});

app.get("/complete-profile", (req, res) => {
  res.render("completamento-profilo");
});

app.get("/home-studenti", (req, res) => {
  res.render("home-studente");
});

// ===== ROUTES =====
app.use("/auth", authRoutes);

connectDB(CONNECTION_URL) // ← CHIAMA DA QUI
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  });
