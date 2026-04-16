import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, AlertTriangle, Box, Droplet,
    Activity, FlaskConical, Info, ShieldAlert, ThumbsDown, ThumbsUp, X
} from 'lucide-react';
import { ADDITIVE_DICTIONARY } from '../services/healthScoreEngine';

// ─── Rich Additive Knowledge Base ─────────────────────────────────────────────
// Extends the engine's dictionary with consumer-friendly prose
const ADDITIVE_DEEP = {
    'e102': {
        commonName: 'Tartrazine (Yellow Dye)',
        madeFrom: 'Petroleum by-product (coal tar derivative)',
        usedFor: 'Gives bright yellow/orange colour to foods like noodles, sauces, chips, sweets.',
        pros: ['Extremely cheap for manufacturers', 'Very stable colour even in heat'],
        cons: ['Linked to hyperactivity and ADHD in children (EU mandates warning label)', 'Can trigger allergic reactions and asthma', 'Banned in Austria & Norway', 'May affect sleep in sensitive people'],
        indianContext: 'Common in coloured sweets, canned beverages, instant noodles in India.',
        whoSays: 'JECFA allows ADI of 7.5 mg/kg body weight. UK FSA recommends avoidance for children.',
    },
    'e110': {
        commonName: 'Sunset Yellow (Orange Dye)',
        madeFrom: 'Petroleum-derived azo dye',
        usedFor: 'Orange/yellow colour in soft drinks, jams, biscuits, desserts.',
        pros: ['Heat and light stable colour', 'Cost-effective colouring agent'],
        cons: ['Part of the "Southampton Six" — linked to ADHD and hyperactivity in children', 'Can cause hives, nasal congestion', 'May worsen asthma', 'Banned in Norway'],
        indianContext: 'Found in orange flavoured drinks, packaged sweets, biscuits.',
        whoSays: 'EFSA (Europe) recommends warning label: "may have an adverse effect on activity and attention in children."',
    },
    'e211': {
        commonName: 'Sodium Benzoate (Preservative)',
        madeFrom: 'Synthesized from benzoic acid + sodium hydroxide (industrial chemical)',
        usedFor: 'Prevents mould and bacteria in acidic foods like soft drinks, squashes, pickles.',
        pros: ['Highly effective at stopping microbial growth', 'Extends shelf life significantly'],
        cons: ['When combined with Vitamin C (ascorbic acid), forms BENZENE — a known carcinogen', 'Linked to hyperactivity in children', 'May damage DNA mitochondria at high doses (University of Sheffield study)', 'Possible trigger for allergies'],
        indianContext: 'Very common in Indian fruit drinks, carbonated beverages, pickles, sauces.',
        whoSays: 'WHO ADI: 5 mg/kg body weight. The benzene formation combination is a serious concern.',
    },
    'e320': {
        commonName: 'BHA (Butylated Hydroxyanisole)',
        madeFrom: 'Synthetic petroleum-derived chemical antioxidant',
        usedFor: 'Prevents fats from going rancid in chips, biscuits, instant noodles, oils.',
        pros: ['Extends shelf life of fat-containing foods effectively'],
        cons: ['Listed as "reasonably anticipated to be a human carcinogen" by US National Toxicology Program', 'Endocrine disruptor — interferes with hormones', 'Banned in Japan and parts of Europe for some uses'],
        indianContext: 'Common in packaged chips, crackers, fried snack foods.',
        whoSays: 'IARC Group 2B (Possibly carcinogenic to humans).',
    },
    'e321': {
        commonName: 'BHT (Butylated Hydroxytoluene)',
        madeFrom: 'Synthetic petroleum-derived antioxidant',
        usedFor: 'Prevents oxidation of fats and oils in packaged foods.',
        pros: ['Very cheap and effective antioxidant for oils'],
        cons: ['Suspected endocrine disruptor', 'Shows cancer promotion activity in animal studies', 'Banned in UK for baby foods'],
        indianContext: 'Used in fried snacks, cereals, gum.',
        whoSays: 'Under review by EFSA and FDA. Precautionary avoidance recommended.',
    },
    'e621': {
        commonName: 'MSG (Monosodium Glutamate)',
        madeFrom: 'Fermentation of sugarcane or tapioca starch',
        usedFor: 'The "fifth taste" (umami) — makes food irresistibly savoury. Used in noodles, chips, fast food.',
        pros: ['Allows less salt to be used (sodium reduction)', 'Naturally occurring in tomatoes, cheese', 'FDA classified as GRAS (Generally Recognized as Safe)'],
        cons: ['Can trigger "MSG Symptom Complex" — headaches, sweating, flushing in sensitive individuals', 'Highly addictive — engineered to make you eat more (bliss point engineering)', 'High sodium contributes to blood pressure', 'Poorly tolerated by people with migraines'],
        indianContext: 'Widely used in Indian instant noodles (Maggi), chips, Chinese restaurant food.',
        whoSays: 'FDA GRAS, but individual sensitivity is well-documented. Not recommended for those with migraines.',
    },
    'e951': {
        commonName: 'Aspartame (Artificial Sweetener)',
        madeFrom: 'Chemical synthesis of phenylalanine and aspartic acid',
        usedFor: '200x sweeter than sugar — used in "sugar-free" products, diet drinks, chewing gum.',
        pros: ['Zero calories — helps reduce sugar intake', 'Does not cause tooth decay'],
        cons: ['IARC (2023): Classified as "possibly carcinogenic to humans" (Group 2B)', 'Must be avoided by people with PKU (phenylketonuria)', 'May affect gut microbiome negatively', 'Some studies link to headaches, mood changes', 'May increase sugar cravings paradoxically'],
        indianContext: 'Common in diet cola, sugar-free biscuits, "diabetic" sweets.',
        whoSays: 'IARC 2023 classified it as Group 2B carcinogen. WHO maintains ADI of 40mg/kg body weight remains safe.',
    },
    'e950': {
        commonName: 'Acesulfame-K (Artificial Sweetener)',
        madeFrom: 'Synthetic chemical — reaction of acetoacetic acid with potassium',
        usedFor: '200x sweeter than sugar. Used with aspartame in diet drinks for a cleaner taste.',
        pros: ['Heat stable unlike aspartame', 'Zero calorie'],
        cons: ['Long-term safety data is limited', 'Some studies show possible effects on insulin response', 'May disrupt gut microbiome balance'],
        indianContext: 'Present in most "diet" or "zero sugar" beverages and packaged sweets.',
        whoSays: 'FDA approved. European Food Safety Authority has approved at 9 mg/kg body weight ADI.',
    },
    'e250': {
        commonName: 'Sodium Nitrite (Curing Agent)',
        madeFrom: 'Industrial chemical — sodium salt of nitrous acid',
        usedFor: 'Preserves cured meats (sausages, hot dogs, deli meats) and gives them pink colour.',
        pros: ['Prevents deadly botulism bacteria growth', 'Maintains colour and flavour of cured meats'],
        cons: ['Reacts with amino acids during cooking to form NITROSAMINES — classified as Group 2A carcinogens', 'WHO/IARC: Processed meat consumption linked to colorectal cancer', 'Can cause methaemoglobinaemia in infants'],
        indianContext: 'Present in imported processed meats, some Indian sausages and cold cuts.',
        whoSays: 'WHO/IARC: Processed meats are Group 1 carcinogens. Limit consumption is strongly advised.',
    },
    'e412': {
        commonName: 'Guar Gum (Thickener)',
        madeFrom: 'Ground seeds of the guar plant (Cyamopsis tetragonoloba) — largely grown in Rajasthan, India',
        usedFor: 'Thickens sauces, ice cream, dairy products, baked goods. Improves texture.',
        pros: ['Natural plant-based ingredient', 'Prebiotic fibre — feeds healthy gut bacteria', 'May help lower cholesterol and blood sugar', 'Produced in India — low carbon footprint'],
        cons: ['Can cause digestive bloating and gas in large amounts', 'May cause issues in people with irritable bowel syndrome (IBS)'],
        indianContext: 'Very common in Indian food products. Generally well tolerated.',
        whoSays: 'FDA GRAS. EFSA: Safe at regulated levels.',
    },
    'e330': {
        commonName: 'Citric Acid (Preservative & Flavour)',
        madeFrom: 'Fermentation of sugars by Aspergillus niger mould (industrial process). Naturally found in lemons.',
        usedFor: 'Sour taste, preservative, pH control in beverages, candies, jams.',
        pros: ['Generally considered safe', 'Natural origin (though commercial version is mould-fermented)', 'Prevents oxidation and microbial growth'],
        cons: ['Mould-fermented version: some people with mould sensitivities may react', 'Erodes tooth enamel with frequent exposure (acid)', 'Can trigger heartburn/acid reflux in large amounts'],
        indianContext: 'Ubiquitous in Indian packaged foods — chips, drinks, sauces.',
        whoSays: 'GRAS by FDA. ADI "not specified" — considered safe at current food use levels.',
    },
    'e322': {
        commonName: 'Lecithin (Emulsifier)',
        madeFrom: 'Extracted from soybeans, sunflowers, or egg yolk. Acts as a natural emulsifier.',
        usedFor: 'Prevents separation of oil and water in chocolate, margarine, baked goods, dressings.',
        pros: ['Supports brain health — choline is a building block of acetylcholine neurotransmitter', 'Generally classified as safe and beneficial', 'Natural source emulsifier'],
        cons: ['Soy lecithin contains trace soy proteins (may concern people with severe soy allergy)', 'Often GMO soy source'],
        indianContext: 'Very common in Indian chocolates and baked goods. Generally not a concern.',
        whoSays: 'FDA GRAS. One of the safest emulsifiers used in food.',
    },
    'e471': {
        commonName: 'Mono & Diglycerides (Emulsifier)',
        madeFrom: 'Derived from glycerol and fatty acids — can be animal or plant-based fats',
        usedFor: 'Keeps bread soft, prevents ice cream from melting rapidly, emulsifies baked goods.',
        pros: ['Improves texture and shelf life of bread and baked goods'],
        cons: ['May contain TRANS FATS — not required to be listed separately on labels', 'Can be animal-derived (not always vegetarian)', 'Some individuals experience digestive sensitivity'],
        indianContext: 'Common in Indian bread, biscuits, ice cream. Source (animal/plant) is often not disclosed.',
        whoSays: 'FDA GRAS but the hidden trans fat issue is a significant regulatory loophole.',
    },
    'e500': {
        commonName: 'Sodium Bicarbonate (Baking Soda)',
        madeFrom: 'Mineral — naturally found as nahcolite, or manufactured via Solvay process',
        usedFor: 'Leavening agent — makes bread, cakes, biscuits rise by releasing CO₂.',
        pros: ['Completely safe', 'Natural mineral compound', 'Only present in trace amounts after baking'],
        cons: ['High intake (not from food) can cause alkalosis', 'Negligible concern at food usage levels'],
        indianContext: 'Universal in Indian baked goods. Absolutely no concern.',
        whoSays: 'FDA GRAS. No health concerns at normal dietary levels.',
    },
    'e440': {
        commonName: 'Pectin (Gelling Agent)',
        madeFrom: 'Extracted from apple pomace or citrus peel — completely natural plant fibre',
        usedFor: 'Sets jams, jellies, fruit preparations. Used as fibre supplement.',
        pros: ['Excellent source of soluble dietary fibre', 'Lowers LDL cholesterol', 'Feeds beneficial gut bacteria (prebiotic)', 'Natural and plant-derived'],
        cons: ['Virtually none at food use levels', 'Very large amounts may reduce mineral absorption slightly'],
        indianContext: 'Used in Indian fruit jams and preserves. A genuinely beneficial additive.',
        whoSays: 'FDA GRAS. Considered a beneficial functional food ingredient.',
    },
};

