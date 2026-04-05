import { Link } from 'react-router-dom';
import { Scan, Sun, Moon, User, LogOut, Layout } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            padding: '1.5em',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            background: 'var(--color-glass-strong)',
            borderBottom: '1px solid var(--color-glass-border)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', textDecoration: 'none' }}>
                    <Scan color="var(--color-primary)" /> Facts<span className="text-gradient">Scan</span>
                </Link>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Home</Link>
                    <Link to="/scan" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Scanner</Link>
                    <Link to="/compare" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Compare</Link>
                    {isAuthenticated && <Link to="/dashboard" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Dashboard</Link>}
                    <Link to="/how-it-works" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>How It Works</Link>

                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--color-glass-border)',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {isAuthenticated ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1.25rem',
                                    background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)',
                                    border: '1px solid var(--color-glass-border)',
                                    borderRadius: '50px',
                                    color: 'var(--color-text)',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <User size={18} />
                                <span>{user?.firstName}</span>
                            </button>

                            {showUserMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 1rem)',
                                    right: 0,
                                    width: '240px',
                                    backgroundColor: '#1E293B',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '0.5rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    zIndex: 9999
                                }}>
                                    <div style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', margin: '4px 0 0 0' }}>
                                            {user?.email}
                                        </p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '1rem', color: '#E2E8F0', textDecoration: 'none',
                                            fontSize: '0.9rem', fontWeight: '600', borderRadius: '12px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <User size={18} /> My Profile
                                    </Link>

                                    <Link
                                        to="/dashboard"
                                        onClick={() => setShowUserMenu(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '1rem', color: '#E2E8F0', textDecoration: 'none',
                                            fontSize: '0.9rem', fontWeight: '600', borderRadius: '12px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Layout size={18} /> Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem', background: 'transparent', border: 'none',
                                            color: '#f87171', cursor: 'pointer', borderRadius: '8px',
                                            fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    color: 'var(--color-text)',
                                    textDecoration: 'none',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="btn-primary"
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;

