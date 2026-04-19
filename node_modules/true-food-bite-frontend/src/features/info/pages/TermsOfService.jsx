/**
 * Terms of Service — True FoodBite
 * Clear, fair, plain-language terms. No dark patterns.
 * Last updated: April 2026
 */
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, Mail, Shield } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const TERMS = [
    {
        icon: CheckCircle,
        color: '#22c55e',
        title: '1. Acceptance of Terms',
        paras: [
            'By accessing or using True FoodBite ("the Service", "the Platform"), you agree to these Terms of Service. If you do not agree, please do not use the Service.',
            'These Terms apply to all users including registered members and anonymous visitors.',
            'We may update these Terms periodically. Continued use of the Service after changes constitutes acceptance. We will notify registered users of material changes via email.',
        ]
    },
    {
        icon: FileText,
        color: '#6366f1',
        title: '2. Nature of the Service',
        paras: [
            'True FoodBite is a consumer food transparency and nutritional analysis platform. It provides educational information about packaged food products based on publicly available data.',
            'The Service sources product data from OpenFoodFacts (a non-profit open food database) and manufacturer-declared labels. We do not independently verify this data through laboratory testing.',
            'All nutritional scores, Nutri-Grades, NOVA classifications, and additive flagging are algorithmic assessments for educational purposes only. They do not constitute medical advice, dietary prescriptions, or regulatory certifications.',
            'True FoodBite is not affiliated with FSSAI, ICMR-NIN, WHO, or any government body. References to these organisations are citations of their published research and regulations.',
        ]
    },
    {
        icon: AlertTriangle,
        color: '#f59e0b',
        title: '3. Disclaimer of Medical Advice',
        paras: [
            'IMPORTANT: The content on True FoodBite is for general educational and informational purposes ONLY. It is NOT a substitute for professional medical advice, diagnosis, or treatment.',
            'Never disregard professional medical advice or delay seeking it based on information from this platform. If you have a medical condition (diabetes, allergies, celiac disease, cardiovascular disease, etc.), always consult a qualified healthcare professional or registered dietitian before making dietary changes.',
            'Allergen information is provided as an educational aid. We strongly caution users with severe allergies to verify ingredients directly on physical product labels and contact manufacturers, as formulations change without notice.',
        ]
    },
    {
        icon: Shield,
        color: '#ec4899',
        title: '4. User Accounts & Security',
        paras: [
            'Registration is optional. Core scanning and search features are available without an account.',
            'You are responsible for maintaining the confidentiality of your account credentials. Do not share your password with anyone.',
            'You must provide accurate information when registering. Creating accounts with false identities or for unauthorised purposes is prohibited.',
            'We reserve the right to suspend accounts that violate these Terms or are used for abuse, scraping at unreasonable scale, or malicious activity.',
        ]
    },
    {
        icon: XCircle,
        color: '#ef4444',
        title: '5. Prohibited Uses',
        paras: [
            'You may not use the Service for any of the following purposes:',
        ],
        bullets: [
            'Automated scraping or bulk downloading of product data without explicit written permission',
            'Reverse-engineering, decompiling, or extracting proprietary algorithms',
            'Misrepresenting True FoodBite ratings in advertising, packaging, or marketing materials',
            'Attempting to compromise the security or integrity of our systems',
            'Submitting false or misleading product data',
            'Using the Service for commercial data resale without a data licensing agreement',
        ],
        postPara: 'Violations may result in immediate account termination and, where applicable, legal action under the Information Technology Act 2008.'
    },
    {
        icon: Scale,
        color: '#0ea5e9',
        title: '6. Intellectual Property',
        paras: [
            'The True FoodBite brand, logo, design, rating methodology, and proprietary software code are the intellectual property of True FoodBite and are protected under applicable Indian and international IP laws.',
            'Product names, images, and nutritional data sourced from OpenFoodFacts remain subject to the Open Database License (ODbL) v1.0. Re-use of this data must comply with ODbL terms.',
            'You are granted a limited, non-exclusive, non-transferable licence to access and use the Service for personal, non-commercial purposes only.',
        ]
    },
    {
        icon: AlertTriangle,
        color: '#84cc16',
        title: '7. Limitation of Liability',
        paras: [
            'To the fullest extent permitted by Indian law, True FoodBite and its creators shall not be liable for:',
        ],
        bullets: [
            'Any health consequences arising from reliance on our ratings or recommendations',
            'Inaccuracies in product data sourced from third-party databases or manufacturer labels',
            'Data loss, service interruptions, or technical errors',
            'Indirect, incidental, or consequential damages of any kind',
        ],
        postPara: 'Our total liability to you, if applicable, shall not exceed INR 1,000 (Rupees one thousand only) or the amount you paid for premium services, whichever is greater.'
    },
    {
        icon: Scale,
        color: '#8b5cf6',
        title: '8. Governing Law & Dispute Resolution',
        paras: [
            'These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of courts in India.',
            'We encourage users to first contact us directly to resolve any disputes amicably before initiating formal proceedings.',
            'If you have a consumer complaint, you may also approach the National Consumer Helpline (NCH) at 1800-11-4000 or through the INGRAM portal.',
        ]
    },
];

export default function TermsOfService() {
    return (
        <div style={{ paddingBottom: '6rem' }}>

            {/* ── HERO ── */}
            <section style={{
                background: 'linear-gradient(180deg, rgba(99,102,241,0.07) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5rem 0 3.5rem', textAlign: 'center'
            }}>
                <div className="container" style={{ maxWidth: '780px' }}>
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div variants={fadeUp} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem',
                            borderRadius: '999px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                            color: '#818cf8', fontWeight: '700', fontSize: '0.82rem', marginBottom: '1.5rem'
                        }}>
                            <Scale size={14} /> Fair Terms · Plain Language
                        </motion.div>
                        <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '1rem' }}>
                            Terms of Service
                        </motion.h1>
                        <motion.p variants={fadeUp} style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65 }}>
                            Written in plain English. No hidden clauses. If you see something unfair, please tell us.
                        </motion.p>
                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>✅ Last Updated: April 2026</span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>✅ Applicable Jurisdiction: India</span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>✅ IT Act 2008 Compliant</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── SECTIONS ── */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '820px' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {TERMS.map(t => (
                            <motion.div key={t.title} variants={fadeUp} style={{
                                borderRadius: '20px', border: `1px solid ${t.color}18`,
                                background: `${t.color}04`, padding: '2rem 2.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: `${t.color}18`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <t.icon size={20} color={t.color} />
                                    </div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f1f5f9' }}>{t.title}</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {t.paras.map((p, i) => (
                                        <p key={i} style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.75 }}>{p}</p>
                                    ))}
                                    {t.bullets && (
                                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {t.bullets.map(b => (
                                                <li key={b} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.55 }}>
                                                    <span style={{ color: t.color, flexShrink: 0, marginTop: '3px' }}>•</span> {b}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {t.postPara && <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.75, marginTop: '0.25rem' }}>{t.postPara}</p>}
                                </div>
                            </motion.div>
                        ))}

                        {/* Contact */}
                        <motion.div variants={fadeUp} style={{ padding: '1.75rem 2.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(132,204,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mail size={20} color="#84cc16" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f1f5f9', marginBottom: '0.2rem' }}>Questions About These Terms?</h3>
                                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Contact True FoodBite for any legal queries or to report violations. We respond within 48 business hours.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
