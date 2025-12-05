import express from "express";
import {
  createVerifica,
  getVerificheStudente,
  getVerifica,
  updateVerifica,
  deleteVerifica,
  getMaterieConMedia,
  getVerifichePerMateria,
} from "../controllers/testController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /verifiche - Crea una nuova verifica
router.post("/", verifyToken, createVerifica);

// GET verifiche/materie-media - Leggi materie con media verifiche
router.get("/materie-media", verifyToken, getMaterieConMedia);

// GET verifiche - Leggi tutte le verifiche dello studente
router.get("/data", verifyToken, getVerificheStudente);

// GET /test/materia/:materiaId - Leggi verifiche per materia
router.get("/materia/:materiaId", verifyToken, getVerifichePerMateria);

// GET verifiche/:verificaID - Leggi una singola verifica
router.get("/:verificaID", verifyToken, getVerifica);

// PUT verifiche/:verificaID - Aggiorna una verifica
router.put("/:verificaID", verifyToken, updateVerifica);

// DELETE verifiche/:verificaID - Elimina una verifica
router.delete("/:verificaID", verifyToken, deleteVerifica);

export default router;
