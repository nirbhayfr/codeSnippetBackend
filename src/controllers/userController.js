import User from "../models/User.js";
import Snippet from "../models/Snippet.js";
import Collection from "../models/Collection.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

export const getUserProfile = asyncHandler(async (req, res, next) => {
	const { username } = req.params;

	const user = await User.findOne({
		username: username.toLowerCase(),
	}).select("-password");

	if (!user) {
		throw new AppError("User not found", 404);
	}

	// Get user's public snippets count
	const snippetsCount = await Snippet.countDocuments({
		author: user._id,
		isPublic: true,
	});

	// Get user's public collections count
	const collectionsCount = await Collection.countDocuments({
		owner: user._id,
		isPublic: true,
	});

	res.json({
		...user.toObject(),
		stats: {
			snippets: snippetsCount,
			collections: collectionsCount,
			followers: user.followers.length,
			following: user.following.length,
		},
	});
});

export const getUserSnippets = asyncHandler(async (req, res, next) => {
	const { username } = req.params;
	const { page = 1, limit = 10 } = req.query;

	const user = await User.findOne({ username: username.toLowerCase() });

	if (!user) {
		throw new AppError("User not found", 404);
	}

	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

	const snippets = await Snippet.find({
		author: user._id,
		isPublic: true,
	})
		.sort({ createdAt: -1 })
		.skip((pageNum - 1) * limitNum)
		.limit(limitNum)
		.lean();

	const total = await Snippet.countDocuments({
		author: user._id,
		isPublic: true,
	});

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

export const followUser = asyncHandler(async (req, res, next) => {
	const { userId } = req.params;

	if (userId === req.userId) {
		throw new AppError("Cannot follow yourself", 400);
	}

	const userToFollow = await User.findById(userId);
	const currentUser = await User.findById(req.userId);

	if (!userToFollow || !currentUser) {
		throw new AppError("User not found", 404);
	}

	const isFollowing = currentUser.following.includes(userId);

	if (isFollowing) {
		// Unfollow
		currentUser.following = currentUser.following.filter(
			(id) => id.toString() !== userId,
		);
		userToFollow.followers = userToFollow.followers.filter(
			(id) => id.toString() !== req.userId,
		);
	} else {
		// Follow
		currentUser.following.push(userId);
		userToFollow.followers.push(req.userId);
	}

	await currentUser.save();
	await userToFollow.save();

	res.json({
		message: isFollowing ? "Unfollowed" : "Followed",
		isFollowing: !isFollowing,
	});
});
