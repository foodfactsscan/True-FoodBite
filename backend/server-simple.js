import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth-simple.js';
import profileRoutes from './routes/profile.js';
import aiRoutes from './routes/ai.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://truefoodbite.vercel.app',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (same-domain Vercel, curl, Postman)
        if (!origin) return callback(null, true);
        // Allow any localhost port for dev
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        // Allow any truefoodbite vercel.app subdomain
        if (origin.includes('truefoodbite') && origin.includes('vercel.app')) {
            return callback(null, true);
        }
        // Allow explicitly configured CLIENT_URL
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Vercel Serverless: ensure DB is connected before every request ───────────
// On Vercel, each serverless function invocation is stateless. The DB connection
// must be established (or reused from a warm container) on EVERY request.
// This middleware makes that bullet-proof.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection failed on request:', err.message);
        // Always return valid JSON — never an empty body
        return res.status(503).json({
            message: 'Database is temporarily unavailable. Please try again in a moment.',
            error: 'SERVICE_UNAVAILABLE'
        });
    }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'True FoodBite API is running',
        database: 'MongoDB Atlas',
        smtp: process.env.SMTP_USER ? 'configured' : 'not configured (dev mode)',
        timestamp: new Date().toISOString(),
    });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
// Any unmatched route MUST return valid JSON, never an empty body.
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Catches any uncaught errors in route handlers and always returns valid JSON.
// This is the final safety net that prevents empty-body responses.
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message || err);

    // CORS errors
    if (err.message && err.message.startsWith('Not allowed by CORS')) {
        return res.status(403).json({ message: 'CORS: Origin not allowed.' });
    }

    // JSON parse errors (malformed request body)
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON in request body.' });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error. Please try again.',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// ─── Local dev server start ───────────────────────────────────────────────────
// On Vercel, the app is exported directly without calling .listen()
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

if (!isVercel) {
    // Connect once at startup for local dev, then start listening
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`\n✅ Server running on http://localhost:${PORT}`);
                console.log(`📱 Frontend: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
                if (!process.env.SMTP_USER) {
                    console.log(`\n🔧 DEV MODE: OTP codes returned in API responses (no email needed)`);
                }
            });
        })
        .catch((err) => {
            console.error('Failed to start server:', err.message);
            process.exit(1);
        });
}

export default app;
