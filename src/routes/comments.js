import express from "express";
import {
	createComment,
	getSnippetComments,
	updateComment,
	deleteComment,
} from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/snippet/:snippetId", getSnippetComments);
router.post("/snippet/:snippetId", authMiddleware, createComment);
router.put("/:commentId", authMiddleware, updateComment);
router.delete("/:commentId", authMiddleware, deleteComment);

export default router;
