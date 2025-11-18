import mongoose from "mongoose";

const materieSchema = mongoose.Schema(
  {
    // L'_id viene generato automaticamente da MongoDB

    studenteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Validazione: max 15 materie per studente
materieSchema.pre("save", async function (next) {
  const countMaterie = await mongoose.model("Materie").countDocuments({
    studenteId: this.studenteId,
  });

  if (countMaterie >= 15) {
    return next(new Error("Uno studente può avere massimo 15 materie"));
  }
  next();
});

const Materie = mongoose.model("Materie", materieSchema);
export default Materie;
