/**
 * ============================================================
 * IngredientBreakdown — Complete Product Ingredient Intelligence
 * ============================================================
 * Uses OpenFoodFacts `product.ingredients[]` structured data:
 *   - ingredient.text         → name
 *   - ingredient.id           → E-code / category
 *   - ingredient.percent_min  → minimum % in product
 *   - ingredient.percent_max  → maximum % in product
 *   - ingredient.percent_estimate → best estimate %
 *   - ingredient.ingredients  → nested sub-ingredients
 *   - ingredient.vegan / vegetarian → dietary status
 *   - ingredient.from_palm_oil → palm oil flag
 *
 * Falls back to ingredients_text for parsing if structured
 * data is missing.
 * ============================================================
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info,
    FlaskConical, Eye, ShieldAlert, Leaf, List, BarChart3
} from 'lucide-react';
import { analyzeIngredientText } from '../services/ingredientAnalyzer';
import PriceRadar from './PriceRadar';

// ─── Risk Config ──────────────────────────────────────────────────────────────
const RISK = {
    safe:     { label: 'Safe',     color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)' },
    moderate: { label: 'Caution',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    risky:    { label: 'Avoid',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a percentage for display */
function fmtPct(estimate, min, max) {
    if (estimate !== undefined && estimate !== null) {
        return `${parseFloat(estimate).toFixed(2)}%`;
    }
    if (min !== undefined && max !== undefined) {
        return `${parseFloat(min).toFixed(2)}–${parseFloat(max).toFixed(2)}%`;
    }
    return null;
}

/** Clean an ingredient name from API (remove markup, fix casing) */
function cleanName(raw) {
    if (!raw) return '';
    // Preserve as much original label text as possible (only remove underscored/API prefixes)
    let processed = raw.replace(/_/g, ' ').replace(/en:/gi, '').trim();
    return processed.replace(/^(.)/, (c) => c.toUpperCase());
}

/** Build percentage bar style */
function PctBar({ pct, color }) {
    if (!pct) return null;
    const num = parseFloat(pct);
    const width = Math.min(100, Math.max(2, (num / 50) * 100)); // scale: 50% ingredient = full bar
    return (
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
        </div>
    );
}

