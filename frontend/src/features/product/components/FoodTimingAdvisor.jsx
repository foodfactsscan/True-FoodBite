import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Thermometer, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info, Star } from 'lucide-react';
import { generateFoodTimingAdvice } from '../services/foodTimingEngine';

const severityConfig = {
    safe:    { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)',  border: 'rgba(34, 197, 94, 0.2)',  Icon: CheckCircle },
    warning: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', Icon: AlertTriangle },
    danger:  { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)',  border: 'rgba(239, 68, 68, 0.2)',  Icon: AlertTriangle },
    neutral: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.06)',border: 'rgba(148, 163, 184, 0.1)', Icon: Info },
};

function AdviceItem({ text, severity }) {
    const cfg = severityConfig[severity] || severityConfig.neutral;
    const { Icon } = cfg;
    return (
        <div style={{
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            padding: '0.875rem 1rem', borderRadius: '14px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            marginBottom: '0.6rem'
        }}>
            <Icon size={17} color={cfg.color} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.55 }}>{text}</span>
        </div>
    );
}

export default function FoodTimingAdvisor({ product }) {
    const [advice, setAdvice] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        if (!product) return;
        setAdvice(generateFoodTimingAdvice(product));
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, [product]);

    if (!advice) return null;

    const { currentSlot, currentSeason, timeAdvice, seasonAdvice, bestTime, worstTime } = advice;

    const allBad = [...timeAdvice, ...seasonAdvice].every(a => a.severity === 'danger');
    const allGood = [...timeAdvice, ...seasonAdvice].every(a => a.severity === 'safe');
    const headerColor = allBad ? '#ef4444' : allGood ? '#22c55e' : '#f59e0b';
    const headerLabel = allBad ? 'Not Ideal Right Now' : allGood ? 'Great Time to Eat' : 'Consume With Caution';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Ambient glow */}
            <div style={{
                position: 'absolute', top: '-40px', left: '-40px',
                width: '120px', height: '120px',
                background: headerColor, filter: 'blur(70px)', opacity: 0.1,
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: headerColor }}>
                        <Clock size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.01em' }}>Food Timing Intelligence</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                            {currentSlot.icon} {currentSlot.label} &nbsp;·&nbsp; {currentSeason.icon} {currentSeason.label}
                        </div>
                    </div>
                </div>
                <span style={{
                    padding: '0.35rem 0.9rem', borderRadius: '30px',
                    background: `${headerColor}15`, color: headerColor,
                    border: `1px solid ${headerColor}25`,
                    fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase',
                    letterSpacing: '0.04em', flexShrink: 0
                }}>
                    {headerLabel}
                </span>
            </div>

            {/* Best / Worst Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.07)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#4ade80', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        ✅ Best Time
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#f1f5f9' }}>{bestTime.icon} {bestTime.slot}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', lineHeight: 1.4 }}>{bestTime.reason}</div>
                </div>
                <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.07)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#f87171', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        🚫 Worst Time
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#f1f5f9' }}>{worstTime.icon} {worstTime.slot}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', lineHeight: 1.4 }}>{worstTime.reason}</div>
                </div>
            </div>

            {/* Toggle Detail */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
                    position: 'relative', zIndex: 1
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', fontWeight: '700' }}>
                    <Thermometer size={16} />
                    Right Now Analysis — {currentSlot.icon} + {currentSeason.icon}
                </div>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}
                    >
                        <div style={{ paddingTop: '1rem' }}>
                            {/* Time Advice */}
                            {timeAdvice.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                                        {currentSlot.icon} {currentSlot.label} Analysis
                                    </div>
                                    {timeAdvice.map((a, i) => <AdviceItem key={`t-${i}`} {...a} />)}
                                </div>
                            )}

                            {/* Season Advice */}
                            {seasonAdvice.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                                        {currentSeason.icon} {currentSeason.label} Season
                                    </div>
                                    {seasonAdvice.map((a, i) => <AdviceItem key={`s-${i}`} {...a} />)}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
