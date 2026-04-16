import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, 
    ChevronUp, 
    FlaskConical, 
    Box, 
    Info, 
    AlertTriangle, 
    CheckCircle,
    Activity,
    BookOpen,
    ArrowRight
} from 'lucide-react';
import { 
    ADDITIVE_DATA, 
    NUTRIENT_RESEARCH, 
    POSITIVE_RESEARCH, 
    NOVA_RESEARCH 
} from '../services/nutritionResearchService';
import { parseAdditives } from '../services/additiveParser';

// ─── Sub-component for a Nutrient Row ─────────────────────────────────────────
const NutrientIntelligenceItem = ({ icon, name, value, unit, type, research, pct }) => {
    const [expanded, setExpanded] = useState(false);
    
    const isPositive = type === 'positive';
    const accentColor = isPositive ? '#22c55e' : '#ef4444';
    
    return (
        <div style={{
            background: expanded ? 'rgba(255,255,255,0.04)' : 'transparent',
            borderRadius: '20px',
            marginBottom: '0.5rem',
            border: expanded ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <button 
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', gap: '1rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                    <div style={{ 
                        width: '42px', height: '42px', borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.03)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' 
                    }}>
                        {icon}
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#f8fafc', letterSpacing: '-0.01em' }}>{name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {expanded ? 'Scientific analysis' : 'Tap for research & context'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', fontSize: '1.15rem', color: accentColor }}>
                            {value} <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{unit}</span>
                        </div>
                        {pct !== undefined && (
                            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                {pct.toFixed(0)}% Daily
                            </div>
                        )}
                    </div>
                    <div style={{ color: '#475569' }}>
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {research ? (
                                <div style={{ paddingTop: '1.25rem' }}>
                                    {/* What it is */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Info size={12} /> Clinical Perspective
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{research.what}</p>
                                    </div>

                                    {/* Medical / Health Impact */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <div style={{ 
                                            padding: '1rem', borderRadius: '14px', 
                                            background: isPositive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                                            border: `1px solid ${isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`
                                        }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                                                {isPositive ? '💪 Health Benefits' : '⚠️ Health Risks'}
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: isPositive ? '#dcfce7' : '#fee2e2', lineHeight: 1.5, margin: 0 }}>{research.why}</p>
                                        </div>
                                    </div>

                                    {/* Indian Context */}
                                    <div style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '1.25rem' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Activity size={12} /> The Indian Context
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: '#c7d2fe', lineHeight: 1.5, margin: 0 }}>{research.indianContext}</p>
                                    </div>

                                    {/* Authority Guideline */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <BookOpen size={14} color="#94a3b8" />
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8' }}>
                                            Guideline: <span style={{ color: '#f1f5f9' }}>{research.whoSays}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ paddingTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                                    Standard nutritional data. Consuming a balanced diet based on whole foods is recommended by all major health organizations.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DetailedNutrients = ({ product }) => {
    const [showAdditives, setShowAdditives] = useState(false);
    const [showProcessing, setShowProcessing] = useState(false);
    
    const n = product.nutriments || {};
    const additives = parseAdditives(product);
    const nova = product.nova_group;
    
    // Build nutrient list with research mapping
    const nutrientList = [
        { 
            key: 'saturated-fat', 
            icon: '🥓', 
            val: n['saturated-fat_100g'], 
            unit: 'g', 
            type: 'concern', 
            research: NUTRIENT_RESEARCH['saturated-fat'],
            pct: ((n['saturated-fat_100g'] || 0) / 22) * 100 
        },
        { 
            key: 'sodium', 
            icon: '🧂', 
            val: (n.sodium_100g || 0) * 1000, 
            unit: 'mg', 
            type: 'concern', 
            research: NUTRIENT_RESEARCH['sodium'],
            pct: ((n.sodium_100g || 0) / 2) * 100 
        },
        { 
            key: 'proteins', 
            icon: '💪', 
            val: n.proteins_100g, 
            unit: 'g', 
            type: 'positive', 
            research: POSITIVE_RESEARCH['proteins'],
            pct: ((n.proteins_100g || 0) / 60) * 100 
        },
        { 
            key: 'fiber', 
            icon: '🌾', 
            val: n.fiber_100g, 
            unit: 'g', 
            type: 'positive', 
            research: POSITIVE_RESEARCH['fiber'],
            pct: ((n.fiber_100g || 0) / 30) * 100 
        },
        { 
            key: 'sugars', 
            icon: '🍬', 
            val: n.sugars_100g, 
            unit: 'g', 
            type: 'concern', 
            research: NUTRIENT_RESEARCH['sugars'],
            pct: ((n.sugars_100g || 0) / 50) * 100 
        },
        { 
            key: 'trans-fat', 
            icon: '🚫', 
            val: n['trans-fat_100g'], 
            unit: 'g', 
            type: 'concern', 
            research: NUTRIENT_RESEARCH['trans-fat'],
            pct: ((n['trans-fat_100g'] || 0) / 2) * 100 
        },
    ].filter(item => item.val !== undefined && item.val !== null && item.val > 0.01);

    return (
        <div style={{ marginBottom: '3rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Activity size={20} color="var(--color-primary)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f1f5f9' }}>
                    Nutritional Intelligence & Breakdown
                </h3>
            </div>

            <div className="glass-panel" style={{ 
                padding: '0.75rem', borderRadius: '32px', 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' 
            }}>
                
                {/* 1. Processing Level Row (UPF Check) */}
                {nova && (
                    <div style={{ 
                        borderRadius: '24px', 
                        background: `${NOVA_RESEARCH[nova].color}08`, 
                        border: `1px solid ${NOVA_RESEARCH[nova].color}15`,
                        marginBottom: '0.5rem', 
                        overflow: 'hidden' 
                    }}>
                        <button 
                            onClick={() => setShowProcessing(!showProcessing)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box size={20} color={NOVA_RESEARCH[nova].color} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#f8fafc' }}>Processing Level</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>NOVA {nova}: {NOVA_RESEARCH[nova].label}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ 
                                    padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '900', 
                                    color: NOVA_RESEARCH[nova].color, background: `${NOVA_RESEARCH[nova].color}20`, border: `1px solid ${NOVA_RESEARCH[nova].color}30`, textTransform: 'uppercase' 
                                }}>
                                    {nova === 4 ? 'Avoid' : 'Caution'}
                                </span>
                                {showProcessing ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                            </div>
                        </button>
                        <AnimatePresence>
                            {showProcessing && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '0 1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>{NOVA_RESEARCH[nova].desc}</p>
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <AlertTriangle size={14} color="#f87171" />
                                            <span style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: '600' }}>{NOVA_RESEARCH[nova].impact}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 2. Additives Row */}
                {additives.length > 0 && (
                    <div style={{ 
                        borderRadius: '24px', 
                        background: 'rgba(234, 179, 8, 0.05)', 
                        border: '1px solid rgba(234, 179, 8, 0.12)',
                        marginBottom: '0.5rem', 
                        overflow: 'hidden' 
                    }}>
                        <button 
                            onClick={() => setShowAdditives(!showAdditives)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FlaskConical size={20} color="#eab308" />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#f8fafc' }}>Additives Analysis</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{additives.length} scientific additions detected</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eab308', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '900' }}>
                                    {additives.length}
                                </div>
                                {showAdditives ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                            </div>
                        </button>
                        <AnimatePresence>
                            {showAdditives && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '0 1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ marginTop: '1.25rem' }}>
                                            {additives.map((a, i) => {
                                                const normalized = a.code?.toLowerCase().replace('en:', '');
                                                const research = ADDITIVE_DATA[normalized];
                                                return (
                                                    <div key={i} style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <div style={{ fontWeight: '700', color: '#fff' }}>{a.code} {research ? `— ${research.commonName}` : (a.name ? `— ${a.name}` : '')}</div>
                                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#eab308', textTransform: 'uppercase' }}>{a.level || 'Unknown'}</span>
                                                        </div>
                                                        {research && (
                                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                                                <div style={{ marginBottom: '0.4rem' }}><strong>🎯 Used for:</strong> {research.usedFor}</div>
                                                                <div style={{ color: '#f87171' }}><strong>⚠️ Risk:</strong> {research.cons[0]}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 3. Nutrient Rows */}
                <div style={{ padding: '0.5rem' }}>
                    {nutrientList.map((item, idx) => (
                        <NutrientIntelligenceItem key={idx} {...item} name={item.research.label} value={item.val.toFixed(item.unit === 'g' ? 1 : 0)} />
                    ))}
                </div>
            </div>
            
            {/* Disclaimer */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <CheckCircle size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                    Our analysis is based on global scientific research. Always check the physical label on the pack before consumption. Nutrient figures are per 100g.
                </p>
            </div>
        </div>
    );
};

export default DetailedNutrients;
