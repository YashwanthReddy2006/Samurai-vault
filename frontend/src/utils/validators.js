/**
 * Validation utilities
 */

export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) return 'Invalid email format';
    return null;
};

export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 12) return 'Password must be at least 12 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain a number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain a special character';
    return null;
};

export const validateUsername = (username) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, underscores, and hyphens';
    return null;
};

export const validateUrl = (url) => {
    if (!url) return null; // Optional
    const pattern = /^https?:\/\/[^\s<>"{}|\\^`[\]]+$/;
    if (!pattern.test(url)) return 'Invalid URL format';
    return null;
};

export default {
    validateEmail,
    validatePassword,
    validateUsername,
    validateUrl,
};
