// Backend API base URL
// On Vercel: frontend + backend share the same domain (truefoodbite.vercel.app)
// so /api routes are handled by backend/api/index.js via vercel.json rewrites.
// In local dev: falls back to localhost:5000.
const API_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
        ? '/api'  // Production: same-domain API (Vercel)
        : 'http://localhost:5000/api'; // Local dev

// Auth API Service - Connects to backend OTP system
class AuthService {
    // Signup - Step 1: Create user and send OTP
    async signup(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            return { success: true, ...data };
        } catch (error) {
            // Handle network errors (backend not running)
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Cannot connect to server. Please make sure the backend is running on port 5000.' };
            }
            return { success: false, error: error.message };
        }
    }

    // Verify OTP - Step 2: Verify email or password reset OTP
    async verifyOTP(email, otp, type = 'signup') {
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, type }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }

            // For signup, save token and user data
            if (type === 'signup' && data.token) {
                localStorage.setItem('factsscan_token', data.token);
                localStorage.setItem('factsscan_user', JSON.stringify(data.user));
            }

            return { success: true, ...data };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Cannot connect to server. Please make sure the backend is running.' };
            }
            return { success: false, error: error.message };
        }
    }

    // Resend OTP
    async resendOTP(email, type = 'signup') {
        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, type }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            return { success: true, ...data };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Cannot connect to server. Please make sure the backend is running.' };
            }
            return { success: false, error: error.message };
        }
    }

    // Login
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token and user data
            localStorage.setItem('factsscan_token', data.token);
            localStorage.setItem('factsscan_user', JSON.stringify(data.user));

            return { success: true, ...data };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Cannot connect to server. Please make sure the backend is running on port 5000.' };
            }
            return { success: false, error: error.message };
        }
    }

    // Forgot Password - Request OTP
    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            return { success: true, ...data };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Cannot connect to server. Please make sure the backend is running.' };
            }
            return { success: false, error: error.message };
        }
    }

    // Reset Password - After OTP verification
    async resetPassword(email, newPassword) {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            return { success: true, ...data };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Cannot connect to server. Please make sure the backend is running.' };
            }
            return { success: false, error: error.message };
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('factsscan_token');
        localStorage.removeItem('factsscan_user');
        return { success: true, message: 'Logged out successfully' };
    }

    // Get current user
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('factsscan_user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('factsscan_token');
        const user = this.getCurrentUser();
        return !!token && !!user;
    }

    // Get auth token
    getToken() {
        return localStorage.getItem('factsscan_token');
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
