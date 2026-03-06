import express from "express";
import {
	createCollection,
	getCollections,
	getCollectionById,
	updateCollection,
	deleteCollection,
	addSnippetToCollection,
	removeSnippetFromCollection,
	getUserCollections,
} from "../controllers/collectionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getCollections);
router.get("/:id", getCollectionById);

// Protected routes
router.post("/", authMiddleware, createCollection);
router.put("/:id", authMiddleware, updateCollection);
router.delete("/:id", authMiddleware, deleteCollection);
router.post("/:id/snippets", authMiddleware, addSnippetToCollection);
router.delete("/:id/snippets", authMiddleware, removeSnippetFromCollection);
router.get("/user/my-collections", authMiddleware, getUserCollections);

export default router;
