import express from "express";
import {
  getStudentData,
  deleteStudentProfile,
  updateStudentPersonalData,
  updateStudentPassword,
  updateStudentFamilyData,
  updateStudentSchoolData,
} from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /student/data - Ottieni dati profilo studente
router.get("/data", verifyToken, getStudentData);

// DELETE /student/profile - Elimina profilo (protetta)
router.delete("/profile", verifyToken, deleteStudentProfile);

// PATCH /student/personal - Aggiorna dati personali
router.patch("/personal", verifyToken, updateStudentPersonalData);

// PATCH /student/password - Aggiorna password
router.patch("/password", verifyToken, updateStudentPassword);

// PATCH /student/family - Aggiorna dati famiglia
router.patch("/family", verifyToken, updateStudentFamilyData);

// PATCH /student/school - Aggiorna dati scuola
router.patch("/school", verifyToken, updateStudentSchoolData);

export default router;
