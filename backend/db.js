import mongoose from 'mongoose';

// ─── Connection state ─────────────────────────────────────────────────────────
// Vercel serverless functions can reuse a warm Lambda container.
// We cache the connection promise so we don't reconnect on every request.
let connectionPromise = null;

const connectDB = async () => {
    // If already fully connected, return immediately
    if (mongoose.connection.readyState === 1) {
        return;
    }

    // If a connection attempt is already in progress, await that same promise
    // instead of creating a duplicate connection
    if (connectionPromise) {
        return connectionPromise;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is not set in environment variables!');
        throw new Error('MONGODB_URI environment variable is missing.');
    }

    connectionPromise = mongoose.connect(MONGODB_URI, {
        // Vercel serverless: keep pool small to avoid connection limit
        maxPoolSize: 10,
        minPoolSize: 1,
        // Faster failure detection for serverless cold starts
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        // Heartbeat monitoring
        heartbeatFrequencyMS: 10000,
    }).then((conn) => {
        const dbName = conn.connection.db?.databaseName || 'unknown';
        console.log(`✅ MongoDB connected — Database: ${dbName}`);
        connectionPromise = null; // Reset so future calls reconnect if needed
        return conn;
    }).catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        connectionPromise = null; // Allow retry on next request
        throw err;
    });

    return connectionPromise;
};

// ─── Connection event monitoring ─────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected.');
    connectionPromise = null; // Allow fresh reconnect
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected.');
    connectionPromise = null;
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
    connectionPromise = null;
});

export default connectDB;
