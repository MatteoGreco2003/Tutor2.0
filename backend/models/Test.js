import mongoose from "mongoose";

// Test/assessment schema - tracks student tests and grades
const verificheSchema = mongoose.Schema(
  {
    // References to Student and Subject collections
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

    // Test date (scheduled or completed)
    data: {
      type: Date,
      required: [true, "Data verifica obbligatoria"],
    },

    // Test topic/subject matter
    argomento: {
      type: String,
      required: [true, "Argomento verifica obbligatorio"],
      trim: true,
    },

    // Grade on Italian scale (0-10), null if not yet graded
    voto: {
      type: Number,
      min: [0, "Voto minimo è 0"],
      max: [10, "Voto massimo è 10"],
      default: null,
    },

    // true = test not yet taken, false = completed with grade
    votoFuturo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Validation: if test marked complete (votoFuturo=false), grade must be set
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
