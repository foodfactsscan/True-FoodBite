/**
 * How It Works — True FoodBite
 * Science-backed rating methodology explained with full citations.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Microscope, Leaf, Activity, AlertTriangle, Target,
    CheckCircle, XCircle, FlaskConical, Brain, Database,
    ChevronRight, Scan, ArrowRight, BookOpen, ShieldCheck
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const SCORE_TIERS = [
    { range: '4.5 – 5.0', label: 'Excellent', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', desc: 'Minimally processed, nutrient-dense, no harmful additives. Safe to consume daily.' },
    { range: '3.5 – 4.4', label: 'Good', color: '#65a30d', bg: 'rgba(101,163,13,0.1)', desc: 'Good nutritional quality with minor trade-offs. Suitable for regular consumption.' },
    { range: '2.5 – 3.4', label: 'Average', color: '#ca8a04', bg: 'rgba(202,138,4,0.1)', desc: 'Moderate quality. Consume in controlled portions, occasionally.' },
    { range: '1.5 – 2.4', label: 'Poor', color: '#ea580c', bg: 'rgba(234,88,12,0.1)', desc: 'High in sugar, salt, or bad fats. Limit intake significantly.' },
    { range: '0.0 – 1.4', label: 'Avoid', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', desc: 'Ultra-processed with harmful additives. Not recommended for regular use.' },
];

const COMPONENTS = [
    {
        n: '01', icon: Microscope, color: '#6366f1',
        title: 'Nutrition Profile Analysis',
        weight: '35% of score',
        points: [
            'Evaluated per 100g / 100ml (international standard)',
            'Negative nutrients: Total sugar (ICMR limit: <10% daily energy), Sodium (FSSAI: max 2000mg/day), Saturated fat, Trans fat',
            'Positive nutrients: Dietary fibre (ICMR RDA: 25–40g/day), Protein, Calcium, Iron',
            'Category-relative scoring — biscuits compared to biscuits, not to salads',
        ],
        cite: 'ICMR-NIN Recommended Dietary Allowances, 2020'
    },
    {
        n: '02', icon: Leaf, color: '#22c55e',
        title: 'Ingredient Quality Assessment',
        weight: '25% of score',
        points: [
            'Whole grain vs refined grain — whole grain scores 2x higher',
            'Natural sweeteners (jaggery, dates) vs added refined sugar',
            'Cold-pressed oils vs refined palm oil / vanaspati (PHVO)',
            'Real fruit/vegetable content vs flavouring agents',
        ],
        cite: 'FSSAI Food Product Standards & Food Additives Regulations, 2011'
    },
    {
        n: '03', icon: Activity, color: '#0ea5e9',
        title: 'NOVA Processing Level',
        weight: '25% of score',
        points: [
            'NOVA 1 (Unprocessed) → full score contribution',
            'NOVA 2 (Culinary ingredients) → minimal penalty',
            'NOVA 3 (Processed) → moderate deduction',
            'NOVA 4 (Ultra-processed) → severe deduction, automatic flag',
        ],
        cite: 'Monteiro CA et al. — NOVA classification, PAHHANS, 2019'
    },
    {
        n: '04', icon: AlertTriangle, color: '#f97316',
        title: 'Harmful Additive Penalty',
        weight: '15% of score',
        points: [
            'Artificial colours (E102, E110, E122) — linked to ADHD in children (The Lancet, 2007)',
            'Aspartame (E951) — IARC Group 2B possible carcinogen (2023)',
            'TBHQ (E319) — hepatotoxic at high doses (EFSA Opinion, 2020)',
            'Carrageenan (E407) — intestinal inflammation in animal models',
        ],
        cite: 'WHO / IARC Monographs + EFSA Scientific Opinions'
    },
];

const WHAT_WE_DONT = [
    { text: 'Use brand reputation or price to influence ratings' },
    { text: 'Accept advertising or sponsorship from food companies' },
    { text: 'Rate food without verified ingredient + nutrition data' },
    { text: 'Compare products across categories (biscuits vs vegetables)' },
    { text: 'Personalize ratings — every user sees the same score' },
];

export default function HowItWorks() {
    return (
        <div style={{ paddingBottom: '6rem' }}>

            {/* ── HERO ── */}
            <section style={{
                background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5rem 0 4rem', textAlign: 'center'
            }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div variants={fadeUp} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.4rem 1.2rem', borderRadius: '999px',
                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                            color: '#818cf8', fontWeight: '700', fontSize: '0.82rem', marginBottom: '1.5rem'
                        }}>
                            <Microscope size={14} /> Methodology · Transparent · Science-First
                        </motion.div>
                        <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', lineHeight: 1.08, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                            How True FoodBite<br /><span className="text-gradient">Rates Your Food</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto 2rem', lineHeight: 1.65 }}>
                            Every rating is built on four independently weighted components — Nutrition, Ingredient Quality, Processing Level, and Additive Penalty — grounded entirely in peer-reviewed science and Indian regulatory standards.
                        </motion.p>
                        <motion.div variants={fadeUp}>
                            <Link to="/scan" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                padding: '0.9rem 2rem', borderRadius: '999px',
                                background: 'linear-gradient(135deg, #84cc16, #65a30d)',
                                color: '#000', fontWeight: '800', fontSize: '0.95rem', textDecoration: 'none'
                            }}>
                                <Scan size={18} /> Try It Now — Scan a Product
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── SCORE TIERS ── */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 className="section-title">The 0–5 Rating Scale</h2>
                            <p className="section-subtitle">Each product gets a single, unified score. Here's exactly what each range means.</p>
                        </motion.div>
                        <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '760px', margin: '0 auto' }}>
                            {SCORE_TIERS.map(t => (
                                <motion.div key={t.label} variants={fadeUp} style={{
                                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                                    padding: '1.25rem 1.5rem', borderRadius: '18px',
                                    background: t.bg, border: `1px solid ${t.color}25`
                                }}>
                                    <div style={{ minWidth: '90px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: t.color }}>{t.range}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', color: t.color, fontSize: '1rem', marginBottom: '0.2rem' }}>{t.label}</div>
                                        <div style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.55 }}>{t.desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── 4 COMPONENTS ── */}
            <section style={{ padding: '5rem 0', background: 'rgba(0,0,0,0.2)' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                            <h2 className="section-title">4 Components. One Honest Score.</h2>
                            <p className="section-subtitle">Each component is independently calculated and weighted. The final score is their weighted average — never rounded, never fudged.</p>
                        </motion.div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {COMPONENTS.map(c => (
                                <motion.div key={c.n} variants={fadeUp} style={{
                                    background: `${c.color}08`, border: `1px solid ${c.color}25`,
                                    borderRadius: '24px', padding: '2rem 2.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                                            background: `${c.color}18`, border: `1px solid ${c.color}35`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <c.icon size={26} color={c.color} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '220px' }}>
                                            <div style={{ fontSize: '0.7rem', color: c.color, fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                                Component {c.n} · {c.weight}
                                            </div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f1f5f9', marginBottom: '1rem' }}>{c.title}</h3>
                                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}>
                                                {c.points.map(p => (
                                                    <li key={p} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55 }}>
                                                        <CheckCircle size={14} color={c.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                                                        {p}
                                                    </li>
                                                ))}
                                            </ul>
                                            <p style={{ fontSize: '0.7rem', color: '#334155', fontStyle: 'italic' }}>📚 Source: {c.cite}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── WHAT WE DON'T DO ── */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container" style={{ maxWidth: '860px' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 className="section-title">Our Commitments to You</h2>
                            <p className="section-subtitle">What we will <em>never</em> do — because your trust depends on it.</p>
                        </motion.div>
                        <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {WHAT_WE_DONT.map(w => (
                                <motion.div key={w.text} variants={fadeUp} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '1rem 1.4rem', borderRadius: '14px',
                                    background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)'
                                }}>
                                    <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{w.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ padding: '3.5rem 2rem', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(132,204,22,0.1), rgba(99,102,241,0.1))', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <ShieldCheck size={44} color="#84cc16" style={{ marginBottom: '1.25rem' }} />
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '1rem' }}>Ready to Decode Your Food?</h2>
                        <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>Scan any product in 3 seconds. No login required. Free forever.</p>
                        <Link to="/scan" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2.5rem',
                            borderRadius: '999px', background: 'linear-gradient(135deg, #84cc16, #65a30d)',
                            color: '#000', fontWeight: '800', fontSize: '1rem', textDecoration: 'none'
                        }}>
                            <Scan size={20} /> Start Scanning <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
