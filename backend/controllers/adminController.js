import Tutor from "../models/Tutor.js";
import Studenti from "../models/Student.js";
import Annotazioni from "../models/Annotation.js";
import Materie from "../models/Subject.js";
import Verifiche from "../models/Test.js";

// ===== CREATE TUTOR (ADMIN) =====
export const createTutor = async (req, res) => {
  try {
    const { email, password, nome, cognome } = req.body;

    // Validate required fields
    if (!email || !password || !nome || !cognome) {
      return res.status(400).json({
        message: "Email, password, nome e cognome sono obbligatori",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email non valida",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimo 8 caratteri",
      });
    }

    // Check if email already exists
    const tutorEsistente = await Tutor.findOne({ email: email.toLowerCase() });
    if (tutorEsistente) {
      return res.status(409).json({
        message: "Email già registrata",
      });
    }

    // Create and save new tutor (password auto-hashed by pre-save hook)
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

    // Handle duplicate email error from MongoDB
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

// ===== READ ALL TUTORS (ADMIN) =====
export const getAllTutor = async (req, res) => {
  try {
    // Populate student names, exclude password
    const tutor = await Tutor.find()
      .populate("studentiAssociati", "nome cognome email")
      .select("-password")
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

// ===== READ SINGLE TUTOR (ADMIN) =====
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

// ===== UPDATE TUTOR (ADMIN) =====
export const updateTutor = async (req, res) => {
  try {
    const { tutorID } = req.params;
    const { nome, cognome, email } = req.body;

    // Require at least one field to update
    if (!nome && !cognome && !email) {
      return res.status(400).json({
        message: "Fornisci almeno un campo da aggiornare",
      });
    }

    // Validate new email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Email non valida",
        });
      }

      // Check if new email already exists (exclude current tutor)
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

    // Build update data
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

// ===== DELETE TUTOR (ADMIN) - CASCADE DELETE =====
export const deleteTutor = async (req, res) => {
  try {
    const { tutorID } = req.params;

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

    // Delete the tutor
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

// ===== ASSIGN STUDENT TO TUTOR (ADMIN) =====
export const assegnaStudenteATutor = async (req, res) => {
  try {
    const { tutorID } = req.params;
    const { studenteID } = req.body;

    if (!studenteID) {
      return res.status(400).json({
        message: "StudenteID è obbligatorio",
      });
    }

    // Verify tutor exists
    const tutor = await Tutor.findById(tutorID);
    if (!tutor) {
      return res.status(404).json({
        message: "Tutor non trovato",
      });
    }

    // Verify student exists
    const studente = await Studenti.findById(studenteID);
    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // Check if already assigned
    if (tutor.studentiAssociati.includes(studenteID)) {
      return res.status(409).json({
        message: "Studente già associato a questo tutor",
      });
    }

    // Add student to tutor's list
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

// ===== REMOVE STUDENT FROM TUTOR (ADMIN) - CASCADE DELETE =====
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

    // Remove student from array
    tutor.studentiAssociati = tutor.studentiAssociati.filter(
      (id) => id.toString() !== studenteID
    );
    await tutor.save();

    // Delete related annotations
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

// ===== TUTOR STATISTICS (ADMIN) =====
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

// ===== READ ALL STUDENTS (ADMIN) =====
export const getAllStudenti = async (req, res) => {
  try {
    const studenti = await Studenti.find()
      .select("-password")
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

// ===== READ SINGLE STUDENT (ADMIN) =====
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

// ===== DELETE STUDENT (ADMIN) - COMPLETE CASCADE =====
export const deleteStudente = async (req, res) => {
  try {
    const { studenteID } = req.params;

    const studente = await Studenti.findById(studenteID);
    if (!studente) {
      return res.status(404).json({
        message: "Studente non trovato",
      });
    }

    // Delete all student's subjects
    const materieEliminate = await Materie.deleteMany({
      studenteId: studenteID,
    });

    // Delete all student's tests
    const verificheEliminate = await Verifiche.deleteMany({
      studenteID: studenteID,
    });

    // Delete all student's annotations
    const annotazioniEliminate = await Annotazioni.deleteMany({
      studenteID: studenteID,
    });

    // Remove student from all tutors' lists
    const tutorAggiornati = await Tutor.updateMany(
      { studentiAssociati: studenteID },
      { $pull: { studentiAssociati: studenteID } }
    );

    // Delete the student
    await Studenti.findByIdAndDelete(studenteID);

    res.status(200).json({
      message: "Studente eliminato con successo",
      dettagli: {
        studenteID: studenteID,
        materieEliminate: materieEliminate.deletedCount,
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

// ===== STUDENT STATISTICS (ADMIN) =====
export const getStatisticheStudenti = async (req, res) => {
  try {
    const totaleStudenti = await Studenti.countDocuments();

    // Group students by school grade
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
