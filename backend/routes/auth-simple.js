import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/Otp.js';
import { sendOTPEmail, generateOTP, isSmtpConfigured } from '../services/emailService.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'truefoodbite-secure-jwt-secret-2026';
const JWT_EXPIRES_IN = '30d';

const isDevMode = () => !isSmtpConfigured();

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
    }
    req.userEmail = decoded.email;
    req.userId = decoded.id;
    next();
};

// ═══════════════════════════════════════════
// POST /api/auth/signup
// ═══════════════════════════════════════════
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const emailLower = email.toLowerCase().trim();

        // Check if already registered and verified
        const existing = await User.findOne({ email: emailLower });
        if (existing && existing.isVerified) {
            return res.status(400).json({ message: 'Email already registered. Please login.' });
        }

        // Upsert: create or overwrite unverified user
        if (existing) {
            existing.firstName = firstName;
            existing.lastName = lastName;
            existing.password = password; // will be hashed by pre-save hook
            await existing.save();
        } else {
            await User.create({ firstName, lastName, email: emailLower, password });
        }

        // Generate and Save OTP to DB (Persistent)
        const otp = generateOTP();
        await OTP.findOneAndUpdate(
            { email: emailLower, type: 'signup' },
            { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 },
            { upsert: true, new: true }
        );

        await sendOTPEmail(emailLower, otp, 'signup');

        const response = {
            success: true,
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: emailLower
        };
        if (isDevMode()) {
            response.devOtp = otp;
            response.message = 'DEV MODE: Your OTP is shown below. Enter it to verify.';
        }

        res.status(201).json(response);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// ═══════════════════════════════════════════
// POST /api/auth/verify-otp
// ═══════════════════════════════════════════
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, type } = req.body;
        const emailLower = email.toLowerCase().trim();
        
        // Find OTP in DB
        const otpData = await OTP.findOne({ email: emailLower, type });

        if (!otpData) {
            return res.status(400).json({ message: 'No OTP found or expired. Please request a new one.' });
        }
        if (Date.now() > otpData.expiresAt.getTime()) {
            await OTP.deleteOne({ _id: otpData._id });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        if (otpData.otp !== otp.trim()) {
            otpData.attempts++;
            if (otpData.attempts >= 5) {
                await OTP.deleteOne({ _id: otpData._id });
                return res.status(400).json({ message: 'Too many attempts. Request a new OTP.' });
            }
            await otpData.save();
            return res.status(400).json({ message: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` });
        }

        // Valid OTP!
        await OTP.deleteOne({ _id: otpData._id });

        if (type === 'signup') {
            const user = await User.findOne({ email: emailLower });
            if (!user) return res.status(404).json({ message: 'User not found' });

            user.isVerified = true;
            user.verifiedAt = new Date();
            await user.save();

            const token = generateToken(user);
            res.json({
                success: true,
                message: 'Email verified successfully!',
                token,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isVerified: true
                }
            });
        } else {
            res.json({ success: true, message: 'OTP Verified' });
        }
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// POST /api/auth/resend-otp
// ═══════════════════════════════════════════
router.post('/resend-otp', async (req, res) => {
    try {
        const { email, type } = req.body;
        const emailLower = email.toLowerCase().trim();

        if (type === 'forgot-password') {
            const exists = await User.findOne({ email: emailLower });
            if (!exists) return res.status(404).json({ message: 'No account found with this email' });
        }

        const otp = generateOTP();
        await OTP.findOneAndUpdate(
            { email: emailLower, type },
            { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 },
            { upsert: true, new: true }
        );

        await sendOTPEmail(emailLower, otp, type);

        const response = { success: true, message: 'New OTP sent' };
        if (isDevMode()) {
            response.devOtp = otp;
            response.message = 'DEV MODE: New OTP generated. Check below.';
        }
        res.json(response);
    } catch (error) {
        console.error('Resend error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const emailLower = email.toLowerCase().trim();

        // Must select password since it's select:false in schema
        const user = await User.findOne({ email: emailLower }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Email not verified. Please sign up again to verify.',
                needsVerification: true
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: true
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ═══════════════════════════════════════════
// POST /api/auth/forgot-password
// ═══════════════════════════════════════════
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const emailLower = email.toLowerCase().trim();

        const user = await User.findOne({ email: emailLower });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        const otp = generateOTP();
        await OTP.findOneAndUpdate(
            { email: emailLower, type: 'forgot-password' },
            { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 },
            { upsert: true, new: true }
        );

        await sendOTPEmail(emailLower, otp, 'forgot-password');

        const response = { success: true, message: 'Password reset OTP sent to your email' };
        if (isDevMode()) {
            response.devOtp = otp;
            response.message = 'DEV MODE: Password reset OTP generated. Check below.';
        }
        res.json(response);
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// POST /api/auth/reset-password
// ═══════════════════════════════════════════
router.post('/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const emailLower = email.toLowerCase().trim();
        const user = await User.findOne({ email: emailLower });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = password; // re-hashed by pre-save hook
        await user.save();
        
        // Final cleanup
        await OTP.deleteMany({ email: emailLower, type: 'forgot-password' });

        res.json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
