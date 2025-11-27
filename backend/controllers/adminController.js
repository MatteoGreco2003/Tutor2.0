import Tutor from "../models/Tutor.js";
import Studenti from "../models/Student.js";
import Annotazioni from "../models/Annotation.js";
import Materie from "../models/Subject.js";
import Verifiche from "../models/Test.js";

// ===== CREA TUTOR (ADMIN) =====
export const createTutor = async (req, res) => {
  try {
    const { email, password, nome, cognome } = req.body;

    // Validazione input
    if (!email || !password || !nome || !cognome) {
      return res.status(400).json({
        message: "Email, password, nome e cognome sono obbligatori",
      });
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email non valida",
      });
    }

    // Validazione password (minimo 8 caratteri)
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimo 8 caratteri",
      });
    }

    // Controlla se email esiste già
    const tutorEsistente = await Tutor.findOne({ email: email.toLowerCase() });
    if (tutorEsistente) {
      return res.status(409).json({
        message: "Email già registrata",
      });
    }

    // Crea nuovo tutor
    const nuovoTutor = new Tutor({
      email: email.toLowerCase(),
      password: password,
      nome: nome.trim(),
      cognome: cognome.trim(),
      studentiAssociati: [],
    });

    await nuovoTutor.save();

    res.status(201).json({
      message: "Tutor creato con successo",
      tutor: {
        id: nuovoTutor._id,
        email: nuovoTutor.email,
        nome: nuovoTutor.nome,
        cognome: nuovoTutor.cognome,
        studentiAssociati: nuovoTutor.studentiAssociati,
        createdAt: nuovoTutor.createdAt,
      },
    });
  } catch (error) {
    console.error("Errore creazione tutor:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email già registrata",
      });
    }

    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== LEGGI TUTTI I TUTOR (ADMIN) =====
