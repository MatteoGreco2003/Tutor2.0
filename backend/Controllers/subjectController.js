import Materie from "../models/Subject.js";

// ===== CREA MATERIA =====
export const createMateria = async (req, res) => {
  try {
    const { nome } = req.body;
    const studenteId = req.user.userId;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        message: "Nome materia obbligatorio",
      });
    }

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

// ===== LEGGI MATERIE DELLO STUDENTE =====
export const getMaterieStudente = async (req, res) => {
  try {
    const studenteId = req.user.userId;

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

// ===== ELIMINA MATERIA =====
export const deleteMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const studenteId = req.user.userId;

    const materia = await Materie.findOneAndDelete({
      _id: materiaId,
      studenteId: studenteId,
    });

    if (!materia) {
      return res.status(404).json({
        message: "Materia non trovata o non autorizzato",
      });
    }

    res.status(200).json({
      message: "Materia eliminata con successo",
      materiaId: materiaId,
    });
  } catch (error) {
    console.error("Errore eliminazione materia:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== AGGIORNA NOME MATERIA =====
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
