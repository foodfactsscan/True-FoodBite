import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuthUser } = useAuth();

    const email = location.state?.email || '';
    const purpose = location.state?.purpose || 'signup';
    const initialDevOtp = location.state?.devOtp || null;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [devOtp, setDevOtp] = useState(initialDevOtp);

    const inputRefs = useRef([]);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    // Resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            while (newOtp.length < 6) newOtp.push('');
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        // Call backend API
        const result = await authService.verifyOTP(email, otpValue, purpose);

        if (result.success) {
            setSuccess('✅ OTP verified successfully!');

            // Handle based on purpose
            if (purpose === 'signup') {
                // User is automatically logged in after signup OTP verification
                setAuthUser(result.user, result.token);

                setTimeout(() => {
                    navigate('/scan', {
                        state: { message: 'Welcome to True FoodBite! Start scanning products.' }
                    });
                }, 1500);
            } else if (purpose === 'forgot-password') {
                // Navigate to reset password page
                setTimeout(() => {
                    navigate('/reset-password', { state: { email, verified: true } });
                }, 1500);
            }
        } else {
            setError(result.error || 'OTP verification failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsLoading(true);
        const result = await authService.resendOTP(email, purpose);
        setIsLoading(false);

        if (result.success) {
            setSuccess('✉️ New OTP sent!');
            setCanResend(false);
            setResendTimer(30);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();

            // Update dev OTP if returned
            if (result.devOtp) {
                setDevOtp(result.devOtp);
            }

            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to resend OTP. Please try again.');
        }
    };

    return (
        <div className="page-container" style={{
            minHeight: 'calc(100vh - 160px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        marginBottom: '1.5rem',
                        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
                    }}>
                        <Shield size={40} color="#fff" />
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Verify OTP
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: '0.5rem'
                    }}>
                        We've sent a 6-digit code to
                    </p>
                    <p style={{
                        fontSize: '1rem',
                        color: '#7c3aed',
                        fontWeight: '600'
                    }}>
                        {email}
                    </p>
                </div>

                {/* OTP Form */}
                <div style={{
                    background: 'var(--gradient-card)',
                    borderRadius: 'var(--radius-2xl)',
                    padding: '2.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                    {/* Dev Mode OTP Display */}
                    {devOtp && (
                        <div style={{
                            padding: '1rem 1.25rem',
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                            border: '2px solid rgba(124, 58, 237, 0.4)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                color: '#a78bfa',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                🔧 Dev Mode — Your OTP Code
                            </p>
                            <p style={{
                                fontSize: '2rem',
                                fontWeight: '900',
                                letterSpacing: '8px',
                                color: '#fff',
                                margin: '0',
                                fontFamily: 'monospace'
                            }}>
                                {devOtp}
                            </p>
                            <p style={{
                                color: 'var(--color-text-muted)',
                                fontSize: '0.75rem',
                                marginTop: '0.5rem'
                            }}>
                                Email not configured. OTP shown here for testing.
                            </p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <CheckCircle size={20} color="#22c55e" />
                            <span style={{ color: '#22c55e', fontSize: '0.9rem' }}>
                                {success}
                            </span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <AlertCircle size={20} color="#ef4444" />
                            <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                                {error}
                            </span>
                        </div>
                    )}

                    {/* OTP Input */}
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                style={{
                                    width: '55px',
                                    height: '60px',
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: '#fff',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#7c3aed';
                                    e.target.select();
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={handleVerify}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: isLoading
                                ? 'rgba(124, 58, 237, 0.5)'
                                : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                            marginBottom: '1.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
                        }}
                    >
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    {/* Resend OTP */}
                    <div style={{
                        textAlign: 'center',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '0.9rem',
                            marginBottom: '1rem'
                        }}>
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={!canResend}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: canResend ? '#7c3aed' : 'var(--color-text-muted)',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: canResend ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                margin: '0 auto',
                                padding: '0.5rem 1rem',
                                transition: 'opacity 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                if (canResend) e.currentTarget.style.opacity = '0.8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            <RotateCw size={16} />
                            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
