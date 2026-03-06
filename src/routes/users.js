import express from "express";
import {
	getUserProfile,
	getUserSnippets,
	followUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/:username", getUserProfile);
router.get("/:username/snippets", getUserSnippets);
router.post("/:userId/follow", authMiddleware, followUser);

export default router;