export const getAllTutor = async (req, res) => {
  try {
    const tutor = await Tutor.find()
      .populate("studentiAssociati", "nome cognome email")
      .select("-password") // Non restituire la password
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tutor recuperati con successo",
      count: tutor.length,
      tutor: tutor,
    });
  } catch (error) {
    console.error("Errore lettura tutor:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== LEGGI SINGOLO TUTOR (ADMIN) =====
export const getTutor = async (req, res) => {
  try {
    const { tutorID } = req.params;

    const tutor = await Tutor.findById(tutorID)
      .populate("studentiAssociati", "nome cognome email gradoScolastico")
      .select("-password");

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    res.status(200).json({
      message: "Tutor recuperato con successo",
      tutor: tutor,
    });
  } catch (error) {
    console.error("Errore lettura tutor:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== AGGIORNA TUTOR (ADMIN) =====
export const updateTutor = async (req, res) => {
  try {
    const { tutorID } = req.params;
    const { nome, cognome, email } = req.body;

    // Validazione: almeno un campo deve essere fornito
    if (!nome && !cognome && !email) {
      return res.status(400).json({
        message: "Fornisci almeno un campo da aggiornare",
      });
    }

    // Se aggiorna email, validala
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Email non valida",
        });
      }

      // Controlla se email esiste già
      const tutorEsistente = await Tutor.findOne({
        email: email.toLowerCase(),
        _id: { $ne: tutorID },
      });
      if (tutorEsistente) {
        return res.status(409).json({
          message: "Email già registrata",
        });
      }
    }

    const updateData = {};
    if (nome) updateData.nome = nome.trim();
    if (cognome) updateData.cognome = cognome.trim();
    if (email) updateData.email = email.toLowerCase();

    const tutor = await Tutor.findByIdAndUpdate(tutorID, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    res.status(200).json({
      message: "Tutor aggiornato con successo",
      tutor: tutor,
    });
  } catch (error) {
    console.error("Errore aggiornamento tutor:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== ELIMINA TUTOR (ADMIN) - CON CASCATA =====
export const deleteTutor = async (req, res) => {
  try {
    const { tutorID } = req.params;

    const tutor = await Tutor.findById(tutorID);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    // ===== STEP 1: ELIMINA TUTTE LE ANNOTAZIONI DEL TUTOR =====
    const annotazioniEliminate = await Annotazioni.deleteMany({
      tutorID: tutorID,
    });

    // ===== STEP 2: ELIMINA IL TUTOR =====
    await Tutor.findByIdAndDelete(tutorID);

    res.status(200).json({
      message: "Tutor eliminato con successo",
      dettagli: {
        tutorID: tutorID,
        annotazioniEliminate: annotazioniEliminate.deletedCount,
      },
    });
  } catch (error) {
    console.error("Errore eliminazione tutor:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== ASSEGNA STUDENTE A TUTOR (ADMIN) =====
export const assegnaStudenteATutor = async (req, res) => {
  try {
    const { tutorID } = req.params;
    const { studenteID } = req.body;

    if (!studenteID) {
      return res.status(400).json({
        message: "StudenteID è obbligatorio",
      });
    }

    // Controlla che tutor esista
    const tutor = await Tutor.findById(tutorID);
    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    // Controlla che studente esista
    const studente = await Studenti.findById(studenteID);
    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // Controlla se studente è già associato
    if (tutor.studentiAssociati.includes(studenteID)) {
      return res.status(409).json({
        message: "Studente già associato a questo tutor",
      });
    }

    // Aggiungi studente ai studentiAssociati del tutor
    tutor.studentiAssociati.push(studenteID);
    await tutor.save();

    res.status(200).json({
      message: "Studente assegnato al tutor con successo",
      tutor: {
        id: tutor._id,
        nome: tutor.nome,
        cognome: tutor.cognome,
        studentiAssociati: tutor.studentiAssociati,
      },
    });
  } catch (error) {
    console.error("Errore assegnazione studente:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== RIMUOVI STUDENTE DA TUTOR (ADMIN) - CON CASCATA =====
export const rimuoviStudenteDaTutor = async (req, res) => {
  try {
    const { tutorID } = req.params;
    const { studenteID } = req.body;

    if (!studenteID) {
      return res.status(400).json({
        message: "StudenteID è obbligatorio",
      });
    }

    const tutor = await Tutor.findById(tutorID);
    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    // ===== STEP 1: RIMUOVI STUDENTE DALL'ARRAY =====
    tutor.studentiAssociati = tutor.studentiAssociati.filter(
      (id) => id.toString() !== studenteID
    );
    await tutor.save();

    // ===== STEP 2: ELIMINA TUTTE LE ANNOTAZIONI COLLEGATE =====
    const annotazioniEliminate = await Annotazioni.deleteMany({
      tutorID: tutorID,
      studenteID: studenteID,
    });

    res.status(200).json({
      message: "Studente rimosso dal tutor con successo",
      dettagli: {
        tutor: {
          id: tutor._id,
          nome: tutor.nome,
          cognome: tutor.cognome,
          studentiAssociati: tutor.studentiAssociati,
        },
        annotazioniEliminate: annotazioniEliminate.deletedCount,
      },
    });
  } catch (error) {
    console.error("Errore rimozione studente:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== STATISTICHE TUTOR (ADMIN) =====
export const getStatisticheTutor = async (req, res) => {
  try {
    const { tutorID } = req.params;

    const tutor = await Tutor.findById(tutorID).populate(
      "studentiAssociati",
      "nome cognome email"
    );

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    res.status(200).json({
      message: "Statistiche tutor recuperate con successo",
      statistiche: {
        tutorID: tutor._id,
        tutorNome: `${tutor.nome} ${tutor.cognome}`,
        totaleStudentiAssociati: tutor.studentiAssociati.length,
        studentiAssociati: tutor.studentiAssociati,
        dataiscrizione: tutor.createdAt,
      },
    });
  } catch (error) {
    console.error("Errore statistiche tutor:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== LEGGI TUTTI GLI STUDENTI (ADMIN) =====
export const getAllStudenti = async (req, res) => {
  try {
    const studenti = await Studenti.find()
      .select("-password") // Non restituire la password
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Studenti recuperati con successo",
      count: studenti.length,
      studenti: studenti,
    });
  } catch (error) {
    console.error("Errore lettura studenti:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== LEGGI SINGOLO STUDENTE (ADMIN) =====
export const getStudente = async (req, res) => {
  try {
    const { studenteID } = req.params;

    const studente = await Studenti.findById(studenteID).select("-password");

    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    res.status(200).json({
      message: "Studente recuperato con successo",
      studente: studente,
    });
  } catch (error) {
    console.error("Errore lettura studente:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== ELIMINA STUDENTE (ADMIN) - CON CASCATA COMPLETA =====
export const deleteStudente = async (req, res) => {
  try {
    const { studenteID } = req.params;

    const studente = await Studenti.findById(studenteID);
    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // ===== STEP 1: ELIMINA TUTTE LE MATERIE DELLO STUDENTE =====
    const Materie = (await import("../models/Subject.js")).default;
    const materieEliminategni = await Materie.deleteMany({
      studenteId: studenteID,
    });

    // ===== STEP 2: ELIMINA TUTTE LE VERIFICHE DELLO STUDENTE =====
    const Verifiche = (await import("../models/Test.js")).default;
    const verificheEliminate = await Verifiche.deleteMany({
      studenteID: studenteID,
    });

    // ===== STEP 3: ELIMINA TUTTE LE ANNOTAZIONI DELLO STUDENTE =====
    const annotazioniEliminate = await Annotazioni.deleteMany({
      studenteID: studenteID,
    });

    // ===== STEP 4: RIMUOVI LO STUDENTE DALL'ARRAY STUDENTI ASSOCIATI DEI TUTOR =====
    const tutorAggiornati = await Tutor.updateMany(
      { studentiAssociati: studenteID },
      { $pull: { studentiAssociati: studenteID } }
    );

    // ===== STEP 5: ELIMINA LO STUDENTE =====
    await Studenti.findByIdAndDelete(studenteID);

    res.status(200).json({
      message: "Studente eliminato con successo",
      dettagli: {
        studenteID: studenteID,
        materieEliminate: materieEliminategni.deletedCount,
        verificheEliminate: verificheEliminate.deletedCount,
        annotazioniEliminate: annotazioniEliminate.deletedCount,
        tutorAggiornati: tutorAggiornati.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Errore eliminazione studente:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== STATISTICHE STUDENTI (ADMIN) =====
export const getStatisticheStudenti = async (req, res) => {
  try {
    const totaleStudenti = await Studenti.countDocuments();

    // Studenti per grado scolastico
    const studentiPerGrado = await Studenti.aggregate([
      {
        $group: {
          _id: "$gradoScolastico",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      message: "Statistiche studenti recuperate con successo",
      statistiche: {
        totaleStudenti: totaleStudenti,
        studentiPerGrado: studentiPerGrado,
      },
    });
  } catch (error) {
    console.error("Errore statistiche studenti:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};
