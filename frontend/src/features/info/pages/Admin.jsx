import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, Package, AlertTriangle, BarChart3, Search,
    Trash2, Edit3, Check, X, Database, Activity, Eye, Lock,
    LogOut, Settings, Bell, Flag, FlaskConical, Plus, Save,
    Clock, TrendingUp, UserCheck, UserX, ChevronDown, RefreshCw
} from 'lucide-react';
import { SYNC_KEYS, invalidateSync, useSyncEffect, usePolling, optimisticMutate } from '../../core/services/trueSync';

const API = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
        ? ''
        : 'http://localhost:5000');
const API_URL = `${API}/api/admin`;

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e 50%,#0a1628)', color: '#e2e8f0', fontFamily: "'Inter',sans-serif", padding: '1.5rem 2rem' },
    glass: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', backdropFilter: 'blur(12px)' },
    input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
    btn: (bg = '#7c3aed') => ({ padding: '0.7rem 1.2rem', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg,${bg},${bg}cc)`, color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', transition: 'all 0.2s' }),
    btnSm: (bg = '#7c3aed') => ({ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: `${bg}25`, color: bg, fontWeight: '600', cursor: 'pointer', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }),
    th: { textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: '600', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    td: { padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.9rem' },
    badge: (c) => ({ display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', background: `${c}20`, color: c, border: `1px solid ${c}40` }),
    tab: (a) => ({ padding: '0.65rem 1.1rem', borderRadius: '10px', border: 'none', background: a ? 'rgba(124,58,237,0.3)' : 'transparent', color: a ? '#c4b5fd' : '#94a3b8', fontSize: '0.88rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }),
    stat: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', textAlign: 'center', flex: '1', minWidth: '160px' },
    select: { padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: '0.85rem', outline: 'none' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalBody: { background: '#1a1a2e', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', width: '90%', maxWidth: '540px', maxHeight: '80vh', overflowY: 'auto' },
};

// ─── API helper ───────────────────────────────────────────────────────────────
function api(path, opts = {}) {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_URL}${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '', ...(opts.headers || {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(r => r.json());
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function AdminLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr('');
        const res = await api('/login', { method: 'POST', body: { email, password: pw } });
        setLoading(false);
        if (res.success) {
            localStorage.setItem('adminToken', res.token);
            onLogin(true);
        } else {
            setErr(res.message || 'Login failed');
        }
    };

    return (
        <div style={s.page}>
            <motion.div style={{ maxWidth: '420px', margin: '80px auto', ...s.glass, padding: '2.5rem' }}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Shield size={32} color="#fff" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Panel</h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>True FoodBite Administration</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>Email</label>
                    <input style={{ ...s.input, marginBottom: '1rem' }} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>Password</label>
                    <input style={{ ...s.input, marginBottom: '1rem' }} type="password" value={pw} onChange={e => setPw(e.target.value)} required />
                    {err && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{err}</p>}
                    <button style={{ ...s.btn(), width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1 }} disabled={loading}>
                        {loading ? <RefreshCw size={16} className="spin" /> : <Lock size={16} />} {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', marginTop: '1.5rem' }}>
                    Default: admin@truefoodbite.com / admin123
                </p>
            </motion.div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function Modal({ show, onClose, title, children }) {
    if (!show) return null;
    return (
        <div style={s.modal} onClick={onClose}>
            <motion.div style={s.modalBody} onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardTab({ stats, loading }) {
    useSyncEffect(SYNC_KEYS.ADMIN_STATS, () => {
        // Parent handles the actual re-fetch of stats state
        console.log('[Admin] Stats refresh triggered via TrueSync');
    });

    if (loading && !stats) return <p style={{ color: '#94a3b8' }}>Loading analytics...</p>;
    if (!stats) return <p style={{ color: '#94a3b8' }}>Unable to load stats. Is the backend running?</p>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#a855f7' },
        { label: 'Verified', value: stats.verifiedUsers, icon: UserCheck, color: '#22c55e' },
        { label: 'Unverified', value: stats.unverifiedUsers, icon: UserX, color: '#f59e0b' },
        { label: 'Profiles', value: stats.totalProfiles, icon: Activity, color: '#06b6d4' },
        { label: 'Total Scans', value: stats.totalScans, icon: TrendingUp, color: '#ec4899' },
        { label: 'Ingredients', value: stats.totalIngredients, icon: Database, color: '#14b8a6' },
        { label: 'Flagged Items', value: stats.totalFlagged, icon: AlertTriangle, color: '#ef4444' },
    ];

    return (
        <div>
            <h2 style={{ margin: '0 0 1.5rem' }}>📊 Dashboard Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {cards.map((c, i) => (
                    <motion.div key={i} style={s.stat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <c.icon size={22} style={{ color: c.color, marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: c.color }}>{c.value}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem' }}>{c.label}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={s.glass}>
                    <h3 style={{ margin: '0 0 1rem', color: '#a78bfa', fontSize: '1rem' }}>🔥 Top Scanned Products</h3>
                    {(stats.topProducts || []).length > 0 ? stats.topProducts.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: '0.9rem' }}>{i + 1}. {p.name}</span>
                            <span style={{ color: '#a855f7', fontWeight: '600', fontSize: '0.85rem' }}>{p.scans} scans</span>
                        </div>
                    )) : <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No scan data yet</p>}
                </div>

                <div style={s.glass}>
                    <h3 style={{ margin: '0 0 1rem', color: '#f59e0b', fontSize: '1rem' }}>🏥 User Health Conditions</h3>
                    {Object.entries(stats.conditionCounts || {}).length > 0 ? Object.entries(stats.conditionCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cond, count], i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: '0.85rem' }}>{cond}</span>
                            <span style={s.badge('#f59e0b')}>{count} users</span>
                        </div>
                    )) : <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No profile data yet</p>}
                </div>
            </div>

            <div style={s.glass}>
                <h3 style={{ margin: '0 0 1rem', color: '#06b6d4', fontSize: '1rem' }}>📝 Recent Admin Activity</h3>
                {(stats.recentLogs || []).length > 0 ? stats.recentLogs.slice(0, 8).map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                        <Clock size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', flex: 1 }}>{log.action.replace(/_/g, ' ')}</span>
                        <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                )) : <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No activity logged yet</p>}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PasswordCell({ user, onUpdate }) {
    const [showPw, setShowPw] = useState(false);
    const [editing, setEditing] = useState(false);
    const [newPw, setNewPw] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!newPw || newPw.length < 4) return;
        setSaving(true);
        const res = await api(`/users/${encodeURIComponent(user.email)}/password`, { method: 'PUT', body: { newPassword: newPw } });
        setSaving(false);
        if (res.success) {
            setEditing(false);
            setNewPw('');
            onUpdate(res.message);
        }
    };

    if (editing) {
        return (
            <td style={s.td}>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <input style={{ ...s.input, width: '120px', padding: '0.35rem 0.5rem', fontSize: '0.82rem', marginBottom: 0 }}
                        type="text" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus />
                    <button style={s.btnSm('#22c55e')} onClick={handleSave} disabled={saving} title="Save">
                        <Save size={12} />
                    </button>
                    <button style={s.btnSm('#94a3b8')} onClick={() => { setEditing(false); setNewPw(''); }} title="Cancel">
                        <X size={12} />
                    </button>
                </div>
            </td>
        );
    }

    const hashPreview = user.passwordHash ? user.passwordHash.substring(0, 15) + '...' : '—';

    return (
        <td style={s.td}>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {showPw ? hashPreview : '••••••••'}
                </span>
                <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                    onClick={() => setShowPw(!showPw)} title={showPw ? 'Hide' : 'Show hash'}>
                    <Eye size={12} />
                </button>
                <button style={s.btnSm('#a855f7')} onClick={() => setEditing(true)} title="Change password">
                    <Edit3 size={12} />
                </button>
            </div>
        </td>
    );
}

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        const res = await api('/users');
        if (res.success) setUsers(res.users);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);
    
    // Listen for global user list invalidations
    useSyncEffect(SYNC_KEYS.USER_LIST, load);

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

    const deleteUser = async (email) => {
        if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
        
        await optimisticMutate({
            action: () => api(`/users/${encodeURIComponent(email)}`, { method: 'DELETE' }),
            onSync: SYNC_KEYS.ADMIN_STATS, // Also refresh dashboard stats
            localState: users,
            setLocalState: setUsers,
            tempUpdate: (list) => list.filter(u => u.email !== email),
            onFail: (err) => alert(err)
        });
    };

    const toggleVerify = async (email) => {
        await optimisticMutate({
            action: () => api(`/users/${encodeURIComponent(email)}/toggle-verify`, { method: 'PUT' }),
            onSync: SYNC_KEYS.ADMIN_STATS,
            localState: users,
            setLocalState: setUsers,
            tempUpdate: (list) => list.map(u => u.email === email ? { ...u, isVerified: !u.isVerified } : u),
            onFail: (err) => alert(err)
        });
    };

    const handlePwUpdate = (message) => { showMsg(message); load(); };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>👥 User Management ({users.length})</h2>
                <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input style={{ ...s.input, paddingLeft: '34px', width: '260px' }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>
            {msg && <div style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginBottom: '1rem', fontSize: '0.85rem' }}>✅ {msg}</div>}
            <div style={{ ...s.glass, overflowX: 'auto' }}>
                {loading ? <p style={{ color: '#94a3b8' }}>Loading users...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Password', 'Verified', 'Scans', 'Joined', 'Last Login', 'Conditions', 'Actions'].map(h => (
                                    <th key={h} style={s.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.email}>
                                    <td style={{ ...s.td, fontWeight: '600' }}>{u.firstName} {u.lastName}</td>
                                    <td style={{ ...s.td, color: '#94a3b8', fontSize: '0.85rem' }}>{u.email}</td>
                                    <PasswordCell user={u} onUpdate={handlePwUpdate} />
                                    <td style={s.td}>
                                        <span style={s.badge(u.isVerified ? '#22c55e' : '#f59e0b')}>{u.isVerified ? 'Verified' : 'Pending'}</span>
                                    </td>
                                    <td style={s.td}>{u.scanCount}</td>
                                    <td style={{ ...s.td, color: '#94a3b8', fontSize: '0.82rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                    <td style={{ ...s.td, color: '#94a3b8', fontSize: '0.82rem' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                                    <td style={s.td}>{u.chronicDiseases.length > 0 ? u.chronicDiseases.slice(0, 2).join(', ') : '—'}</td>
                                    <td style={s.td}>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button style={s.btnSm(u.isVerified ? '#f59e0b' : '#22c55e')} onClick={() => toggleVerify(u.email)} title={u.isVerified ? 'Unverify' : 'Verify'}>
                                                {u.isVerified ? <UserX size={13} /> : <UserCheck size={13} />}
                                            </button>
                                            <button style={s.btnSm('#ef4444')} onClick={() => deleteUser(u.email)} title="Delete">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: '#64748b' }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function IngredientsTab() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | item object
    const [form, setForm] = useState({ name: '', code: '', category: 'preservative', riskLevel: 'safe', description: '', alternateNames: '' });
    const [msg, setMsg] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        const res = await api('/ingredients');
        if (res.success) setItems(res.ingredients);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    useSyncEffect(SYNC_KEYS.INGREDIENTS, load);

    const openAdd = () => { setForm({ name: '', code: '', category: 'preservative', riskLevel: 'safe', description: '', alternateNames: '' }); setModal('add'); };
    const openEdit = (item) => { setForm({ name: item.name, code: item.code, category: item.category, riskLevel: item.riskLevel, description: item.description, alternateNames: (item.alternateNames || []).join(', ') }); setModal(item); };

    const handleSave = async () => {
        const body = { ...form, alternateNames: form.alternateNames.split(',').map(s => s.trim()).filter(Boolean) };
        if (modal === 'add') {
            await api('/ingredients', { method: 'POST', body });
        } else {
            await api(`/ingredients/${modal.id}`, { method: 'PUT', body });
        }
        setModal(null);
        load();
        setMsg('Ingredient saved!');
        setTimeout(() => setMsg(''), 2000);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this ingredient?')) return;
        await api(`/ingredients/${id}`, { method: 'DELETE' });
        load();
    };

    const riskColors = { safe: '#22c55e', low: '#84cc16', moderate: '#f59e0b', high: '#ef4444' };
    const categories = ['preservative', 'colour', 'flavour_enhancer', 'emulsifier', 'sweetener', 'antioxidant', 'thickener', 'acid', 'general'];
    const filtered = items.filter(i => `${i.name} ${i.code} ${i.category}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>🧪 Ingredient Database ({items.length})</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input style={{ ...s.input, paddingLeft: '34px', width: '220px' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button style={s.btn()} onClick={openAdd}><Plus size={16} /> Add Ingredient</button>
                </div>
            </div>
            {msg && <div style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginBottom: '1rem', fontSize: '0.85rem' }}>✅ {msg}</div>}
            <div style={{ ...s.glass, overflowX: 'auto' }}>
                {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>{['Name', 'Code', 'Category', 'Risk', 'Description', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item.id}>
                                    <td style={{ ...s.td, fontWeight: '600' }}>{item.name}</td>
                                    <td style={{ ...s.td, fontFamily: 'monospace', color: '#a78bfa' }}>{item.code || '—'}</td>
                                    <td style={s.td}><span style={s.badge('#06b6d4')}>{item.category}</span></td>
                                    <td style={s.td}><span style={s.badge(riskColors[item.riskLevel] || '#94a3b8')}>{item.riskLevel}</span></td>
                                    <td style={{ ...s.td, maxWidth: '300px', color: '#94a3b8', fontSize: '0.85rem' }}>{item.description || '—'}</td>
                                    <td style={s.td}>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button style={s.btnSm('#a855f7')} onClick={() => openEdit(item)}><Edit3 size={13} /></button>
                                            <button style={s.btnSm('#ef4444')} onClick={() => handleDelete(item.id)}><Trash2 size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#64748b' }}>No ingredients found. Click "Add Ingredient" to start building your database.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
            <Modal show={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Ingredient' : 'Edit Ingredient'}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>Name *</label>
                        <input style={s.input} placeholder="e.g. Monosodium Glutamate" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>E-Number / Code</label>
                            <input style={s.input} placeholder="e.g. E621" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>Category</label>
                            <select style={{ ...s.select, width: '100%' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>Risk Level</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['safe', 'low', 'moderate', 'high'].map(r => (
                                <button key={r} onClick={() => setForm({ ...form, riskLevel: r })}
                                    style={{ ...s.btnSm(riskColors[r]), opacity: form.riskLevel === r ? 1 : 0.4, textTransform: 'capitalize', padding: '0.4rem 1rem' }}>{r}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>Description</label>
                        <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} placeholder="What does this ingredient do? Any health concerns?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' }}>Alternate Names (comma-separated)</label>
                        <input style={s.input} placeholder="e.g. MSG, Ajinomoto, INS 621" value={form.alternateNames} onChange={e => setForm({ ...form, alternateNames: e.target.value })} />
                    </div>
                    <button style={{ ...s.btn(), width: '100%', justifyContent: 'center' }} onClick={handleSave}><Save size={16} /> Save Ingredient</button>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLAGGED SUBSTANCES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function FlaggedTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', severity: 'moderate', reason: '', source: 'FSSAI', affectedProducts: '' });
    const [msg, setMsg] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        const res = await api('/flagged');
        if (res.success) setItems(res.flagged);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);
    
    useSyncEffect(SYNC_KEYS.FLAGGED, load);

    const openAdd = () => { setForm({ name: '', code: '', severity: 'moderate', reason: '', source: 'FSSAI', affectedProducts: '' }); setModal('add'); };
    const openEdit = (item) => { setForm({ name: item.name, code: item.code, severity: item.severity, reason: item.reason, source: item.source, affectedProducts: (item.affectedProducts || []).join(', ') }); setModal(item); };

    const handleSave = async () => {
        const body = { ...form, affectedProducts: form.affectedProducts.split(',').map(s => s.trim()).filter(Boolean) };
        if (modal === 'add') await api('/flagged', { method: 'POST', body });
        else await api(`/flagged/${modal.id}`, { method: 'PUT', body });
        setModal(null);
        load();
        setMsg('Saved!');
        setTimeout(() => setMsg(''), 2000);
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this flag?')) return;
        await api(`/flagged/${id}`, { method: 'DELETE' });
        load();
    };

    const toggleActive = async (item) => {
        await api(`/flagged/${item.id}`, { method: 'PUT', body: { isActive: !item.isActive } });
        load();
    };

    const sevColor = { low: '#84cc16', moderate: '#f59e0b', high: '#ef4444', critical: '#dc2626' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>⚠️ Flagged Harmful Substances ({items.length})</h2>
                <button style={s.btn('#ef4444')} onClick={openAdd}><Flag size={16} /> Flag Substance</button>
            </div>
            {msg && <div style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginBottom: '1rem', fontSize: '0.85rem' }}>✅ {msg}</div>}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : items.length === 0 ? (
                    <div style={{ ...s.glass, textAlign: 'center', padding: '3rem' }}>
                        <AlertTriangle size={40} style={{ color: '#64748b', marginBottom: '1rem' }} />
                        <p style={{ color: '#64748b' }}>No substances flagged yet. Use "Flag Substance" to add harmful ingredients that should trigger warnings.</p>
                    </div>
                ) : items.map(item => (
                    <motion.div key={item.id} style={{ ...s.glass, borderLeft: `4px solid ${sevColor[item.severity] || '#f59e0b'}`, opacity: item.isActive ? 1 : 0.5 }}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: item.isActive ? 1 : 0.5, x: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{item.name}</h3>
                                    {item.code && <span style={{ fontFamily: 'monospace', color: '#a78bfa', fontSize: '0.85rem' }}>{item.code}</span>}
                                    <span style={s.badge(sevColor[item.severity])}>{item.severity}</span>
                                    {!item.isActive && <span style={s.badge('#94a3b8')}>Inactive</span>}
                                </div>
                                <p style={{ margin: '0 0 0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>{item.reason}</p>
                                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                                    <span>Source: {item.source}</span>
                                    <span>Flagged: {new Date(item.createdAt).toLocaleDateString()}</span>
                                    {(item.affectedProducts || []).length > 0 && <span>Affects: {item.affectedProducts.join(', ')}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                <button style={s.btnSm(item.isActive ? '#94a3b8' : '#22c55e')} onClick={() => toggleActive(item)}>{item.isActive ? <Eye size={13} /> : <Check size={13} />}</button>
                                <button style={s.btnSm('#a855f7')} onClick={() => openEdit(item)}><Edit3 size={13} /></button>
                                <button style={s.btnSm('#ef4444')} onClick={() => handleDelete(item.id)}><Trash2 size={13} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <Modal show={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Flag Harmful Substance' : 'Edit Flag'}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Substance Name *</label>
                            <input style={s.input} placeholder="e.g. Lead acetate" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Code</label>
                            <input style={s.input} placeholder="e.g. E210" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Severity</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['low', 'moderate', 'high', 'critical'].map(sv => (
                                <button key={sv} onClick={() => setForm({ ...form, severity: sv })}
                                    style={{ ...s.btnSm(sevColor[sv]), opacity: form.severity === sv ? 1 : 0.4, textTransform: 'capitalize', padding: '0.4rem 1rem' }}>{sv}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Reason / Health Impact</label>
                        <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} placeholder="Why is this substance harmful?" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Source</label>
                            <input style={s.input} placeholder="e.g. FSSAI, WHO, FDA" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Affected Products</label>
                            <input style={s.input} placeholder="Comma-separated list" value={form.affectedProducts} onChange={e => setForm({ ...form, affectedProducts: e.target.value })} />
                        </div>
                    </div>
                    <button style={{ ...s.btn('#ef4444'), width: '100%', justifyContent: 'center' }} onClick={handleSave}><Flag size={16} /> Save Flag</button>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('adminToken'));
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await api('/stats');
            if (res.success) setStats(res.stats);
        } catch { /* backend may not be running */ }
        setStatsLoading(false);
    }, []);

    useEffect(() => { if (loggedIn) loadStats(); }, [loggedIn, loadStats]);

    // Background Poll Stats every 20 seconds (Live Admin View)
    usePolling(SYNC_KEYS.ADMIN_STATS, 20000);
    
    // Listen for mutations that invalidates stats
    useSyncEffect(SYNC_KEYS.ADMIN_STATS, loadStats);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setLoggedIn(false);
    };

    if (!loggedIn) return <AdminLogin onLogin={setLoggedIn} />;

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'ingredients', label: 'Ingredients', icon: FlaskConical },
        { id: 'flagged', label: 'Flagged Substances', icon: AlertTriangle },
    ];

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>True FoodBite Admin</h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem' }}>Administration Panel</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button style={s.btnSm('#06b6d4')} onClick={loadStats}><RefreshCw size={13} /> Refresh</button>
                    <button style={s.btn('#ef4444')} onClick={handleLogout}><LogOut size={16} /> Logout</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '14px' }}>
                {tabs.map(t => (
                    <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {tab === 'dashboard' && <DashboardTab stats={stats} loading={statsLoading} />}
                    {tab === 'users' && <UsersTab />}
                    {tab === 'ingredients' && <IngredientsTab />}
                    {tab === 'flagged' && <FlaggedTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
