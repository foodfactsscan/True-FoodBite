import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure Gmail SMTP transporter
const createTransporter = () => {
    // Only create transporter if credentials exist
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER, // Your Gmail address
            pass: process.env.SMTP_PASS  // Your Gmail App Password
        }
    });
};

// Check if SMTP is configured
export const isSmtpConfigured = () => {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

// Generate cryptographically secure 6-digit OTP
export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, purpose) => {
    const transporter = createTransporter();

    // Fallback logging function
    const logFallback = (reason) => {
        console.log('\n=================================================');
        console.log(`⚠️  EMAIL DELIVERY FALLBACK (${reason})`);
        console.log(`📨 To: ${email}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log('=================================================\n');
    };

    // If no credentials, use fallback immediately
    if (!transporter) {
        logFallback('Missing SMTP Credentials in .env');
        return true;
    }

    try {
        const subject = purpose === 'signup'
            ? 'True FoodBite - Verify Your Email'
            : 'True FoodBite - Password Reset OTP';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 40px 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                    .header { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 40px 30px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 32px; font-weight: 800; }
                    .content { padding: 40px 30px; text-align: center; }
                    .otp-box { background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%); border: 2px solid #7c3aed; border-radius: 12px; padding: 30px; margin: 30px 0; }
                    .otp-code { font-size: 48px; font-weight: 800; letter-spacing: 8px; color: #7c3aed; margin: 10px 0; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; text-align: left; border-radius: 4px; }
                    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 True FoodBite</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Smart Food Scanner</p>
                    </div>
                    <div class="content">
                        <h2 style="color: #1f2937; margin-bottom: 10px;">
                            ${purpose === 'signup' ? 'Welcome to True FoodBite!' : 'Password Reset Request'}
                        </h2>
                        <p style="color: #6b7280; font-size: 16px;">
                            ${purpose === 'signup'
                ? 'Thank you for signing up! Please verify your email address to complete your registration.'
                : 'We received a request to reset your password. Use the OTP below to proceed.'}
                        </p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600;">YOUR OTP CODE</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin: 0; color: #ef4444; font-size: 14px; font-weight: 600;">⏱️ Valid for 5 minutes only</p>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong><br>
                            • Do not share this OTP with anyone<br>
                            • Our team will never ask for your OTP<br>
                            • This code expires in 5 minutes<br>
                            • Maximum 5 attempts allowed
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>True FoodBite</strong> - Know Your Food, Protect Your Health</p>
                        <p style="margin: 5px 0;">This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"True FoodBite" <${process.env.SMTP_USER}>`,
            to: email,
            subject: subject,
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending error:', error.message);

        // Use console fallback if email sending fails
        logFallback(`SMTP Error: ${error.message}`);

        // Return true to prevent blocking user flow
        return true;
    }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, firstName) => {
    try {
        const transporter = createTransporter();
        if (!transporter) return; // Silent fail if no config

        const html = `
            <!DOCTYPE html>
            <html>
                <!-- Simple welcome email content -->
                <body>
                    <h1>Welcome, ${firstName}!</h1>
                    <p>You have successfully verified your email.</p>
                </body>
            </html>
        `;

        await transporter.sendMail({
            from: `"True FoodBite" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Welcome to True FoodBite! 🎉',
            html: html
        });

        console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
        console.error('❌ Welcome email error:', error.message);
        // Don't throw error - welcome email is not critical
    }
};
