import Studente from "../models/Studenti.js";
import Tutor from "../models/Tutor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ===== LOGIN =====
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email e password sono richieste",
      });
    }

    // Cerca prima nella collezione STUDENTE
    let user = await Studente.findOne({ email }).select("+password");
    let userType = "studente";

    // Se non trovato, cerca nella collezione TUTOR
    if (!user) {
      user = await Tutor.findOne({ email }).select("+password");
      userType = "tutor";
    }

    // Se non trovato in nessuna delle due collezioni
    if (!user) {
      return res.status(401).json({
        message: "Email o password non valide",
      });
    }

    // Controlla che la password corrisponda
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email o password non valide",
      });
    }

    // Se tutto OK, genera JWT token
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
