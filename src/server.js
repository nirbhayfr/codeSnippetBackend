import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import snippetRoutes from "./routes/snippets.js";
import collectionRoutes from "./routes/collections.js";
import commentRoutes from "./routes/comments.js";
import userRoutes from "./routes/users.js";

dotenv.config();
const app = express();
await connectDB();

const allowedOrigins = [
	"http://localhost:3000",
	"https://code-snippet-demo.vercel.app",
];

app.use(
	cors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check endpoint (for UptimeRobot)
app.get("/api/health", (req, res) => {
	res.json({
		status: "ok",
		timestamp: new Date(),
		uptime: process.uptime(),
	});
});

app.use((err, req, res, next) => {
	console.error("❌ Error:", err);

	if (err.name === "ValidationError") {
		return res.status(400).json({ error: err.message });
	}

	if (err.code === 11000) {
		const field = Object.keys(err.keyValue)[0];
		return res.status(400).json({ error: `${field} already exists` });
	}

	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({ error: "Invalid token" });
	}

	res.status(err.status || 500).json({
		error: err.message || "Something went wrong!",
	});
});

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
