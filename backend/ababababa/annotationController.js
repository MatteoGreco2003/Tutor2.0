import Annotazioni from "../models/Annotation.js";
import Tutor from "../models/Tutor.js";
import Studenti from "../models/Student.js";

// ===== LEGGI ANNOTAZIONI DELLO STUDENTE =====
export const getAnnotazioni = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const tutorID = req.user.userId;

    // Verifica che il tutor abbia questo studente associato
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

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

// ===== CREA ANNOTAZIONE =====
export const createAnnotazione = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const { testo } = req.body;
    const tutorID = req.user.userId;

    // Validazione
    if (!testo || testo.trim() === "") {
      return res.status(400).json({
        message: "Testo annotazione obbligatorio",
      });
    }

    // Verifica che il tutor abbia questo studente associato
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // Verifica che lo studente esista
    const studente = await Studenti.findById(studenteID);
    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // Crea annotazione
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

// ===== MODIFICA ANNOTAZIONE =====
export const updateAnnotazione = async (req, res) => {
  try {
    const { studenteID, annotazioneID } = req.params;
    const { testo } = req.body;
    const tutorID = req.user.userId;

    // Validazione
    if (!testo || testo.trim() === "") {
      return res.status(400).json({
        message: "Testo annotazione obbligatorio",
      });
    }

    // Verifica che il tutor abbia questo studente associato
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // Trova annotazione
    const annotazione = await Annotazioni.findById(annotazioneID);
    if (!annotazione) {
      return res.status(404).json({
        message: "Annotazione non trovata",
      });
    }

    // Verifica che appartiene al tutor
    if (annotazione.tutorID.toString() !== tutorID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione non tua",
      });
    }

    // Verifica che sia dello studente corretto
    if (annotazione.studenteID.toString() !== studenteID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione di studente diverso",
      });
    }

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

// ===== ELIMINA ANNOTAZIONE =====
export const deleteAnnotazione = async (req, res) => {
  try {
    const { studenteID, annotazioneID } = req.params;
    const tutorID = req.user.userId;

    // Verifica che il tutor abbia questo studente associato
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // Trova annotazione
    const annotazione = await Annotazioni.findById(annotazioneID);
    if (!annotazione) {
      return res.status(404).json({
        message: "Annotazione non trovata",
      });
    }

    // Verifica che appartiene al tutor
    if (annotazione.tutorID.toString() !== tutorID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione non tua",
      });
    }

    // Verifica che sia dello studente corretto
    if (annotazione.studenteID.toString() !== studenteID) {
      return res.status(403).json({
        message: "Accesso negato: annotazione di studente diverso",
      });
    }

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
