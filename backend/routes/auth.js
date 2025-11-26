import express from "express";
import {
  login,
  logout,
  registerComplete,
  verifyHomeStudenti,
  verifyHomeAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
//verifyHomeTutor, nel import
const router = express.Router();

// POST auth/login
router.post("/login", login);

// POST auth/register-complete
router.post("/register-complete", registerComplete);

// GET auth/logout
router.get("/logout", logout);

// POST /auth/forgot-password - Richiedi reset password
router.post("/forgot-password", forgotPassword);

// POST /auth/reset-password - Reimposta password
router.post("/reset-password", resetPassword);

// ===== ROTTE API PROTETTE PER VERIFICA ACCESSO =====
// Queste controllano il token e restituiscono i dati
router.get("/verify-home-studenti", verifyToken, verifyHomeStudenti);
//router.get("/verify-home-tutor", verifyToken, verifyHomeTutor);
router.get("/verify-home-admin", verifyToken, verifyHomeAdmin);

export default router;
