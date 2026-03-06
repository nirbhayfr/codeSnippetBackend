import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			lowercase: true,
			trim: true,
			minlength: [3, "Username must be at least 3 characters"],
			maxlength: [30, "Username cannot exceed 30 characters"],
			match: [
				/^[a-zA-Z0-9_-]+$/,
				"Username can only contain letters, numbers, underscore and hyphen",
			],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			match: [/.+\@.+\..+/, "Please provide a valid email"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false, // Don't return password by default
		},
		avatar: {
			type: String,
			default: null,
		},
		bio: {
			type: String,
			default: "",
			maxlength: [500, "Bio cannot exceed 500 characters"],
		},
		socialLinks: {
			github: {
				type: String,
				default: null,
			},
			twitter: {
				type: String,
				default: null,
			},
			website: {
				type: String,
				default: null,
			},
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
		return;
	}

	try {
		const salt = await bcryptjs.genSalt(10);
		this.password = await bcryptjs.hash(this.password, salt);
		// next();
	} catch (error) {
		throw error;
	}
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (inputPassword) {
	return await bcryptjs.compare(inputPassword, this.password);
};

// Remove password from output
userSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

export default mongoose.model("User", userSchema);
