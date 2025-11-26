import Verifiche from "../models/Test.js";
import Materie from "../models/Subject.js";

// ===== CREA VERIFICA =====
export const createVerifica = async (req, res) => {
  try {
    const { materialID, data, argomento, voto, votoFuturo } = req.body;
    const studenteID = req.user.userId;

    if (!materialID || !data || !argomento) {
      return res.status(400).json({
        message: "materialID, data e argomento sono obbligatori",
      });
    }

    // Controlla che la materia appartenga allo studente
    // ATTENZIONE: nel schema Subject è "studenteId" (minuscola)
    const materia = await Materie.findOne({
      _id: materialID,
      studenteId: studenteID,
    });

    if (!materia) {
      return res.status(403).json({
        message: "Materia non trovata o non autorizzato",
      });
    }

    if (votoFuturo === false && (!voto || voto === null)) {
      return res.status(400).json({
        message: "Se la verifica non è futura, il voto è obbligatorio",
      });
    }

    const nuovaVerifica = new Verifiche({
      studenteID: studenteID,
      materialID: materialID,
      data: new Date(data),
      argomento: argomento.trim(),
      voto: voto || null,
      votoFuturo: votoFuturo !== undefined ? votoFuturo : true,
    });

    await nuovaVerifica.save();
    await nuovaVerifica.populate("materialID", "nome");

    res.status(201).json({
      message: "Verifica creata con successo",
      verifica: {
        id: nuovaVerifica._id,
        studenteID: nuovaVerifica.studenteID,
        materialID: nuovaVerifica.materialID,
        data: nuovaVerifica.data,
        argomento: nuovaVerifica.argomento,
        voto: nuovaVerifica.voto,
        votoFuturo: nuovaVerifica.votoFuturo,
        createdAt: nuovaVerifica.createdAt,
      },
    });
  } catch (error) {
    console.error("Errore creazione verifica:", error);

    if (error.message.includes("obbligatorio")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== LEGGI VERIFICHE DELLO STUDENTE =====
export const getVerificheStudente = async (req, res) => {
  try {
    const studenteID = req.user.userId;
    const { materialID } = req.query;

    let query = { studenteID: studenteID };

    if (materialID) {
      query.materialID = materialID;
    }

    const verifiche = await Verifiche.find(query)
      .populate("materialID", "nome")
      .sort({ data: -1 });

    res.status(200).json({
      message: "Verifiche recuperate con successo",
      count: verifiche.length,
      verifiche: verifiche,
    });
  } catch (error) {
    console.error("Errore lettura verifiche:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== LEGGI SINGOLA VERIFICA =====
export const getVerifica = async (req, res) => {
  try {
    const { verificaID } = req.params;
    const studenteID = req.user.userId;

    const verifica = await Verifiche.findOne({
      _id: verificaID,
      studenteID: studenteID,
    }).populate("materialID", "nome");

    if (!verifica) {
      return res.status(404).json({
        message: "Verifica non trovata o non autorizzato",
      });
    }

    res.status(200).json({
      message: "Verifica recuperata con successo",
      verifica: verifica,
    });
  } catch (error) {
    console.error("Errore lettura verifica:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== AGGIORNA VERIFICA =====
export const updateVerifica = async (req, res) => {
  try {
    const { verificaID } = req.params;
    const { data, argomento, voto, votoFuturo } = req.body;
    const studenteID = req.user.userId;

    if (!data && !argomento && voto === undefined && votoFuturo === undefined) {
      return res.status(400).json({
        message: "Fornisci almeno un campo da aggiornare",
      });
    }

    const updateData = {};
    if (data) updateData.data = new Date(data);
    if (argomento) updateData.argomento = argomento.trim();
    if (voto !== undefined) updateData.voto = voto;
    if (votoFuturo !== undefined) updateData.votoFuturo = votoFuturo;
    if (req.body.materialID) updateData.materialID = req.body.materialID;
    if (votoFuturo === false && (!voto || voto === null)) {
      return res.status(400).json({
        message: "Se la verifica non è futura, il voto è obbligatorio",
      });
    }

    const verifica = await Verifiche.findOneAndUpdate(
      {
        _id: verificaID,
        studenteID: studenteID,
      },
      updateData,
      { new: true, runValidators: true }
    ).populate("materialID", "nome");

    if (!verifica) {
      return res.status(404).json({
        message: "Verifica non trovata o non autorizzato",
      });
    }

    res.status(200).json({
      message: "Verifica aggiornata con successo",
      verifica: verifica,
    });
  } catch (error) {
    console.error("Errore aggiornamento verifica:", error);

    if (error.message.includes("obbligatorio")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Errore del server",
    });
  }
};

// ===== ELIMINA VERIFICA =====
export const deleteVerifica = async (req, res) => {
  try {
    const { verificaID } = req.params;
    const studenteID = req.user.userId;

    const verifica = await Verifiche.findOneAndDelete({
      _id: verificaID,
      studenteID: studenteID,
    });

    if (!verifica) {
      return res.status(404).json({
        message: "Verifica non trovata o non autorizzato",
      });
    }

    res.status(200).json({
      message: "Verifica eliminata con successo",
      verificaID: verificaID,
    });
  } catch (error) {
    console.error("Errore eliminazione verifica:", error);
    res.status(500).json({
      message: "Errore del server",
    });
  }
};

export const getMaterieConMedia = async (req, res) => {
  try {
    const studenteID = req.user.userId;

    const materie = await Materie.find({ studenteId: studenteID });

    if (materie.length === 0) {
      return res.json({ materieConMedia: [] });
    }

    const materieConMedia = await Promise.all(
      materie.map(async (materia) => {
        // ✅ CORRETTO: materialID (con la "l")
        const verifiche = await Verifiche.find({
          studenteID: studenteID,
          materialID: materia._id, // ← CAMBIATO da materiaID a materialID
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

    res.json({ materieConMedia });
  } catch (error) {
    console.error("❌ Errore getMaterieConMedia:", error);
    res.status(500).json({ message: "Errore nel calcolo delle medie" });
  }
};

export const getVerifichePerMateria = async (req, res) => {
  try {
    const studenteID = req.user.userId;
    const { materiaId } = req.params;

    const verifiche = await Verifiche.find({
      studenteID: studenteID,
      materialID: materiaId,
    })
      .populate("materialID", "nome")
      .sort({ data: -1 });

    // ✅ ASSICURATI DI RESTITUIRE 200 (OK)
    return res.status(200).json({ verifiche });
  } catch (error) {
    console.error("❌ ERRORE getVerifichePerMateria:", error.message);
    return res.status(500).json({
      message: "Errore nel caricamento delle verifiche",
      error: error.message,
    });
  }
};
