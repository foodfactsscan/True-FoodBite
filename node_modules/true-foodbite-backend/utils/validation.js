// Email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation - at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
export const validatePassword = (password) => {
    if (!password || password.length < 8) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

// Name validation - 2-50 characters, letters and spaces only
export const validateName = (name) => {
    if (!name || name.trim().length < 2 || name.trim().length > 50) return false;
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name.trim());
};

// Sanitize input - remove dangerous characters
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};
