import Comment from "../models/Comment.js";
import Snippet from "../models/Snippet.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

export const createComment = asyncHandler(async (req, res, next) => {
	const { content } = req.body;
	const { snippetId } = req.params;

	if (!content) {
		throw new AppError("Comment content is required", 400);
	}

	const snippet = await Snippet.findById(snippetId);

	if (!snippet) {
		throw new AppError("Snippet not found", 404);
	}

	const comment = new Comment({
		content,
		author: req.userId,
		snippet: snippetId,
	});

	await comment.save();
	await comment.populate("author", "username avatar");

	res.status(201).json(comment);
});

export const getSnippetComments = asyncHandler(async (req, res, next) => {
	const { snippetId } = req.params;
	const { page = 1, limit = 10 } = req.query;

	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

	const comments = await Comment.find({ snippet: snippetId })
		.populate("author", "username avatar")
		.sort({ createdAt: -1 })
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.lean();

	const total = await Comment.countDocuments({ snippet: snippetId });

	res.json({
		data: comments,
		pagination: {
			total,
			pages: Math.ceil(total / limitNum),
			currentPage: pageNum,
			pageSize: limitNum,
		},
	});
});

export const updateComment = asyncHandler(async (req, res, next) => {
	const { content } = req.body;
	const { commentId } = req.params;

	if (!content) {
		throw new AppError("Comment content is required", 400);
	}

	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw new AppError("Comment not found", 404);
	}

	if (comment.author.toString() !== req.userId) {
		throw new AppError("Not authorized to update this comment", 403);
	}

	comment.content = content;
	await comment.save();

	res.json(comment);
});

export const deleteComment = asyncHandler(async (req, res, next) => {
	const { commentId } = req.params;

	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw new AppError("Comment not found", 404);
	}

	if (comment.author.toString() !== req.userId) {
		throw new AppError("Not authorized to delete this comment", 403);
	}

	await Comment.findByIdAndDelete(commentId);

	res.json({ message: "Comment deleted successfully" });
});
