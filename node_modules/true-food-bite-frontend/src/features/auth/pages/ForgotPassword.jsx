import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, AlertCircle } from 'lucide-react';
import authService from '../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Call backend API
        setIsLoading(true);
        setError('');

        const result = await authService.forgotPassword(email.toLowerCase().trim());

        setIsLoading(false);

        if (result.success) {
            // Navigate to OTP verification
            navigate('/verify-otp', {
                state: {
                    email: email.toLowerCase().trim(),
                    purpose: 'forgot-password',
                    devOtp: result.devOtp || null
                }
            });
        } else {
            setError(result.error || 'Failed to send OTP. Please try again.');
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
                        <KeyRound size={40} color="#fff" />
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Forgot Password?
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        No worries! We'll send you a code to reset it
                    </p>
                </div>

                {/* Form */}
                <div style={{
                    background: 'var(--gradient-card)',
                    borderRadius: 'var(--radius-2xl)',
                    padding: '2.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
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

                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#fff',
                                fontWeight: '600'
                            }}>
                                Email Address
                            </label>
                            <div style={{
                                position: 'relative'
                            }}>
                                <Mail
                                    size={20}
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="your.email@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                                        borderRadius: 'var(--radius-lg)',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.3s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
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
                                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
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
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '0.95rem'
                        }}>
                            Remember your password?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#7c3aed',
                                    textDecoration: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
