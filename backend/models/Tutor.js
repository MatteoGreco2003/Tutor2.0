import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Tutor account schema with authentication and student management
const tutorSchema = mongoose.Schema(
  {
    // Primary login credential - unique and case-insensitive
    email: {
      type: String,
      required: [true, "Email obbligatoria"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email non valida"],
    },

    // Hashed with bcrypt in pre-save hook
    password: {
      type: String,
      required: [true, "Password obbligatoria"],
      minlength: [8, "Minimo 8 caratteri"],
    },

    // Tutor first and last name
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

    // Array of student IDs this tutor teaches
    // Add: $push, Remove: $pull
    studentiAssociati: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    // Password reset fields - set during forgot password flow
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true } // Auto-adds createdAt, updatedAt
);

// Auto-hash password before saving (only if modified)
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

const Tutor = mongoose.model("Tutor", tutorSchema, "Tutor");
export default Tutor;
