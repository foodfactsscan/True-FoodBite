import { Link } from 'react-router-dom';
import { Scan, Sun, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useAuth } from '../context/AuthContext';
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
            padding: '1.5rem',
            zIndex: 50,
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
                    <Link to="/dashboard" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Dashboard</Link>
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
                                    padding: '0.5rem 1rem',
                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                                    border: '1px solid rgba(124, 58, 237, 0.3)',
                                    borderRadius: 'var(--radius-full)',
                                    color: 'var(--color-text)',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                <User size={18} />
                                <span>{user?.firstName}</span>
                            </button>

                            {showUserMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 0.5rem)',
                                    right: 0,
                                    minWidth: '200px',
                                    background: 'var(--gradient-card)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '0.75rem',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                                }}>
                                    <div style={{
                                        padding: '0.75rem',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            {user?.email}
                                        </p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            transition: 'background 0.2s',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <User size={18} />
                                        My Profile
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setShowUserMenu(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            transition: 'background 0.2s',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Activity size={18} />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            transition: 'background 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <LogOut size={18} />
                                        Logout
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

