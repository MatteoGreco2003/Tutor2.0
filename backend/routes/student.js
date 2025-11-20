import express from "express";
import {
  getStudentData,
  deleteStudentProfile,
} from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===== ROTTE PROTETTE STUDENTE =====
// GET /student/data - Ottieni dati profilo studente
router.get("/data", verifyToken, getStudentData);

// DELETE /student/profile - Elimina profilo (protetta)
router.delete("/profile", verifyToken, deleteStudentProfile);

// Aggiungi altre rotte qui:
// router.get("/verifiche", verifyToken, getStudentVerifiche);
// router.post("/verifiche", verifyToken, createVerifica);
// router.delete("/verifiche/:id", verifyToken, deleteVerifica);
// ecc.

export default router;
