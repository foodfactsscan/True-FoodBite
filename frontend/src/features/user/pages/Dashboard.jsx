
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Clock, Heart, Notebook, Activity,
    ChevronRight, Calendar, Trash2, Scale,
    Flame, Droplets, Cookie, Zap, Star, AlertCircle
} from 'lucide-react';
import trackingService from '../services/historyService';
import profileService from '../services/profileService';
import { calculateDailyRecommendations } from '../../product/services/personalizedEngine';
import { useAuth } from '../../auth/context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('history'); // history, favorites, intake, notes

    // Data states
    const [history, setHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [notes, setNotes] = useState({});
    const [profile, setProfile] = useState(null);
    const [intakeData, setIntakeData] = useState({ summary: {}, entries: [] });
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const rda = useMemo(() => calculateDailyRecommendations(profile), [profile]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = () => {
        setHistory(trackingService.getHistory());
        setFavorites(trackingService.getFavorites());
        setNotes(trackingService._get('factsscan_notes_cache'));
        setProfile(profileService.getCachedProfile());
        setIntakeData(trackingService.getDailySummary(selectedDate));
    };

    const handleDeleteIntake = (timestamp) => {
        const list = trackingService._get('factsscan_intake_cache');
        const updated = list.filter(i => i.timestamp !== timestamp);
        trackingService._set('factsscan_intake_cache', updated);
        loadData();
    };

    const tabs = [
        { id: 'history', label: 'History', icon: <History size={18} /> },
        { id: 'favorites', label: 'Favorites', icon: <Heart size={18} /> },
        { id: 'intake', label: 'Intake', icon: <Activity size={18} /> },
        { id: 'notes', label: 'My Notes', icon: <Notebook size={18} /> },
    ];

    if (authLoading) return <div className="loading-container">Loading Dashboard...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', paddingBottom: '6rem' }}
        >
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>Food Dashboard</h1>
                <p style={{ color: '#94a3b8' }}>Monitor your food scans, favorites and nutritional intake.</p>
            </div>

            {/* Daily Summary Quick View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <SummaryCard
                    label="Calories" value={Math.round(intakeData?.summary?.calories || 0)} limit={rda.calories} unit="kcal"
                    icon={<Flame size={20} color="#f87171" />} color="#ef4444"
                />
                <SummaryCard
                    label="Sugar" value={(intakeData?.summary?.sugar || 0).toFixed(1)} limit={rda.sugar} unit="g"
                    icon={<Cookie size={20} color="#fbbf24" />} color="#f59e0b"
                />
                <SummaryCard
                    label="Protein" value={(intakeData?.summary?.protein || 0).toFixed(1)} limit={rda.protein} unit="g"
                    icon={<Zap size={20} color="#4ade80" />} color="#10b981"
                />
                <SummaryCard
                    label="Salt" value={(intakeData?.summary?.salt || 0).toFixed(1)} limit={rda.salt} unit="g"
                    icon={<Droplets size={20} color="#60a5fa" />} color="#3b82f6"
                />
            </div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto',
                paddingBottom: '0.5rem', scrollbarWidth: 'none'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.25rem',
                            borderRadius: '16px', border: 'none', background: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab.id ? '#fff' : '#94a3b8', fontWeight: '700', cursor: 'pointer',
                            whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : 'none'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'history' && <HistoryTab history={history} navigate={navigate} />}
                    {activeTab === 'favorites' && <FavoritesTab favorites={favorites} navigate={navigate} />}
                    {activeTab === 'intake' && (
                        <IntakeTab
                            data={intakeData}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            onDelete={handleDeleteIntake}
                        />
                    )}
                    {activeTab === 'notes' && <NotesTab notes={notes} navigate={navigate} />}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

const SummaryCard = ({ label, value, limit, unit, icon, color }) => {
    const percent = Math.min(100, (value / limit) * 100);
    const isExceeded = value > limit && label !== 'Protein';

    return (
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: `4px solid ${isExceeded ? '#ef4444' : color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    {icon} {label}
                </div>
                {isExceeded && <AlertCircle size={14} color="#ef4444" />}
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: isExceeded ? '#fca5a5' : '#fff' }}>
                {value} <span style={{ fontSize: '0.8rem', fontWeight: '500', opacity: 0.5 }}>/ {limit} {unit}</span>
            </div>

            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{
                    width: `${percent}%`, height: '100%',
                    background: isExceeded ? '#ef4444' : color,
                    boxShadow: `0 0 10px ${isExceeded ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0,0,0,0.2)'}`,
                    transition: 'width 1s ease-out'
                }} />
            </div>
        </div>
    );
};

const HistoryTab = ({ history, navigate }) => (
    <div style={{ display: 'grid', gap: '1rem' }}>
        {history.length === 0 ? (
            <EmptyState icon={<Clock size={48} />} text="No scan history yet." />
        ) : (
            history.map((item, i) => (
                <ProductRow key={i} item={item} navigate={navigate} />
            ))
        )}
    </div>
);

const FavoritesTab = ({ favorites, navigate }) => (
    <div style={{ display: 'grid', gap: '1rem' }}>
        {favorites.length === 0 ? (
            <EmptyState icon={<Heart size={48} />} text="No favorites saved yet." />
        ) : (
            favorites.map((item, i) => (
                <ProductRow key={i} item={item} navigate={navigate} isFav />
            ))
        )}
    </div>
);

const IntakeTab = ({ data, selectedDate, setSelectedDate, onDelete }) => (
    <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={18} color="var(--color-primary)" />
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', padding: '0.5rem 1rem', borderRadius: '12px', outline: 'none'
                }}
            />
        </div>

        {data.entries.length === 0 ? (
            <EmptyState icon={<Scale size={48} />} text="No consumption logged for this date." />
        ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {data.entries.map((entry, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{entry.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {entry.grams}g • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '800', color: '#f87171' }}>{Math.round(entry?.nutrients?.calories || 0)} kcal</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{(entry?.nutrients?.sugar || 0).toFixed(1)}g sugar</div>
                            </div>
                            <button
                                onClick={() => onDelete(entry.timestamp)}
                                style={{ border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const NotesTab = ({ notes, navigate }) => {
    const noteList = useMemo(() => Object.entries(notes), [notes]);

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {noteList.length === 0 ? (
                <EmptyState icon={<Notebook size={48} />} text="You haven't added any personal notes yet." />
            ) : (
                noteList.map(([barcode, note]) => (
                    <div
                        key={barcode}
                        className="glass-card"
                        style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}
                        onClick={() => navigate(`/product/${barcode}`)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8' }}>ID: {barcode}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#e2e8f0' }}>"{note.text}"</p>
                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer' }}>
                            View Product <ChevronRight size={14} />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const ProductRow = ({ item, navigate, isFav }) => (
    <div
        onClick={() => navigate(`/product/${item.barcode}`)}
        className="glass-card"
        style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
    >
        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#fff', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', color: '#fff' }}>{item.productName}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.brand}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {item.grade && (
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: item.grade.toLowerCase() <= 'b' ? '#22c55e' : item.grade.toLowerCase() === 'c' ? '#f59e0b' : '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.1rem'
                }}>
                    {item.grade.toUpperCase()}
                </div>
            )}
            {isFav && <Heart size={18} fill="#ef4444" color="#ef4444" />}
            <ChevronRight size={20} color="#334155" />
        </div>
    </div>
);

const EmptyState = ({ icon, text }) => (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
        <div style={{ marginBottom: '1.5rem', opacity: 0.1 }}>{icon}</div>
        <div style={{ fontWeight: '600' }}>{text}</div>
    </div>
);

export default Dashboard;
