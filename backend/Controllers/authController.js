import Studenti from "../models/Student.js";
import Tutor from "../models/Tutor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//===== LOGIN =====
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email e password sono richieste",
      });
    }

    // Rimuovi spazi iniziali e finali
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Cerca in Studenti
    let user = await Studenti.findOne({ email: cleanEmail });
    let userType = "studente";

    // Se non trovato, cerca in Tutor
    if (!user) {
      user = await Tutor.findOne({ email: cleanEmail });
      userType = "tutor";
    }

    // Se non trovato
    if (!user) {
      return res.status(401).json({
        message: "Email o password non valide",
      });
    }

    // Controlla password
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
      process.env.JWT_SECRET || "your-secret-key-change-this",
      { expiresIn: "7d" }
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

//===== LOGOUT =====
export const logout = async (req, res) => {
  try {
    // Con JWT, il logout è lato client (cancella il token)
    // Lato server semplicemente reindirigiamo
    res.clearCookie("token"); // Se il token è salvato in cookie
    res.status(200).json({
      message: "Logout avvenuto con successo",
    });
  } catch (error) {
    console.error("Errore logout:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

//TODO IL NOME STUDENTE DEVE ESSERE STUDENTI
// // ===== REGISTRAZIONE COMPLETA (per studente) =====
// export const registerComplete = async (req, res) => {
//   try {
//     const {
//       email,
//       password,
//       consentGDPR,
//       consentGDPRDate,
//       nome,
//       cognome,
//       telefono,
//       gradoScolastico,
//       indirizzoScolastico,
//       famiglia,
//       scuola,
//     } = req.body;

//     // Controlla se l'email esiste già
//     const studenteEsiste = await Studente.findOne({ email });
//     const tutorEsiste = await Tutor.findOne({ email });

//     if (studenteEsiste || tutorEsiste) {
//       return res.status(400).json({
//         message: "Email già registrata",
//       });
//     }

//     // Crea il nuovo studente
//     const nuovoStudente = new Studente({
//       email,
//       password, // Il middleware pre("save") farà l'hash automaticamente
//       nome,
//       cognome,
//       telefono,
//       gradoScolastico,
//       indirizzoScolastico: indirizzoScolastico || null,
//       consentiGDPR: consentGDPR,
//       GDPRdata: consentGDPRDate,
//       genitore1: famiglia.genitore1,
//       genitore2: famiglia.genitore2 || {},
//       emailFamiglia: famiglia.email,
//       emailInsegnanti: scuola.emailProfessori || [],
//     });

//     // Salva nel DB
//     await nuovoStudente.save();

//     // Genera JWT token
//     const token = jwt.sign(
//       { userId: nuovoStudente._id, email: nuovoStudente.email, tipo: "studente" },
//       process.env.JWT_SECRET || "your-secret-key-change-this",
//       { expiresIn: "7d" }
//     );

//     res.status(201).json({
//       message: "Registrazione completata con successo",
//       token: token,
//       user: {
//         id: nuovoStudente._id,
//         email: nuovoStudente.email,
//         tipo: "studente",
//         nome: nuovoStudente.nome,
//         cognome: nuovoStudente.cognome,
//       },
//     });
//   } catch (error) {
//     console.error("Errore registrazione:", error);
//     res.status(500).json({
//       message: "Errore del server",
//       dettagli: error.message,
//     });
//   }
// };
