import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "No token provided" });
		}

		const token = authHeader.substring(7); // Remove "Bearer "

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		req.user = decoded;

		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token expired" });
		}
		return res.status(401).json({ error: "Invalid token" });
	}
};
