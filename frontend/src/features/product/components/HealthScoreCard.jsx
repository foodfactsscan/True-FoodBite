import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateHealthScore } from '../services/healthScoreEngine';
import { 
    Star, 
    ChevronDown, 
    ChevronUp, 
    Heart, 
    Shield, 
    Leaf, 
    FlaskConical,
    Activity,
    Info,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function HealthScoreCard({ product, userProfile }) {
    const [expanded, setExpanded] = useState(false);

    if (!product) return null;
    const result = calculateHealthScore(product, userProfile);
    const { score, grade, gradeColor, gradeLabel, breakdown, summary, personalVerdicts } = result;

    const ringRadius = 54;
    const circumference = 2 * Math.PI * ringRadius;
    const strokeDash = (score / 100) * circumference;

    const breakdownIcons = {
        nutrition: Heart,
        processing: Activity,
        additives: FlaskConical,
        ingredients: Leaf,
    };

    return (
        <motion.div
            className="glass-card"
            style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.75rem',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Glow Effect */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: gradeColor,
                filter: 'blur(80px)',
                opacity: 0.15,
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                        padding: '0.5rem', 
                        borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.05)',
                        color: gradeColor
                    }}>
                        <Star size={22} fill={gradeColor} fillOpacity={0.2} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>FoodBite Score</h3>
                </div>
                <div style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '30px',
                    background: `${gradeColor}20`,
                    color: gradeColor,
                    border: `1px solid ${gradeColor}30`,
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Grade {grade}
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                {/* Score Gauge */}
                <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="70" cy="70" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                        <motion.circle 
                            cx="70" cy="70" r={ringRadius} fill="none" 
                            stroke={gradeColor} strokeWidth="12"
                            strokeLinecap="round" 
                            strokeDasharray={circumference} 
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference - strokeDash }} 
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} 
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: 0.9 }}>{score}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginTop: '4px' }}>OUT OF 100</div>
                    </div>
                </div>

                {/* Verdict Info */}
                <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: '800', 
                        color: gradeColor, 
                        lineHeight: 1.2,
                        marginBottom: '0.5rem'
                    }}>
                        {gradeLabel}
                    </div>
                    {summary[0] && (
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem', lineHeight: 1.5, fontWeight: '500' }}>
                            {summary[0]}
                        </p>
                    )}
                    
                    {/* Action Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
                        {summary.slice(1).map((tag, i) => {
                            const isPositive = tag.includes('✅') || tag.includes('🌿') || tag.includes('💪') || tag.includes('🌾');
                            const bgColor = isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                            const textColor = isPositive ? '#4ade80' : '#f87171';
                            const borderColor = isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
                            
                            return (
                                <span key={i} style={{
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    background: bgColor,
                                    color: textColor,
                                    border: `1px solid ${borderColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}>
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Breakdown Bars */}
            <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '16px', 
                padding: '1.25rem',
                border: '1px solid rgba(255,255,255,0.04)',
                marginBottom: '1rem',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Activity size={16} color="#94a3b8" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Rating Components
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    {Object.entries(breakdown).map(([key, data]) => {
                        const Icon = breakdownIcons[key] || Star;
                        const pct = Math.round((data.score / data.max) * 100);
                        const barColor = pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444';
                        
                        return (
                            <div key={key}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Icon size={16} color={barColor} />
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f1f5f9' }}>{data.label}</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '800', color: barColor }}>
                                        {data.score}<span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>/{data.max}</span>
                                    </span>
                                </div>
                                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <motion.div 
                                        style={{ height: '100%', borderRadius: '4px', background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${pct}%` }} 
                                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }} 
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Personalized Verdicts - Re-styled */}
            {personalVerdicts.length > 0 && (
                <div style={{ marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
                    <button 
                        onClick={() => setExpanded(!expanded)}
                        style={{ 
                            width: '100%',
                            background: 'rgba(167, 139, 250, 0.1)', 
                            border: '1px solid rgba(167, 139, 250, 0.2)', 
                            borderRadius: '12px',
                            color: '#a78bfa', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '1rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Shield size={18} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Your Personal Verdicts</span>
                            <span style={{ 
                                background: '#a78bfa', 
                                color: '#0f172a', 
                                padding: '0.1rem 0.5rem', 
                                borderRadius: '10px', 
                                fontSize: '0.7rem',
                                fontWeight: '900'
                            }}>
                                {personalVerdicts.length}
                            </span>
                        </div>
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    <AnimatePresence>
                        {expanded && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                style={{ overflow: 'hidden', display: 'grid', gap: '0.75rem' }}
                            >
                                {personalVerdicts.map((v, i) => {
                                    const isDanger = v.severity === 'danger';
                                    const isWarning = v.severity === 'warning';
                                    const StatusIcon = isDanger ? AlertCircle : isWarning ? Info : CheckCircle2;
                                    const statusColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';
                                    
                                    return (
                                        <div key={i} style={{
                                            padding: '1rem', 
                                            borderRadius: '14px',
                                            background: `${statusColor}08`,
                                            border: `1px solid ${statusColor}15`,
                                            display: 'flex',
                                            gap: '0.75rem'
                                        }}>
                                            <StatusIcon size={18} color={statusColor} style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.2rem' }}>
                                                    {v.condition}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                                    {v.verdict}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}

