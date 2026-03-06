import express from "express";
import {
	register,
	login,
	getCurrentUser,
	updateProfile,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);

export default router;
