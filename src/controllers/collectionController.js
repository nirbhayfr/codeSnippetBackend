import Collection from "../models/Collection.js";
import Snippet from "../models/Snippet.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

export const createCollection = asyncHandler(async (req, res, next) => {
	const { name, description, isPublic } = req.body;

	if (!name) {
		throw new AppError("Name is required", 400);
	}

	const collection = new Collection({
		name,
		description: description || "",
		isPublic: isPublic !== undefined ? isPublic : true,
		owner: req.userId,
	});

	await collection.save();
	await collection.populate("owner", "username avatar");

	res.status(201).json(collection);
});

export const getCollections = asyncHandler(async (req, res, next) => {
	const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

	const collections = await Collection.find({ isPublic: true })
		.populate("owner", "username avatar")
		.populate("snippets", "title")
		.sort(sort)
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.lean();

	const total = await Collection.countDocuments({ isPublic: true });

	res.json({
		data: collections,
		pagination: {
			total,
			pages: Math.ceil(total / limitNum),
			currentPage: pageNum,
			pageSize: limitNum,
		},
	});
});

export const getCollectionById = asyncHandler(async (req, res, next) => {
	const collection = await Collection.findById(req.params.id)
		.populate("owner", "username avatar bio")
		.populate("snippets")
		.populate("collaborators", "username avatar");

	if (!collection) {
		throw new AppError("Collection not found", 404);
	}

	if (
		!collection.isPublic &&
		collection.owner._id.toString() !== req.userId?.toString()
	) {
		throw new AppError("Access denied", 403);
	}

	res.json(collection);
});

export const updateCollection = asyncHandler(async (req, res, next) => {
	const { name, description, isPublic } = req.body;

	const collection = await Collection.findById(req.params.id);

	if (!collection) {
		throw new AppError("Collection not found", 404);
	}

	if (collection.owner.toString() !== req.userId) {
		throw new AppError("Not authorized to update this collection", 403);
	}

	if (name) collection.name = name;
	if (description !== undefined) collection.description = description;
	if (isPublic !== undefined) collection.isPublic = isPublic;

	await collection.save();

	res.json(collection);
});

export const deleteCollection = asyncHandler(async (req, res, next) => {
	const collection = await Collection.findById(req.params.id);

	if (!collection) {
		throw new AppError("Collection not found", 404);
	}

	if (collection.owner.toString() !== req.userId) {
		throw new AppError("Not authorized to delete this collection", 403);
	}

	await Collection.findByIdAndDelete(req.params.id);

	res.json({ message: "Collection deleted successfully" });
});

export const addSnippetToCollection = asyncHandler(async (req, res, next) => {
	const { snippetId } = req.body;

	if (!snippetId) {
		throw new AppError("Snippet ID is required", 400);
	}

	const collection = await Collection.findById(req.params.id);
	const snippet = await Snippet.findById(snippetId);

	if (!collection) {
		throw new AppError("Collection not found", 404);
	}

	if (!snippet) {
		throw new AppError("Snippet not found", 404);
	}

	if (collection.owner.toString() !== req.userId) {
		throw new AppError("Not authorized", 403);
	}

	if (!collection.snippets.includes(snippetId)) {
		collection.snippets.push(snippetId);
		await collection.save();
	}

	res.json(collection);
});

export const removeSnippetFromCollection = asyncHandler(
	async (req, res, next) => {
		const { snippetId } = req.body;

		if (!snippetId) {
			throw new AppError("Snippet ID is required", 400);
		}

		const collection = await Collection.findById(req.params.id);

		if (!collection) {
			throw new AppError("Collection not found", 404);
		}

		if (collection.owner.toString() !== req.userId) {
			throw new AppError("Not authorized", 403);
		}

		collection.snippets = collection.snippets.filter(
			(id) => id.toString() !== snippetId,
		);
		await collection.save();

		res.json(collection);
	},
);

export const getUserCollections = asyncHandler(async (req, res, next) => {
	const { page = 1, limit = 10 } = req.query;

	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

	const collections = await Collection.find({ owner: req.userId })
		.populate("owner", "username avatar")
		.populate("snippets", "title")
		.sort({ createdAt: -1 })
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.lean();

	const total = await Collection.countDocuments({ owner: req.userId });

	res.json({
		data: collections,
		pagination: {
			total,
			pages: Math.ceil(total / limitNum),
			currentPage: pageNum,
			pageSize: limitNum,
		},
	});
});
