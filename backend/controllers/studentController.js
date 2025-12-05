import Studenti from "../models/Student.js";
import bcrypt from "bcryptjs";
import Materie from "../models/Subject.js";
import Verifiche from "../models/Test.js";
import Tutor from "../models/Tutor.js";
import Annotazioni from "../models/Annotation.js";

// ===== GET STUDENT DATA =====
export const getStudentData = async (req, res) => {
  try {
    const studentId = req.user.userId;

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

// ===== DELETE STUDENT PROFILE - CASCADE DELETE =====
// Deletes: subjects, tests, annotations, tutor associations, student record
export const deleteStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const student = await Studenti.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // Delete all subjects
    const materieEliminate = await Materie.deleteMany({
      studenteId: studentId,
    });

    // Delete all tests
    const verificheEliminate = await Verifiche.deleteMany({
      studenteID: studentId,
    });

    // Delete all annotations about this student
    const annotazioniEliminate = await Annotazioni.deleteMany({
      studenteID: studentId,
    });

    // Remove student from all tutors' lists
    const tutorAggiornati = await Tutor.updateMany(
      { studentiAssociati: studentId },
      { $pull: { studentiAssociati: studentId } }
    );

    // Delete student
    await Studenti.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Profilo eliminato con successo",
      dettagli: {
        materieEliminate: materieEliminate.deletedCount,
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

// ===== UPDATE PERSONAL DATA =====
export const updateStudentPersonalData = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { nome, cognome, telefono, gradoScolastico, indirizzoScolastico } =
      req.body;

    // Validate required fields
    if (!nome || !cognome || !telefono || !gradoScolastico) {
      return res.status(400).json({ message: "Dati incompleti" });
    }

    // Set indirizzoScolastico to null if not Superiori
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

// ===== UPDATE PASSWORD =====
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

    // Verify old password
    const match = await bcrypt.compare(oldPassword, student.password);
    if (!match) {
      return res.status(401).json({ message: "Password vecchia non corretta" });
    }

    // Validate new password: min 8 chars, uppercase, lowercase, number
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

    // Update password (pre-save hook auto-hashes)
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

// ===== UPDATE FAMILY DATA =====
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

    // Validate parent 1 required, email required
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

    // Parent 2 is optional
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

// ===== UPDATE TEACHER EMAILS =====
export const updateStudentSchoolData = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { emailInsegnanti } = req.body;

    // Must be array
    if (!Array.isArray(emailInsegnanti)) {
      return res.status(400).json({
        message: "emailInsegnanti deve essere un array",
      });
    }

    // Max 5 emails
    if (emailInsegnanti.length > 5) {
      return res.status(400).json({
        message: "Massimo 5 email di insegnanti",
      });
    }

    // Validate each email format
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
