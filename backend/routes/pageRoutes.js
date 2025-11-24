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

// GET /reset-password - Pagina reset password (pubblica)
router.get("/reset-password", (req, res) => {
  res.render("reset-password");
});

// ===== PAGINE PROTETTE → SERVITE COME PUBBLICHE =====
// Ora sono pubbliche, il controllo accesso avviene via API
router.get("/home-studenti", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate"); //evita caricamento pagine dalla cache
  res.render("home-studente");
});

router.get("/home-admin", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.render("admin");
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

router.get("/home-admin", verifyToken, (req, res) => {
  if (req.user.tipo !== "admin") {
    return res
      .status(403)
      .render("errore", { message: "Accesso solo per admin" });
  }
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.render("admin", { user: req.user, token: null }); // ← Passa il user
});

router.get("/profilo-studente", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate"); //evita caricamento pagine dalla cache
  res.render("riepilogo-studente");
});

router.get("/subject", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate"); //evita caricamento pagine dalla cache
  res.render("materie");
});

router.get("/avg-materie", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate"); //evita caricamento pagine dalla cache
  res.render("medie-materie");
});

export default router;
