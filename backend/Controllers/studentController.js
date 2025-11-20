/**
 * STUDENT CONTROLLER
 * Gestisce tutte le operazioni relative al profilo studente
 */

import Studenti from "../models/Student.js";

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
 * Elimina il profilo dello studente e tutti i dati associati
 * DELETE /student/profile
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

    // [TODO] Se hai una collezione "Verifiche", elimina tutte le verifiche dello studente
    // const Verifiche = (await import("../models/Verifica.js")).default;
    // await Verifiche.deleteMany({ studentId: studentId });

    // [TODO] Se hai una collezione "Materie", elimina tutte le materie dello studente
    // const Materie = (await import("../models/Materia.js")).default;
    // await Materie.deleteMany({ studentId: studentId });

    // eliminare anche se è uno studente associato a un tutor
    // const TutorStudenti = (await import("../models/TutorStudente.js")).default;
    // await TutorStudenti.deleteMany({ studentId: studentId });

    // Elimina lo studente dal database
    await Studenti.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Profilo eliminato con successo",
    });
  } catch (error) {
    console.error("Errore nell'eliminazione del profilo:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

/**
 * [TODO] Ottieni tutte le verifiche dello studente
 */
// export const getStudentVerifiche = async (req, res) => {
//   // ...
// };

/**
 * [TODO] Crea una nuova verifica
 */
// export const createVerifica = async (req, res) => {
//   // ...
// };

/**
 * [TODO] Elimina una verifica
 */
// export const deleteVerifica = async (req, res) => {
//   // ...
// };
