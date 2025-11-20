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

// ===== ROTTE API PROTETTE PER VERIFICA ACCESSO =====
// Queste controllano il token e restituiscono i dati
router.get("/verify-home-studenti", verifyToken, verifyHomeStudenti);
//router.get("/verify-home-tutor", verifyToken, verifyHomeTutor);

export default router;
