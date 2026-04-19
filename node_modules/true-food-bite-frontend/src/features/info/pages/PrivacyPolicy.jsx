/**
 * Privacy Policy — True FoodBite
 * Clear, plain-language privacy policy. No legalese obfuscation.
 * Last updated: April 2026
 */
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Trash2, Mail, CheckCircle, XCircle, Globe, Database } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const SECTIONS = [
    {
        icon: Database,
        color: '#6366f1',
        title: 'What Data We Collect',
        content: [
            { heading: 'Account Data (only if you register)', text: 'Name, email address, and a securely hashed password (we never store plain-text passwords). This is stored in MongoDB Atlas — a SOC 2 Type II certified cloud database hosted in India/Singapore.' },
            { heading: 'Scan & Search History', text: 'Products you scan or search are temporarily stored on your device (localStorage) to enable offline functionality. If you are logged in, we additionally store your scan history on our servers to power your personal dashboard. This data is associated only with your account ID, never sold.' },
            { heading: 'Technical Logs', text: 'Standard server logs include your IP address, browser type, and pages visited. These are retained for 30 days for security and debugging purposes only, then permanently deleted.' },
            { heading: 'What We Do NOT Collect', text: 'We do not collect: health conditions, financial data, location data, camera images stored on our servers (camera is used locally for barcode reading only), or any form of biometric data.' },
        ]
    },
    {
        icon: Eye,
        color: '#22c55e',
        title: 'How We Use Your Data',
        content: [
            { heading: 'Service Delivery', text: 'Your account data is used solely to authenticate you and provide personalised features like scan history and dietary preference settings.' },
            { heading: 'Product Analysis', text: 'When you scan a barcode, it is sent to the OpenFoodFacts API to retrieve product data. Your barcode query is not stored in a user-identifiable way.' },
            { heading: 'Service Improvement', text: 'Anonymised and aggregated usage patterns (e.g., "most searched categories") help us improve the app. No individual user data is included in these analyses.' },
            { heading: 'Communication', text: 'We send emails only for: account verification OTP, password reset, and (with your opt-in consent) product updates or feature announcements. You can unsubscribe at any time.' },
        ]
    },
    {
        icon: Globe,
        color: '#0ea5e9',
        title: 'Third-Party Services We Use',
        content: [
            { heading: 'OpenFoodFacts API', text: 'Product data is fetched from OpenFoodFacts (world.openfoodfacts.org), a non-profit open food database. Their privacy policy: https://world.openfoodfacts.org/privacy' },
            { heading: 'MongoDB Atlas', text: 'User account and scan history data is stored on MongoDB Atlas (MongoDB, Inc.), a SOC 2 certified cloud database. Region: Asia Pacific (Mumbai/Singapore).' },
            { heading: 'Vercel', text: 'Our application is hosted on Vercel, Inc. (USA). Standard hosting logs apply per Vercel\'s privacy policy.' },
            { heading: 'No Advertising Networks', text: 'We do not use Google AdSense, Facebook Pixel, or any advertising or tracking networks on this platform.' },
        ]
    },
    {
        icon: Lock,
        color: '#ec4899',
        title: 'Security Measures',
        content: [
            { heading: 'Password Security', text: 'Passwords are hashed using bcrypt (minimum 10 rounds) before storage. We never store or transmit plain-text passwords.' },
            { heading: 'Authentication Tokens', text: 'Login sessions use JSON Web Tokens (JWT) signed with a secure secret key. Tokens expire and require re-authentication.' },
            { heading: 'Data Transmission', text: 'All data is transmitted over HTTPS with TLS 1.2+. We enforce HTTPS redirect on all endpoints.' },
            { heading: 'Data Access Controls', text: 'User data in our database is access-controlled. Developers access production data only through authenticated, audited connections.' },
        ]
    },
    {
        icon: Shield,
        color: '#f59e0b',
        title: 'Your Rights (Indian Users)',
        content: [
            { heading: 'Right to Access', text: 'You can export all your personal data (account info and scan history) from your Profile Settings page at any time.' },
            { heading: 'Right to Correction', text: 'You can update your name and email from Profile Settings.' },
            { heading: 'Right to Deletion', text: 'You can permanently delete your account and all associated data from Profile Settings → Delete Account. Deletion is irreversible and completed within 72 hours.' },
            { heading: 'Indian IT Act Compliance', text: 'We comply with the Information Technology (Amendment) Act 2008 and endeavour to align with the Digital Personal Data Protection (DPDP) Act 2023 as it is operationalised.' },
        ]
    },
    {
        icon: Trash2,
        color: '#84cc16',
        title: 'Data Retention Policy',
        content: [
            { heading: 'Active Accounts', text: 'Account data and scan history are retained as long as your account is active.' },
            { heading: 'Deleted Accounts', text: 'All personal data is permanently purged within 72 hours of account deletion request.' },
            { heading: 'Server Logs', text: 'Technical logs are retained for 30 days, then auto-deleted.' },
            { heading: 'Cookies', text: 'We use only functional cookies (for session management). No tracking or analytics cookies are set without consent.' },
        ]
    },
];

export default function PrivacyPolicy() {
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
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.4rem 1.2rem', borderRadius: '999px',
                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                            color: '#818cf8', fontWeight: '700', fontSize: '0.82rem', marginBottom: '1.5rem'
                        }}>
                            <Shield size={14} /> Plain Language · No Legalese
                        </motion.div>
                        <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '1rem' }}>
                            Privacy Policy
                        </motion.h1>
                        <motion.p variants={fadeUp} style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65 }}>
                            We believe privacy policies should be readable. This document is written in plain language so you can actually understand what we do with your data.
                        </motion.p>
                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                                <CheckCircle size={14} color="#22c55e" /> Last Updated: April 2026
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                                <CheckCircle size={14} color="#22c55e" /> DPDP Act 2023 Aligned
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                                <XCircle size={14} color="#ef4444" /> No Ads. No Data Selling.
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── TL;DR STRIP ── */}
            <div style={{ background: 'rgba(132,204,22,0.06)', borderTop: '1px solid rgba(132,204,22,0.12)', borderBottom: '1px solid rgba(132,204,22,0.12)', padding: '1.25rem 0' }}>
                <div className="container">
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#a3e635', fontWeight: '700' }}>
                        🔒 TL;DR — We collect only what's needed to run the app. We never sell your data. You can delete everything instantly.
                    </p>
                </div>
            </div>

            {/* ── SECTIONS ── */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '820px' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {SECTIONS.map(s => (
                            <motion.div key={s.title} variants={fadeUp} style={{
                                borderRadius: '24px', border: `1px solid ${s.color}18`,
                                background: `${s.color}05`, padding: '2rem 2.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <s.icon size={22} color={s.color} />
                                    </div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f1f5f9' }}>{s.title}</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {s.content.map(c => (
                                        <div key={c.heading}>
                                            <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: s.color, marginBottom: '0.35rem' }}>{c.heading}</h3>
                                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7 }}>{c.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Contact */}
                        <motion.div variants={fadeUp} style={{
                            padding: '2rem 2.5rem', borderRadius: '24px',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
                        }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(132,204,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Mail size={22} color="#84cc16" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#f1f5f9', marginBottom: '0.3rem' }}>Privacy Questions or Data Requests</h3>
                                <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                                    For any privacy concerns, data access requests, or deletion requests, contact us. We respond within 48 hours.
                                    Jurisdiction: India · Governing law: Information Technology Act 2008 & DPDP Act 2023.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