// NOVA classification deep explanation
const NOVA_DEEP = {
    1: {
        label: 'Unprocessed or Minimally Processed',
        color: '#22c55e',
        icon: '🥦',
        what: 'Natural foods that are eaten raw or with minimal treatment — washing, cutting, freezing, drying. No factory ingredients added.',
        examples: 'Fresh fruits, vegetables, eggs, meat, milk, rice, lentils, oats.',
        impact: 'The gold standard. These form the base of every healthy diet globally.',
        recommendation: 'Eat freely and daily. These are your food foundation.',
    },
    2: {
        label: 'Processed Culinary Ingredients',
        color: '#84cc16',
        icon: '🫒',
        what: 'Ingredients extracted from natural foods and used in cooking — not eaten alone.',
        examples: 'Oils, butter, flour, sugar, salt, vinegar, honey.',
        impact: 'Perfectly fine as part of cooking. Become problematic only in excess.',
        recommendation: 'Use in home cooking. Minimise industrial sources.',
    },
    3: {
        label: 'Processed Foods',
        color: '#f59e0b',
        icon: '🥫',
        what: 'Foods made from NOVA 1 or 2 ingredients with added salt, sugar, oil, or preservation. Recognisable ingredients. Meant to extend shelf life.',
        examples: 'Cheese, tinned fish, cured meats, freshly baked bread, canned vegetables, fruit jams.',
        impact: 'Acceptable occasionally. Main concern is added sodium, sugar, or saturated fat from preservation.',
        recommendation: 'Read labels carefully. Occasional consumption is fine.',
    },
    4: {
        label: '⚠️ Ultra-Processed Food (UPF)',
        color: '#ef4444',
        icon: '🏭',
        what: 'Industrial formulations containing ingredients never found in a kitchen — artificial flavours, colours, sweeteners, emulsifiers, stabilisers, texturisers. Designed to be hyper-palatable (engineered to be addictive).',
        examples: 'Instant noodles, packaged chips, soft drinks, flavoured biscuits, margarine, most fast food.',
        impact: '100+ studies link UPF consumption to obesity, type 2 diabetes, cardiovascular disease, depression, colorectal cancer, and all-cause mortality. A 10% increase in UPF consumption is associated with a 14% higher cancer risk (BMJ 2018).',
        recommendation: '🚫 Minimise or avoid. Replace with NOVA 1–2 alternatives wherever possible.',
        alarm: true,
    },
};

