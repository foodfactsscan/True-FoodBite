import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, Heart, Leaf, Activity, Zap,
    Droplets, ShieldCheck, ThumbsUp
} from 'lucide-react';

// ─── Rich positive nutrient knowledge base ────────────────────────────────────
const POSITIVE_DB = {
    protein: {
        icon: '💪',
        color: '#22c55e',
        label: 'High Protein',
        what: 'Protein is made of amino acids — the building blocks of muscles, enzymes, hormones, and immune cells. Every cell in your body needs protein to function.',
        why: [
            'Builds and repairs muscle tissue — essential for active individuals',
            'Most satiating macronutrient — keeps you fuller longer, reduces cravings',
            'Boosts metabolism — body burns more calories digesting protein than carbs or fat',
            'Supports immune function, skin health, hair growth, and nail strength',
        ],
        indianContext: 'India has a widespread protein deficiency problem — only 1 in 5 Indians meets their daily protein requirement. A good protein source in packaged food is genuinely valuable.',
        dailyTarget: '0.8–1.2g per kg body weight (so ~56–84g for a 70kg person). Athletes: up to 2g/kg.',
        threshold: 8,
        unit: 'g',
        key: 'proteins_100g',
    },
    fiber: {
        icon: '🌾',
        color: '#84cc16',
        label: 'Good Fibre Source',
        what: 'Dietary fibre is indigestible carbohydrate from plant cell walls. It comes in two types: soluble fibre (dissolves in water, forms gel) and insoluble fibre (adds bulk to stool).',
        why: [
            'Lowers LDL (bad) cholesterol — soluble fibre binds cholesterol in the gut',
            'Regulates blood sugar — slows glucose absorption, preventing insulin spikes',
            'Feeds gut bacteria (prebiotic) — improves microbiome diversity and immunity',
            'Prevents constipation, reduces risk of colorectal cancer',
            'Helps with weight management by creating satiety',
        ],
        indianContext: 'Most Indians consume far less fibre than recommended. Traditional roti (whole wheat), dal, and vegetables are excellent sources. Finding fibre in packaged food is a real plus.',
        dailyTarget: 'ICMR recommends 40g/day. Most Indians get only 20–25g.',
        threshold: 3,
        unit: 'g',
        key: 'fiber_100g',
    },
    lowFat: {
        icon: '💧',
        color: '#38bdf8',
        label: 'Low Saturated Fat',
        what: 'Low saturated fat content means this food will not heavily contribute to LDL cholesterol buildup in your arteries.',
        why: [
            'Reduces risk of cardiovascular disease — the #1 killer in India',
            'Allows more fat budget for healthy fats (omega-3, MUFA from nuts/olive oil)',
            'Heart-friendly — supports healthy blood vessel function',
        ],
        indianContext: 'Indians have a genetic predisposition to cardiovascular disease. Low saturated fat packaged foods help manage overall dietary fat intake from multiple daily sources.',
        dailyTarget: 'Less than 20g saturated fat per day (women) / 30g (men) — WHO/ICMR.',
        threshold: 3,
        unit: 'g',
        key: 'saturated-fat_100g',
        invert: true, // positive when LOW
    },
    lowSugar: {
        icon: '🩺',
        color: '#a78bfa',
        label: 'Low Sugar',
        what: 'Low free sugar content means this product will not cause a rapid blood glucose spike after consumption.',
        why: [
            'Prevents insulin resistance and progression toward type 2 diabetes',
            'Reduces empty calorie intake — maintains healthier body weight',
            'Better for dental health — low sugar = less acid production in mouth',
            'Avoids the energy crash that follows a sugar spike',
        ],
        indianContext: 'India has 101 million diabetics — the highest number globally. Low sugar packaged food is clinically significant for Indian consumers.',
        dailyTarget: 'WHO recommends less than 25g free sugar per day.',
        threshold: 5,
        unit: 'g',
        key: 'sugars_100g',
        invert: true,
    },
    calcium: {
        icon: '🦴',
        color: '#60a5fa',
        label: 'Good Calcium Source',
        what: 'Calcium is the most abundant mineral in the human body. 99% is stored in bones and teeth.',
        why: [
            'Essential for strong bones and prevention of osteoporosis',
            'Required for muscle contraction — including heartbeat regulation',
            'Supports nerve signal transmission',
            'Helps blood clotting process',
        ],
        indianContext: 'Calcium deficiency is extremely common in India, especially among women. Most Indians get only 400–500mg vs the recommended 1000mg/day.',
        dailyTarget: '1000 mg/day for adults. 1200 mg for women over 50 and men over 70.',
        threshold: 100,
        unit: 'mg',
        key: 'calcium_100g',
        multiply: 1000,
    },
    iron: {
        icon: '🩸',
        color: '#f87171',
        label: 'Iron Rich',
        what: 'Iron is an essential mineral that forms haemoglobin — the protein in red blood cells that carries oxygen throughout your body.',
        why: [
            'Prevents iron-deficiency anaemia — most common nutrient deficiency in India',
            'Supports energy production and reduces fatigue',
            'Critical for cognitive function and brain development in children',
            'Important during pregnancy for foetal development',
        ],
        indianContext: 'India has the highest burden of anaemia globally — 80% of children and 50% of women are anaemic. Iron-rich packaged foods address a critical public health gap.',
        dailyTarget: '17mg/day for men, 21mg/day for women of childbearing age (ICMR).',
        threshold: 2,
        unit: 'mg',
        key: 'iron_100g',
        multiply: 1000,
    },
    fruitsVeg: {
        icon: '🥗',
        color: '#34d399',
        label: 'Rich in Fruits & Vegetables',
        what: 'A high fruit and vegetable content means this product provides natural vitamins, minerals, antioxidants, and phytonutrients from whole plant sources.',
        why: [
            'Antioxidants fight free radical damage — reduces cancer and heart disease risk',
            'Natural source of vitamins C, A, K, and folate',
            'Contributes to the recommended 5-a-day fruit and vegetable intake',
            'Phytonutrients (plant compounds) have anti-inflammatory effects',
        ],
        indianContext: 'Vegetable-rich foods align with traditional Indian dietary wisdom. Modern processing often destroys these benefits — finding them in packaged food is a genuine health positive.',
        dailyTarget: 'WHO: 400g of fruits and vegetables per day minimum.',
        threshold: 30,
        unit: '%',
        key: 'fruits-vegetables-nuts_100g',
    },
};

