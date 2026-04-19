import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from '../services/authService';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const verified = location.state?.verified || false;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Redirect if not verified
    useEffect(() => {
        if (!email || !verified) {
            navigate('/forgot-password');
        }
    }, [email, verified, navigate]);

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (!validatePassword(formData.newPassword)) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        // Call backend API
        const result = await authService.resetPassword(email, formData.newPassword);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Password reset successful! Please login with your new password.' }
                });
            }, 2000);
        } else {
            setErrors({ general: result.error || 'Failed to reset password. Please try again.' });
            setIsLoading(false);
        }
    };

    if (success) {
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
                    maxWidth: '480px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        background: 'var(--gradient-card)',
                        borderRadius: 'var(--radius-2xl)',
                        padding: '3rem 2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '80px',
                            borderRadius: 'var(--radius-full)',
                            background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                            marginBottom: '1.5rem',
                            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)'
                        }}>
                            <CheckCircle2 size={40} color="#fff" />
                        </div>
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: '800',
                            color: '#22c55e',
                            marginBottom: '1rem'
                        }}>
                            Password Reset Successful!
                        </h2>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '1rem',
                            lineHeight: '1.6'
                        }}>
                            Your password has been updated successfully.
                            <br />
                            Redirecting to login page...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                        <Lock size={40} color="#fff" />
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Reset Password
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        Create a new secure password for your account
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
                    {errors.general && (
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
                                {errors.general}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* New Password Field */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#fff',
                                fontWeight: '600'
                            }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock
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
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="At least 6 characters"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 3rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${errors.newPassword ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                                        borderRadius: 'var(--radius-lg)',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)',
                                        padding: '0.25rem',
                                        display: 'flex'
                                    }}
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <span style={{
                                    display: 'block',
                                    marginTop: '0.5rem',
                                    color: '#ef4444',
                                    fontSize: '0.85rem'
                                }}>
                                    {errors.newPassword}
                                </span>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#fff',
                                fontWeight: '600'
                            }}>
                                Confirm New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock
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
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your new password"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 3rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${errors.confirmPassword ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                                        borderRadius: 'var(--radius-lg)',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)',
                                        padding: '0.25rem',
                                        display: 'flex'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span style={{
                                    display: 'block',
                                    marginTop: '0.5rem',
                                    color: '#ef4444',
                                    fontSize: '0.85rem'
                                }}>
                                    {errors.confirmPassword}
                                </span>
                            )}
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
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
