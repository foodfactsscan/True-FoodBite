import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['signup', 'forgot-password'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - MongoDB will auto-delete after expiry
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5 // Max 5 verification attempts
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash OTP before saving
otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.otp = await bcrypt.hash(this.otp, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare OTP method
otpSchema.methods.compareOTP = async function (candidateOTP) {
    return await bcrypt.compare(candidateOTP, this.otp);
};

// Increment attempt counter
otpSchema.methods.incrementAttempts = async function () {
    this.attempts += 1;
    await this.save();
};

export default mongoose.model('OTP', otpSchema);
