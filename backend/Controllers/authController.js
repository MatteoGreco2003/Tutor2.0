import Studenti from "../models/Student.js";
import Tutor from "../models/Tutor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//===== LOGOUT =====
export const logout = async (req, res) => {
  try {
    // Con JWT salvato in localStorage, il logout è principalmente lato client
    // Il server semplicemente conferma il logout
    // (Opzionale: potresti aggiungere il token a una blacklist se necessario)

    res.status(200).json({
      message: "Logout avvenuto con successo",
    });
  } catch (error) {
    console.error("Errore logout:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

//===== COMPLETA REGISTRAZIONE =====
export const registerComplete = async (req, res) => {
  try {
    const {
      email,
      password,
      nome,
      cognome,
      telefono,
      gradoScolastico,
      indirizzoScolastico,
      famiglia,
      scuola,
      consentGDPR,
      consentGDPRDate,
    } = req.body;

    // ===== VALIDAZIONE =====
    if (!email || !password || !nome || !cognome) {
      return res.status(400).json({
        message: "Email, password, nome e cognome sono obbligatori",
      });
    }

    if (!telefono || !gradoScolastico) {
      return res.status(400).json({
        message: "Telefono e grado scolastico sono obbligatori",
      });
    }

    if (!famiglia?.genitore1?.nome || !famiglia?.genitore1?.cognome) {
      return res.status(400).json({
        message: "Dati genitore1 sono obbligatori",
      });
    }

    if (!famiglia?.email) {
      return res.status(400).json({
        message: "Email famiglia è obbligatoria",
      });
    }

    // Controlla se lo studente esiste già
    const studenteEsistente = await Studenti.findOne({ email });
    if (studenteEsistente) {
      return res.status(400).json({
        message: "Email già registrata",
      });
    }

    // ===== CREA NUOVO STUDENTE =====
    const nuovoStudente = new Studenti({
      // Dati di registrazione
      email: email.toLowerCase().trim(),
      password, // Lo schema farà l'hash automaticamente nel pre-save hook
      nome,
      cognome,
      consentiGDPR: consentGDPR || true,
      GDPRdata: consentGDPRDate ? new Date(consentGDPRDate) : new Date(),

      // Dati personali
      telefono,
      gradoScolastico,
      indirizzoScolastico: indirizzoScolastico || null,

      // Dati famiglia
      genitore1: {
        nome: famiglia.genitore1.nome,
        cognome: famiglia.genitore1.cognome,
        telefono: famiglia.genitore1.telefono,
      },
      genitore2: famiglia.genitore2?.nome
        ? {
            nome: famiglia.genitore2.nome,
            cognome: famiglia.genitore2.cognome,
            telefono: famiglia.genitore2.telefono,
          }
        : undefined,

      emailFamiglia: famiglia.email.toLowerCase().trim(),
      emailInsegnanti: scuola?.emailProfessori || [],
    });

    // Salva nel database (lo schema valida e hashizza la password)
    await nuovoStudente.save();

    // ===== GENERA TOKEN =====
    const token = jwt.sign(
      {
        userId: nuovoStudente._id,
        email: nuovoStudente.email,
        tipo: "studente",
      },
      process.env.JWT_SECRET || "your-secret-key-change-this",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registrazione completata con successo",
      token: token,
      user: {
        id: nuovoStudente._id,
        email: nuovoStudente.email,
        nome: nuovoStudente.nome,
        cognome: nuovoStudente.cognome,
      },
    });
  } catch (error) {
    console.error("Errore registrazione:", error);

    // Gestione errori di validazione Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    // Errore di email duplicata
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email già registrata",
      });
    }

    res.status(500).json({ message: "Errore del server" });
  }
};

//===== LOGIN =====
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email e password sono richieste",
      });
    }

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    let user = await Studenti.findOne({ email: cleanEmail });
    let userType = "studente";

    if (!user) {
      user = await Tutor.findOne({ email: cleanEmail });
      userType = "tutor";
    }

    if (!user) {
      return res.status(401).json({
        message: "Email o password non valide",
      });
    }

    const passwordMatch = await bcrypt.compare(
      cleanPassword,
      user.password.trim()
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email o password non valide",
      });
    }

    // Genera token
    const token = jwt.sign(
      { userId: user._id, email: user.email, tipo: userType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login avvenuto con successo",
      token: token,
      user: {
        id: user._id,
        email: user.email,
        tipo: userType,
        nome: user.nome,
        cognome: user.cognome,
      },
    });
  } catch (error) {
    console.error("Errore login:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// ===== VERIFICA ACCESSO HOME STUDENTI =====
export const verifyHomeStudenti = async (req, res) => {
  try {
    // req.user viene riempito dal middleware verifyToken
    if (req.user.tipo !== "studente") {
      return res.status(403).json({
        message: "Accesso solo per studenti",
      });
    }

    res.status(200).json({
      message: "Accesso autorizzato",
      user: req.user,
    });
  } catch (error) {
    console.error("Errore verifica accesso:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// ===== VERIFICA ACCESSO HOME TUTOR =====
export const verifyHomeTutor = async (req, res) => {
  try {
    if (req.user.tipo !== "tutor") {
      return res.status(403).json({
        message: "Accesso solo per tutor",
      });
    }

    res.status(200).json({
      message: "Accesso autorizzato",
      user: req.user,
    });
  } catch (error) {
    console.error("Errore verifica accesso:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};
