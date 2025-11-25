import Studenti from "../models/Student.js";
import bcrypt from "bcryptjs";
import Materie from "../models/Subject.js";
import Verifiche from "../models/Test.js";
import Tutor from "../models/Tutor.js";
import Annotazioni from "../models/Annotation.js";

/**
 * Ottiene i dati dello studente loggato
 * GET /student/data
 */
export const getStudentData = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Cerca lo studente per ID - prende TUTTI i campi
    const student = await Studenti.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Errore nel recupero dati studente:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

/**
 * Elimina il profilo dello studente e TUTTI i dati associati (CASCATA)
 * DELETE /student/profile
 *
 * Elimina:
 * 1. Tutte le materie dello studente
 * 2. Tutte le verifiche dello studente
 * 3. Tutte le annotazioni fatte dai tutor su questo studente
 * 4. Lo studente dall'array studentiAssociati dei tutor
 * 5. Lo studente dalla collezione Student
 */
export const deleteStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Cerca lo studente
    const student = await Studenti.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // ===== STEP 1: ELIMINA TUTTE LE MATERIE DELLO STUDENTE =====
    const materieEliminategni = await Materie.deleteMany({
      studenteId: studentId,
    });

    // ===== STEP 2: ELIMINA TUTTE LE VERIFICHE DELLO STUDENTE =====
    const verificheEliminate = await Verifiche.deleteMany({
      studenteID: studentId,
    });

    // ===== STEP 3: ELIMINA TUTTE LE ANNOTAZIONI DELLO STUDENTE =====
    const annotazioniEliminate = await Annotazioni.deleteMany({
      studenteID: studentId,
    });

    // ===== STEP 4: RIMUOVI LO STUDENTE DALL'ARRAY STUDENTI ASSOCIATI DEI TUTOR =====
    const tutorAggiornati = await Tutor.updateMany(
      { studentiAssociati: studentId },
      { $pull: { studentiAssociati: studentId } }
    );

    // ===== STEP 5: ELIMINA LO STUDENTE =====
    await Studenti.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Profilo eliminato con successo",
      dettagli: {
        materieEliminate: materieEliminategni.deletedCount,
        verificheEliminate: verificheEliminate.deletedCount,
        annotazioniEliminate: annotazioniEliminate.deletedCount,
        tutorAggiornati: tutorAggiornati.modifiedCount,
      },
    });
  } catch (error) {
    console.error("❌ Errore nell'eliminazione del profilo:", error);
    res.status(500).json({
      message: "Errore del server",
      error: error.message,
    });
  }
};

// PATCH /student/personal
export const updateStudentPersonalData = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { nome, cognome, telefono, gradoScolastico, indirizzoScolastico } =
      req.body;

    // validazioni base lato server
    if (!nome || !cognome || !telefono || !gradoScolastico) {
      return res.status(400).json({ message: "Dati incompleti" });
    }

    // se non è Superiori, indirizzo deve diventare null
    const indirizzo =
      gradoScolastico === "Superiori" && indirizzoScolastico
        ? indirizzoScolastico
        : null;

    const updated = await Studenti.findByIdAndUpdate(
      studentId,
      {
        nome,
        cognome,
        telefono,
        gradoScolastico,
        indirizzoScolastico: indirizzo,
      },
      { new: true }
    ).select("nome cognome email telefono gradoScolastico indirizzoScolastico");

    if (!updated) {
      return res.status(404).json({ message: "Studente non trovato" });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Errore update dati personali:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// PATCH /student/password
export const updateStudentPassword = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Tutti i campi sono obbligatori" });
    }

    const student = await Studenti.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Studente non trovato" });
    }

    // controlla password attuale
    const match = await bcrypt.compare(oldPassword, student.password);
    if (!match) {
      return res.status(401).json({ message: "Password vecchia non corretta" });
    }

    // validazione nuova password (stessa logica del login)
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!(hasMinLength && hasUpperCase && hasLowerCase && hasNumber)) {
      return res.status(400).json({
        message:
          "Password deve contenere minimo 8 caratteri, almeno una maiuscola, una minuscola e un numero (es: Password123)",
      });
    }

    // aggiorna password (usa il pre-save per hash)
    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Password aggiornata con successo",
    });
  } catch (error) {
    console.error("Errore update password:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

/**
 * PATCH /student/family
 * Aggiorna i dati della famiglia
 */
export const updateStudentFamilyData = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const {
      genitore1Nome,
      genitore1Cognome,
      genitore1Telefono,
      genitore2Nome,
      genitore2Cognome,
      genitore2Telefono,
      emailFamiglia,
    } = req.body;

    // Validazioni base
    if (
      !genitore1Nome ||
      !genitore1Cognome ||
      !genitore1Telefono ||
      !emailFamiglia
    ) {
      return res.status(400).json({
        message: "Genitore 1 e email famiglia sono obbligatori",
      });
    }

    // Prepara oggetto genitore 2
    let genitore2 = undefined;
    if (genitore2Nome || genitore2Cognome || genitore2Telefono) {
      genitore2 = {
        nome: genitore2Nome || "",
        cognome: genitore2Cognome || "",
        telefono: genitore2Telefono || "",
      };
    }

    const updated = await Studenti.findByIdAndUpdate(
      studentId,
      {
        genitore1: {
          nome: genitore1Nome,
          cognome: genitore1Cognome,
          telefono: genitore1Telefono,
        },
        genitore2: genitore2,
        emailFamiglia: emailFamiglia,
      },
      { new: true }
    ).select("genitore1 genitore2 emailFamiglia");

    if (!updated) {
      return res.status(404).json({ message: "Studente non trovato" });
    }

    res.status(200).json({
      success: true,
      data: {
        genitore1: updated.genitore1,
        genitore2: updated.genitore2,
        emailFamiglia: updated.emailFamiglia,
      },
    });
  } catch (error) {
    console.error("Errore update dati famiglia:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

/**
 * Aggiorna email insegnanti dello studente
 * PATCH /student/school
 */
export const updateStudentSchoolData = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { emailInsegnanti } = req.body;

    // Validazioni
    if (!Array.isArray(emailInsegnanti)) {
      return res.status(400).json({
        message: "emailInsegnanti deve essere un array",
      });
    }

    if (emailInsegnanti.length > 5) {
      return res.status(400).json({
        message: "Massimo 5 email di insegnanti",
      });
    }

    // Valida ogni email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let email of emailInsegnanti) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: `Email non valida: ${email}`,
        });
      }
    }

    const updated = await Studenti.findByIdAndUpdate(
      studentId,
      { emailInsegnanti },
      { new: true }
    ).select("emailInsegnanti");

    if (!updated) {
      return res.status(404).json({ message: "Studente non trovato" });
    }

    res.status(200).json({
      success: true,
      data: {
        emailInsegnanti: updated.emailInsegnanti,
      },
    });
  } catch (error) {
    console.error("Errore update email insegnanti:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};
