import mongoose from "mongoose";

const SUPPORTED_LANGUAGES = [
	"javascript",
	"typescript",
	"python",
	"java",
	"cpp",
	"csharp",
	"php",
	"ruby",
	"go",
	"rust",
	"sql",
	"html",
	"css",
	"jsx",
	"tsx",
	"bash",
	"json",
	"yaml",
	"markdown",
];

const snippetSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [200, "Title cannot exceed 200 characters"],
		},
		description: {
			type: String,
			default: "",
			maxlength: [2000, "Description cannot exceed 2000 characters"],
		},
		code: {
			type: String,
			required: [true, "Code is required"],
		},
		language: {
			type: String,
			required: [true, "Language is required"],
			enum: {
				values: SUPPORTED_LANGUAGES,
				message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(", ")}`,
			},
		},
		tags: [
			{
				type: String,
				lowercase: true,
				trim: true,
			},
		],
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required"],
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
		upvotes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		viewCount: {
			type: Number,
			default: 0,
		},
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

snippetSchema.index(
	{
		title: "text",
		description: "text",
		tags: "text",
	},
	{
		language_override: "dummy",
	},
);

snippetSchema.index({ language: 1, isPublic: 1 });
snippetSchema.index({ author: 1 });
snippetSchema.index({ createdAt: -1 });

export default mongoose.model("Snippet", snippetSchema);
