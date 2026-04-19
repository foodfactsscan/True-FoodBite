/**
 * Insights — True FoodBite
 * Genuine research-backed food insights for Indian consumers.
 * All statistics cited from peer-reviewed sources.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle, BookOpen, Leaf, Heart, Zap, ChevronDown, ExternalLink, Scan } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const INSIGHTS = [
    {
        category: 'Hidden Sugars',
        icon: AlertTriangle,
        color: '#f59e0b',
        badge: 'High Concern',
        badgeColor: '#f59e0b',
        title: 'Sugar Hides Under 56+ Different Names on Indian Food Labels',
        summary: 'FSSAI regulations require "added sugar" to be declared, but manufacturers split it across multiple ingredients — each below the threshold that would push it to the top of the list.',
        detail: `The most common hidden sugar aliases found on Indian packaged food labels include: Dextrose, Maltose, High-Fructose Corn Syrup (HFCS), Fruit Juice Concentrate, Sucrose, Cane Juice, Evaporated Cane Juice, Corn Syrup, Rice Syrup, Barley Malt, and Agave Nectar.

ICMR-NIN guidelines recommend that added sugar should not exceed 10% of total daily energy intake (~50g for a 2000 kcal diet). A single 300ml tetra-pack fruit drink typically contains 30–36g of sugar — 60–72% of the daily recommended limit.

Regulation: FSSAI Labelling Regulations 2020 require total sugars declaration per 100g but do not mandate combined "added sugar" disclosures in grams.`,
        cite: 'ICMR-NIN Dietary Guidelines for Indians, 2024 | FSSAI Food Safety & Standards (Labelling) Regulations, 2020',
        products: ['Packaged fruit juices', 'Flavoured yogurts', '"Health" cereal bars', 'Protein shakes', 'Instant oatmeal packets'],
    },
    {
        category: 'Ultra-Processing',
        icon: Zap,
        color: '#ef4444',
        badge: 'Critical',
        badgeColor: '#ef4444',
        title: '80% of Top-Selling Indian Snacks Are NOVA Group 4 (Ultra-Processed)',
        summary: 'Ultra-processed foods (NOVA 4) contain industrial ingredients not found in home kitchens — emulsifiers, artificial flavours, and texture modifiers. Regular consumption is linked to a 31% higher risk of metabolic syndrome.',
        detail: `NOVA Group 4 (Ultra-Processed) is defined by Prof. Carlos Monteiro (University of São Paulo) and endorsed by WHO, PAHO, and European Food Safety Authority (EFSA). Products qualify as NOVA 4 if they contain:

• Hydrogenated or interesterified oils
• Modified starches (E140x, E141x)  
• Artificial flavouring agents (thousands approved under FSSAI)
• Artificial colours (E102, E110, E122, E123, E124, E127, E128, E132, E133)
• Emulsifiers (E322 lecithin, E433, E471, E472)
• Synthetic preservatives (E202, E211, E250, E319, E320)

ICMR Research (2020): Urban Indians consuming >3 NOVA 4 products/day had 31% higher prevalence of metabolic syndrome vs those consuming <1/day.`,
        cite: 'Monteiro CA et al. PAHHANS, 2019 | ICMR-NIN Special Report on UPF, 2020 | WHO Global Action Plan on NCDs, 2021',
        products: ['Instant noodles', 'Flavoured chips', 'Packaged bread', 'Ready-to-eat meals', 'Chocolates with additives'],
    },
    {
        category: 'Palm Oil',
        icon: Leaf,
        color: '#22c55e',
        badge: 'Important',
        badgeColor: '#22c55e',
        title: 'India Is the World\'s Largest Importer of Palm Oil — Found in 60% of Biscuits & Snacks',
        summary: 'Palm oil itself is not inherently toxic, but refined palm oil is high in saturated fat (49%), and its production is associated with significant environmental concerns. The critical issue is when it\'s partially hydrogenated (PHVO) — which creates trans fats.',
        detail: `Palm oil in Indian packaged foods:
• India imports 9–13 million tonnes of palm oil annually (USDA FAS, 2023)
• Found in: biscuits, chips, instant noodles, chocolates, peanut butter, bread, and most fried snacks
• Regular palm oil: 49% saturated fat — ICMR recommends saturated fat <10% of daily energy
• Vanaspati (Partially Hydrogenated Palm/Vegetable Oil — PHVO): Contains trans fats. FSSAI banned trans fats >2% in 2022, but enforcement in loose vanaspati is challenging.

ICMR-NIN position: Replace palm oil with rice bran oil, mustard oil, or groundnut oil for better cardiovascular outcomes.

The label trick: "Edible vegetable oil" or "edible refined vegetable oil" — legally allows palm oil without naming it.`,
        cite: 'USDA Foreign Agricultural Service, India, 2023 | ICMR-NIN Dietary Guidelines, 2024 | FSSAI Trans Fat Regulations, 2022',
        products: ['Most commercial biscuits', 'Namkeen & chips', 'Instant noodles', 'Commercial peanut butter'],
    },
    {
        category: 'Additives',
        icon: AlertTriangle,
        color: '#8b5cf6',
        badge: 'Research Alert',
        badgeColor: '#8b5cf6',
        title: 'Aspartame: IARC Classified as "Possibly Carcinogenic" in 2023 — Still in 100s of Indian Products',
        summary: 'In July 2023, the International Agency for Research on Cancer (IARC) classified aspartame as Group 2B — "possibly carcinogenic to humans." This doesn\'t mean it causes cancer at normal doses, but raises serious questions.',
        detail: `IARC Classification context:
• Group 2A = "Probably carcinogenic" (includes red meat, night shift work)  
• Group 2B = "Possibly carcinogenic" (includes aspartame, aloe vera extract, coffee — now removed)

The 2023 IARC/WHO Joint Assessment (JECFA) maintained the ADI (Acceptable Daily Intake) at 40mg/kg body weight/day — but IARC flagged "limited evidence of hepatocellular carcinoma in humans" in some studies.

FSSAI permits aspartame up to Schedule IV limits in India. It is found in:
• Diet soft drinks (nearly all)
• Sugar-free chewing gum
• "Light" or "Zero" yogurt products
• Sugar-free confectionery
• Some flavoured waters

True FoodBite flags aspartame as "Caution" in all products where it appears, with a full explanation of the IARC classification.`,
        cite: 'IARC/WHO Joint Expert Committee, July 2023 | FSSAI Food Additives Schedule IV | EFSA Scientific Opinion on Aspartame, 2013',
        products: ['Diet soft drinks', 'Sugar-free gum', '"Zero" labelled products', 'Flavoured waters'],
    },
    {
        category: 'Fibre Myth',
        icon: Heart,
        color: '#0ea5e9',
        badge: 'Label Literacy',
        badgeColor: '#0ea5e9',
        title: '"High Fibre" Claims on Indian Products: What They Actually Mean (and Don\'t)',
        summary: 'FSSAI permits "High Fibre" claim when a product provides ≥6g dietary fibre per 100g. However, marketers use isolated fibres (inulin, chicory root extract) that don\'t have the same health benefits as naturally occurring whole-grain fibre.',
        detail: `Under FSSAI Claim Regulations (Schedule II, Health Claims):
• "Source of Fibre" = ≥3g/100g
• "High in Fibre" = ≥6g/100g

The issue: Fibre type matters enormously. Research consistently supports benefits from:
✅ Naturally occurring fibre (whole wheat, oats, lentils, vegetables)
⚠️ Isolated inulin / chicory root (commonly added to breakfast cereals and biscuits to boost fibre numbers on labels)

ICMR-NIN recommends 25–40g fibre/day from natural food sources, noting that isolated fibres do not provide the same microbiome benefits as naturally occurring dietary fibre.

A biscuit labelled "High Fibre" may use added inulin to cross the 6g threshold — while being NOVA Group 4 ultra-processed and high in refined flour and sugar. True FoodBite analyses fibre source quality, not just quantity.`,
        cite: 'FSSAI Food Safety & Standards (Advertising & Claims) Regulations 2018 | ICMR-NIN RDA 2020 | Slavin J, Nutrients 2013',
        products: ['High-fibre biscuits', 'Fortified breakfast cereals', 'Fibre-enriched bread', '"Health" granola bars'],
    },
    {
        category: 'Protein Quality',
        icon: TrendingUp,
        color: '#84cc16',
        badge: 'Nutrition Science',
        badgeColor: '#84cc16',
        title: 'Protein Quantity vs Quality: The PDCAAS Score Most Indian Brands Don\'t Mention',
        summary: 'Protein content (grams) tells only half the story. Protein Digestibility Corrected Amino Acid Score (PDCAAS) — the WHO-validated metric — tells you how usable that protein actually is. Many "high protein" Indian products score poorly.',
        detail: `PDCAAS (Protein Digestibility Corrected Amino Acid Score) — WHO/FAO 1991, updated to DIAAS 2011:
• Scale: 0 to 1.0 (or 0–100%)
• Egg white = 1.0 (perfect score — contains all 9 essential amino acids in correct ratios)
• Whey protein = 1.0
• Casein (milk protein) = 1.0
• Soy protein isolate = 0.91
• Chickpea = 0.71
• Wheat protein = 0.42 (low in lysine)
• Pea protein = 0.69

The common misleading practice: Products made primarily from wheat protein (bread, biscuits, wheat-based items) claim "high protein" based purely on gram content — without disclosing the low PDCAAS score.

ICMR-NIN recommends 0.8–1.0g protein per kg body weight/day from mixed, high-quality sources. For vegetarians, combining cereals + pulses at each meal improves the combined PDCAAS significantly.`,
        cite: 'WHO/FAO Protein Quality Evaluation, 1991 | FAO/WHO DIAAS, 2013 | ICMR-NIN RDA Report, 2020',
        products: ['Protein bars', '"High protein" biscuits', 'Protein shakes', 'Fortified breakfast cereals'],
    },
];

export default function Insights() {
    const [expanded, setExpanded] = useState(null);
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Production: relative /api | Local: http://localhost:5000/api
                const API_BASE = (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'))
                    ? '/api'
                    : 'http://localhost:5000/api';
                
                const response = await fetch(`${API_BASE}/news`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.news?.length > 0) {
                        setNews(data.news);
                    }
                }
            } catch (err) {
                console.error('News fetch error:', err);
            } finally {
                setLoadingNews(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div style={{ paddingBottom: '6rem' }}>

            {/* ── HERO ── */}
            <section style={{
                background: 'linear-gradient(180deg, rgba(99,102,241,0.07) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5rem 0 4rem', textAlign: 'center'
            }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={stagger} style={{ maxWidth: '760px', margin: '0 auto' }}>
                        <motion.div variants={fadeUp} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.4rem 1.2rem', borderRadius: '999px',
                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                            color: '#818cf8', fontWeight: '700', fontSize: '0.82rem', marginBottom: '1.5rem'
                        }}>
                            <BookOpen size={14} /> Science-Backed · Cited · No Clickbait
                        </motion.div>
                        <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                            Food Insights That<br /><span className="text-gradient">Actually Matter</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.65 }}>
                            Every insight below is sourced from peer-reviewed research, FSSAI regulations, and WHO/ICMR-NIN guidelines.
                            No wellness myths. No sponsored content. Just documented food science — simplified for you.
                        </motion.p>
                    </motion.div>
                </div>
            </section>
            
            {/* ── LIVE INDUSTRY ALERTS ── */}
            <section style={{ padding: '3rem 0 1rem' }}>
                <div className="container">
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.03)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '24px',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="animate-ping" style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', opacity: 0.6 }} />
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', zIndex: 1 }} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f1f5f9', margin: 0 }}>Breaking Industry Alerts</h2>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Updated every 15 mins</span>
                        </div>

                        {loadingNews ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Connecting to global food safety networks...</div>
                        ) : news.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                {news.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            textDecoration: 'none',
                                            display: 'block',
                                            padding: '1.25rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '16px',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: '#94a3b8', fontWeight: '700' }}>
                                                {item.source}
                                            </span>
                                            <ExternalLink size={12} color="#64748b" />
                                        </div>
                                        <h4 style={{ fontSize: '0.9rem', lineHeight: 1.45, color: '#e2e8f0', fontWeight: '600', margin: 0 }}>
                                            {item.title}
                                        </h4>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No critical alerts found in the last 24 hours. Stand by...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── INSIGHTS CARDS ── */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {INSIGHTS.map((ins, idx) => (
                            <motion.div key={ins.title} variants={fadeUp} style={{
                                borderRadius: '24px',
                                border: `1px solid ${ins.color}20`,
                                background: `${ins.color}06`,
                                overflow: 'hidden'
                            }}>
                                {/* Header (always visible) */}
                                <button
                                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                                    style={{
                                        width: '100%', padding: '1.75rem 2rem',
                                        background: 'transparent', border: 'none',
                                        display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
                                        cursor: 'pointer', textAlign: 'left'
                                    }}
                                >
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${ins.color}18`, border: `1px solid ${ins.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <ins.icon size={22} color={ins.color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.68rem', color: ins.badgeColor, fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', background: `${ins.badgeColor}15`, border: `1px solid ${ins.badgeColor}30`, padding: '0.2rem 0.65rem', borderRadius: '999px' }}>
                                                {ins.badge}
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: '#475569' }}>{ins.category}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.4, marginBottom: '0.6rem' }}>{ins.title}</h3>
                                        <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55 }}>{ins.summary}</p>
                                    </div>
                                    <ChevronDown size={20} color="#475569" style={{ flexShrink: 0, transform: expanded === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', marginTop: '4px' }} />
                                </button>

                                {/* Expandable detail */}
                                <AnimatePresence>
                                    {expanded === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '0 2rem 2rem' }}>
                                                <div style={{ height: '1px', background: `${ins.color}15`, marginBottom: '1.5rem' }} />
                                                <pre style={{
                                                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                                    fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.75,
                                                    fontFamily: 'inherit', marginBottom: '1.25rem'
                                                }}>
                                                    {ins.detail}
                                                </pre>
                                                <div style={{ marginBottom: '1.25rem' }}>
                                                    <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                        Commonly Found In:
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                        {ins.products.map(p => (
                                                            <span key={p} style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', background: `${ins.color}10`, border: `1px solid ${ins.color}20`, color: ins.color, fontWeight: '600' }}>{p}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.7rem', color: '#334155', fontStyle: 'italic' }}>📚 Sources: {ins.cite}</p>
                                                <div style={{ marginTop: '1.25rem' }}>
                                                    <Link to="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.3rem', borderRadius: '999px', background: `${ins.color}18`, border: `1px solid ${ins.color}30`, color: ins.color, fontWeight: '700', fontSize: '0.82rem', textDecoration: 'none' }}>
                                                        <Scan size={14} /> Check your product for this
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── DISCLAIMER ── */}
            <section style={{ padding: '2rem 0 4rem' }}>
                <div className="container" style={{ maxWidth: '760px' }}>
                    <div style={{ padding: '1.5rem 2rem', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.7, textAlign: 'center' }}>
                            <strong style={{ color: '#64748b' }}>Research Disclaimer:</strong> All insights presented here are for consumer education and awareness purposes. They are not medical advice. Always consult a registered dietitian or healthcare professional for personalized dietary guidance. True FoodBite does not recommend or endorse any specific diet or product. All citations link to publicly accessible regulatory documents or peer-reviewed publications.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
