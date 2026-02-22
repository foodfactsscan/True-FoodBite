import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Search, X, Package, Loader2, Trophy, ArrowRight } from 'lucide-react';
import { getProductByBarcode, searchProducts } from '../services/api';
import { calculateHealthScore } from '../services/healthScoreEngine';
import { calculateTruthInRating } from '../services/ratingEngine';

const styles = {
    page: {
        minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1628 100%)',
        color: '#e2e8f0', fontFamily: "'Inter', sans-serif", padding: '2rem',
    },
    card: {
        background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem',
    },
    input: {
        width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
        color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
    },
    row: (color, highlight) => ({
        display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px',
        background: highlight ? `${color}10` : 'transparent',
    }),
    badge: (color) => ({
        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px',
        fontSize: '0.8rem', fontWeight: '700', background: `${color}20`,
        color: color, border: `1px solid ${color}40`,
    }),
};

function ProductSearchBox({ label, onSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const doSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            if (/^\d+$/.test(query.trim())) {
                const p = await getProductByBarcode(query.trim());
                setResults(p ? [p] : []);
            } else {
                const data = await searchProducts(query.trim(), {});
                setResults((data.products || []).slice(0, 6));
            }
        } catch { setResults([]); }
        setLoading(false);
    };

    return (
        <div>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>{label}</label>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input style={styles.input} placeholder="Search product or barcode..."
                    value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSearch()} />
            </div>
            {loading && <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 size={20} className="spin" style={{ color: '#a855f7' }} /></div>}
            {results.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: '10px', background: 'rgba(0,0,0,0.3)' }}>
                    {results.map((p, i) => (
                        <div key={i} onClick={() => { onSelect(p); setResults([]); setQuery(p.product_name || 'Selected'); }}
                            style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {p.image_small_url && <img src={p.image_small_url} alt="" style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }} />}
                            <div>
                                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{p.product_name || 'Unknown'}</div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.brands || ''}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function NutrientCompareRow({ label, val1, val2, unit, lowerBetter = true }) {
    const n1 = parseFloat(val1) || 0;
    const n2 = parseFloat(val2) || 0;
    const winner = lowerBetter ? (n1 < n2 ? 1 : n1 > n2 ? 2 : 0) : (n1 > n2 ? 1 : n1 < n2 ? 2 : 0);

    return (
        <div style={styles.row(winner === 1 ? '#22c55e' : winner === 2 ? '#ef4444' : '#64748b', winner !== 0)}>
            <span style={{ flex: 1, color: winner === 1 ? '#22c55e' : '#cbd5e1', fontWeight: winner === 1 ? '600' : '400' }}>
                {winner === 1 ? '✅ ' : ''}{typeof val1 === 'number' ? val1.toFixed(1) : val1 || '-'} {unit}
            </span>
            <span style={{ flex: 1, textAlign: 'center', fontWeight: '600', color: '#94a3b8' }}>{label}</span>
            <span style={{ flex: 1, textAlign: 'right', color: winner === 2 ? '#22c55e' : '#cbd5e1', fontWeight: winner === 2 ? '600' : '400' }}>
                {typeof val2 === 'number' ? val2.toFixed(1) : val2 || '-'} {unit}{winner === 2 ? ' ✅' : ''}
            </span>
        </div>
    );
}

