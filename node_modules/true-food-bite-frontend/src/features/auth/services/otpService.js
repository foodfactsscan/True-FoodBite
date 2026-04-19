// OTP Service for handling OTP generation and verification
// In a real application, this would be handled by a backend server

class OTPService {
    constructor() {
        this.otpStore = new Map();
        this.otpExpiry = 5 * 60 * 1000; // 5 minutes
    }

    // Generate a 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP to email (simulated)
    sendOTP(email, purpose = 'signup') {
        const otp = this.generateOTP();
        const expiryTime = Date.now() + this.otpExpiry;

        // Store OTP with email and expiry
        this.otpStore.set(email, {
            otp,
            expiryTime,
            purpose,
            attempts: 0
        });

        // In a real app, this would send an actual email
        console.log(`📧 OTP sent to ${email}: ${otp} (Purpose: ${purpose})`);

        // For development, also show in alert (remove in production)
        if (process.env.NODE_ENV === 'development') {
            alert(`🔐 Development Mode - Your OTP is: ${otp}\n\nThis would be sent to: ${email}\n(Valid for 5 minutes)`);
        }

        return {
            success: true,
            message: `OTP sent to ${email}`,
            // In production, never return OTP to client
            ...(process.env.NODE_ENV === 'development' && { otp })
        };
    }

    // Verify OTP
    verifyOTP(email, inputOTP) {
        const otpData = this.otpStore.get(email);

        if (!otpData) {
            return {
                success: false,
                error: 'No OTP found. Please request a new one.'
            };
        }

        // Check if OTP has expired
        if (Date.now() > otpData.expiryTime) {
            this.otpStore.delete(email);
            return {
                success: false,
                error: 'OTP has expired. Please request a new one.'
            };
        }

        // Check attempts
        if (otpData.attempts >= 3) {
            this.otpStore.delete(email);
            return {
                success: false,
                error: 'Too many failed attempts. Please request a new OTP.'
            };
        }

        // Verify OTP
        if (otpData.otp === inputOTP.trim()) {
            this.otpStore.delete(email);
            return {
                success: true,
                message: 'OTP verified successfully'
            };
        }

        // Increment attempts
        otpData.attempts += 1;
        this.otpStore.set(email, otpData);

        return {
            success: false,
            error: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`
        };
    }

    // Resend OTP
    resendOTP(email) {
        const otpData = this.otpStore.get(email);
        if (otpData) {
            return this.sendOTP(email, otpData.purpose);
        }
        return {
            success: false,
            error: 'No active OTP session found'
        };
    }

    // Clear OTP for email
    clearOTP(email) {
        this.otpStore.delete(email);
    }

    // Check if email exists in users database
    emailExists(email) {
        const users = JSON.parse(localStorage.getItem('factsscan_users') || '[]');
        return users.some(u => u.email === email);
    }
}

// Export singleton instance
const otpService = new OTPService();
export default otpService;
