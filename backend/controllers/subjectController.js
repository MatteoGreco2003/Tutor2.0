import Materie from "../models/Subject.js";
import Verifiche from "../models/Test.js";

// ===== CREATE SUBJECT =====
export const createMateria = async (req, res) => {
  try {
    const { nome } = req.body;
    const studenteId = req.user.userId;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        message: "Nome materia obbligatorio",
      });
    }

    // Check if subject already exists for this student
    const materiaEsistente = await Materie.findOne({
      studenteId: studenteId,
      nome: nome.trim(),
    });

    if (materiaEsistente) {
      return res.status(409).json({
        message: "Questa materia è già presente",
      });
    }

    const nuovaMateria = new Materie({
      studenteId: studenteId,
      nome: nome.trim(),
    });

    await nuovaMateria.save();

    res.status(201).json({
      message: "Materia creata con successo",
      materia: {
        id: nuovaMateria._id,
        nome: nuovaMateria.nome,
        studenteId: nuovaMateria.studenteId,
        createdAt: nuovaMateria.createdAt,
      },
    });
  } catch (error) {
    console.error("Errore creazione materia:", error);

    // Check for validation error (max 15 subjects)
    if (error.message.includes("massimo")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== READ STUDENT SUBJECTS =====
export const getMaterieStudente = async (req, res) => {
  try {
    const studenteId = req.user.userId;

    // Get all subjects, newest first
    const materie = await Materie.find({ studenteId: studenteId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Materie recuperate con successo",
      count: materie.length,
      materie: materie,
    });
  } catch (error) {
    console.error("Errore lettura materie:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== DELETE SUBJECT AND CASCADE TESTS =====
export const deleteMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const studenteId = req.user.userId;

    // Find subject first (security check)
    const materia = await Materie.findOne({
      _id: materiaId,
      studenteId: studenteId,
    });

    if (!materia) {
      return res.status(404).json({
        message: "Materia non trovata o non autorizzato",
      });
    }

    // Delete all tests for this subject
    const verificheEliminate = await Verifiche.deleteMany({
      materialID: materiaId,
      studenteID: studenteId,
    });

    // Delete subject
    await Materie.findByIdAndDelete(materiaId);

    res.status(200).json({
      message: "Materia e verifiche associate eliminate con successo",
      materiaId: materiaId,
      verificheEliminate: verificheEliminate.deletedCount,
    });
  } catch (error) {
    console.error("Errore eliminazione materia:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== UPDATE SUBJECT NAME =====
export const updateMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const { nome } = req.body;
    const studenteId = req.user.userId;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        message: "Nome materia obbligatorio",
      });
    }

    // Check if same name already exists (exclude current subject)
    const materiaEsistente = await Materie.findOne({
      studenteId: studenteId,
      nome: nome.trim(),
      _id: { $ne: materiaId },
    });

    if (materiaEsistente) {
      return res.status(409).json({
        message: "Questa materia è già presente",
      });
    }

    const materia = await Materie.findOneAndUpdate(
      {
        _id: materiaId,
        studenteId: studenteId,
      },
      { nome: nome.trim() },
      { new: true, runValidators: true }
    );

    if (!materia) {
      return res.status(404).json({
        message: "Materia non trovata o non autorizzato",
      });
    }

    res.status(200).json({
      message: "Materia aggiornata con successo",
      materia: materia,
    });
  } catch (error) {
    console.error("Errore aggiornamento materia:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};
