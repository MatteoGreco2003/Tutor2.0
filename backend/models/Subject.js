import mongoose from "mongoose";

const materieSchema = mongoose.Schema(
  {
    studenteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studenti",
      required: [true, "ID studente obbligatorio"],
    },

    nome: {
      type: String,
      required: [true, "Nome materia obbligatorio"],
      trim: true,
    },
  },
  { timestamps: true }
);

// ===== VALIDAZIONE: MAX 15 MATERIE PER STUDENTE =====
materieSchema.pre("save", async function (next) {
  try {
    // Usa 'this.model()' invece di mongoose.model()
    const countMaterie = await this.model("Subject").countDocuments({
      studenteId: this.studenteId,
    });

    if (countMaterie >= 15) {
      return next(new Error("Uno studente può avere massimo 15 materie"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Materie = mongoose.model("Subject", materieSchema, "Subject");
export default Materie;
