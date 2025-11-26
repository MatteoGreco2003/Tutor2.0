// ==========================================
// AUTH CONTROLLER - TUTOR 2.0
// ==========================================

// 2️⃣ ORA importa il resto
import Studenti from "../models/Student.js";
import Tutor from "../models/Tutor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";

// Inizializza SendGrid con API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      if (cleanEmail == "toptutor.it@gmail.com") userType = "admin";
      else userType = "tutor";
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

// ===== VERIFICA ACCESSO HOME ADMIN =====
export const verifyHomeAdmin = async (req, res) => {
  try {
    if (req.user.tipo !== "admin") {
      return res.status(403).json({
        message: "Accesso solo per admin",
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

// ===== FORGOT PASSWORD (RICHIESTA RESET) =====
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validazione input
    if (!email) {
      return res.status(400).json({
        message: "Email è obbligatoria",
      });
    }

    // Ricerca utente (studente o tutor)
    let user = await Studenti.findOne({ email: email.toLowerCase() });
    let userType = user ? "student" : null;

    if (!user) {
      user = await Tutor.findOne({ email: email.toLowerCase() });
      if (user) {
        userType = "tutor";
      }
    }

    // Se l'email non esiste, comunque rispondi con successo (security best practice)
    if (!user) {
      return res.status(200).json({
        message:
          "Se l'email è registrata, riceverai un link per reimpostare la password",
      });
    }

    // Genera token random
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash il token prima di salvarlo nel DB
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Salva token hashato e expiry nel database
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 3600000; // 1 ora
    await user.save();

    // Costruisci URL di reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Invia email con SendGrid
    await sendResetPasswordEmail(email, resetUrl);

    res.status(200).json({
      message:
        "Se l'email è registrata, riceverai un link per reimpostare la password",
    });
  } catch (error) {
    console.error("Errore forgot password:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== RESET PASSWORD (PAGINA RESET) =====
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    // Validazione input
    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Token, email e password sono obbligatori",
      });
    }

    // Le password devono corrispondere
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Le password non corrispondono",
      });
    }

    // Password deve avere min 8 caratteri
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password minimo 8 caratteri",
      });
    }

    // Hash il token ricevuto per confrontare con il DB
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Ricerca utente con token valido
    let user = await Studenti.findOne({
      email: email.toLowerCase(),
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }, // Token non scaduto
    });

    if (!user) {
      user = await Tutor.findOne({
        email: email.toLowerCase(),
        passwordResetToken: resetTokenHash,
        passwordResetExpires: { $gt: Date.now() },
      });
    }

    // Se utente non trovato o token scaduto
    if (!user) {
      return res.status(400).json({
        message: "Token non valido o scaduto",
      });
    }

    // Aggiorna password (sarà hashata dal pre-save hook)
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      message: "Password reimpostata con successo",
    });
  } catch (error) {
    console.error("Errore reset password:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== FUNZIONE HELPER: Invia email reset con SendGrid =====
async function sendResetPasswordEmail(email, resetUrl) {
  try {
    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      replyTo: process.env.SENDER_EMAIL, // ← AGGIUNGI
      subject: "🔐 Recupera la tua password - Tutor 2.0",
      text: `Clicca il link per reimpostare la password: ${resetUrl}`, // ← AGGIUNGI (versione testo)
      html: `
        <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9e3ffd, #7e32ca); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Tutor 2.0</h1>
          </div>
          
          <div style="background: #f8f0ff; padding: 40px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #16163f; margin-top: 0;">Hai richiesto il reset della password</h2>
            
            <p style="color: #73738c; font-size: 16px; line-height: 1.6;">
              Clicca il bottone sottostante per reimpostare la tua password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #9e3ffd, #7e32ca);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
              ">
                Reimposta Password
              </a>
            </div>
            
            <p style="color: #73738c; font-size: 14px; margin-top: 30px; border-top: 1px solid #ffd7ef; padding-top: 20px;">
              Oppure copia e incolla questo link nel browser:
            </p>
            <p style="color: #116dff; font-size: 12px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div style="background: #fff5f5; border-left: 4px solid #ff4444; padding: 16px; margin-top: 20px; border-radius: 4px;">
              <p style="color: #cc0000; margin: 0; font-weight: 600;">⏰ Attenzione:</p>
              <p style="color: #73738c; margin: 8px 0 0 0; font-size: 14px;">
                Questo link scade in <b>1 ora</b>. Se non lo usi, dovrai richiedere un nuovo reset.
              </p>
            </div>
            
            <div style="background: #e6f7ff; border-left: 4px solid #116dff; padding: 16px; margin-top: 20px; border-radius: 4px;">
              <p style="color: #116dff; margin: 0; font-weight: 600;">ℹ️ Sicurezza:</p>
              <p style="color: #73738c; margin: 8px 0 0 0; font-size: 14px;">
                Se non hai richiesto il reset della password, <b>ignora questa email</b>. 
                Il tuo account è al sicuro.
              </p>
            </div>
          </div>
          
          <div style="background: #white; padding: 20px; text-align: center; border-top: 1px solid #ffd7ef;">
            <p style="color: #73738c; font-size: 12px; margin: 0;">
              © 2025 Tutor 2.0 - <a href="https://www.toptutor.it" style="color: #9e3ffd; text-decoration: none;">www.toptutor.it</a>
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error("❌ ERRORE CRITICO invio email SendGrid:", error);
  }
}
