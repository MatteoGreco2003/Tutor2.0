import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===== PAGINE PUBBLICHE =====
router.get("/", (req, res) => {
  res.render("registrazione");
});

router.get("/complete-profile", (req, res) => {
  res.render("completamento-profilo");
});

router.get("/profilo-studente", (req, res) => {
  res.render("riepilogo-studente");
});

// ===== PAGINE PROTETTE → SERVITE COME PUBBLICHE =====
// Ora sono pubbliche, il controllo accesso avviene via API
router.get("/home-studenti", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate"); //evita caricamento pagine dalla cache
  res.render("home-studente");
});

// Aggiungi altre pagine protette qui se servono
router.get("/home-tutor", verifyToken, (req, res) => {
  if (req.user.tipo !== "tutor") {
    return res
      .status(403)
      .render("errore", { message: "Accesso solo per tutor" });
  }
  res.set("Cache-Control", "no-store, no-cache, must-revalidate"); //evita caricamento pagine dalla cache
  res.render("home-tutor");
});

export default router;
