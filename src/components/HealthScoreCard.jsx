import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateHealthScore } from '../services/healthScoreEngine';
import { Star, ChevronDown, ChevronUp, Heart, Shield, Leaf, FlaskConical } from 'lucide-react';

/**
 * HealthScoreCard — displays 0–100 score as a circular ring with grade badge,
 * breakdown bars, summary, and personal verdicts.
 *
 * Props:
 *   product  - product data from OpenFoodFacts
 *   userProfile - (optional) user health profile
 */
export default function HealthScoreCard({ product, userProfile }) {
    const [expanded, setExpanded] = useState(false);

    if (!product) return null;
    const result = calculateHealthScore(product, userProfile);
    const { score, grade, gradeColor, gradeLabel, breakdown, summary, personalVerdicts } = result;

    const ringRadius = 58;
    const circumference = 2 * Math.PI * ringRadius;
    const strokeDash = (score / 100) * circumference;

    const breakdownIcons = {
        nutrition: Heart,
        processing: Shield,
        additives: FlaskConical,
        ingredients: Leaf,
    };

    return (
        <motion.div
            style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem',
                backdropFilter: 'blur(10px)', marginBottom: '1rem',
            }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                {/* Circular score ring */}
                <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                    <svg width="130" height="130" viewBox="0 0 130 130">
                        <circle cx="65" cy="65" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                        <motion.circle cx="65" cy="65" r={ringRadius} fill="none" stroke={gradeColor} strokeWidth="8"
                            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference}
                            animate={{ strokeDashoffset: circumference - strokeDash }} transition={{ duration: 1.2, ease: 'easeOut' }}
                            transform="rotate(-90 65 65)" />
                    </svg>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: gradeColor, lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>/ 100</div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Star size={20} style={{ color: gradeColor }} />
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Overall Health Score</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{
                            display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '20px',
                            fontSize: '0.9rem', fontWeight: '700',
                            background: `${gradeColor}20`, color: gradeColor, border: `1px solid ${gradeColor}40`,
                        }}>
                            Grade {grade} — {gradeLabel}
                        </span>
                    </div>
                    {/* First summary line */}
                    {summary[0] && <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>{summary[0]}</p>}
                </div>
            </div>

            {/* Score breakdown bars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {Object.entries(breakdown).map(([key, data]) => {
                    const Icon = breakdownIcons[key] || Star;
                    const pct = Math.round((data.score / data.max) * 100);
                    const barColor = pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444';
                    return (
                        <div key={key} style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                <Icon size={14} style={{ color: barColor }} />
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{data.label}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: '700', color: barColor }}>
                                    {data.score}/{data.max}
                                </span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <motion.div style={{ height: '100%', borderRadius: '3px', background: barColor }}
                                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary points */}
            {summary.length > 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {summary.slice(1).map((s, i) => (
                        <span key={i} style={{
                            padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem',
                            background: 'rgba(255,255,255,0.05)', color: '#cbd5e1',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>{s}</span>
                    ))}
                </div>
            )}

            {/* Personal verdicts */}
            {personalVerdicts.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                    <button onClick={() => setExpanded(!expanded)}
                        style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.88rem', fontWeight: '600', padding: 0 }}>
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        Personalised Verdicts ({personalVerdicts.length})
                    </button>
                    {expanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                            {personalVerdicts.map((v, i) => (
                                <div key={i} style={{
                                    padding: '0.6rem 0.8rem', borderRadius: '10px',
                                    background: v.severity === 'danger' ? 'rgba(239,68,68,0.08)' :
                                        v.severity === 'warning' ? 'rgba(245,158,11,0.08)' :
                                            'rgba(34,197,94,0.08)',
                                    borderLeft: `3px solid ${v.severity === 'danger' ? '#ef4444' : v.severity === 'warning' ? '#f59e0b' : '#22c55e'}`,
                                }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: v.severity === 'danger' ? '#fca5a5' : v.severity === 'warning' ? '#fcd34d' : '#86efac' }}>
                                        {v.condition}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.15rem' }}>{v.verdict}</div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
