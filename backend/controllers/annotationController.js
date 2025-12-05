import Annotazioni from "../models/Annotation.js";
import Tutor from "../models/Tutor.js";
import Studenti from "../models/Student.js";

// ===== READ STUDENT ANNOTATIONS =====
export const getAnnotazioni = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const tutorID = req.user.userId;

    // Verify tutor has this student assigned
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // Get all annotations for this tutor-student pair, newest first
    const annotazioni = await Annotazioni.find({
      tutorID: tutorID,
      studenteID: studenteID,
    }).sort({ data: -1 });

    res.status(200).json({
      message: "Annotazioni recuperate con successo",
      totale: annotazioni.length,
      annotazioni: annotazioni,
    });
  } catch (error) {
    console.error("Errore lettura annotazioni:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== CREATE ANNOTATION =====
export const createAnnotazione = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const { testo } = req.body;
    const tutorID = req.user.userId;

    // Validate text not empty
    if (!testo || testo.trim() === "") {
      return res.status(400).json({
        message: "Testo annotazione obbligatorio",
      });
    }

    // Verify tutor has this student assigned
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // Verify student exists
    const studente = await Studenti.findById(studenteID);
    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // Create and save annotation
    const nuovaAnnotazione = new Annotazioni({
      tutorID: tutorID,
      studenteID: studenteID,
      testo: testo.trim(),
      data: new Date(),
    });

    await nuovaAnnotazione.save();

    res.status(201).json({
      message: "Annotazione creata con successo",
      annotazione: {
        id: nuovaAnnotazione._id,
        tutorID: nuovaAnnotazione.tutorID,
        studenteID: nuovaAnnotazione.studenteID,
        testo: nuovaAnnotazione.testo,
        data: nuovaAnnotazione.data,
      },
    });
  } catch (error) {
    console.error("Errore creazione annotazione:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== UPDATE ANNOTATION =====
export const updateAnnotazione = async (req, res) => {
  try {
    const { studenteID, annotazioneID } = req.params;
    const { testo } = req.body;
    const tutorID = req.user.userId;

    // Validate text not empty
    if (!testo || testo.trim() === "") {
      return res.status(400).json({
        message: "Testo annotazione obbligatorio",
      });
    }

    // Verify tutor has this student assigned
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // Find annotation
    const annotazione = await Annotazioni.findById(annotazioneID);
    if (!annotazione) {
      return res.status(404).json({
        message: "Annotazione non trovata",
      });
    }

    // Verify annotation belongs to tutor
    if (annotazione.tutorID.toString() !== tutorID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione non tua",
      });
    }

    // Verify annotation is for correct student
    if (annotazione.studenteID.toString() !== studenteID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione di studente diverso",
      });
    }

    // Update and save
    annotazione.testo = testo.trim();
    await annotazione.save();

    res.status(200).json({
      message: "Annotazione modificata con successo",
      annotazione: annotazione,
    });
  } catch (error) {
    console.error("Errore modifica annotazione:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== DELETE ANNOTATION =====
export const deleteAnnotazione = async (req, res) => {
  try {
    const { studenteID, annotazioneID } = req.params;
    const tutorID = req.user.userId;

    // Verify tutor has this student assigned
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // Find annotation
    const annotazione = await Annotazioni.findById(annotazioneID);
    if (!annotazione) {
      return res.status(404).json({
        message: "Annotazione non trovata",
      });
    }

    // Verify annotation belongs to tutor
    if (annotazione.tutorID.toString() !== tutorID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione non tua",
      });
    }

    // Verify annotation is for correct student
    if (annotazione.studenteID.toString() !== studenteID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione di studente diverso",
      });
    }

    // Delete annotation
    await Annotazioni.findByIdAndDelete(annotazioneID);

    res.status(200).json({
      message: "Annotazione eliminata con successo",
      annotazioneID: annotazioneID,
    });
  } catch (error) {
    console.error("Errore eliminazione annotazione:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};
