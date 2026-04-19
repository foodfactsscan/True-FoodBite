import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Search, X, Package, Loader2, Trophy, Info } from 'lucide-react';
import { getProductByBarcode, searchProducts } from '../../core/services/api';
import { calculateHealthScore } from '../services/healthScoreEngine';

/* ─── Grade helpers ────────────────────────────────────────── */
const gradeColor = (g) => ({ A: '#16a34a', B: '#65a30d', C: '#ca8a04', D: '#ea580c', E: '#dc2626' }[g?.toUpperCase()] || '#6366f1');
const gradeLabel = (s) => s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : s >= 20 ? 'D' : 'E';

/* ─── Search Box Component ─────────────────────────────────── */
function SearchBox({ slot, product, onSelect, onClear }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const doSearch = async (q) => {
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            if (/^\d+$/.test(q.trim())) {
                const p = await getProductByBarcode(q.trim());
                setResults(p ? [p] : []);
            } else {
                const data = await searchProducts(q.trim(), {});
                setResults((data.products || []).slice(0, 8));
            }
        } catch { setResults([]); }
        setLoading(false);
    };

    const color = slot === 1 ? '#6366f1' : '#ec4899';

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}25`, borderRadius: '24px', padding: '1.5rem', position: 'relative' }}>
            <div style={{ fontSize: '0.7rem', color: color, fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Product {slot}
            </div>

            {product ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {product.image_small_url
                            ? <img src={product.image_small_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }} />
                            : <Package size={24} color="#475569" />
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '800', color: '#f1f5f9', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.product_name || 'Unknown Product'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{product.brands || '—'}</div>
                    </div>
                    <button onClick={() => { onClear(); setQuery(''); }} style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <X size={15} color="#f87171" />
                    </button>
                </motion.div>
            ) : (
                <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    <input
                        value={query}
                        onChange={e => { setQuery(e.target.value); if (e.target.value.length >= 2) doSearch(e.target.value); if (!e.target.value) setResults([]); }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 200)}
                        onKeyDown={e => e.key === 'Enter' && doSearch(query)}
                        placeholder="Search product name or barcode…"
                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}20`, borderRadius: '12px', color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {loading && <Loader2 size={15} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: color, animation: 'spin 1s linear infinite' }} />}
                    {open && results.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', maxHeight: '220px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                            {results.map((p, i) => (
                                <button key={i} onMouseDown={() => { onSelect(p); setQuery(p.product_name || ''); setResults([]); }}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {p.image_small_url ? <img src={p.image_small_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Package size={16} color="#475569" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '0.85rem' }}>{p.product_name || 'Unknown'}</div>
                                        <div style={{ color: '#475569', fontSize: '0.72rem' }}>{p.brands || ''}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Nutrient Row ─────────────────────────────────────────── */
function NutrientRow({ label, val1, val2, unit, lowerBetter = true, note }) {
    const n1 = parseFloat(val1) || 0;
    const n2 = parseFloat(val2) || 0;
    const winner = lowerBetter ? (n1 < n2 ? 1 : n1 > n2 ? 2 : 0) : (n1 > n2 ? 1 : n1 < n2 ? 2 : 0);

    const fmt = (v) => (typeof v === 'number' ? v.toFixed(1) : v || '–');

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ textAlign: 'right', fontWeight: winner === 1 ? '800' : '400', color: winner === 1 ? '#22c55e' : '#94a3b8', fontSize: '0.88rem' }}>
                {winner === 1 && <span style={{ marginRight: '0.3rem', fontSize: '0.75rem' }}>✅</span>}{fmt(val1)} {unit}
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#475569', fontWeight: '700', padding: '0 0.5rem', minWidth: '90px' }}>
                {label}
                {note && <div style={{ fontSize: '0.62rem', color: '#334155', fontStyle: 'italic' }}>{note}</div>}
            </div>
            <div style={{ textAlign: 'left', fontWeight: winner === 2 ? '800' : '400', color: winner === 2 ? '#22c55e' : '#94a3b8', fontSize: '0.88rem' }}>
                {fmt(val2)} {unit}{winner === 2 && <span style={{ marginLeft: '0.3rem', fontSize: '0.75rem' }}>✅</span>}
            </div>
        </div>
    );
}

/* ─── Main Compare Page ────────────────────────────────────── */
export default function Compare() {
    const [product1, setProduct1] = useState(null);
    const [product2, setProduct2] = useState(null);

    const score1 = product1 ? calculateHealthScore(product1) : null;
    const score2 = product2 ? calculateHealthScore(product2) : null;
    const n1 = product1?.nutriments || {};
    const n2 = product2?.nutriments || {};

    const hasComparison = product1 && product2;
    const winner = score1 && score2 ? (score1.score > score2.score ? 1 : score2.score > score1.score ? 2 : 0) : 0;

    return (
        <div style={{ minHeight: '100vh', padding: '0 0 6rem' }}>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '3.5rem 0 3rem', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '860px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(99,102,241,0.3)', marginBottom: '1.25rem' }}>
                            <ArrowLeftRight size={26} color="#818cf8" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Product <span className="text-gradient">Comparison</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto' }}>
                            Side-by-side nutrition, health score, and processing level analysis.
                            Green ✅ = better value per 100g per ICMR-NIN guidelines.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '960px', paddingTop: '3rem' }}>
                {/* Search boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'start', marginBottom: '2.5rem' }}>
                    <SearchBox slot={1} product={product1} onSelect={setProduct1} onClear={() => setProduct1(null)} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2.8rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeftRight size={18} color="#475569" />
                        </div>
                    </div>
                    <SearchBox slot={2} product={product2} onSelect={setProduct2} onClear={() => setProduct2(null)} />
                </div>

                {/* Empty state */}
                {!hasComparison && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Package size={44} color="#1e293b" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#475569', fontWeight: '700', marginBottom: '0.5rem' }}>Select Two Products to Compare</h3>
                        <p style={{ color: '#334155', fontSize: '0.85rem' }}>Search by product name or scan barcode in both slots above</p>
                    </motion.div>
                )}

                {/* Comparison results */}
                <AnimatePresence>
                    {hasComparison && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Winner banner */}
                            {score1 && score2 && (
                                <div style={{ padding: '1.5rem 2rem', borderRadius: '20px', marginBottom: '1.5rem', background: winner === 0 ? 'rgba(99,102,241,0.08)' : 'rgba(34,197,94,0.06)', border: `1px solid ${winner === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(34,197,94,0.2)'}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <Trophy size={28} color="#eab308" style={{ flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.2rem' }}>
                                            {winner === 1 ? `${product1.product_name || 'Product 1'} is Healthier` :
                                             winner === 2 ? `${product2.product_name || 'Product 2'} is Healthier` :
                                             'Equal Health Score — It\'s a Tie!'}
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                            Health scores: <strong style={{ color: '#818cf8' }}>{score1.score}/100</strong> vs <strong style={{ color: '#ec4899' }}>{score2.score}/100</strong>
                                            {winner !== 0 && ` — difference of ${Math.abs(score1.score - score2.score)} points`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Score breakdown */}
                            {score1 && score2 && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '22px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>⭐ Health Score Breakdown</h3>
                                    {['nutrition', 'processing', 'additives', 'ingredients'].map(key => (
                                        <NutrientRow
                                            key={key}
                                            label={score1.breakdown[key]?.label || key}
                                            val1={score1.breakdown[key]?.score}
                                            val2={score2.breakdown[key]?.score}
                                            unit={`/ ${score1.breakdown[key]?.max || 100}`}
                                            lowerBetter={false}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Nutrient table */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '22px', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>🔢 Nutrition per 100g</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#334155' }}>
                                        <Info size={12} /> per ICMR-NIN RDA 2020
                                    </div>
                                </div>
                                <NutrientRow label="Calories" val1={n1['energy-kcal_100g']} val2={n2['energy-kcal_100g']} unit="kcal" note="lower = lighter" />
                                <NutrientRow label="Sugar" val1={n1.sugars_100g} val2={n2.sugars_100g} unit="g" note="ICMR: <50g/day" />
                                <NutrientRow label="Sodium" val1={n1.sodium_100g} val2={n2.sodium_100g} unit="g" note="ICMR: <2g/day" />
                                <NutrientRow label="Sat. Fat" val1={n1['saturated-fat_100g']} val2={n2['saturated-fat_100g']} unit="g" />
                                <NutrientRow label="Total Fat" val1={n1.fat_100g} val2={n2.fat_100g} unit="g" />
                                <NutrientRow label="Protein" val1={n1.proteins_100g} val2={n2.proteins_100g} unit="g" lowerBetter={false} note="higher = better" />
                                <NutrientRow label="Fibre" val1={n1.fiber_100g} val2={n2.fiber_100g} unit="g" lowerBetter={false} note="ICMR: 25-40g/day" />
                                <NutrientRow label="Carbs" val1={n1.carbohydrates_100g} val2={n2.carbohydrates_100g} unit="g" />
                                <NutrientRow label="NOVA Group" val1={product1.nova_group} val2={product2.nova_group} unit="" note="1 best → 4 worst" />
                            </div>

                            <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.7rem', color: '#334155', fontStyle: 'italic' }}>
                                ✅ indicates the better value for the metric shown. Nutrient targets per ICMR-NIN RDA (2020) and FSSAI labelling standards.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
}
