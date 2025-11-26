import express from "express";
import {
  getAllStudenti,
  getStudente,
  deleteStudente,
  getStatisticheStudenti,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET admin/studenti/statistiche - Statistiche studenti
router.get("/statistiche", verifyToken, getStatisticheStudenti);

// GET admin/studenti - Leggi tutti gli studenti
router.get("/", verifyToken, getAllStudenti);

// GET admin/studenti/:studenteID - Leggi singolo studente
router.get("/:studenteID", verifyToken, getStudente);

// DELETE admin/studenti/:studenteID - Elimina studente
router.delete("/:studenteID", verifyToken, deleteStudente);

export default router;
