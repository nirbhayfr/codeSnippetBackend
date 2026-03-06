import Snippet from "../models/Snippet.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

export const createSnippet = asyncHandler(async (req, res, next) => {
	const { title, description, code, language, tags, isPublic } = req.body;

	if (!title || !code || !language) {
		throw new AppError("Title, code, and language are required", 400);
	}

	const snippet = new Snippet({
		title,
		description,
		code,
		language,
		tags: tags ? tags.map((tag) => tag.toLowerCase().trim()) : [],
		isPublic: isPublic !== undefined ? isPublic : true,
		author: req.userId,
	});

	await snippet.save();
	await snippet.populate("author", "username avatar");

	res.status(201).json(snippet);
});

export const getAllSnippets = asyncHandler(async (req, res, next) => {
	const { page = 1, limit = 10, sort = "-createdAt", language } = req.query;

	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

	let filter = { isPublic: true };
	if (language) {
		filter.language = language.toLowerCase();
	}

	const snippets = await Snippet.find(filter)
		.populate("author", "username avatar")
		.sort(sort)
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.lean();

	const total = await Snippet.countDocuments(filter);

	res.json({
		data: snippets,
		pagination: {
			total,
			pages: Math.ceil(total / limitNum),
			currentPage: pageNum,
			pageSize: limitNum,
		},
	});
});

export const getSnippetById = asyncHandler(async (req, res, next) => {
	const snippet = await Snippet.findByIdAndUpdate(
		req.params.id,
		{ $inc: { viewCount: 1 } },
		{ new: true },
	).populate("author", "username avatar bio");

	if (!snippet) {
		throw new AppError("Snippet not found", 404);
	}

	if (
		!snippet.isPublic &&
		snippet.author._id.toString() !== req.userId?.toString()
	) {
		throw new AppError("Access denied", 403);
	}

	res.json(snippet);
});

export const updateSnippet = asyncHandler(async (req, res, next) => {
	const { title, description, code, language, tags, isPublic } = req.body;

	const snippet = await Snippet.findById(req.params.id);

	if (!snippet) {
		throw new AppError("Snippet not found", 404);
	}

	if (snippet.author.toString() !== req.userId) {
		throw new AppError("Not authorized to update this snippet", 403);
	}

	if (title) snippet.title = title;
	if (description !== undefined) snippet.description = description;
	if (code) snippet.code = code;
	if (language) snippet.language = language;
	if (tags) snippet.tags = tags.map((tag) => tag.toLowerCase().trim());
	if (isPublic !== undefined) snippet.isPublic = isPublic;

	await snippet.save();
	await snippet.populate("author", "username avatar");

	res.json(snippet);
});

export const deleteSnippet = asyncHandler(async (req, res, next) => {
	const snippet = await Snippet.findById(req.params.id);

	if (!snippet) {
		throw new AppError("Snippet not found", 404);
	}

	if (snippet.author.toString() !== req.userId) {
		throw new AppError("Not authorized to delete this snippet", 403);
	}

	await Snippet.findByIdAndDelete(req.params.id);

	res.json({ message: "Snippet deleted successfully" });
});

export const searchSnippets = asyncHandler(async (req, res, next) => {
	const { query, language, tag, page = 1, limit = 10 } = req.query;

	if (!query) {
		throw new AppError("Search query is required", 400);
	}

	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

	let filter = { isPublic: true };

	if (query) {
		filter.$text = { $search: query };
	}

	if (language) {
		filter.language = language.toLowerCase();
	}

	if (tag) {
		filter.tags = tag.toLowerCase();
	}

	const snippets = await Snippet.find(filter)
		.populate("author", "username avatar")
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.sort({ createdAt: -1 })
		.lean();

	const total = await Snippet.countDocuments(filter);

	res.json({
		data: snippets,
		pagination: {
			total,
			pages: Math.ceil(total / limitNum),
			currentPage: pageNum,
			pageSize: limitNum,
		},
	});
});

export const getUserSnippets = asyncHandler(async (req, res, next) => {
	const { page = 1, limit = 10 } = req.query;

	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

	const snippets = await Snippet.find({ author: req.userId })
		.populate("author", "username avatar")
		.sort({ createdAt: -1 })
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.lean();

	const total = await Snippet.countDocuments({ author: req.userId });

	res.json({
		data: snippets,
		pagination: {
			total,
			pages: Math.ceil(total / limitNum),
			currentPage: pageNum,
			pageSize: limitNum,
		},
	});
});

export const upvoteSnippet = asyncHandler(async (req, res, next) => {
	const snippet = await Snippet.findById(req.params.id);

	if (!snippet) {
		throw new AppError("Snippet not found", 404);
	}

	const userIndex = snippet.upvotes.indexOf(req.userId);

	if (userIndex === -1) {
		snippet.upvotes.push(req.userId);
	} else {
		snippet.upvotes.splice(userIndex, 1);
	}

	await snippet.save();
	await snippet.populate("author", "username avatar");

	res.json(snippet);
});

export const getTrendingSnippets = asyncHandler(async (req, res, next) => {
	const { limit = 10, days = 7 } = req.query;

	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
	const dateFrom = new Date();
	dateFrom.setDate(dateFrom.getDate() - parseInt(days));

	const snippets = await Snippet.find({
		isPublic: true,
		createdAt: { $gte: dateFrom },
	})
		.populate("author", "username avatar")
		.sort({ upvotes: -1, viewCount: -1 })
		.limit(limitNum)
		.lean();

	res.json({
		data: snippets,
		period: `last ${days} days`,
	});
});
