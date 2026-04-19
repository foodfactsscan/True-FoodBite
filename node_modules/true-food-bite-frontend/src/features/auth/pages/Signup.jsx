import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[!@#$%^&*(),.?":{}|<>]/.test(p);

const PWD_CHECKS = [
    { label: '8+ characters', test: p => p.length >= 8 },
    { label: 'Uppercase letter', test: p => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: p => /[a-z]/.test(p) },
    { label: 'Number', test: p => /[0-9]/.test(p) },
    { label: 'Special character (!@#$...)', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const Field = ({ label, icon: Icon, type, name, value, onChange, error, placeholder, right }) => (
    <div style={{ marginBottom: '1.1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <Icon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: error ? '#f87171' : '#475569', pointerEvents: 'none' }} />
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                style={{
                    width: '100%', padding: right ? '0.85rem 3rem 0.85rem 2.75rem' : '0.85rem 1rem 0.85rem 2.75rem',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: '12px', color: '#f1f5f9', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = error ? '#f87171' : 'rgba(124,58,237,0.6)'}
                onBlur={e => e.target.style.borderColor = error ? '#f87171' : 'rgba(255,255,255,0.09)'}
            />
            {right}
        </div>
        {error && <p style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#f87171' }}>{error}</p>}
    </div>
);

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [show, setShow] = useState({ password: false, confirm: false });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.firstName.trim() || formData.firstName.trim().length < 2) newErrors.firstName = 'Enter a valid first name (min 2 chars)';
        if (!formData.lastName.trim() || formData.lastName.trim().length < 2) newErrors.lastName = 'Enter a valid last name (min 2 chars)';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Enter a valid email address';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (!validatePassword(formData.password)) newErrors.password = 'Password does not meet all requirements below';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setIsLoading(true); setErrors({});
        const result = await authService.signup({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password
        });
        setIsLoading(false);

        if (result.success) {
            navigate('/verify-otp', { state: { email: result.email || formData.email.toLowerCase().trim(), purpose: 'signup', devOtp: result.devOtp || null } });
        } else {
            setErrors({ general: result.error || 'Signup failed. Please try again.' });
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: '520px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.1rem', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
                        <UserPlus size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: '900', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.35rem' }}>Create Your Account</h1>
                    <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Start making informed food choices — free, forever.</p>
                </div>

                {/* Benefits strip */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['✅ No credit card', '✅ Scan history saved', '✅ FSSAI allergen alerts', '✅ Permanent account'].map(b => (
                        <span key={b} style={{ fontSize: '0.72rem', padding: '0.25rem 0.7rem', borderRadius: '999px', background: 'rgba(132,204,22,0.06)', border: '1px solid rgba(132,204,22,0.15)', color: '#84cc16', fontWeight: '600' }}>{b}</span>
                    ))}
                </div>

                {/* Form card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                    {errors.general && (
                        <div style={{ padding: '0.85rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                            <AlertCircle size={16} color="#ef4444" />
                            <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.general}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="First Name" icon={User} type="text" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} placeholder="Arjun" />
                            <Field label="Last Name" icon={User} type="text" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} placeholder="Sharma" />
                        </div>

                        <Field label="Email Address" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="your@email.com" />

                        <Field
                            label="Password" icon={Lock}
                            type={show.password ? 'text' : 'password'}
                            name="password" value={formData.password} onChange={handleChange}
                            error={errors.password} placeholder="Min 8 chars, upper, number, symbol"
                            right={<button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>{show.password ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                        />

                        {/* Password strength checklist */}
                        {formData.password.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                                {PWD_CHECKS.map(c => {
                                    const ok = c.test(formData.password);
                                    return (
                                        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: ok ? '#22c55e' : '#475569' }}>
                                            <CheckCircle size={11} color={ok ? '#22c55e' : '#334155'} />
                                            {c.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Field
                            label="Confirm Password" icon={Lock}
                            type={show.confirm ? 'text' : 'password'}
                            name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                            error={errors.confirmPassword} placeholder="Re-enter your password"
                            right={<button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>{show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                        />

                        {/* Security note */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)', marginBottom: '1.25rem' }}>
                            <ShieldCheck size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
                                Your password is hashed with bcrypt before storage. We never see your plain-text password. Your account is permanent — no data loss on app updates.
                            </p>
                        </div>

                        <button type="submit" disabled={isLoading} style={{
                            width: '100%', padding: '0.95rem', borderRadius: '14px', border: 'none',
                            background: isLoading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#ec4899)',
                            color: '#fff', fontWeight: '800', fontSize: '1rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            boxShadow: isLoading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
                            transition: 'all 0.2s ease',
                        }}>
                            {isLoading ? 'Creating Account...' : 'Create My Account →'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <p style={{ color: '#475569', fontSize: '0.87rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#7c3aed', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: '#334155' }}>
                    By creating an account you agree to our <Link to="/terms-of-service" style={{ color: '#475569', textDecoration: 'underline' }}>Terms</Link> and <Link to="/privacy-policy" style={{ color: '#475569', textDecoration: 'underline' }}>Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
