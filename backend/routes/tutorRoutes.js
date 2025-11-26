import express from "express";
import {
  getStudentiAssociati,
  getStudenteRiepilogo,
  getVerificheStorico,
  getVerificheFuture,
  getMaterieStudente,
  checkMaterie,
  getTutorData,
  deleteTutorProfile,
  associaStudente,
  rimuoviStudente,
  updateTutorPassword,
} from "../controllers/tutorController.js";
import {
  getAnnotazioni,
  createAnnotazione,
  updateAnnotazione,
  deleteAnnotazione,
} from "../controllers/annotationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===== TUTOR - GESTIONE STUDENTI =====

// GET /tutor/studenti - Leggi studenti associati
router.get("/studenti", verifyToken, getStudentiAssociati);

// GET /tutor/studenti/:studenteID/riepilogo - Riepilogo completo
router.get(
  "/studenti/:studenteID/riepilogo",
  verifyToken,
  getStudenteRiepilogo
);

// ===== TUTOR - GESTIONE VERIFICHE =====

// GET /tutor/studenti/:studenteID/verifiche/storico - Storico verifiche (con voto)
router.get(
  "/studenti/:studenteID/verifiche/storico",
  verifyToken,
  getVerificheStorico
);

// GET /tutor/studenti/:studenteID/verifiche/future - Verifiche future (senza voto)
router.get(
  "/studenti/:studenteID/verifiche/future",
  verifyToken,
  getVerificheFuture
);

// ===== TUTOR - GESTIONE MATERIE =====

// GET /tutor/studenti/:studenteID/materie - Materie con media
router.get("/studenti/:studenteID/materie", verifyToken, getMaterieStudente);

// GET /tutor/studenti/:studenteID/materie/check - Check insufficienze
router.get("/studenti/:studenteID/materie/check", verifyToken, checkMaterie);

// ===== TUTOR - GESTIONE ANNOTAZIONI =====

// GET /tutor/studenti/:studenteID/annotazioni - Leggi annotazioni
router.get("/studenti/:studenteID/annotazioni", verifyToken, getAnnotazioni);

// POST /tutor/studenti/:studenteID/annotazioni - Crea annotazione
router.post(
  "/studenti/:studenteID/annotazioni",
  verifyToken,
  createAnnotazione
);

// PUT /tutor/studenti/:studenteID/annotazioni/:annotazioneID - Modifica annotazione
router.put(
  "/studenti/:studenteID/annotazioni/:annotazioneID",
  verifyToken,
  updateAnnotazione
);

// DELETE /tutor/studenti/:studenteID/annotazioni/:annotazioneID - Elimina annotazione
router.delete(
  "/studenti/:studenteID/annotazioni/:annotazioneID",
  verifyToken,
  deleteAnnotazione
);

// ===== TUTOR - GESTIONE PROFILO =====

// GET /tutor/data - Leggi dati tutor loggato
router.get("/data", verifyToken, getTutorData);

// DELETE /tutor/profile - Elimina profilo tutor loggato
router.delete("/profile", verifyToken, deleteTutorProfile);

// POST /tutor/studenti/associa - Associa studente
router.post("/studenti/associa", verifyToken, associaStudente);

// DELETE /tutor/studenti/rimuovi - Rimuovi studente
router.delete("/studenti/rimuovi", verifyToken, rimuoviStudente);

// PATCH /tutor/password
router.patch("/password", verifyToken, updateTutorPassword);

export default router;
