/**
 * About Us — True FoodBite
 * 100% genuine mission, values, and transparency declaration.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Shield, BookOpen, Users, Target, TrendingUp, Globe, Zap, ArrowRight, CheckCircle, Mail } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const VALUES = [
    { icon: Shield, color: '#6366f1', title: 'Radical Transparency', desc: 'Every score is explainable. We show you exactly which components drove the rating — no black boxes.' },
    { icon: BookOpen, color: '#22c55e', title: 'Science Over Marketing', desc: 'We cite peer-reviewed studies and regulatory standards. No influencer trends, no sponsored content.' },
    { icon: Heart, color: '#ec4899', title: 'Consumer First', desc: 'We exist to serve the consumer, not the food industry. We accept zero advertising from brands we rate.' },
    { icon: Globe, color: '#0ea5e9', title: 'Made for India', desc: 'Built with Indian regulatory standards (FSSAI), Indian dietary guidelines (ICMR-NIN), and Indian products in mind.' },
    { icon: Zap, color: '#f59e0b', title: 'Speed & Accessibility', desc: 'Health information should be instant and free. No paywalls, no subscriptions for core features.' },
    { icon: TrendingUp, color: '#84cc16', title: 'Continuously Improving', desc: 'Our database and algorithms are updated as FSSAI regulations evolve and new research emerges.' },
];

const PROBLEM_STATS = [
    { value: '68%', label: 'Packaged food labels in India have compliance issues', cite: 'FSSAI Surveillance Report 2022' },
    { value: '74%', label: 'Consumers cannot correctly interpret Nutrition Facts labels', cite: 'NCBI Survey, India 2021' },
    { value: '77M+', label: 'Indians live with Type 2 Diabetes — diet is the #1 risk factor', cite: 'IDF Diabetes Atlas, 2021' },
    { value: '31%', label: 'Higher metabolic risk associated with ultra-processed food consumption', cite: 'ICMR-NIN Research, 2020' },
];

const DATA_SOURCES = [
    { name: 'OpenFoodFacts', detail: '3M+ globally verified products', url: 'https://world.openfoodfacts.org' },
    { name: 'FSSAI', detail: 'Food Safety & Standards Authority of India', url: 'https://www.fssai.gov.in' },
    { name: 'ICMR-NIN', detail: 'Dietary Guidelines & RDA 2020', url: 'https://www.nin.res.in' },
    { name: 'WHO / EFSA', detail: 'Additive & contaminant safety opinions', url: 'https://www.who.int' },
    { name: 'IARC', detail: 'International carcinogen classifications', url: 'https://www.iarc.who.int' },
    { name: 'PubMed / Lancet', detail: 'Peer-reviewed nutrition studies', url: 'https://pubmed.ncbi.nlm.nih.gov' },
];

export default function About() {
    return (
        <div style={{ paddingBottom: '6rem' }}>

            {/* ── HERO ── */}
            <section style={{
                background: 'linear-gradient(180deg, rgba(132,204,22,0.07) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5rem 0 4rem', textAlign: 'center'
            }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={stagger} style={{ maxWidth: '780px', margin: '0 auto' }}>
                        <motion.div variants={fadeUp} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.4rem 1.2rem', borderRadius: '999px',
                            background: 'rgba(132,204,22,0.08)', border: '1px solid rgba(132,204,22,0.2)',
                            color: '#84cc16', fontWeight: '700', fontSize: '0.82rem', marginBottom: '1.5rem'
                        }}>
                            <Heart size={14} /> Our Mission & Story
                        </motion.div>
                        <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', lineHeight: 1.08, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                            We Believe Every Indian<br /><span className="text-gradient">Deserves Food Truth.</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.65 }}>
                            True FoodBite was built out of a simple, urgent question: <em style={{ color: '#f1f5f9' }}>"Why is it so hard to know what's actually in your food?"</em> India has 1.4 billion consumers and millions of packaged products — yet most people cannot decode a single Nutrition Facts label.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* ── THE PROBLEM ── */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 className="section-title">The Problem We're Solving</h2>
                            <p className="section-subtitle">The Indian food transparency gap is real, measurable, and dangerous. These are not opinions — they are documented facts.</p>
                        </motion.div>
                        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            {PROBLEM_STATS.map(s => (
                                <motion.div key={s.value} variants={fadeUp} style={{
                                    padding: '2rem', borderRadius: '22px', textAlign: 'center',
                                    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)'
                                }}>
                                    <div style={{ fontSize: '3rem', fontWeight: '900', color: '#f87171', lineHeight: 1, marginBottom: '0.6rem' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55, marginBottom: '0.5rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#475569', fontStyle: 'italic' }}>Source: {s.cite}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── MISSION ── */}
            <section style={{ padding: '5rem 0', background: 'rgba(0,0,0,0.2)' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                            <motion.div variants={fadeUp}>
                                <div style={{ fontSize: '0.75rem', color: '#84cc16', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Our Mission</div>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', lineHeight: 1.15, marginBottom: '1.5rem' }}>
                                    Make food transparency <span className="text-gradient">instant, free, and science-backed</span> for every Indian.
                                </h2>
                                <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '1rem', marginBottom: '1rem' }}>
                                    We analyse every ingredient, calculate every nutrient, and cross-reference every additive against FSSAI, WHO, IARC, and ICMR-NIN standards — so you don't have to.
                                </p>
                                <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '1rem' }}>
                                    Our goal is not to tell you what to eat. It's to give you the knowledge to decide for yourself — with confidence, clarity, and zero confusion.
                                </p>
                            </motion.div>
                            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    'Decode 3M+ products from the OpenFoodFacts verified database',
                                    'Classify every ingredient by NOVA processing group (Group 1–4)',
                                    'Flag additives per IARC, EFSA, and FSSAI permitted limits',
                                    'Track all 8 FSSAI Schedule 4 mandatory allergens',
                                    'Provide Nutri-Grade A–E per international validated methodology',
                                    'Deliver this in under 3 seconds, free, on any device',
                                ].map(item => (
                                    <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(132,204,22,0.04)', border: '1px solid rgba(132,204,22,0.1)' }}>
                                        <CheckCircle size={16} color="#84cc16" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{item}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── VALUES ── */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 className="section-title">What We Stand For</h2>
                            <p className="section-subtitle">The values we operate by — which we will never compromise, regardless of commercial pressure.</p>
                        </motion.div>
                        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {VALUES.map(v => (
                                <motion.div key={v.title} variants={fadeUp} style={{
                                    padding: '1.75rem', borderRadius: '22px',
                                    background: `${v.color}06`, border: `1px solid ${v.color}22`
                                }}>
                                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: `${v.color}18`, border: `1px solid ${v.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                        <v.icon size={22} color={v.color} />
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#f1f5f9', marginBottom: '0.5rem' }}>{v.title}</h3>
                                    <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>{v.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── DATA SOURCES ── */}
            <section style={{ padding: '5rem 0', background: 'rgba(0,0,0,0.2)' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 className="section-title">Where Our Data Comes From</h2>
                            <p className="section-subtitle">We exclusively rely on peer-reviewed research, government regulatory data, and verified open databases. No proprietary algorithms without validated scientific basis.</p>
                        </motion.div>
                        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                            {DATA_SOURCES.map(s => (
                                <motion.div key={s.name} variants={fadeUp} style={{
                                    padding: '1.4rem 1.6rem', borderRadius: '18px',
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)'
                                }}>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#84cc16', marginBottom: '0.3rem' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.detail}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                        <motion.div variants={fadeUp} style={{ marginTop: '2rem', padding: '1.25rem 2rem', borderRadius: '18px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', textAlign: 'center', maxWidth: '700px', margin: '2rem auto 0' }}>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.65 }}>
                                <strong style={{ color: '#818cf8' }}>Important disclosure:</strong> True FoodBite does not conduct original laboratory testing. All nutrition and ingredient data is sourced from verified open databases and product manufacturers' declared labels. Regulatory compliance is assessed against published FSSAI standards, not independent lab analysis.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── CONTACT CTA ── */}
            <section style={{ padding: '5rem 0', textAlign: 'center' }}>
                <div className="container">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{
                        padding: '4rem 2rem', borderRadius: '32px',
                        background: 'linear-gradient(135deg, rgba(132,204,22,0.08), rgba(99,102,241,0.08))',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <Mail size={40} color="#84cc16" style={{ marginBottom: '1.25rem' }} />
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '1rem' }}>Questions About Our Methodology?</h2>
                        <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                            We believe in full transparency. If you have questions about how we calculate ratings or want to report a data error, we respond within 48 hours.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2rem', borderRadius: '999px', background: 'linear-gradient(135deg, #84cc16, #65a30d)', color: '#000', fontWeight: '800', fontSize: '0.95rem', textDecoration: 'none' }}>
                                Scan a Product <ArrowRight size={16} />
                            </Link>
                            <Link to="/how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontWeight: '700', fontSize: '0.95rem', textDecoration: 'none' }}>
                                Read Methodology
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