export default function Compare() {
    const [product1, setProduct1] = useState(null);
    const [product2, setProduct2] = useState(null);

    const score1 = product1 ? calculateHealthScore(product1) : null;
    const score2 = product2 ? calculateHealthScore(product2) : null;

    const n1 = product1?.nutriments || {};
    const n2 = product2?.nutriments || {};

    return (
        <div style={styles.page}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <ArrowLeftRight size={40} style={{ color: '#a855f7', marginBottom: '0.5rem' }} />
                    <h1 style={{ margin: 0 }}>Compare Products</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Side-by-side nutrition & health comparison</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={styles.card}>
                        <ProductSearchBox label="Product 1" onSelect={setProduct1} />
                        {product1 && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {product1.image_small_url && <img src={product1.image_small_url} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />}
                                <div>
                                    <div style={{ fontWeight: '600' }}>{product1.product_name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{product1.brands}</div>
                                </div>
                                {score1 && <span style={{ ...styles.badge(score1.gradeColor), marginLeft: 'auto', fontSize: '1.1rem' }}>{score1.score}/100</span>}
                            </div>
                        )}
                    </div>
                    <div style={styles.card}>
                        <ProductSearchBox label="Product 2" onSelect={setProduct2} />
                        {product2 && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {product2.image_small_url && <img src={product2.image_small_url} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />}
                                <div>
                                    <div style={{ fontWeight: '600' }}>{product2.product_name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{product2.brands}</div>
                                </div>
                                {score2 && <span style={{ ...styles.badge(score2.gradeColor), marginLeft: 'auto', fontSize: '1.1rem' }}>{score2.score}/100</span>}
                            </div>
                        )}
                    </div>
                </div>

                {product1 && product2 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Winner declaration */}
                        {score1 && score2 && (
                            <div style={{ ...styles.card, textAlign: 'center', marginBottom: '1.5rem', borderColor: '#a855f740' }}>
                                <Trophy size={28} style={{ color: '#eab308', marginBottom: '0.5rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem' }}>
                                    {score1.score > score2.score ? `${product1.product_name} wins!` :
                                        score2.score > score1.score ? `${product2.product_name} wins!` :
                                            "It's a tie!"}
                                </h3>
                                <p style={{ color: '#94a3b8', margin: 0 }}>
                                    {score1.score > score2.score
                                        ? `Scores ${score1.score} vs ${score2.score} — healthier by ${score1.score - score2.score} points`
                                        : score2.score > score1.score
                                            ? `Scores ${score2.score} vs ${score1.score} — healthier by ${score2.score - score1.score} points`
                                            : `Both score ${score1.score}/100`}
                                </p>
                            </div>
                        )}

                        {/* Score breakdown side by side */}
                        {score1 && score2 && (
                            <div style={{ ...styles.card, marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 1rem', color: '#a78bfa' }}>⭐ Health Score Breakdown</h3>
                                {['nutrition', 'processing', 'additives', 'ingredients'].map(key => (
                                    <NutrientCompareRow key={key}
                                        label={score1.breakdown[key].label}
                                        val1={score1.breakdown[key].score}
                                        val2={score2.breakdown[key].score}
                                        unit={`/ ${score1.breakdown[key].max}`}
                                        lowerBetter={false}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Nutrient comparison */}
                        <div style={styles.card}>
                            <h3 style={{ margin: '0 0 1rem', color: '#a78bfa' }}>🔢 Nutrition per 100g</h3>
                            <NutrientCompareRow label="Calories" val1={n1['energy-kcal_100g']} val2={n2['energy-kcal_100g']} unit="kcal" />
                            <NutrientCompareRow label="Sugar" val1={n1.sugars_100g} val2={n2.sugars_100g} unit="g" />
                            <NutrientCompareRow label="Sodium" val1={n1.sodium_100g} val2={n2.sodium_100g} unit="g" />
                            <NutrientCompareRow label="Sat. Fat" val1={n1['saturated-fat_100g']} val2={n2['saturated-fat_100g']} unit="g" />
                            <NutrientCompareRow label="Total Fat" val1={n1.fat_100g} val2={n2.fat_100g} unit="g" />
                            <NutrientCompareRow label="Protein" val1={n1.proteins_100g} val2={n2.proteins_100g} unit="g" lowerBetter={false} />
                            <NutrientCompareRow label="Fibre" val1={n1.fiber_100g} val2={n2.fiber_100g} unit="g" lowerBetter={false} />
                            <NutrientCompareRow label="Carbs" val1={n1.carbohydrates_100g} val2={n2.carbohydrates_100g} unit="g" />
                            <NutrientCompareRow label="NOVA" val1={product1.nova_group} val2={product2.nova_group} unit="" />
                        </div>
                    </motion.div>
                )}

                {!product1 && !product2 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Search and select two products above to compare them side-by-side</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
