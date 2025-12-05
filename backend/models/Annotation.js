import mongoose from "mongoose";

// Tutor annotations/notes about students
const annotazioniSchema = mongoose.Schema(
  {
    // Reference to Tutor collection - who created the note
    tutorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: [true, "ID tutor obbligatorio"],
    },

    // Reference to Student collection - who the note is about
    studenteID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "ID studente obbligatorio"],
    },

    // Note content
    testo: {
      type: String,
      required: [true, "Testo annotazione obbligatorio"],
      trim: true,
    },

    // When the note was created (auto-set)
    data: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Auto-adds createdAt, updatedAt
);

const Annotazioni = mongoose.model(
  "Annotation",
  annotazioniSchema,
  "Annotation"
);
export default Annotazioni;
