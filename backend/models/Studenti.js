import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentiSchema = mongoose.Schema(
  {
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
    email: {
      type: String,
      required: [true, "Email è obbligatoria"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Inserisci un indirizzo email valido",
      ],
    },
    password: {
      type: String,
      required: [true, "Password obbligatoria"],
      minlength: [8, "Minimo 8 caratteri"],
      select: false,
    },
    consentiGDPR: {
      type: Boolean,
      required: [true, "Consenso GDPR obbligatorio"],
    },
    GDPRdata: {
      type: Date,
      default: Date.now,
    },

    telefono: {
      type: String,
      required: [true, "Telefono obbligatorio"],
      trim: true,
      match: [
        /^[0-9]{10}$/,
        "Inserisci un numero di telefono valido (10 cifre)",
      ],
    },
    gradoScolastico: {
      type: String,
      enum: ["Elementari", "Medie", "Superiori"],
      required: [true, "Grado scolastico obbligatorio"],
    },
    indirizzoScolastico: {
      type: String,
      enum: [null, "Liceo", "Tecnico", "Professionale"],
    },

    // ===== GENITORE 1 (con default vuoto) =====
    genitore1: {
      type: {
        nome: {
          type: String,
          required: [true, "Nome genitore1 obbligatorio"],
          trim: true,
        },
        cognome: {
          type: String,
          required: [true, "Cognome genitore1 obbligatorio"],
          trim: true,
        },
        telefono: {
          type: String,
          required: [true, "Telefono genitore1 obbligatorio"],
          trim: true,
          match: [/^[0-9]{10}$/, "Numero di telefono non valido"],
        },
      },
      default: {},
    },

    // ===== GENITORE 2 (con default undefined) =====
    genitore2: {
      type: {
        nome: { type: String, trim: true },
        cognome: { type: String, trim: true },
        telefono: {
          type: String,
          trim: true,
          match: [/^[0-9]{10}$/, "Numero di telefono non valido"],
        },
      },
      default: undefined,
    },

    emailFamiglia: {
      type: String,
      required: [true, "Email famiglia obbligatoria"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email famiglia non valida"],
    },

    emailInsegnanti: [
      {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email insegnante non valida"],
      },
    ],

    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password
studentiSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Validazione: max 5 email insegnanti per studente
studentiSchema.pre("save", function (next) {
  if (Array.isArray(this.emailInsegnanti) && this.emailInsegnanti.length > 5) {
    return next(new Error("Puoi associare massimo 5 email insegnanti"));
  }
  next();
});

const Studente = mongoose.model("Studente", studentiSchema);
export default Studente;
