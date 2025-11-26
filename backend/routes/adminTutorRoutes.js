import express from "express";
import {
  createTutor,
  getAllTutor,
  getTutor,
  updateTutor,
  deleteTutor,
  assegnaStudenteATutor,
  rimuoviStudenteDaTutor,
  getStatisticheTutor,
} from "../Controllers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /admin/tutor - Crea nuovo tutor
router.post("/", verifyToken, createTutor);

// GET /admin/tutor/statistiche/:tutorID - Statistiche tutor
router.get("/statistiche/:tutorID", verifyToken, getStatisticheTutor);

// GET /admin/tutor - Leggi tutti i tutor
router.get("/", verifyToken, getAllTutor);

// GET /admin/tutor/:tutorID - Leggi singolo tutor
router.get("/:tutorID", verifyToken, getTutor);

// PUT /admin/tutor/:tutorID - Aggiorna tutor
router.put("/:tutorID", verifyToken, updateTutor);

// DELETE /admin/tutor/:tutorID - Elimina tutor
router.delete("/:tutorID", verifyToken, deleteTutor);

// POST /admin/tutor/:tutorID/assegna-studente - Assegna studente
router.post("/:tutorID/assegna-studente", verifyToken, assegnaStudenteATutor);

// DELETE /admin/tutor/:tutorID/rimuovi-studente - Rimuovi studente
router.delete(
  "/:tutorID/rimuovi-studente",
  verifyToken,
  rimuoviStudenteDaTutor
);

export default router;
