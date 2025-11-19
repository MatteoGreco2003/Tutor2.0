import express from "express";
import { login, logout } from "../controllers/authController.js";

const router = express.Router();

// POST auth/login
router.post("/login", login);

// GET auth/logout
router.get("/logout", logout);

export default router;