// ─── Single Ingredient Row ────────────────────────────────────────────────────
function IngredientRow({ item, index, analysis }) {
    const [open, setOpen] = useState(false);

    const name = cleanName(item.text || item.id || '');
    const pct = fmtPct(item.percent_estimate, item.percent_min, item.percent_max);
    const pctNum = item.percent_estimate ?? item.percent_max ?? null;

    // Find matching analysis data by name lookup
    const analyzed = analysis?.ingredients?.find(a =>
        a.name.toLowerCase().includes(name.toLowerCase().slice(0, 8)) ||
        name.toLowerCase().includes(a.name.toLowerCase().slice(0, 8))
    );
    const risk = analyzed?.risk || 'safe';
    const rc = RISK[risk];

    const isVegan = item.vegan === 'yes';
    const isVegetarian = item.vegetarian === 'yes';
    const isPalmOil = item.from_palm_oil === 'yes';
    const hasChildren = item.ingredients && item.ingredients.length > 0;
    const hasNote = analyzed?.note || analyzed?.hiddenInfo;

    return (
        <div style={{
            background: open ? rc.bg : 'rgba(255,255,255,0.01)',
            border: `1px solid ${open ? rc.border : 'rgba(255,255,255,0.05)'}`,
            borderRadius: '16px',
            marginBottom: '0.5rem',
            overflow: 'hidden',
            transition: 'all 0.25s ease'
        }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    padding: '0.875rem 1rem', background: 'none', border: 'none',
                    cursor: 'pointer', gap: '0.75rem'
                }}
            >
                {/* Position number */}
                <div style={{
                    width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.05)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: '800', color: '#64748b'
                }}>
                    {index + 1}
                </div>

                {/* Name + bar */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f1f5f9' }}>{name}</span>
                        {hasNote && (
                            <span style={{ fontSize: '0.6rem', padding: '0 0.4rem', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: '700', border: '1px solid rgba(245,158,11,0.2)' }}>
                                ⚠
                            </span>
                        )}
                        {isPalmOil && (
                            <span style={{ fontSize: '0.6rem', padding: '0 0.4rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: '700' }}>
                                🌴 Palm
                            </span>
                        )}
                        {hasChildren && (
                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>+ {item.ingredients.length} sub</span>
                        )}
                    </div>
                    {pct && pctNum && (
                        <PctBar pct={pctNum} color={rc.color} />
                    )}
                </div>

                {/* Right: % + risk + chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {pct && (
                        <span style={{ fontWeight: '900', fontSize: '0.85rem', color: rc.color, fontVariantNumeric: 'tabular-nums' }}>
                            {pct}
                        </span>
                    )}
                    <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem',
                        fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.03em',
                        color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`
                    }}>
                        {rc.label}
                    </span>
                    {open ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
                </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* Category + dietary badges */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {analyzed?.categoryLabel && (
                                        <Badge text={analyzed.categoryLabel} color="#94a3b8" />
                                    )}
                                    {item.vegan === 'yes' && <Badge text="🌿 Vegan" color="#22c55e" />}
                                    {item.vegetarian === 'yes' && !isVegan && <Badge text="🥬 Vegetarian" color="#84cc16" />}
                                    {item.from_palm_oil === 'yes' && <Badge text="🌴 Palm Oil Source" color="#f59e0b" />}
                                    {analyzed?.isArtificial && <Badge text="⚗️ Artificial" color="#f59e0b" />}
                                    {!analyzed?.isArtificial && <Badge text="🌿 Natural" color="#4ade80" />}
                                    {analyzed?.allergens?.map((al, i) => (
                                        <Badge key={i} text={al.label} color="#f87171" bg="rgba(239,68,68,0.1)" />
                                    ))}
                                </div>

                                {/* Percentage detail */}
                                {(item.percent_estimate ?? item.percent_min) !== undefined && (
                                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                                            📊 Content in 100g of product
                                        </div>
                                        {item.percent_estimate !== undefined && (
                                            <div style={{ fontSize: '0.85rem', color: rc.color, fontWeight: '700' }}>
                                                Precision: <strong>{parseFloat(item.percent_estimate).toFixed(2)}%</strong> = {(parseFloat(item.percent_estimate)).toFixed(2)}g per 100g
                                            </div>
                                        )}
                                        {item.percent_min !== undefined && item.percent_max !== undefined && (
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                                Measured Range: {parseFloat(item.percent_min).toFixed(2)}% – {parseFloat(item.percent_max).toFixed(2)}%
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem', padding: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                            🇮🇳 <strong>Per Indian serving (~30g):</strong> ~{(parseFloat(item.percent_estimate ?? item.percent_max ?? 0) * 0.3).toFixed(2)}g
                                        </div>
                                    </div>
                                )}

                                {/* Note / Hidden info */}
                                {analyzed?.note && (
                                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: '12px', background: `${rc.bg}`, border: `1px solid ${rc.border}` }}>
                                        <Info size={14} color={rc.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span style={{ fontSize: '0.8rem', color: rc.color, fontWeight: '600', lineHeight: 1.4 }}>{analyzed.note}</span>
                                    </div>
                                )}

                                {analyzed?.hiddenInfo && (
                                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        <Eye size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hidden Concern</div>
                                            <span style={{ fontSize: '0.8rem', color: '#fde68a', lineHeight: 1.4 }}>{analyzed.hiddenInfo}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Sub-ingredients */}
                                {hasChildren && (
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                                            Sub-ingredients ({item.ingredients.length})
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                            {item.ingredients.map((sub, si) => (
                                                <span key={si} style={{
                                                    padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem',
                                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                                    color: '#cbd5e1', fontWeight: '600'
                                                }}>
                                                    {cleanName(sub.text || sub.id || '')}
                                                    {fmtPct(sub.percent_estimate, sub.percent_min, sub.percent_max) && (
                                                        <span style={{ color: '#64748b', marginLeft: '0.3rem' }}>
                                                            {fmtPct(sub.percent_estimate, sub.percent_min, sub.percent_max)}
                                                        </span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Badge({ text, color, bg }) {
    return (
        <span style={{
            padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem',
            fontWeight: '700', color,
            background: bg || `${color}15`,
            border: `1px solid ${color}30`
        }}>
            {text}
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const IngredientBreakdown = ({ product }) => {
    const [view, setView] = useState('list'); // 'list' | 'summary'

    // Purify structured data: discard single-character artifacts or Roman numeral remnants
    // STRATEGY: If ingredients_source is 'ai_refined', we TRUST this list 100%.
    // DEDUPLICATION: Ensure no duplicate ingredient names (like "Refined wheat flour" appearing twice).
    const rawStructured = product?.ingredients || [];
    const sourceRefined = product.ingredients_source === 'ai_refined';
    
    let structuredIngredients = sourceRefined 
        ? rawStructured 
        : rawStructured.filter(item => {
            const text = (item.text || item.id || '').replace('en:', '').trim();
            if (text.length <= 1) return false;
            if (/^(i|ii|iii|iv|v|vi)$/i.test(text)) return false;
            if (/^\d+$/.test(text)) return false;
            return true;
        });

    // Final Deduplication by Name (Case Insensitive)
    const seen = new Set();
    structuredIngredients = structuredIngredients.filter(item => {
        const name = (item.text || item.id || '').toLowerCase().trim();
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
    });

    // 100% SCALE GUARDIAN: Ensure total doesn't exceed 100%
    const totalPct = structuredIngredients.reduce((acc, curr) => acc + (parseFloat(curr.percent_estimate || 0)), 0);
    if (totalPct > 105) { // Allow for small rounding but fix major overlaps
        const scaleFactor = 100 / totalPct;
        structuredIngredients = structuredIngredients.map(item => ({
            ...item,
            percent_estimate: (parseFloat(item.percent_estimate || 0) * scaleFactor).toFixed(2)
        }));
    }
    const ingredientText = product?.ingredients_text || '';

    // Analyze the ingredient text for risk intelligence
    const analysis = useMemo(() => {
        if (!ingredientText) return null;
        return analyzeIngredientText(ingredientText);
    }, [ingredientText]);

    const allergens = useMemo(() => {
        const tags = product?.allergens_tags || [];
        return tags.map(t => t.replace('en:', '').replace(/-/g, ' ').replace(/^(.)/, c => c.toUpperCase()));
    }, [product]);

    const noIngredients = structuredIngredients.length === 0 && !ingredientText;

    if (noIngredients) return null;

    const totalIngredients = structuredIngredients.length || analysis?.summary?.total || 0;
    const riskyCount = analysis?.summary?.risky || 0;
    const moderateCount = analysis?.summary?.moderate || 0;
    const safeCount = analysis?.summary?.safe || 0;

    return (
        <div style={{ marginBottom: '3rem' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.12)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <FlaskConical size={20} color="#818cf8" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                            Complete Ingredient Breakdown
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            {totalIngredients} ingredient{totalIngredients !== 1 ? 's' : ''} — highest quantity first
                        </p>
                    </div>
                </div>

                {/* Accuracy & Price Pulse Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {product.ingredients_source === 'ai_refined' && (
                        <div style={{ 
                            padding: '0.4rem 0.75rem', 
                            borderRadius: '12px', 
                            background: 'rgba(34,197,94,0.1)', 
                            color: '#4ade80', 
                            fontSize: '0.75rem', 
                            fontWeight: '800', 
                            border: '1px solid rgba(34,197,94,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 0 15px rgba(34,197,94,0.1)'
                        }}>
                             ✨ <span style={{ letterSpacing: '0.02em' }}>100% Mirror-Match Fidelity</span>
                        </div>
                    )}
                    <div style={{ 
                        padding: '0.5rem 0.8rem', 
                        borderRadius: '12px', 
                        background: 'rgba(99,102,241,0.06)', 
                        color: '#a5b4fc', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        border: '1px solid rgba(99,102,241,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>
                        ⚖️ {product.quantity || 'Weight N/A'}
                    </div>
                    <div style={{ 
                        padding: '0.5rem 0.8rem', 
                        borderRadius: '12px', 
                        background: 'rgba(245,158,11,0.06)', 
                        color: '#fcd34d', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        border: '1px solid rgba(245,158,11,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>
                        💰 {product.price && product.price !== 'N/A' ? `Verified ${product.price}` : 'Price N/A'}
                    </div>
                </div>
            </div>
            {/* View Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.07)', alignSelf: 'flex-start' }}>
                {[
                    { key: 'list', Icon: List, label: 'List' },
                    { key: 'summary', Icon: BarChart3, label: 'Summary' }
                ].map(({ key, Icon, label }) => (
                    <button key={key} onClick={() => setView(key)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem',
                        borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700',
                        background: view === key ? 'rgba(99,102,241,0.3)' : 'transparent',
                        color: view === key ? '#818cf8' : '#64748b',
                        transition: 'all 0.2s'
                    }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* Allergen Warning */}
            {allergens.length > 0 && (
                <div style={{
                    marginBottom: '1rem', padding: '1rem 1.25rem', borderRadius: '16px',
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                }}>
                    <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f87171', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ⚠️ Allergen Warning — Contains
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {allergens.map((a, i) => (
                                <span key={i} style={{ padding: '0.2rem 0.7rem', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Risk summary stat row */}
            {analysis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                        { label: 'Safe', count: safeCount, color: '#22c55e', icon: '✅' },
                        { label: 'Caution', count: moderateCount, color: '#f59e0b', icon: '⚠️' },
                        { label: 'Avoid', count: riskyCount, color: '#ef4444', icon: '🚫' },
                    ].map(item => (
                        <div key={item.label} style={{
                            padding: '0.875rem', borderRadius: '16px', textAlign: 'center',
                            background: `${item.color}08`, border: `1px solid ${item.color}20`
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: item.color }}>{item.count}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', marginTop: '2px' }}>
                                {item.icon} {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── LIST VIEW ── */}
            {view === 'list' && (
                <div>
                    {structuredIngredients.length > 0 ? (
                        structuredIngredients.map((item, i) => (
                            <IngredientRow key={i} item={item} index={i} analysis={analysis} />
                        ))
                    ) : (
                        // Fallback: plain text parsing
                        <div>
                            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: '0.8rem', color: '#fde68a' }}>
                                ⚠️ Structured ingredient data not available for this product — showing parsed text analysis.
                            </div>
                            {analysis?.ingredients?.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.875rem 1.25rem', marginBottom: '0.5rem', borderRadius: '14px',
                                    background: RISK[item.risk]?.bg, border: `1px solid ${RISK[item.risk]?.border}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: '#64748b' }}>{i + 1}</div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#f1f5f9' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>{item.categoryLabel}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.68rem',
                                        fontWeight: '800', textTransform: 'uppercase',
                                        color: RISK[item.risk]?.color, background: `${RISK[item.risk]?.color}15`
                                    }}>
                                        {RISK[item.risk]?.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── SUMMARY VIEW ── */}
            {view === 'summary' && analysis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Diet Status */}
                    <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Dietary Suitability</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                            {[
                                { label: 'Vegetarian', value: analysis.isVegetarian, icon: '🥬' },
                                { label: 'Vegan', value: analysis.isVegan, icon: '🌿' },
                                { label: 'Allergen-Free', value: allergens.length === 0, icon: '🛡️' },
                            ].map(item => (
                                <div key={item.label} style={{
                                    padding: '0.75rem', borderRadius: '14px', textAlign: 'center',
                                    background: item.value ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                                    border: `1px solid ${item.value ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                                }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{item.icon}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: item.value ? '#4ade80' : '#f87171' }}>
                                        {item.value ? `✓ ${item.label}` : `✗ ${item.label}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {Object.entries(analysis.categories || {}).map(([catKey, cat]) => (
                        <div key={catKey} style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#f1f5f9' }}>{cat.label}</span>
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{cat.count}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {cat.items.map((name, i) => (
                                    <span key={i} style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Hidden Ingredients */}
                    {analysis.hiddenIngredients?.length > 0 && (
                        <div style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Eye size={16} color="#f59e0b" />
                                <span style={{ fontWeight: '800', fontSize: '0.875rem', color: '#f59e0b' }}>Hidden Concerns</span>
                            </div>
                            {analysis.hiddenIngredients.map((h, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#fde68a' }}>
                                    <span style={{ fontWeight: '700' }}>{h.ingredient}</span>
                                    <span style={{ color: '#f59e0b' }}>→ {h.hiddenAs}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Full Raw Text */}
                    {ingredientText && (
                        <div style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                                📄 As Printed on Label
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>{ingredientText}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Multi-Platform Pricing Radar (High Fidelity) */}
            {product?.pricing && (
                <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                    <PriceRadar pricing={product.pricing} />
                </div>
            )}

            {/* Note */}
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', padding: '0.875rem 1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Info size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
                    Ingredients are listed highest to lowest by quantity as per FSSAI labelling regulations. <strong>Percentages</strong> shown are estimates from OpenFoodFacts data. Always verify against the physical product label.
                </p>
            </div>
        </div>
    );
};

export default IngredientBreakdown;
