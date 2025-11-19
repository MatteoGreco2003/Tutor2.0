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

// ===== PAGINE PROTETTE =====
router.get("/home-studenti", verifyToken, (req, res) => {
  // Verifica che sia uno studente
  if (req.user.tipo !== "studente") {
    return res
      .status(403)
      .render("errore", { message: "Accesso solo per studenti" });
  }
  res.render("home-studente");
});

// Aggiungi altre pagine protette qui se servono
router.get("/home-tutor", verifyToken, (req, res) => {
  if (req.user.tipo !== "tutor") {
    return res
      .status(403)
      .render("errore", { message: "Accesso solo per tutor" });
  }
  res.render("home-tutor");
});

export default router;
