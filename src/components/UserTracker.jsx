
import { useState, useEffect } from 'react';
import { Heart, Notebook, Plus, Check, ChevronRight, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import trackingService from '../services/historyService';

const UserTracker = ({ product, isAuthenticated }) => {
    const barcode = product._id || product.code;
    const [isFav, setIsFav] = useState(false);
    const [note, setNote] = useState('');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [tempNote, setTempNote] = useState('');
    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [grams, setGrams] = useState(100);
    const [logSuccess, setLogSuccess] = useState(false);

    useEffect(() => {
        if (barcode) {
            setIsFav(trackingService.isFavorite(barcode));
            setNote(trackingService.getNote(barcode));
            setTempNote(trackingService.getNote(barcode));
        }
    }, [barcode]);

    const handleToggleFav = async () => {
        const newList = await trackingService.toggleFavorite(product);
        setIsFav(newList.some(i => i.barcode === barcode));
    };

    const handleSaveNote = () => {
        trackingService.saveNote(barcode, tempNote);
        setNote(tempNote);
        setIsEditingNote(false);
    };

    const handleLogIntake = () => {
        trackingService.logConsumption(product, grams);
        setLogSuccess(true);
        setTimeout(() => {
            setLogSuccess(false);
            setShowIntakeModal(false);
        }, 2000);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👤 Personal Tracking
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {/* Favorite Toggle */}
                <button
                    onClick={handleToggleFav}
                    className="glass-card"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                        padding: '0.75rem', border: isFav ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                        background: isFav ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer', borderRadius: 'var(--radius-lg)', color: isFav ? '#ef4444' : '#94a3b8',
                        fontWeight: '700', transition: 'all 0.2s'
                    }}
                >
                    <Heart size={18} fill={isFav ? '#ef4444' : 'none'} />
                    {isFav ? 'Favorited' : 'Favorite'}
                </button>

                {/* Log Intake Trigger */}
                <button
                    onClick={() => setShowIntakeModal(true)}
                    className="glass-card"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                        padding: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.2)',
                        background: 'rgba(99, 102, 241, 0.05)',
                        cursor: 'pointer', borderRadius: 'var(--radius-lg)', color: '#818cf8',
                        fontWeight: '700', transition: 'all 0.2s'
                    }}
                >
                    <Plus size={18} />
                    Log Intake
                </button>
            </div>

            {/* Personal Notes Section */}
            <div className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Notebook size={14} /> Personal Note
                    </span>
                    {!isEditingNote ? (
                        <button onClick={() => setIsEditingNote(true)} style={{ fontSize: '0.7rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            {note ? 'Edit' : '+ Add Note'}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setIsEditingNote(false)} style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSaveNote} style={{ fontSize: '0.7rem', color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                        </div>
                    )}
                </div>

                {isEditingNote ? (
                    <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="e.g. Too salty, great with tea, causes bloating..."
                        style={{
                            width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                            padding: '0.75rem', borderRadius: 'var(--radius-md)', outline: 'none',
                            fontSize: '0.85rem', fontFamily: 'inherit'
                        }}
                    />
                ) : (
                    <p style={{ fontSize: '0.85rem', color: note ? '#fff' : '#64748b', fontStyle: note ? 'normal' : 'italic' }}>
                        {note || 'No notes added yet for this product.'}
                    </p>
                )}
            </div>

            {/* Intake Logging Modal */}
            <AnimatePresence>
                {showIntakeModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem', backdropFilter: 'blur(8px)'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={{
                                width: '100%', maxWidth: '400px', padding: '2rem',
                                border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Log Consumption</h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>How much {product.product_name} did you have?</p>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Quantity</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary)' }}>{grams} g</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="500"
                                    value={grams}
                                    onChange={(e) => setGrams(parseInt(e.target.value))}
                                    style={{ width: '100%', height: '6px', appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', accentColor: 'var(--color-primary)' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', opacity: 0.5, fontSize: '0.7rem' }}>
                                    <span>1g</span>
                                    <span>250g</span>
                                    <span>500g</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setShowIntakeModal(false)}
                                    className="btn-secondary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogIntake}
                                    className="btn-primary"
                                    style={{ flex: 2, justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                                    disabled={logSuccess}
                                >
                                    <AnimatePresence mode="wait">
                                        {logSuccess ? (
                                            <motion.div
                                                key="success"
                                                initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Check size={18} /> Logged!
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="add"
                                                initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
                                            >
                                                Add to Intake
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserTracker;
