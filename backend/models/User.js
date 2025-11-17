import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    nome: {
      type: String,
      require: True,
    },
    cognome: {
      type: String,
      require: True,
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
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
        "La password deve contenere maiuscole, minuscole e numeri",
      ],
      select: false,
    },
    tipo: {
      type: String,
      enum: ["tutor", "studente"],
      default: "studente",
    },
    consentiGDPR: {
      type: Boolean,
      require: [true, "Consenso GDPR obbligatorio"],
    },
    GDPRdata: {
      type: Date,
      default: Date.now,
    },
    // Dati specifici dello studente
    telefono: {
      type: String,
      trim: true,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        "Inserisci un numero di telefono valido con prefisso (es: +39 3201234567)",
      ],
    },
    gradoScolastico: {
      type: String,
      enum: ["elementari", "medie", "superiori"],
      required: [true, "Grado scolastico obbligatorio"],
    },

    indirizzoScolastico: {
      type: String,
      enum: ["Liceo", "Tecnico", "Professionale"],
      required: [
        function () {
          return this.gradoScolastico === "superiori";
        },
        "Grado scolastico 'superiori' obbligatorio",
      ],
    },

    // Dati specifici della famiglia
    emailFamiglia: {
      type: String,
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

    // Riferimenti ad altre collezioni (relazioni)
    // SEZIONE TUTOR
    studentiAssociati: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: function (value) {
            return mongoose.Types.ObjectId.isValid(value);
          },
          message: "ID studente non valido",
        },
      },
    ],
  },
  { timesamps: true }
); //TODO oggetto annidato per gen1 e 2 mancano nome e cognome e singoli telefoni o email

const User = mongoose.model("User", userSchema);
