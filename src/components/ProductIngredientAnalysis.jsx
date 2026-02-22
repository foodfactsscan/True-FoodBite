/**
 * ProductIngredientAnalysis — Advanced Ingredient Analysis Panel for Product Details
 * Shows the full analysis breakdown for any product's ingredient list.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Eye, Info } from 'lucide-react';
import { analyzeIngredientText } from '../services/ingredientAnalyzer';

const RISK_COLORS = {
    safe: { bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    moderate: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    risky: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)', color: '#f87171' },
};
const NOVA_LABELS = {
    1: { label: 'Unprocessed', color: '#22c55e' },
    2: { label: 'Processed Ingredients', color: '#3b82f6' },
    3: { label: 'Processed Food', color: '#f59e0b' },
    4: { label: 'Ultra-Processed', color: '#ef4444' },
};

const IngredientItem = ({ item, depth = 0 }) => {
    const rc = RISK_COLORS[item.risk];
    return (
        <div style={{
            padding: '0.55rem 0.7rem',
            borderRadius: '8px',
            background: rc.bg,
            border: `1px solid ${rc.border}`,
            marginLeft: `${depth * 1}rem`,
            marginTop: '0.4rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                <div>
                    <span style={{ fontWeight: '700', fontSize: '0.82rem', color: rc.color }}>{item.name}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{item.categoryLabel}</span>
                        <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '6px', background: item.isArtificial ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: item.isArtificial ? '#f87171' : '#4ade80' }}>
                            {item.isArtificial ? '⚗️ Artificial' : '🌿 Natural'}
                        </span>
                        {item.isUltraProcessed && <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>⚙️ Ultra-Processed</span>}
                        {item.allergens.map((al, j) => (
                            <span key={j} style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{al.label}</span>
                        ))}
                    </div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: rc.color, textTransform: 'capitalize' }}>{item.risk}</span>
            </div>
            {(item.note || item.hiddenInfo) && (
                <div style={{ marginTop: '0.25rem', fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: '0.2rem' }}>
                    <Info size={10} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <span>{item.hiddenInfo ? `⚠ ${item.hiddenInfo}` : ''}{item.hiddenInfo && item.note ? ' · ' : ''}{item.note || ''}</span>
                </div>
            )}
            {item.children && item.children.length > 0 && (
                <div style={{ marginTop: '0.4rem', borderLeft: '1px dashed rgba(255,255,255,0.1)', paddingLeft: '0.5rem' }}>
                    {item.children.map((child, k) => (
                        <IngredientItem key={k} item={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductIngredientAnalysis = ({ ingredientText }) => {
    const [expandedCat, setExpandedCat] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const analysis = useMemo(() => {
        if (!ingredientText) return null;
        return analyzeIngredientText(ingredientText);
    }, [ingredientText]);

    if (!analysis || analysis.summary.total === 0) return null;

    const { summary, allergens, hiddenIngredients, categories, isVegetarian, isVegan, ultraProcessedCount, novaGroup, overallRisk, ingredients: analyzedList } = analysis;
    const nova = NOVA_LABELS[novaGroup];
    const riskColor = RISK_COLORS[overallRisk];
    const safePercent = summary.total > 0 ? Math.round((summary.safe / summary.total) * 100) : 0;

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* Header with risk score */}
            <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Donut */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke={riskColor.color} strokeWidth="3"
                                strokeDasharray={`${safePercent} ${100 - safePercent}`} strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: riskColor.color }}>{safePercent}%</span>
                            <span style={{ fontSize: '0.5rem', color: '#94a3b8' }}>safe</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            🧪 Advanced Ingredient Analysis
                            <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '16px', background: riskColor.bg, color: riskColor.color, fontWeight: '600', border: `1px solid ${riskColor.border}` }}>
                                {overallRisk === 'safe' ? '✅ Safe' : overallRisk === 'moderate' ? '⚠️ Moderate' : '🚫 Risky'}
                            </span>
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                            {[{ l: `${summary.safe} Safe`, c: '#4ade80' }, { l: `${summary.moderate} Moderate`, c: '#fbbf24' }, { l: `${summary.risky} Risky`, c: '#f87171' }].map(x => (
                                <span key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: x.c, fontWeight: '600' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: x.c }} />{x.l}
                                </span>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{summary.total} ingredients analyzed</p>
                    </div>
                </div>
            </div>

            {/* Status badges row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '0.7rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{isVegan ? '🌿' : isVegetarian ? '🥬' : '🍖'}</span>
                    <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: '700', color: isVegan ? '#22c55e' : isVegetarian ? '#4ade80' : '#f59e0b' }}>
                            {isVegan ? 'Vegan' : isVegetarian ? 'Vegetarian' : 'Non-Veg'}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Diet Status</div>
                    </div>
                </div>
                <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '0.7rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: nova.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>
                        {novaGroup}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: '700', color: nova.color }}>{nova.label}</div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>NOVA Group</div>
                    </div>
                </div>
                <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '0.7rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                    <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: '700', color: ultraProcessedCount > 3 ? '#ef4444' : ultraProcessedCount > 0 ? '#f59e0b' : '#22c55e' }}>
                            {ultraProcessedCount} / {summary.total}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Ultra-Processed</div>
                    </div>
                </div>
            </div>

            {/* Allergen alerts */}
            {allergens.length > 0 && (
                <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '0.9rem 1rem', marginBottom: '0.75rem', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={14} /> Allergen Warning
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {allergens.map((a, i) => (
                            <span key={i} style={{ padding: '0.2rem 0.6rem', borderRadius: '16px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontWeight: '600' }}>
                                {a.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden ingredients */}
            {hiddenIngredients.length > 0 && (
                <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '0.9rem 1rem', marginBottom: '0.75rem', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Eye size={14} /> Hidden Ingredients
                    </h4>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                        {hiddenIngredients.map((h, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.3rem 0.5rem', borderRadius: '6px', background: 'rgba(245,158,11,0.06)' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#fbbf24' }}>{h.ingredient}</span>
                                <span style={{ fontSize: '0.72rem', color: '#fde68a' }}>→ {h.hiddenAs}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category breakdown */}
            <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '0.9rem 1rem', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.6rem' }}>📋 Categories</h4>
                <div style={{ display: 'grid', gap: '0.3rem' }}>
                    {Object.entries(categories).map(([catKey, cat]) => (
                        <div key={catKey}>
                            <button onClick={() => setExpandedCat(expandedCat === catKey ? null : catKey)}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: expandedCat === catKey ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <span>{cat.label}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span style={{ fontSize: '0.68rem', padding: '0.05rem 0.35rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontWeight: '600' }}>{cat.count}</span>
                                    {expandedCat === catKey ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </span>
                            </button>
                            <AnimatePresence>
                                {expandedCat === catKey && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', paddingLeft: '0.8rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0.4rem 0' }}>
                                            {cat.items.map((name, i) => {
                                                const a = analyzedList.find(x => x.name === name);
                                                const rc = RISK_COLORS[a?.risk || 'safe'];
                                                return (
                                                    <span key={i} style={{ padding: '0.2rem 0.5rem', borderRadius: '14px', fontSize: '0.72rem', background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                                                        {a?.risk === 'risky' && <AlertTriangle size={9} />}
                                                        {a?.risk === 'safe' && <Check size={9} />}
                                                        {name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* All ingredients chips + expandable details */}
            <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '0.9rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800' }}>🔍 All Ingredients ({summary.total})</h4>
                    <button onClick={() => setShowDetails(!showDetails)}
                        style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {showDetails ? <><ChevronUp size={11} /> Collapse</> : <><ChevronDown size={11} /> Details</>}
                    </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {analyzedList.map((a, i) => {
                        const rc = RISK_COLORS[a.risk];
                        return (
                            <span key={i} title={[a.categoryLabel, a.isArtificial ? 'Artificial' : 'Natural', a.note].filter(Boolean).join(' · ')}
                                style={{ padding: '0.2rem 0.5rem', borderRadius: '16px', fontSize: '0.72rem', background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, display: 'inline-flex', alignItems: 'center', gap: '0.15rem', cursor: 'help' }}>
                                {a.risk === 'risky' && <AlertTriangle size={9} />}
                                {a.risk === 'safe' && <Check size={9} />}
                                {a.name}
                                {a.isArtificial && <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>⚗️</span>}
                            </span>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {showDetails && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.6rem' }}>
                            <div style={{ display: 'grid', gap: '0.4rem' }}>
                                {analyzedList.map((a, i) => (
                                    <IngredientItem key={i} item={a} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductIngredientAnalysis;
