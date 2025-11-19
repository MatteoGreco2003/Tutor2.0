import express from "express";
import {
  login,
  logout,
  registerComplete,
  verifyHomeStudenti,
} from "../Controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST auth/login
router.post("/login", login);

// POST auth/register-complete
router.post("/register-complete", registerComplete);

// GET auth/logout
router.get("/logout", logout);

// ===== ROTTE PROTETTE PER VERIFICA ACCESSO =====
router.get("/home-studenti", verifyToken, verifyHomeStudenti);

export default router;
