// Simple in-memory rate limiter
const requests = new Map();

export const rateLimiter = (maxRequests, windowMinutes) => {
    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowMs = windowMinutes * 60 * 1000;

        if (!requests.has(identifier)) {
            requests.set(identifier, []);
        }

        const userRequests = requests.get(identifier);

        // Remove old requests outside the window
        const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

        if (validRequests.length >= maxRequests) {
            return res.status(429).json({
                message: `Too many requests. Please try again in ${windowMinutes} minutes.`
            });
        }

        validRequests.push(now);
        requests.set(identifier, validRequests);

        next();
    };
};
