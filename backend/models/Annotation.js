import mongoose from "mongoose";

const annotazioniSchema = mongoose.Schema(
  {
    // L'_id viene generato automaticamente da MongoDB

    tutorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: [true, "ID tutor obbligatorio"],
    },

    studenteID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "ID studente obbligatorio"],
    },

    testo: {
      type: String,
      required: [true, "Testo annotazione obbligatorio"],
      trim: true,
    },

    data: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Annotazioni = mongoose.model(
  "Annotation",
  annotazioniSchema,
  "Annotation"
);
export default Annotazioni;
