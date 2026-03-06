import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			default: "",
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Owner is required"],
		},
		snippets: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Snippet",
			},
		],
		isPublic: {
			type: Boolean,
			default: true,
		},
		collaborators: [
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

collectionSchema.index({ owner: 1, isPublic: 1 });

export default mongoose.model("Collection", collectionSchema);
