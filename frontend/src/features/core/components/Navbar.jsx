import { Link } from 'react-router-dom';
import { Scan, Sun, Moon, User, LogOut, Layout } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useState, useEffect } from 'react';

// Fast live clock hook
function useLiveClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}

function LiveDateTime() {
    const now = useLiveClock();

    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const date = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    const hour = now.getHours();
    const greeting = hour < 12 ? '🌅' : hour < 17 ? '☀️' : hour < 20 ? '🌆' : '🌙';

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.3rem 0.85rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            fontFamily: "'Outfit', sans-serif",
        }}>
            <span style={{ fontSize: '0.95rem' }}>{greeting}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {time}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '500' }}>
                    {date}
                </span>
            </div>
        </div>
    );
}

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
            padding: '0.65rem 0',   // ← Slimmer than before (was 1.5em)
            zIndex: 1000,
            backdropFilter: 'blur(16px)',
            background: 'rgba(10, 15, 30, 0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.07)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                {/* Logo */}
                <Link to="/" style={{
                    fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center',
                    gap: '0.45rem', color: 'var(--color-text)', textDecoration: 'none', flexShrink: 0
                }}>
                    <Scan size={20} color="var(--color-primary)" />
                    True <span className="text-gradient">FoodBite</span>
                </Link>

                {/* Nav Links */}
                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                        Home
                    </Link>
                    <Link to="/scan" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                        Scanner
                    </Link>
                    <Link to="/compare" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                        Compare
                    </Link>
                    <Link to="/how-it-works" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                        How It Works
                    </Link>
                </div>

                {/* Right side — theme, auth, datetime */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                    {/* Theme toggle */}
                    <button onClick={toggleTheme} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.4rem', borderRadius: '50%', color: 'var(--color-text)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.3s'
                    }}>
                        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                    </button>

                    {/* Auth */}
                    {isAuthenticated ? (
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.35rem 1rem',
                                background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.15), rgba(14, 165, 233, 0.15))',
                                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50px',
                                color: 'var(--color-text)', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem'
                            }}>
                                <User size={15} />
                                <span>{user?.firstName}</span>
                            </button>

                            {showUserMenu && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0, width: '240px',
                                    backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px', padding: '0.5rem',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', zIndex: 9999
                                }}>
                                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', margin: 0 }}>{user?.firstName} {user?.lastName}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>{user?.email}</p>
                                    </div>
                                    <Link to="/profile" onClick={() => setShowUserMenu(false)} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem',
                                        color: '#e2e8f0', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600',
                                        borderRadius: '10px', transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <User size={16} /> My Profile
                                    </Link>
                                    <Link to="/dashboard" onClick={() => setShowUserMenu(false)} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem',
                                        color: '#e2e8f0', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600',
                                        borderRadius: '10px', transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <Layout size={16} /> Dashboard
                                    </Link>
                                    <button onClick={handleLogout} style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem', background: 'transparent', border: 'none',
                                        color: '#f87171', cursor: 'pointer', borderRadius: '8px',
                                        fontSize: '0.85rem', fontWeight: '700'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <LogOut size={15} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={{
                                padding: '0.35rem 1rem', color: 'var(--color-text)', textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px',
                                fontSize: '0.875rem', fontWeight: '600', transition: 'all 0.2s'
                            }}>
                                Login
                            </Link>
                            <Link to="/signup" className="btn-primary" style={{ padding: '0.35rem 1.25rem', fontSize: '0.875rem' }}>
                                Sign Up
                            </Link>
                        </>
                    )}

                    {/* Live DateTime — always visible after auth section */}
                    <LiveDateTime />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
