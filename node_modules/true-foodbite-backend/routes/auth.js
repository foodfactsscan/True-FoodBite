import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from '../services/emailService.js';
import { validateEmail, validatePassword, validateName } from '../utils/validation.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
    );
};

// POST /api/auth/signup - Step 1: Create user and send OTP
router.post('/signup', rateLimiter(5, 15), async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validation
        if (!validateName(firstName)) {
            return res.status(400).json({ message: 'First name must be 2-50 characters' });
        }
        if (!validateName(lastName)) {
            return res.status(400).json({ message: 'Last name must be 2-50 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        // Check if user already exists and is verified
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'Email already registered. Please login.' });
        }

        // If user exists but not verified, delete old user and OTPs
        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ email: email.toLowerCase() });
            await OTP.deleteMany({ email: email.toLowerCase() });
        }

        // Create new user (not verified yet)
        const user = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            isVerified: false
        });
        await user.save();

        // Generate and save OTP
        const otp = generateOTP();
        const otpDoc = new OTP({
            email: email.toLowerCase(),
            otp,
            type: 'signup',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });
        await otpDoc.save();

        // Send OTP email
        await sendOTPEmail(email, otp, 'signup');

        res.status(201).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email.toLowerCase()
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup. Please try again.' });
    }
});

// POST /api/auth/verify-otp - Step 2: Verify OTP
router.post('/verify-otp', rateLimiter(5, 15), async (req, res) => {
    try {
        const { email, otp, type } = req.body;

        if (!email || !otp || !type) {
            return res.status(400).json({ message: 'Email, OTP, and type are required' });
        }

        // Find OTP
        const otpDoc = await OTP.findOne({
            email: email.toLowerCase(),
            type,
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        // Check if expired
        if (new Date() > otpDoc.expiresAt) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Check attempts
        if (otpDoc.attempts >= 5) {
            return res.status(400).json({ message: 'Maximum attempts exceeded. Please request a new OTP.' });
        }

        // Verify OTP
        const isValid = await otpDoc.compareOTP(otp);
        if (!isValid) {
            await otpDoc.incrementAttempts();
            return res.status(400).json({
                message: `Invalid OTP. ${5 - otpDoc.attempts} attempts remaining.`
            });
        }

        // Mark OTP as verified
        otpDoc.verified = true;
        await otpDoc.save();

        if (type === 'signup') {
            // Verify user account
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.isVerified = true;
            user.lastLogin = new Date();
            await user.save();

            // Send welcome email
            await sendWelcomeEmail(email, user.firstName);

            // Generate token
            const token = generateToken(user._id);

            res.json({
                message: 'Email verified successfully! Welcome to True FoodBite.',
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isVerified: user.isVerified
                }
            });
        } else if (type === 'forgot-password') {
            res.json({
                message: 'OTP verified successfully. You can now reset your password.',
                email: email.toLowerCase()
            });
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error during OTP verification. Please try again.' });
    }
});

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', rateLimiter(3, 15), async (req, res) => {
    try {
        const { email, type } = req.body;

        if (!email || !type) {
            return res.status(400).json({ message: 'Email and type are required' });
        }

        // Check if user exists (for signup) or doesn't matter (for forgot-password)
        if (type === 'signup') {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.isVerified) {
                return res.status(400).json({ message: 'Email already verified. Please login.' });
            }
        }

        // Delete old OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase(), type });

        // Generate new OTP
        const otp = generateOTP();
        const otpDoc = new OTP({
            email: email.toLowerCase(),
            otp,
            type,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        await otpDoc.save();

        // Send OTP email
        await sendOTPEmail(email, otp, type);

        res.json({ message: 'New OTP sent to your email.' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/login - Login
router.post('/login', rateLimiter(5, 15), async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Email not verified. Please verify your email first.',
                needsVerification: true
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login. Please try again.' });
    }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', rateLimiter(3, 15), async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validateEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if email exists for security
            return res.json({ message: 'If the email exists, an OTP has been sent.' });
        }

        // Delete old password reset OTPs
        await OTP.deleteMany({ email: email.toLowerCase(), type: 'forgot-password' });

        // Generate and save OTP
        const otp = generateOTP();
        const otpDoc = new OTP({
            email: email.toLowerCase(),
            otp,
            type: 'forgot-password',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        await otpDoc.save();

        // Send OTP email
        await sendOTPEmail(email, otp, 'forgot-password');

        res.json({ message: 'If the email exists, an OTP has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/reset-password - Reset password with verified OTP
router.post('/reset-password', rateLimiter(3, 15), async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        // Check if there's a verified OTP
        const verifiedOTP = await OTP.findOne({
            email: email.toLowerCase(),
            type: 'forgot-password',
            verified: true
        }).sort({ createdAt: -1 });

        if (!verifiedOTP) {
            return res.status(400).json({ message: 'Please verify OTP first' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Delete all OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

export default router;
