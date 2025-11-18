import mongoose from "mongoose";
import bcrypt from "bcrypt";

const tutorSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email obbligatoria"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email non valida"],
    },
    password: {
      type: String,
      required: [true, "Password obbligatoria"],
      minlength: [8, "Minimo 8 caratteri"],
      select: false,
    },
    nome: {
      type: String,
      required: [true, "Nome obbligatorio"],
      trim: true,
    },
    cognome: {
      type: String,
      required: [true, "Cognome obbligatorio"],
      trim: true,
    },
    studentiAssociati: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Studente",
      },
    ],

    // Campi per reset password
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password
tutorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Tutor = mongoose.model("Tutor", tutorSchema);
export default Tutor;
