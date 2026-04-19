/**
 * API Documentation — True FoodBite
 * Developer-friendly API reference.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Zap, Globe, Key, Terminal, Copy, CheckCircle, BookOpen, AlertTriangle } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const BASE = 'https://truefoodbite.vercel.app/api';

const ENDPOINTS = [
    {
        method: 'GET',
        methodColor: '#22c55e',
        path: '/product/:barcode',
        title: 'Get Product by Barcode',
        desc: 'Retrieve complete product data including nutrition facts, ingredient list, Nutri-Grade, and NOVA classification for a product by its EAN-13 barcode.',
        params: [{ name: 'barcode', type: 'string', req: true, desc: 'EAN-13 barcode (e.g., 8901030704849 for Maggi)' }],
        response: `{
  "status": "success",
  "product": {
    "barcode": "8901030704849",
    "name": "Maggi 2-Minute Noodles (Masala)",
    "brand": "Nestlé India",
    "image_url": "https://...",
    "nutri_grade": "E",
    "nova_group": 4,
    "nutrition_per_100g": {
      "energy_kcal": 390,
      "carbohydrates": 58.5,
      "sugar": 2.8,
      "protein": 10.1,
      "fat": 13.9,
      "saturated_fat": 5.8,
      "fibre": 2.2,
      "sodium": 1270
    },
    "ingredients": [ ... ],
    "allergens": ["gluten", "milk"],
    "additives": ["E508", "E627", "E631", "E330"],
    "health_score": 1.8,
    "verdict": "Avoid"
  }
}`,
        example: `curl -X GET "${BASE}/product/8901030704849"`,
    },
    {
        method: 'GET',
        methodColor: '#22c55e',
        path: '/search',
        title: 'Search Products',
        desc: 'Search for products by name. Returns up to 12 results sorted by relevance and popularity. India-first results are prioritised.',
        params: [
            { name: 'q', type: 'string', req: true, desc: 'Search query (e.g., "maggi", "amul butter")' },
            { name: 'page', type: 'integer', req: false, desc: 'Page number (default: 1)' },
            { name: 'limit', type: 'integer', req: false, desc: 'Results per page (default: 12, max: 24)' },
        ],
        response: `{
  "status": "success",
  "count": 12,
  "products": [
    {
      "barcode": "...",
      "name": "...",
      "brand": "...",
      "image_url": "...",
      "nutri_grade": "C",
      "nova_group": 3
    }
  ]
}`,
        example: `curl -X GET "${BASE}/search?q=maggi&page=1&limit=12"`,
    },
    {
        method: 'POST',
        methodColor: '#6366f1',
        path: '/auth/register',
        title: 'Register User',
        desc: 'Create a new user account. Sends an OTP to the provided email for verification.',
        params: [
            { name: 'name', type: 'string', req: true, desc: 'Full name of the user' },
            { name: 'email', type: 'string', req: true, desc: 'Valid email address' },
            { name: 'password', type: 'string', req: true, desc: 'Minimum 8 characters' },
        ],
        response: `{
  "status": "success",
  "message": "OTP sent to your email",
  "userId": "64abc123..."
}`,
        example: `curl -X POST "${BASE}/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test User","email":"test@example.com","password":"secure123"}'`,
    },
    {
        method: 'POST',
        methodColor: '#6366f1',
        path: '/auth/login',
        title: 'Login',
        desc: 'Authenticate a user. Returns a JWT token valid for 7 days.',
        params: [
            { name: 'email', type: 'string', req: true, desc: 'Registered email address' },
            { name: 'password', type: 'string', req: true, desc: 'Account password' },
        ],
        response: `{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64abc123...",
    "name": "Test User",
    "email": "test@example.com"
  }
}`,
        example: `curl -X POST "${BASE}/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"secure123"}'`,
    },
    {
        method: 'GET',
        methodColor: '#22c55e',
        path: '/user/history',
        title: 'Get Scan History (Auth Required)',
        desc: 'Returns the authenticated user\'s product scan history sorted by most recent first.',
        params: [
            { name: 'Authorization', type: 'header', req: true, desc: 'Bearer <JWT token>' },
        ],
        response: `{
  "status": "success",
  "history": [
    {
      "barcode": "...",
      "name": "...",
      "scanned_at": "2026-04-17T10:30:00Z",
      "nutri_grade": "D"
    }
  ]
}`,
        example: `curl -X GET "${BASE}/user/history" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`,
    },
];

const ERROR_CODES = [
    { code: '200', label: 'OK', desc: 'Request successful', color: '#22c55e' },
    { code: '400', label: 'Bad Request', desc: 'Invalid parameters or missing required fields', color: '#f59e0b' },
    { code: '401', label: 'Unauthorized', desc: 'Missing or invalid JWT token for protected routes', color: '#f59e0b' },
    { code: '404', label: 'Not Found', desc: 'Product barcode not found in database', color: '#ef4444' },
    { code: '429', label: 'Rate Limited', desc: 'Too many requests. Limit: 60 req/min per IP', color: '#ef4444' },
    { code: '500', label: 'Server Error', desc: 'Internal server error — please report via GitHub', color: '#ef4444' },
];

function CodeBlock({ code }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginTop: '0.75rem' }}>
            <pre style={{
                background: 'rgba(0,0,0,0.5)', padding: '1rem 1.25rem',
                fontSize: '0.78rem', color: '#a5f3fc', fontFamily: 'monospace', lineHeight: 1.65,
                overflowX: 'auto', scrollbarWidth: 'none', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
            }}>
                {code}
            </pre>
            <button
                onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{
                    position: 'absolute', top: '0.6rem', right: '0.6rem',
                    background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '8px', padding: '0.3rem 0.6rem',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    color: copied ? '#22c55e' : '#94a3b8', fontSize: '0.7rem', cursor: 'pointer'
                }}
            >
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
    );
}

export default function ApiDocumentation() {
    const [active, setActive] = useState(0);

    return (
        <div style={{ paddingBottom: '6rem' }}>
            {/* HERO */}
            <section style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5rem 0 3.5rem', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '780px' }}>
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem', borderRadius: '999px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: '700', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                            <Code size={14} /> REST API · JSON · Free Tier Available
                        </motion.div>
                        <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '1rem' }}>API Documentation</motion.h1>
                        <motion.p variants={fadeUp} style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65 }}>
                            Base URL: <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a5f3fc' }}>{BASE}</code>
                        </motion.p>
                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                            {[['Rate Limit', '60 req/min (free)'], ['Auth', 'JWT Bearer Token'], ['Format', 'JSON only']].map(([k, v]) => (
                                <div key={k} style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#475569' }}>{k}: </span>
                                    <span style={{ color: '#94a3b8', fontWeight: '700' }}>{v}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem', maxWidth: '1100px', alignItems: 'start' }}>
                    {/* Sidebar nav */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ padding: '1.25rem', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Endpoints</div>
                            {ENDPOINTS.map((e, i) => (
                                <button key={e.path} onClick={() => setActive(i)} style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none',
                                    background: active === i ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    cursor: 'pointer', textAlign: 'left', marginBottom: '0.25rem', transition: 'all 0.15s'
                                }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '6px', background: `${e.methodColor}20`, color: e.methodColor, flexShrink: 0 }}>
                                        {e.method}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: active === i ? '#f1f5f9' : '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {e.path}
                                    </span>
                                </button>
                            ))}
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.75rem 0' }} />
                            <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Reference</div>
                            <button onClick={() => setActive(-1)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '10px', border: 'none', background: active === -1 ? 'rgba(99,102,241,0.12)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem', color: active === -1 ? '#f1f5f9' : '#94a3b8' }}>
                                Error Codes
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        {active === -1 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#f1f5f9' }}>Error Codes</h2>
                                {ERROR_CODES.map(e => (
                                    <div key={e.code} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem', borderRadius: '12px', background: `${e.color}06`, border: `1px solid ${e.color}18`, marginBottom: '0.6rem' }}>
                                        <span style={{ width: '44px', fontWeight: '900', fontSize: '0.95rem', color: e.color, fontFamily: 'monospace', flexShrink: 0 }}>{e.code}</span>
                                        <div>
                                            <span style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '0.85rem' }}>{e.label} </span>
                                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>— {e.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                {(() => {
                                    const e = ENDPOINTS[active];
                                    return (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                <span style={{ padding: '0.3rem 0.9rem', borderRadius: '8px', background: `${e.methodColor}18`, color: e.methodColor, fontWeight: '800', fontSize: '0.85rem', fontFamily: 'monospace' }}>{e.method}</span>
                                                <code style={{ fontSize: '1.05rem', color: '#f1f5f9', fontFamily: 'monospace' }}>{e.path}</code>
                                            </div>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: '#f1f5f9' }}>{e.title}</h2>
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>{e.desc}</p>

                                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Parameters</h3>
                                            <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', marginBottom: '2rem' }}>
                                                {e.params.map((p, i) => (
                                                    <div key={p.name} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1.25rem', borderBottom: i < e.params.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                        <code style={{ fontSize: '0.82rem', color: '#a5f3fc', fontFamily: 'monospace', minWidth: '140px' }}>{p.name}</code>
                                                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontFamily: 'monospace', flexShrink: 0 }}>{p.type}</span>
                                                        {p.req && <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(239,68,68,0.12)', color: '#f87171', flexShrink: 0 }}>required</span>}
                                                        <p style={{ fontSize: '0.82rem', color: '#64748b', flex: 1, minWidth: '140px' }}>{p.desc}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Example Request</h3>
                                            <CodeBlock code={e.example} />

                                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', marginTop: '1.75rem' }}>Example Response</h3>
                                            <CodeBlock code={e.response} />
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
