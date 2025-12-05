import Tutor from "../models/Tutor.js";
import Studenti from "../models/Student.js";
import Materie from "../models/Subject.js";
import Verifiche from "../models/Test.js";
import Annotazioni from "../models/Annotation.js";
import bcrypt from "bcryptjs";

// ===== GET ASSOCIATED STUDENTS =====
export const getStudentiAssociati = async (req, res) => {
  try {
    const tutorID = req.user.userId;

    const tutor = await Tutor.findById(tutorID).populate(
      "studentiAssociati",
      "nome cognome email gradoScolastico"
    );

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    const studentiDettagli = tutor.studentiAssociati.map((studente) => ({
      id: studente._id,
      nome: studente.nome,
      cognome: studente.cognome,
      email: studente.email,
      scuola: studente.gradoScolastico,
    }));

    res.status(200).json({
      message: "Studenti associati recuperati con successo",
      totale: studentiDettagli.length,
      studenti: studentiDettagli,
    });
  } catch (error) {
    console.error("Errore lettura studenti associati:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== GET COMPLETE STUDENT SUMMARY =====
export const getStudenteRiepilogo = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const tutorID = req.user.userId;

    // Verify tutor has this student
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    const studente = await Studenti.findById(studenteID);
    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // Get subjects with averages
    const materie = await Materie.find({ studenteId: studenteID });
    const materieConMedia = await Promise.all(
      materie.map(async (materia) => {
        const verifiche = await Verifiche.find({
          studenteID: studenteID,
          materialID: materia._id,
          voto: { $ne: null },
        });

        let media = 0;
        if (verifiche.length > 0) {
          const sommaVoti = verifiche.reduce((acc, v) => acc + v.voto, 0);
          media = (sommaVoti / verifiche.length).toFixed(2);
        }

        const sufficienza = media >= 6 ? "Sufficiente" : "Insufficiente";

        return {
          id: materia._id,
          nome: materia.nome,
          media: parseFloat(media),
          sufficienza: sufficienza,
          numeroVerifiche: verifiche.length,
        };
      })
    );

    // Check if has insufficient subjects
    const meterieInsufficenti = materieConMedia.some(
      (m) => m.sufficienza === "Insufficiente"
    );

    // Get graded tests (history)
    const verificheConVoto = await Verifiche.find({
      studenteID: studenteID,
      voto: { $ne: null },
    })
      .populate("materialID", "nome")
      .sort({ data: -1 });

    // Get ungraded tests (future)
    const verificheFuture = await Verifiche.find({
      studenteID: studenteID,
      voto: null,
    })
      .populate("materialID", "nome")
      .sort({ data: -1 });

    res.status(200).json({
      message: "Riepilogo studente recuperato con successo",
      studente: {
        id: studente._id,
        nome: studente.nome,
        cognome: studente.cognome,
        email: studente.email,
        telefono: studente.telefono,
        scuola: studente.gradoScolastico,
        indirizzo: studente.indirizzoScolastico,
        genitore1: studente.genitore1,
        genitore2: studente.genitore2,
        emailFamiglia: studente.emailFamiglia,
        emailInsegnanti: studente.emailInsegnanti || [],
      },
      materie: {
        totale: materieConMedia.length,
        lista: materieConMedia,
        hasInsufficenze: meterieInsufficenti,
      },
      verifiche: {
        storico: {
          totale: verificheConVoto.length,
          lista: verificheConVoto,
        },
        future: {
          totale: verificheFuture.length,
          lista: verificheFuture,
        },
      },
    });
  } catch (error) {
    console.error("Errore riepilogo studente:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== GET TEST HISTORY (GRADED TESTS) =====
export const getVerificheStorico = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const tutorID = req.user.userId;

    // Verify access
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    // End of today
    const oggiFine = new Date();
    oggiFine.setHours(23, 59, 59, 999);

    // Get graded tests up to today
    const verifiche = await Verifiche.find({
      studenteID: studenteID,
      data: { $lte: oggiFine },
      voto: { $ne: null },
    })
      .populate("materialID", "nome")
      .sort({ data: -1 });

    res.status(200).json({
      message: "Storico verifiche recuperato con successo",
      totale: verifiche.length,
      verifiche: verifiche,
    });
  } catch (error) {
    console.error("Errore storico verifiche:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== GET FUTURE TESTS (UNGRADED) =====
export const getVerificheFuture = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const tutorID = req.user.userId;

    // Verify access
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    const verifiche = await Verifiche.find({
      studenteID: studenteID,
      voto: null,
    })
      .populate("materialID", "nome")
      .sort({ data: -1 });

    res.status(200).json({
      message: "Verifiche future recuperate con successo",
      totale: verifiche.length,
      verifiche: verifiche,
    });
  } catch (error) {
    console.error("Errore verifiche future:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== GET STUDENT SUBJECTS WITH AVERAGES =====
export const getMaterieStudente = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const tutorID = req.user.userId;

    // Verify access
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    const materie = await Materie.find({ studenteId: studenteID });

    const materieConMedia = await Promise.all(
      materie.map(async (materia) => {
        const verifiche = await Verifiche.find({
          studenteID: studenteID,
          materialID: materia._id,
          voto: { $ne: null },
        });

        let media = 0;
        if (verifiche.length > 0) {
          const sommaVoti = verifiche.reduce((acc, v) => acc + v.voto, 0);
          media = (sommaVoti / verifiche.length).toFixed(2);
        }

        const sufficienza = media >= 6 ? "Sufficiente" : "Insufficiente";

        return {
          id: materia._id,
          nome: materia.nome,
          media: parseFloat(media),
          sufficienza: sufficienza,
          numeroVerifiche: verifiche.length,
        };
      })
    );

    res.status(200).json({
      message: "Materie recuperate con successo",
      totale: materieConMedia.length,
      materie: materieConMedia,
    });
  } catch (error) {
    console.error("Errore lettura materie:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== CHECK INSUFFICIENT SUBJECTS =====
export const checkMaterie = async (req, res) => {
  try {
    const { studenteID } = req.params;
    const tutorID = req.user.userId;

    // Verify access
    const tutor = await Tutor.findById(tutorID);
    if (!tutor.studentiAssociati.includes(studenteID)) {
      return res.status(403).json({
        message: "Accesso negato: studente non associato",
      });
    }

    const materie = await Materie.find({ studenteId: studenteID });

    const materieInsufficenti = [];

    for (let materia of materie) {
      const verifiche = await Verifiche.find({
        studenteID: studenteID,
        materialID: materia._id,
        voto: { $ne: null },
      });

      if (verifiche.length > 0) {
        const sommaVoti = verifiche.reduce((acc, v) => acc + v.voto, 0);
        const media = sommaVoti / verifiche.length;

        if (media < 6) {
          materieInsufficenti.push({
            materia: materia.nome,
            media: media.toFixed(2),
            numeroVerifiche: verifiche.length,
          });
        }
      }
    }

    res.status(200).json({
      message: "Controllo materie completato",
      hasInsufficenze: materieInsufficenti.length > 0,
      materieInsufficenti: materieInsufficenti,
      totaleInsufficenze: materieInsufficenti.length,
    });
  } catch (error) {
    console.error("Errore controllo materie:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== GET TUTOR DATA =====
export const getTutorData = async (req, res) => {
  try {
    const tutorID = req.user.userId;

    const tutor = await Tutor.findById(tutorID).select(
      "email nome cognome studentiAssociati"
    );

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    res.status(200).json({
      success: true,
      data: tutor,
    });
  } catch (error) {
    console.error("Errore nel recupero dati tutor:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// ===== DELETE TUTOR PROFILE - CASCADE DELETE =====
export const deleteTutorProfile = async (req, res) => {
  try {
    const tutorID = req.user.userId;

    const tutor = await Tutor.findById(tutorID);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    // Delete all tutor's annotations
    const annotazioniEliminate = await Annotazioni.deleteMany({
      tutorID: tutorID,
    });

    // Delete tutor
    await Tutor.findByIdAndDelete(tutorID);

    res.status(200).json({
      success: true,
      message: "Profilo tutor eliminato con successo",
      dettagli: {
        annotazioniEliminate: annotazioniEliminate.deletedCount,
      },
    });
  } catch (error) {
    console.error("❌ Errore nell'eliminazione del profilo tutor:", error);
    res.status(500).json({
      message: "Errore del server",
      error: error.message,
    });
  }
};

// ===== ASSOCIATE STUDENT =====
export const associaStudente = async (req, res) => {
  try {
    const tutorID = req.user.userId;
    const { studenteID } = req.body;

    if (!studenteID) {
      return res.status(400).json({
        message: "Errore: studenteID mancante",
      });
    }

    const tutor = await Tutor.findById(tutorID);
    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    // Check if already associated
    if (tutor.studentiAssociati.includes(studenteID)) {
      return res.status(400).json({
        message: "Lo studente è già associato a questo tutor",
      });
    }

    tutor.studentiAssociati.push(studenteID);
    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Studente associato con successo",
      studentiAssociati: tutor.studentiAssociati,
    });
  } catch (error) {
    console.error("Errore associazione studente:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== REMOVE ASSOCIATED STUDENT =====
export const rimuoviStudente = async (req, res) => {
  try {
    const tutorID = req.user.userId;
    const { studenteID } = req.body;

    if (!studenteID) {
      return res.status(400).json({
        message: "Errore: studenteID mancante",
      });
    }

    const tutor = await Tutor.findById(tutorID);
    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    // Remove student from array
    tutor.studentiAssociati = tutor.studentiAssociati.filter(
      (id) => id.toString() !== studenteID
    );
    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Studente rimosso con successo",
      studentiAssociati: tutor.studentiAssociati,
    });
  } catch (error) {
    console.error("Errore rimozione studente:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== UPDATE TUTOR PASSWORD =====
export const updateTutorPassword = async (req, res) => {
  try {
    const tutorId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Tutti i campi sono obbligatori" });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor non trovato" });
    }

    // Verify old password
    const match = await bcrypt.compare(oldPassword, tutor.password);
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
    tutor.password = newPassword;
    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Password aggiornata con successo",
    });
  } catch (error) {
    console.error("Errore update password tutor:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// ===== UPDATE TUTOR PERSONAL DATA =====
export const updateTutorPersonalData = async (req, res) => {
  try {
    const tutorId = req.user.userId;
    const { nome, cognome } = req.body;

    if (!nome || !cognome) {
      return res.status(400).json({
        message: "Nome e cognome sono obbligatori",
      });
    }

    // Validate minimum length
    if (nome.trim().length < 2 || cognome.trim().length < 2) {
      return res.status(400).json({
        message: "Nome e cognome devono contenere almeno 2 caratteri",
      });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor non trovato" });
    }

    tutor.nome = nome.trim();
    tutor.cognome = cognome.trim();
    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Dati personali aggiornati con successo",
      data: {
        nome: tutor.nome,
        cognome: tutor.cognome,
      },
    });
  } catch (error) {
    console.error("Errore update dati personali tutor:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};
