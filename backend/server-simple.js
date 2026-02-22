import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth-simple.js';
import profileRoutes from './routes/profile.js';
import aiRoutes from './routes/ai.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';
import { usersDB, profilesDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all origins in development
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow any localhost origin in development
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        // Allow configured CLIENT_URL
        if (origin === process.env.CLIENT_URL) {
            return callback(null, true);
        }
        callback(null, true); // Allow all in dev
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('\n🚀 FactsScan Backend Starting...');
console.log('📧 SMTP User:', process.env.SMTP_USER || 'Not configured');
console.log('📧 SMTP Configured:', process.env.SMTP_USER && process.env.SMTP_PASS ? 'Yes ✅' : 'No ❌ (using dev mode - OTP shown in response)');
console.log(`💾 Database: JSON File Storage (${usersDB.count()} users, ${profilesDB.count()} profiles loaded)`);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FactsScan API is running',
        smtp: process.env.SMTP_USER && process.env.SMTP_PASS ? 'configured' : 'not configured (dev mode)',
        database: 'JSON File Storage',
        users: usersDB.count(),
        profiles: profilesDB.count()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

// Start server
// Start server only if not running in Vercel (serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173 (any localhost port accepted)'}`);
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`\n🔧 DEV MODE: OTP codes will be returned in API responses (no email needed)`);
            console.log(`   To enable real emails, configure SMTP in .env file`);
            console.log(`   See GMAIL-SMTP-SETUP.md for instructions\n`);
        }
    });
}

export default app;
