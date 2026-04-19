import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertTriangle, CheckCircle, Info, ChevronDown, Search } from 'lucide-react';
import { ADDITIVE_DICTIONARY, lookupAdditive, detectAdditives } from '../services/healthScoreEngine';

/**
 * LabelInterpreter — takes ingredient_text and renders an interactive explainer.
 * Shows each detected additive/E-number with name, risk, and description.
 *
 * Props:
 *   ingredientText - the raw ingredient text from product data
 */
export default function LabelInterpreter({ ingredientText }) {
    const [expanded, setExpanded] = useState(false);
    const [search, setSearch] = useState('');

    if (!ingredientText) return null;

    const detectedAdditives = detectAdditives(ingredientText);

    // Also allow manual search
    const searchResult = search.trim() ? lookupAdditive(search.trim()) : null;

    const riskColor = (risk) => risk === 'high' ? '#ef4444' : risk === 'moderate' ? '#f59e0b' : '#22c55e';
    const riskIcon = (risk) => risk === 'high' ? AlertTriangle : risk === 'moderate' ? Info : CheckCircle;

    if (detectedAdditives.length === 0 && !expanded) return null;

    return (
        <motion.div
            style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem',
                marginBottom: '1rem',
            }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

            <button onClick={() => setExpanded(!expanded)}
                style={{
                    background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, width: '100%',
                    fontSize: '1rem', fontWeight: '600',
                }}>
                <BookOpen size={18} style={{ color: '#a855f7' }} />
                Label Interpreter
                {detectedAdditives.length > 0 && (
                    <span style={{
                        padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem',
                        background: 'rgba(168,85,247,0.2)', color: '#a855f7',
                    }}>{detectedAdditives.length} additives found</span>
                )}
                <ChevronDown size={16} style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        {/* Manual lookup */}
                        <div style={{ marginTop: '1rem', marginBottom: '1rem', position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                style={{
                                    width: '100%', padding: '0.6rem 0.6rem 0.6rem 2rem', borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
                                    color: '#e2e8f0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
                                }}
                                placeholder="Look up any E-number or INS code (e.g. E621, INS 211)..."
                                value={search} onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Search result */}
                        {searchResult && (
                            <div style={{
                                padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem',
                                background: `${riskColor(searchResult.risk)}10`,
                                borderLeft: `3px solid ${riskColor(searchResult.risk)}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '700', textTransform: 'uppercase', color: riskColor(searchResult.risk) }}>
                                        {searchResult.code}
                                    </span>
                                    <span style={{ fontWeight: '600' }}>{searchResult.name}</span>
                                    <span style={{
                                        padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                                        background: `${riskColor(searchResult.risk)}20`, color: riskColor(searchResult.risk),
                                    }}>{searchResult.risk}</span>
                                </div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{searchResult.desc}</p>
                            </div>
                        )}

                        {search.trim() && !searchResult && (
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                No match found for "{search}". Try E621, E211, INS 322, etc.
                            </p>
                        )}

                        {/* Detected additives */}
                        {detectedAdditives.length > 0 && (
                            <>
                                <h4 style={{ margin: '0 0 0.75rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Detected in this product
                                </h4>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {detectedAdditives.map((a, i) => {
                                        const Icon = riskIcon(a.risk);
                                        return (
                                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                                style={{
                                                    display: 'flex', gap: '0.6rem', padding: '0.6rem',
                                                    borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                                                    borderLeft: `3px solid ${riskColor(a.risk)}`,
                                                }}>
                                                <Icon size={16} style={{ color: riskColor(a.risk), marginTop: '2px', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                        <span style={{ fontFamily: 'monospace', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem' }}>{a.code}</span>
                                                        <span style={{ fontSize: '0.85rem' }}>→</span>
                                                        <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>{a.name}</span>
                                                        <span style={{
                                                            padding: '0.1rem 0.4rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700',
                                                            background: `${riskColor(a.risk)}20`, color: riskColor(a.risk),
                                                        }}>{a.risk}</span>
                                                    </div>
                                                    <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>{a.desc}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {detectedAdditives.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#22c55e' }}>
                                <CheckCircle size={24} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0 }}>No concerning additives detected</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
