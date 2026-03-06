import express from "express";
import {
	createSnippet,
	getAllSnippets,
	getSnippetById,
	updateSnippet,
	deleteSnippet,
	searchSnippets,
	getUserSnippets,
	upvoteSnippet,
	getTrendingSnippets,
} from "../controllers/snippetController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllSnippets);
router.get("/trending", getTrendingSnippets);
router.get("/search", searchSnippets);
router.get("/:id", authMiddleware, getSnippetById);

// Protected routes
router.post("/", authMiddleware, createSnippet);
router.put("/:id", authMiddleware, updateSnippet);
router.delete("/:id", authMiddleware, deleteSnippet);
router.post("/:id/upvote", authMiddleware, upvoteSnippet);
router.get("/user/my-snippets", authMiddleware, getUserSnippets);

export default router;
