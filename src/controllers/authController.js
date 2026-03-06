import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
	validateEmail,
	validatePassword,
	validateUsername,
} from "../utils/validators.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "7d",
	});
};

export const register = asyncHandler(async (req, res, next) => {
	const { username, email, password, confirmPassword } = req.body;

	// Validation
	if (!username || !email || !password || !confirmPassword) {
		throw new AppError("All fields are required", 400);
	}

	if (!validateUsername(username)) {
		throw new AppError(
			"Username must be 3-30 characters and contain only letters, numbers, underscore, and hyphen",
			400,
		);
	}

	if (!validateEmail(email)) {
		throw new AppError("Please provide a valid email", 400);
	}

	if (!validatePassword(password)) {
		throw new AppError("Password must be at least 6 characters", 400);
	}

	if (password !== confirmPassword) {
		throw new AppError("Passwords do not match", 400);
	}

	// Check if user exists
	const existingUser = await User.findOne({
		$or: [
			{ email: email.toLowerCase() },
			{ username: username.toLowerCase() },
		],
	});

	if (existingUser) {
		throw new AppError("User already exists", 400);
	}

	// Create user
	const user = new User({
		username: username.toLowerCase(),
		email: email.toLowerCase(),
		password,
	});

	await user.save();

	const token = generateToken(user._id);

	res.status(201).json({
		message: "User registered successfully",
		token,
		user: {
			id: user._id,
			username: user.username,
			email: user.email,
		},
	});
});

export const login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new AppError("Email and password are required", 400);
	}

	const user = await User.findOne({ email: email.toLowerCase() }).select(
		"+password",
	);

	if (!user) {
		throw new AppError("Invalid email or password", 401);
	}

	const isPasswordValid = await user.comparePassword(password);

	if (!isPasswordValid) {
		throw new AppError("Invalid email or password", 401);
	}

	const token = generateToken(user._id);

	res.json({
		message: "Logged in successfully",
		token,
		user: {
			id: user._id,
			username: user.username,
			email: user.email,
		},
	});
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.userId).select("-password");

	if (!user) {
		throw new AppError("User not found", 404);
	}

	res.json(user);
});

export const updateProfile = asyncHandler(async (req, res, next) => {
	const { bio, avatar, socialLinks } = req.body;

	const user = await User.findById(req.userId);

	if (!user) {
		throw new AppError("User not found", 404);
	}

	if (bio !== undefined) user.bio = bio;
	if (avatar !== undefined) user.avatar = avatar;
	if (socialLinks !== undefined) user.socialLinks = socialLinks;

	await user.save();

	res.json({
		message: "Profile updated successfully",
		user,
	});
});
