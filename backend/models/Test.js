import mongoose from "mongoose";

const verificheSchema = mongoose.Schema(
  {
    // L'_id viene generato automaticamente da MongoDB

    studenteID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "ID studente obbligatorio"],
    },

    materialID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "ID materia obbligatorio"],
    },

    data: {
      type: Date,
      required: [true, "Data verifica obbligatoria"],
    },

    argomento: {
      type: String,
      required: [true, "Argomento verifica obbligatorio"],
      trim: true,
    },

    voto: {
      type: Number,
      min: [0, "Voto minimo è 0"],
      max: [10, "Voto massimo è 10"],
      default: null,
    },

    votoFuturo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Validazione: se votoFuturo è false, voto deve essere compilato
verificheSchema.pre("save", function (next) {
  if (!this.votoFuturo && this.voto === null) {
    return next(
      new Error("Se la verifica non è futura, il voto è obbligatorio")
    );
  }
  next();
});

const Verifiche = mongoose.model("Test", verificheSchema, "Test");
export default Verifiche;
