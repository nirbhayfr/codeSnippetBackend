export const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (password) => {
	return password.length >= 6;
};

export const validateUsername = (username) => {
	const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
	return usernameRegex.test(username);
};

export const validateUrl = (url) => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

export const validateTags = (tags) => {
	if (!Array.isArray(tags)) return false;
	return tags.every(
		(tag) =>
			typeof tag === "string" && tag.length > 0 && tag.length <= 20,
	);
};
