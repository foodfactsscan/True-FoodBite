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

// CORS — allow localhost in dev + configured CLIENT_URL + Vercel deployment domain
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://truefoodbite.vercel.app',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (same-domain Vercel, curl, Postman, mobile)
        if (!origin) return callback(null, true);
        // Allow any localhost port for dev
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        // Allow any vercel.app subdomain of this project
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'True FoodBite API is running',
        database: 'MongoDB Atlas',
        smtp: process.env.SMTP_USER ? 'configured' : 'not configured (dev mode)'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Connect to MongoDB then start server
const start = async () => {
    await connectDB();

    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
        app.listen(PORT, () => {
            console.log(`\n✅ Server running on http://localhost:${PORT}`);
            console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
            if (!process.env.SMTP_USER) {
                console.log(`\n🔧 DEV MODE: OTP codes returned in API responses (no email needed)`);
                console.log(`   To enable real emails, configure SMTP_USER and SMTP_PASS in backend/.env\n`);
            }
        });
    }
};

start();

export default app;
