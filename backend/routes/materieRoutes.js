import express from "express";
import {
  createMateria,
  getMaterieStudente,
  deleteMateria,
  updateMateria,
} from "../Controllers/materieController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===== TUTTE LE ROTTE SONO PROTETTE =====

// POST /api/materie - Crea una nuova materia
router.post("/", verifyToken, createMateria);

// GET /api/materie - Leggi tutte le materie dello studente
router.get("/", verifyToken, getMaterieStudente);

// DELETE /api/materie/:materiaId - Elimina una materia
router.delete("/:materiaId", verifyToken, deleteMateria);

// PUT /api/materie/:materiaId - Aggiorna una materia
router.put("/:materiaId", verifyToken, updateMateria);

export default router;
