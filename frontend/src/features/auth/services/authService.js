// ─── True FoodBite Auth Service ─────────────────────────────────────────────
// API base URL resolution:
//   - Production (Vercel): same-domain /api rewrites via vercel.json
//   - Local dev: http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
        ? '/api'
        : 'http://localhost:5000/api';

// ─── Safe JSON parser ─────────────────────────────────────────────────────────
// CRITICAL FIX: Always parse the body as text first, then attempt JSON.parse.
// This prevents "Unexpected end of JSON input" when the server returns an empty
// body (e.g. cold-start timeout, 502/503 gateway errors on Vercel).
async function safeParseJSON(response) {
    const text = await response.text();
    if (!text || text.trim() === '') {
        // Server returned empty body — generate a meaningful error
        return {
            message: response.status >= 500
                ? 'Server is starting up. Please wait a moment and try again.'
                : response.status === 0
                    ? 'Cannot reach server. Check your internet connection.'
                    : `Server error (${response.status}). Please try again.`
        };
    }
    try {
        return JSON.parse(text);
    } catch {
        // Body exists but is not valid JSON (e.g. HTML error page from Vercel)
        return {
            message: 'Server returned an unexpected response. Please try again in a moment.'
        };
    }
}

// ─── Fetch wrapper with timeout ───────────────────────────────────────────────
// Adds a 15-second timeout to every auth request to prevent hanging.
async function authFetch(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out. The server took too long to respond. Please try again.');
        }
        if (err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('network')) {
            throw new Error('Cannot connect to server. Please check your internet connection.');
        }
        throw err;
    }
}

// ─── Auth API Service ─────────────────────────────────────────────────────────
class AuthService {

    // ── Signup: Create account & send OTP ─────────────────────────────────────
    async signup(userData) {
        try {
            const response = await authFetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await safeParseJSON(response);

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed. Please try again.');
            }

            return { success: true, ...data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ── Verify OTP ────────────────────────────────────────────────────────────
    async verifyOTP(email, otp, type = 'signup') {
        try {
            const response = await authFetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, type }),
            });

            const data = await safeParseJSON(response);

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed. Please try again.');
            }

            // For signup, persist token and user
            if (type === 'signup' && data.token) {
                localStorage.setItem('factsscan_token', data.token);
                localStorage.setItem('factsscan_user', JSON.stringify(data.user));
            }

            return { success: true, ...data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ── Resend OTP ────────────────────────────────────────────────────────────
    async resendOTP(email, type = 'signup') {
        try {
            const response = await authFetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type }),
            });

            const data = await safeParseJSON(response);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP. Please try again.');
            }

            return { success: true, ...data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    async login(email, password) {
        try {
            const response = await authFetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await safeParseJSON(response);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            // Persist token and user
            if (data.token) {
                localStorage.setItem('factsscan_token', data.token);
            }
            if (data.user) {
                localStorage.setItem('factsscan_user', JSON.stringify(data.user));
            }

            return { success: true, ...data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ── Forgot Password ───────────────────────────────────────────────────────
    async forgotPassword(email) {
        try {
            const response = await authFetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await safeParseJSON(response);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP. Please try again.');
            }

            return { success: true, ...data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ── Reset Password ────────────────────────────────────────────────────────
    async resetPassword(email, newPassword) {
        try {
            const response = await authFetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: newPassword }),
            });

            const data = await safeParseJSON(response);

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed. Please try again.');
            }

            return { success: true, ...data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ── Logout ────────────────────────────────────────────────────────────────
    logout() {
        localStorage.removeItem('factsscan_token');
        localStorage.removeItem('factsscan_user');
        return { success: true, message: 'Logged out successfully' };
    }

    // ── Get current user from localStorage ────────────────────────────────────
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('factsscan_user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            // Corrupted localStorage entry – clear it
            localStorage.removeItem('factsscan_user');
            return null;
        }
    }

    // ── Check authentication status ────────────────────────────────────────────
    isAuthenticated() {
        const token = localStorage.getItem('factsscan_token');
        const user = this.getCurrentUser();
        return !!token && !!user;
    }

    // ── Get auth token ────────────────────────────────────────────────────────
    getToken() {
        return localStorage.getItem('factsscan_token');
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
