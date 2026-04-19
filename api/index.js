/**
 * True FoodBite - Vercel Serverless Function Entry Point
 * 
 * This file is INTENTIONALLY self-contained. Vercel builds and runs this file
 * in an isolated sandbox. Cross-directory imports (e.g. from ../backend/)
 * cause dependency resolution failures because Vercel only installs packages
 * from the package.json closest to this file.
 * 
 * All backend logic is either inlined here or imported from sibling files
 * within the /api directory that Vercel correctly bundles.
 * 
 * April 19, 2026
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        if (origin.endsWith('.vercel.app') && (origin.includes('truefoodbite') || origin.includes('true-foodbite'))) {
            return callback(null, true);
        }
        if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
            return callback(null, true);
        }
        callback(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection (cached for Vercel warm containers) ───────────────────
let connectionPromise = null;

async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    if (connectionPromise) return connectionPromise;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set.');

    connectionPromise = mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
    }).then(() => {
        console.log('✅ MongoDB connected');
        connectionPromise = null;
    }).catch(err => {
        connectionPromise = null;
        throw err;
    });

    return connectionPromise;
}

mongoose.connection.on('disconnected', () => { connectionPromise = null; });
mongoose.connection.on('error', () => { connectionPromise = null; });

// ─── User Model ───────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 6, select: false },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    lastLogin:  { type: Date, default: null },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ─── Profile Model ────────────────────────────────────────────────────────────
const ProfileSchema = new mongoose.Schema({
    email:       { type: String, required: true, unique: true, lowercase: true },
    firstName:   String,
    lastName:    String,
    profilePhoto: String,
    gender:      String,
    age:         Number,
    heightCm:    Number,
    weightKg:    Number,
    goal:        String,
    chronicDiseases:    { type: [String], default: [] },
    temporaryIssues:    { type: [String], default: [] },
    customHealthIssues: { type: [String], default: [] },
    customGoals:        { type: [String], default: [] },
    history:   { type: Array, default: [] },
    favorites: { type: Array, default: [] },
    notes:     { type: Array, default: [] },
    intake:    { type: Array, default: [] },
}, { timestamps: true });

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

// ─── JWT Helpers ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'truefoodbite-dev-secret-change-in-production';

function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

function authenticateToken(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        req.userEmail = decoded.email;
        req.userId    = decoded.id;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
    }
}

// ─── OTP Helpers ──────────────────────────────────────────────────────────────
const otps = new Map(); // In-memory OTP store (per warm container)

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

async function sendOTPEmail(email, otp, purpose) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`\n[DEV MODE] OTP for ${email}: ${otp}\n`);
        return true;
    }
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        const subject = purpose === 'signup'
            ? 'True FoodBite - Verify Your Email'
            : 'True FoodBite - Password Reset OTP';
        await transporter.sendMail({
            from: `"True FoodBite" <${process.env.SMTP_USER}>`,
            to: email,
            subject,
            html: `
                <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#fff;padding:32px;border-radius:16px;border:1px solid #e5e7eb">
                  <h2 style="color:#7c3aed;margin-bottom:8px">🔐 True FoodBite</h2>
                  <p style="color:#374151">${purpose === 'signup' ? 'Verify your email to complete registration.' : 'Your password reset OTP is below.'}</p>
                  <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
                    <p style="margin:0;color:#6b7280;font-size:13px;font-weight:600;letter-spacing:1px">YOUR OTP CODE</p>
                    <div style="font-size:42px;font-weight:800;letter-spacing:10px;color:#7c3aed;margin:12px 0">${otp}</div>
                    <p style="margin:0;color:#ef4444;font-size:13px;font-weight:600">⏱️ Valid for 5 minutes only</p>
                  </div>
                  <p style="color:#9ca3af;font-size:12px;margin-top:24px">Do not share this OTP. Our team will never ask for it.</p>
                </div>
            `,
        });
        console.log(`✅ OTP email sent to ${email}`);
        return true;
    } catch (err) {
        console.error('Email error:', err.message);
        console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);
        return true; // Never block user flow on email failure
    }
}

// ─── Live News Store (In-memory cache) ────────────────────────────────────────
let newsCache = { data: [], timestamp: 0 };
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchLiveNews() {
    if (Date.now() - newsCache.timestamp < NEWS_CACHE_TTL && newsCache.data.length > 0) {
        return newsCache.data;
    }

    try {
        console.log('📰 Fetching live food safety news...');
        // Query focused on Indian food safety and alerts
        const queries = [
            'food safety India news',
            'FSSAI notifications 2024',
            'Indian food alert report',
            'food adulteration caught in India'
        ];
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(randomQuery)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        if (!response.ok) throw new Error(`News fetch failed: ${response.status}`);
        const xml = await response.text();
        
        const items = [];
        // More robust item split that handles line breaks and nested tags better
        const itemBlocks = xml.split('<item>').slice(1);

        for (const block of itemBlocks) {
            const cleanBlock = block.split('</item>')[0];
            
            // Helper to extract content from tags (including CDATA)
            const getTag = (tag) => {
                const match = cleanBlock.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
                if (!match) return '';
                let val = match[1];
                if (val.includes('<![CDATA[')) {
                    val = val.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
                }
                return val.trim();
            };

            const title = getTag('title');
            const link = getTag('link');
            const source = cleanBlock.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Industry Update';
            const pubDate = getTag('pubDate');

            if (title && link) {
                let cleanTitle = title.split(' - ')[0].trim();
                cleanTitle = cleanTitle
                    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
                    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'")
                    .replace(/[\n\r]+/g, ' ');

                items.push({
                    title: cleanTitle,
                    link,
                    source,
                    date: pubDate,
                    id: crypto.createHash('md5').update(link).digest('hex')
                });
            }
            if (items.length >= 12) break;
        }

        console.log(`✅ Successfully fetched ${items.length} news items.`);
        
        if (items.length === 0) {
            console.warn('⚠️ No news items parsed from feed.');
        }

        newsCache = { data: items, timestamp: Date.now() };
        return items;
    } catch (err) {
        console.error('❌ News service error:', err.message);
        return newsCache.data;
    }
}

// ─── DB middleware ────────────────────────────────────────────────────────────
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection failed:', err.message);
        return res.status(503).json({ message: 'Database temporarily unavailable. Please try again.' });
    }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'True FoodBite API is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
    });
});

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

// GET /api/news - Fetch live food industry news
app.get('/api/news', async (req, res) => {
    try {
        const news = await fetchLiveNews();
        res.json({ success: true, count: news.length, news });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch news' });
    }
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const emailLower = email.toLowerCase().trim();
        const existing = await User.findOne({ email: emailLower });
        if (existing && existing.isVerified) {
            return res.status(400).json({ message: 'Email already registered. Please login.' });
        }
        if (existing) {
            existing.firstName = firstName;
            existing.lastName  = lastName;
            existing.password  = password;
            await existing.save();
        } else {
            await User.create({ firstName, lastName, email: emailLower, password });
        }
        const otp = generateOTP();
        otps.set(emailLower, { otp, type: 'signup', expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
        await sendOTPEmail(emailLower, otp, 'signup');
        const response = { success: true, message: 'OTP sent to your email. Please verify to complete registration.', email: emailLower };
        if (isDevMode()) { response.devOtp = otp; response.message = 'DEV MODE: Your OTP is shown below.'; }
        return res.status(201).json(response);
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Server error during signup. Please try again.' });
    }
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp, type } = req.body;
        const emailLower  = email.toLowerCase().trim();
        const otpData     = otps.get(emailLower);
        if (!otpData || otpData.type !== type) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }
        if (Date.now() > otpData.expiresAt) {
            otps.delete(emailLower);
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        if (otpData.otp !== otp.trim()) {
            otpData.attempts++;
            if (otpData.attempts >= 5) { otps.delete(emailLower); return res.status(400).json({ message: 'Too many attempts. Request a new OTP.' }); }
            return res.status(400).json({ message: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` });
        }
        otps.delete(emailLower);
        if (type === 'signup') {
            const user = await User.findOne({ email: emailLower });
            if (!user) return res.status(404).json({ message: 'User not found' });
            user.isVerified = true;
            user.verifiedAt = new Date();
            await user.save();
            const token = generateToken(user);
            return res.json({ success: true, message: 'Email verified! Welcome to True FoodBite.', token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, isVerified: true } });
        }
        return res.json({ success: true, message: 'OTP verified.' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/resend-otp
app.post('/api/auth/resend-otp', async (req, res) => {
    try {
        const { email, type } = req.body;
        const emailLower = email.toLowerCase().trim();
        if (type === 'forgot-password') {
            const exists = await User.findOne({ email: emailLower });
            if (!exists) return res.status(404).json({ message: 'No account found with this email' });
        }
        const otp = generateOTP();
        otps.set(emailLower, { otp, type, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
        await sendOTPEmail(emailLower, otp, type);
        const response = { success: true, message: 'New OTP sent to your email.' };
        if (isDevMode()) { response.devOtp = otp; response.message = 'DEV MODE: New OTP generated.'; }
        return res.json(response);
    } catch (err) {
        console.error('Resend OTP error:', err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const emailLower = email.toLowerCase().trim();
        const user = await User.findOne({ email: emailLower }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please sign up again to verify.', needsVerification: true });
        }
        user.lastLogin = new Date();
        await user.save();
        const token = generateToken(user);
        return res.json({ success: true, message: 'Login successful', token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, isVerified: true } });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error during login. Please try again.' });
    }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const emailLower = req.body.email?.toLowerCase().trim();
        if (!emailLower) return res.status(400).json({ message: 'Email is required' });
        const user = await User.findOne({ email: emailLower });
        if (!user) return res.status(404).json({ message: 'No account found with this email' });
        const otp = generateOTP();
        otps.set(emailLower, { otp, type: 'forgot-password', expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
        await sendOTPEmail(emailLower, otp, 'forgot-password');
        const response = { success: true, message: 'Password reset OTP sent to your email.' };
        if (isDevMode()) { response.devOtp = otp; response.message = 'DEV MODE: Check OTP below.'; }
        return res.json(response);
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const emailLower = email.toLowerCase().trim();
        const user = await User.findOne({ email: emailLower });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.password = password;
        await user.save();
        otps.delete(emailLower);
        return res.json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// ─── PROFILE ROUTES ───────────────────────────────────────────────────────────

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.userEmail });
        return res.json({ success: true, profile: profile || null });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const fields = ['firstName','lastName','profilePhoto','gender','age','heightCm','weightKg','goal',
                        'chronicDiseases','temporaryIssues','customHealthIssues','customGoals'];
        const update = { email: req.userEmail };
        fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
        const profile = await Profile.findOneAndUpdate({ email: req.userEmail }, { $set: update }, { new: true, upsert: true, runValidators: true });
        return res.json({ success: true, message: 'Profile updated', profile });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/profile/history', authenticateToken, async (req, res) => {
    try {
        const { barcode, productName, brand, image, grade } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode required' });
        const item = { barcode, productName: productName || 'Unknown', brand: brand || '', image: image || '', grade: grade || '?', scannedAt: new Date() };
        await Profile.findOneAndUpdate({ email: req.userEmail }, { $pull: { history: { barcode } } }, { upsert: true });
        const profile = await Profile.findOneAndUpdate({ email: req.userEmail }, { $push: { history: { $each: [item], $position: 0, $slice: 50 } } }, { new: true });
        return res.json({ success: true, history: profile.history });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/profile/favorites', authenticateToken, async (req, res) => {
    try {
        const { barcode, productName, brand, image } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode required' });
        let profile = await Profile.findOne({ email: req.userEmail });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        const isFav = profile.favorites.some(f => f.barcode === barcode);
        if (isFav) { profile.favorites = profile.favorites.filter(f => f.barcode !== barcode); }
        else { profile.favorites.unshift({ barcode, productName, brand, image, timestamp: new Date() }); }
        await profile.save();
        return res.json({ success: true, favorites: profile.favorites });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/profile/notes', authenticateToken, async (req, res) => {
    try {
        const { barcode, text } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode required' });
        let profile = await Profile.findOne({ email: req.userEmail });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        profile.notes = profile.notes.filter(n => n.barcode !== barcode);
        if (text && text.trim()) profile.notes.push({ barcode, text: text.trim(), updatedAt: new Date() });
        await profile.save();
        return res.json({ success: true, notes: profile.notes });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/profile/intake', authenticateToken, async (req, res) => {
    try {
        const { barcode, name, grams, nutrients } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode required' });
        let profile = await Profile.findOne({ email: req.userEmail });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        profile.intake.unshift({ barcode, name, grams: grams || 100, timestamp: new Date(), nutrients: nutrients || {} });
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
        profile.intake = profile.intake.filter(e => new Date(e.timestamp) > cutoff);
        await profile.save();
        return res.json({ success: true, intake: profile.intake });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ─── AI ROUTES ────────────────────────────────────────────────────────────────

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history, productContext } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.json({ success: true, reply: getAIFallback(message), isRuleBased: true });
        }
        const systemContext = `You are True FoodBite AI BOT, a friendly food safety and nutrition expert for an Indian food scanner app. Answer concisely and accurately based on FSSAI, WHO, ICMR-NIN guidelines. ${productContext || ''}`;
        const contents = [];
        if (history?.length) {
            history.slice(-6).forEach(m => contents.push({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
        }
        contents.push({ role: 'user', parts: [{ text: message }] });
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemInstruction: { parts: [{ text: systemContext }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 512 } }),
        });
        if (!geminiRes.ok) return res.json({ success: true, reply: getAIFallback(message), isRuleBased: true });
        const data = await geminiRes.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || getAIFallback(message);
        return res.json({ success: true, reply });
    } catch (err) {
        console.error('AI chat error:', err);
        return res.json({ success: true, reply: getAIFallback(req.body?.message || ''), isRuleBased: true });
    }
});

function getAIFallback(message) {
    const msg = message.toLowerCase();
    if (msg.includes('diabet')) return 'For diabetes, limit added sugars to <25g/day and avoid refined carbs (maida). Choose foods with ≥6g fibre per 100g. Avoid NOVA Group 4 ultra-processed products which often contain hidden sugars.';
    if (msg.includes('blood pressure') || msg.includes('hypertens') || /\bbp\b/.test(msg)) return 'For hypertension, keep sodium under 2000mg/day. Avoid products with >600mg sodium per 100g. Watch for hidden sodium in Sodium Benzoate (E211), MSG (E621) and baking powder.';
    if (msg.includes('heart') || msg.includes('cholesterol')) return 'For heart health, avoid trans fats entirely (look for "Partially Hydrogenated Oil"). Limit saturated fat to <10% of daily calories. Choose products with NOVA Grade 1 or 2.';
    if (msg.includes('sugar')) return 'WHO recommends <25g added sugar per day. Watch for hidden sugars: Maltodextrin, Dextrose, HFCS, Rice Syrup. Aspartame (E951) is classified as "possibly carcinogenic" by IARC — best avoided.';
    if (msg.includes('sodium') || msg.includes('salt')) return 'Safe sodium limit is <2000mg/day. One pack of instant noodles contains ~1200mg (60% of daily limit). High sodium directly causes chronic hypertension over time.';
    if (msg.includes('nova') || msg.includes('ultra')) return 'NOVA Group 1: Unprocessed (fruits, oats). Group 2: Culinary ingredients (butter). Group 3: Processed (canned beans). Group 4: Ultra-processed (biscuits, instant noodles). Regular Group 4 consumption increases mortality risk by 31%.';
    if (msg.includes('protein')) return 'ICMR recommends 0.8-1g protein per kg of body weight daily. Quality matters: Whey and Eggs score PDCAAS 1.0 (perfect absorption). Wheat protein scores only 0.42 — don\'t rely on wheat-based snacks for protein.';
    if (/hi|hello|hey|help/.test(msg)) return 'Hi! 👋 I\'m True FoodBite AI BOT. Ask me about food safety, ingredients, E-numbers, nutrition for diabetes, heart health, PCOS, NOVA classifications and more. How may I help you?';
    return 'I specialise in food science, nutritional verification, and ingredient safety. Ask me about additives, health conditions, NOVA classification, or specific ingredients. How may I help you?';
}

// ─── Products proxy route ─────────────────────────────────────────────────────
app.get('/api/products/:barcode', async (req, res) => {
    try {
        const { barcode } = req.params;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(200).json({ status: 0, message: 'Product not found' });
        const prompt = `You are a food product database for Indian packaged foods. Return ONLY valid JSON for barcode ${barcode}. If you know this product from training data, return: {"status":1,"product":{"product_name":"Name","brands":"Brand","quantity":"Xg","ingredients_text":"ingredients...","nutriments":{"energy_100g":0,"fat_100g":0,"saturated-fat_100g":0,"sugars_100g":0,"proteins_100g":0,"fiber_100g":0,"salt_100g":0,"sodium_100g":0,"carbohydrates_100g":0}}}. If unknown, return {"status":0}.`;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 512 } }),
        });
        if (!geminiRes.ok) return res.json({ status: 0 });
        const data = await geminiRes.json();
        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{"status":0}';
        text = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        try { return res.json(JSON.parse(text)); } catch { return res.json({ status: 0 }); }
    } catch (err) {
        console.error('Products error:', err);
        return res.json({ status: 0 });
    }
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Not found: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    if (err.message?.startsWith('CORS:')) return res.status(403).json({ message: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON in request body.' });
    res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

export default app;
