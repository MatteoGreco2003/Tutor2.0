import mongoose from "mongoose";

// Subject/course schema - students can have multiple subjects (max 15)
const materieSchema = mongoose.Schema(
  {
    // Reference to Student collection
    studenteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studenti",
      required: [true, "ID studente obbligatorio"],
    },

    // Subject name (e.g., "Matematica", "Inglese")
    nome: {
      type: String,
      required: [true, "Nome materia obbligatorio"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Validation: max 15 subjects per student
materieSchema.pre("save", async function (next) {
  try {
    // Use this.model() to reference current model in pre-save hook
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
