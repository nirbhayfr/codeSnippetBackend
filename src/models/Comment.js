import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
		content: {
			type: String,
			required: [true, "Comment content is required"],
			maxlength: [1000, "Comment cannot exceed 1000 characters"],
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required"],
		},
		snippet: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Snippet",
			required: [true, "Snippet is required"],
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

commentSchema.index({ snippet: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);