// ─── Nutrient concern database ─────────────────────────────────────────────────
const NUTRIENT_CONCERNS = {
    'saturated-fat': {
        name: 'Saturated Fat',
        icon: '🥓',
        color: '#ef4444',
        what: 'A type of fat solid at room temperature — found in meat, butter, palm oil, coconut oil.',
        dailyLimit: '20g (women) / 30g (men) per ICMR/WHO guidelines',
        why: 'Raises LDL ("bad") cholesterol, increasing risk of heart disease and stroke.',
        indianContext: 'Hidden in ghee, butter, palm oil (common in Indian packaged food), coconut oil.',
        threshold: 5,
        unit: 'g',
        key: 'saturated-fat_100g',
    },
    sodium: {
        name: 'Sodium (Salt)',
        icon: '🧂',
        color: '#f59e0b',
        what: 'The mineral in salt (sodium chloride). Essential in small amounts, harmful in excess.',
        dailyLimit: 'WHO recommends LESS than 2,000 mg sodium per day (5g salt)',
        why: 'Excess sodium raises blood pressure (hypertension), increasing risk of heart attack, stroke, and kidney disease.',
        indianContext: 'Indians consume ~11g of salt daily — more than double the safe limit. A major public health crisis.',
        threshold: 0.3,
        unit: 'g',
        key: 'sodium_100g',
        multiply: 1000,
        unitDisplay: 'mg',
    },
    sugars: {
        name: 'Added Sugar',
        icon: '🍬',
        color: '#a78bfa',
        what: 'Free sugars added to food — sucrose, glucose, fructose, corn syrup. Distinct from naturally occurring sugars in whole fruit.',
        dailyLimit: 'WHO: Less than 25g (6 teaspoons) of free sugar per day',
        why: 'Causes blood sugar spikes → insulin resistance → type 2 diabetes. Linked to obesity, tooth decay, fatty liver, and inflammation.',
        indianContext: 'Indians have extremely high genetic predisposition to type 2 diabetes. Sugar consumption is a critical national health issue.',
        threshold: 10,
        unit: 'g',
        key: 'sugars_100g',
    },
    'trans-fat': {
        name: 'Trans Fat (Hydrogenated Oil)',
        icon: '⚠️',
        color: '#dc2626',
        what: 'Artificially created fat made by adding hydrogen to liquid vegetable oils (hydrogenation). Found in vanaspati, margarine, partially hydrogenated oils.',
        dailyLimit: 'WHO target: ZERO trans fat — complete global elimination by 2023',
        why: 'The most dangerous dietary fat. Raises LDL, lowers HDL, causes systemic inflammation, directly linked to heart disease.',
        indianContext: 'Vanaspati (partially hydrogenated oil) has historically been common in Indian cooking and street food. FSSAI has set limits but enforcement remains a concern.',
        threshold: 0,
        unit: 'g',
        key: 'trans-fat_100g',
    },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function RiskBadge({ level }) {
    const cfg = {
        safe:     { label: 'Safe',            color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
        minimal:  { label: 'Minimal Concern', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        moderate: { label: 'Moderate Risk',   color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
        high:     { label: 'High Risk',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    }[level] || { label: 'Unknown', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };

    return (
        <span style={{
            padding: '0.25rem 0.75rem', borderRadius: '20px',
            fontSize: '0.7rem', fontWeight: '800',
            color: cfg.color, background: cfg.bg,
            border: `1px solid ${cfg.color}30`,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            flexShrink: 0
        }}>{cfg.label}</span>
    );
}

function AdditiveCard({ code, name, level }) {
    const [open, setOpen] = useState(false);
    const normalizedCode = code?.toLowerCase().replace('en:', '') || '';
    const deep = ADDITIVE_DEEP[normalizedCode];
    const basicInfo = ADDITIVE_DICTIONARY?.[normalizedCode];

    const riskColors = {
        safe:     '#22c55e',
        minimal:  '#f59e0b',
        moderate: '#f97316',
        high:     '#ef4444',
    };
    const dotColor = riskColors[level] || '#94a3b8';

    return (
        <div style={{
            borderRadius: '16px',
            background: open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${open ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
            marginBottom: '0.6rem',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
        }}>
            {/* Header row */}
            <button onClick={() => setOpen(!open)} style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '1rem 1.25rem',
                background: 'none', border: 'none', cursor: 'pointer', gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f1f5f9' }}>
                            {code} {deep ? `— ${deep.commonName}` : (name ? `— ${name}` : '')}
                        </div>
                        {deep && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {deep.usedFor.substring(0, 60)}…
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <RiskBadge level={level} />
                    {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </div>
            </button>

            {/* Expanded Detail */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {deep ? (
                                <div style={{ paddingTop: '1rem' }}>
                                    {/* Made from */}
                                    <InfoRow icon="🧪" label="Made From" text={deep.madeFrom} />
                                    <InfoRow icon="🎯" label="Used For" text={deep.usedFor} />
                                    <InfoRow icon="🇮🇳" label="In India" text={deep.indianContext} />

                                    {/* Pros & Cons */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
                                        <div style={{ padding: '0.875rem', borderRadius: '12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                                <ThumbsUp size={14} color="#22c55e" />
                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Benefits</span>
                                            </div>
                                            {deep.pros.map((p, i) => (
                                                <div key={i} style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.3rem' }}>
                                                    • {p}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ padding: '0.875rem', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                                <ThumbsDown size={14} color="#f87171" />
                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Risks</span>
                                            </div>
                                            {deep.cons.map((c, i) => (
                                                <div key={i} style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.3rem' }}>
                                                    • {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* WHO / Authority says */}
                                    <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                                            🏛️ WHO / Regulatory Authority Says
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#c7d2fe', lineHeight: 1.5 }}>{deep.whoSays}</div>
                                    </div>
                                </div>
                            ) : basicInfo ? (
                                <div style={{ paddingTop: '1rem' }}>
                                    <InfoRow icon="📋" label="Description" text={basicInfo.desc} />
                                </div>
                            ) : (
                                <div style={{ paddingTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                    Limited public data available for this additive code. It may be a newer or less common compound.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function InfoRow({ icon, label, text }) {
    return (
        <div style={{ marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {icon} {label}
            </span>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.55, marginTop: '0.2rem' }}>{text}</div>
        </div>
    );
}

function NovaDeepdive({ novaGroup }) {
    const [open, setOpen] = useState(novaGroup === 4);
    const info = NOVA_DEEP[novaGroup];
    if (!info) return null;

    return (
        <div style={{
            borderRadius: '16px',
            background: `${info.color}08`,
            border: `1px solid ${info.color}25`,
            marginBottom: '1rem',
            overflow: 'hidden'
        }}>
            <button onClick={() => setOpen(!open)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Box size={20} color={info.color} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f1f5f9' }}>
                            Processing Level: NOVA {novaGroup}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {info.icon} {info.label}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '20px',
                        fontSize: '0.75rem', fontWeight: '800',
                        color: info.color, background: `${info.color}15`,
                        border: `1px solid ${info.color}30`
                    }}>
                        {novaGroup === 4 ? '⚠️ Ultra-Processed' : novaGroup === 3 ? 'Processed' : novaGroup === 2 ? 'Culinary' : 'Natural'}
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
                        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: `1px solid ${info.color}20` }}>
                            <div style={{ paddingTop: '1rem' }}>
                                <InfoRow icon="🔬" label="What This Means" text={info.what} />
                                <InfoRow icon="🛒" label="Examples" text={info.examples} />
                                <InfoRow icon="💊" label="Health Impact" text={info.impact} />

                                {info.alarm && (
                                    <div style={{
                                        padding: '0.875rem 1rem', borderRadius: '12px',
                                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                                        marginTop: '0.75rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                            <ShieldAlert size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <div style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.55 }}>
                                                <strong>Scientific consensus:</strong> {info.recommendation}
                                            </div>
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

function NutrientConcernCard({ nutrientKey, product }) {
    const [open, setOpen] = useState(false);
    const def = NUTRIENT_CONCERNS[nutrientKey];
    if (!def) return null;

    const raw = product.nutriments?.[def.key];
    if (raw === undefined || raw === null) return null;

    const value = def.multiply ? raw * def.multiply : raw;
    if (value <= def.threshold) return null;

    const display = `${value.toFixed(1)} ${def.unitDisplay || def.unit}`;

    return (
        <div style={{
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '0.6rem',
            overflow: 'hidden',
        }}>
            <button onClick={() => setOpen(!open)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{def.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f1f5f9' }}>{def.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>Tap to learn why this matters</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '800', color: def.color, fontSize: '0.95rem' }}>{display}</span>
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
                        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ paddingTop: '1rem' }}>
                                <InfoRow icon="❓" label="What is it?" text={def.what} />
                                <InfoRow icon="🔴" label="Why it's a concern" text={def.why} />
                                <InfoRow icon="🇮🇳" label="Indian Context" text={def.indianContext} />
                                <div style={{
                                    padding: '0.75rem 1rem', borderRadius: '10px',
                                    background: `${def.color}10`, border: `1px solid ${def.color}25`,
                                    marginTop: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: def.color }}>
                                        📏 Safe Daily Limit: {def.dailyLimit}
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

// ─── Main Component ────────────────────────────────────────────────────────────
const ConcernSection = ({ product, additives = [], ingredients = [] }) => {
    const novaLevel = product.nova_group;
    const highRiskAdditives = additives.filter(a => a.level === 'high' || a.level === 'moderate');
    const safeAdditives = additives.filter(a => a.level === 'safe' || a.level === 'minimal');

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* Section Header */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px' }}>
                    <ShieldAlert size={20} color="#f87171" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                        What Should Concern You 🤔
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                        Tap any item to understand it in plain language
                    </p>
                </div>
            </div>

            {/* NOVA Processing Deep Dive */}
            {novaLevel && <NovaDeepdive novaGroup={novaLevel} />}

            {/* Nutrient Concerns */}
            {['saturated-fat', 'sodium', 'sugars'].map(k => (
                <NutrientConcernCard key={k} nutrientKey={k} product={product} />
            ))}

            {/* Additives */}
            {additives.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                        <FlaskConical size={17} color="#f59e0b" />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                            Additives ({additives.length})
                        </span>
                        {highRiskAdditives.length > 0 && (
                            <span style={{
                                padding: '0.2rem 0.6rem', borderRadius: '12px',
                                background: 'rgba(239,68,68,0.15)', color: '#f87171',
                                fontSize: '0.7rem', fontWeight: '800'
                            }}>
                                {highRiskAdditives.length} flagged
                            </span>
                        )}
                    </div>

                    {/* Flagged first */}
                    {highRiskAdditives.map((a, i) => (
                        <AdditiveCard key={`h-${i}`} code={a.code} name={a.name} level={a.level} />
                    ))}

                    {/* Safe ones in collapsible group */}
                    {safeAdditives.length > 0 && (
                        <SafeAdditivesGroup additives={safeAdditives} />
                    )}
                </div>
            )}

            {additives.length === 0 && !novaLevel && (
                <div style={{
                    padding: '1.5rem', textAlign: 'center', borderRadius: '16px',
                    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                    <p style={{ color: '#4ade80', fontWeight: '700', margin: 0 }}>No major concerns detected</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Clean ingredient profile</p>
                </div>
            )}
        </div>
    );
};

function SafeAdditivesGroup({ additives }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setOpen(!open)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0',
                background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
                fontSize: '0.8rem', fontWeight: '600'
            }}>
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {open ? 'Hide' : 'Show'} {additives.length} low-risk additive{additives.length > 1 ? 's' : ''}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {additives.map((a, i) => (
                            <AdditiveCard key={`s-${i}`} code={a.code} name={a.name} level={a.level} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ConcernSection;