function PositiveCard({ def, value }) {
    const [open, setOpen] = useState(false);
    const displayValue = def.multiply ? (value * def.key === 'calcium_100g' ? value * 0.001 * 1000 : value) : value;

    return (
        <div style={{
            borderRadius: '16px',
            background: open ? `${def.color}08` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${open ? def.color + '25' : 'rgba(255,255,255,0.06)'}`,
            marginBottom: '0.6rem',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
        }}>
            <button onClick={() => setOpen(!open)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{def.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f1f5f9' }}>{def.label}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>Tap to understand the benefit</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{
                        fontWeight: '900', color: def.color, fontSize: '1.05rem',
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {value.toFixed(1)}{def.unit}
                    </span>
                    {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: `1px solid ${def.color}20` }}>
                            <div style={{ paddingTop: '1rem' }}>
                                {/* What is it */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                                        ❓ What is it?
                                    </div>
                                    <div style={{ fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.6 }}>{def.what}</div>
                                </div>

                                {/* Why it's good */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                                        ✅ Why it's good for you
                                    </div>
                                    {def.why.map((w, i) => (
                                        <div key={i} style={{
                                            display: 'flex', gap: '0.5rem', marginBottom: '0.4rem',
                                            fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5
                                        }}>
                                            <span style={{ color: def.color, flexShrink: 0, marginTop: '1px' }}>•</span>
                                            {w}
                                        </div>
                                    ))}
                                </div>

                                {/* Indian Context */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                                        🇮🇳 Why it matters in India
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.55 }}>{def.indianContext}</div>
                                </div>

                                {/* Daily target pill */}
                                <div style={{
                                    padding: '0.65rem 1rem', borderRadius: '10px',
                                    background: `${def.color}10`, border: `1px solid ${def.color}25`,
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <ThumbsUp size={14} color={def.color} />
                                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: def.color }}>
                                        Daily Target: {def.dailyTarget}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const PositiveSection = ({ product }) => {
    const [purchaseIntent, setPurchaseIntent] = useState(null);
    const n = product.nutriments || {};
    const positives = [];

    // Protein
    if ((n.proteins_100g ?? 0) > POSITIVE_DB.protein.threshold)
        positives.push({ def: POSITIVE_DB.protein, value: n.proteins_100g });

    // Fibre
    if ((n.fiber_100g ?? 0) > POSITIVE_DB.fiber.threshold)
        positives.push({ def: POSITIVE_DB.fiber, value: n.fiber_100g });

    // Low saturated fat (invert — good when LOW)
    if (n['saturated-fat_100g'] !== undefined && n['saturated-fat_100g'] <= POSITIVE_DB.lowFat.threshold)
        positives.push({ def: POSITIVE_DB.lowFat, value: n['saturated-fat_100g'] });

    // Low sugar (invert)
    if (n.sugars_100g !== undefined && n.sugars_100g <= POSITIVE_DB.lowSugar.threshold)
        positives.push({ def: POSITIVE_DB.lowSugar, value: n.sugars_100g });

    // Calcium
    if ((n.calcium_100g ?? 0) * 1000 > POSITIVE_DB.calcium.threshold)
        positives.push({ def: POSITIVE_DB.calcium, value: n.calcium_100g * 1000 });

    // Iron
    if ((n.iron_100g ?? 0) * 1000 > POSITIVE_DB.iron.threshold)
        positives.push({ def: POSITIVE_DB.iron, value: n.iron_100g * 1000 });

    // Fruits & Veg
    if ((n['fruits-vegetables-nuts_100g'] ?? 0) > POSITIVE_DB.fruitsVeg.threshold)
        positives.push({ def: POSITIVE_DB.fruitsVeg, value: n['fruits-vegetables-nuts_100g'] });

    const purchaseMessages = {
        yes:    { text: '🙏 Thanks for trusting us! Remember to consume mindfully.', color: '#22c55e' },
        no:     { text: '👍 Good call. Always choose what aligns with your health goals.', color: '#f87171' },
        bought: { text: '🛒 Already got it? Make sure to enjoy it at the right time and amount!', color: '#94a3b8' },
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* Section Header */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(34,197,94,0.1)', borderRadius: '12px' }}>
                    <ShieldCheck size={20} color="#4ade80" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                        What You'll Like 😊
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                        Tap to understand why each nutrient matters for you
                    </p>
                </div>
            </div>

            {positives.length > 0 ? (
                positives.map((item, i) => (
                    <PositiveCard key={i} def={item.def} value={item.value} />
                ))
            ) : (
                <div style={{
                    padding: '1.5rem', textAlign: 'center', borderRadius: '16px',
                    background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤷</div>
                    <p style={{ color: '#94a3b8', fontWeight: '600', margin: 0 }}>No standout positives detected</p>
                    <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '4px' }}>
                        This product doesn't particularly excel in any nutritional category
                    </p>
                </div>
            )}

            {/* Purchase Intent */}
            <div style={{
                marginTop: '1.5rem', padding: '1.5rem', borderRadius: '20px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)'
            }}>
                <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: '#e2e8f0' }}>
                    Would you buy this product?
                </p>
                <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                        { key: 'yes', label: '👍 Yes', activeColor: '#22c55e' },
                        { key: 'no', label: '👎 No', activeColor: '#f87171' },
                        { key: 'bought', label: '🛒 Already Bought', activeColor: '#94a3b8' },
                    ].map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setPurchaseIntent(btn.key)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '50px',
                                border: purchaseIntent === btn.key ? `2px solid ${btn.activeColor}` : '2px solid rgba(255,255,255,0.12)',
                                background: purchaseIntent === btn.key ? `${btn.activeColor}18` : 'transparent',
                                color: purchaseIntent === btn.key ? btn.activeColor : '#94a3b8',
                                fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem',
                                transition: 'all 0.25s ease'
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {purchaseIntent && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '12px',
                            background: `${purchaseMessages[purchaseIntent].color}10`,
                            border: `1px solid ${purchaseMessages[purchaseIntent].color}25`,
                            textAlign: 'center',
                            fontSize: '0.85rem', color: purchaseMessages[purchaseIntent].color, fontWeight: '600'
                        }}
                    >
                        {purchaseMessages[purchaseIntent].text}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PositiveSection;
