import express from "express";
import {
  login,
  logout,
  registerComplete,
} from "../controllers/authController.js";

const router = express.Router();

// POST auth/login
router.post("/login", login);

// POST auth/register-complete
router.post("/register-complete", registerComplete);

// GET auth/logout
router.get("/logout", logout);

export default router;
