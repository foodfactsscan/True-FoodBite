import React from 'react';
import { ShoppingCart, ExternalLink, TrendingDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PriceRadar — High-Fidelity Competitive Market Pricing
 * Displays price comparisons across major Indian e-commerce platforms.
 */
const PriceRadar = ({ pricing }) => {
    if (!pricing || Object.keys(pricing).length === 0) return null;

    const platforms = [
        { id: 'blinkit', name: 'Blinkit', color: '#ffcc00', textColor: '#000', icon: '⚡' },
        { id: 'amazon', name: 'Amazon', color: '#ff9900', textColor: '#000', icon: '🛒' },
        { id: 'instamart', name: 'Instamart', color: '#ff5200', textColor: '#fff', icon: '🛵' },
        { id: 'flipkart_minutes', name: 'Flipkart', color: '#2874f0', textColor: '#fff', icon: '⏱️' }
    ];

    // Filter platforms that actually have price data
    const activePlatforms = platforms.filter(p => pricing[p.id] && pricing[p.id] !== 'N/A');
    
    if (activePlatforms.length === 0) return null;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.12)', borderRadius: '12px' }}>
                        <ShoppingCart size={20} color="#f59e0b" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#f1f5f9' }}>Market Price Radar</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Live competitive rates across major platforms</p>
                    </div>
                </div>
                <div style={{ 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '20px', 
                    background: 'rgba(34,197,94,0.1)', 
                    color: '#4ade80', 
                    fontSize: '0.7rem', 
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                }}>
                    <TrendingDown size={14} /> Price Verified
                </div>
            </div>

            {/* Platform Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {activePlatforms.map((p, index) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            padding: '1.25rem',
                            borderRadius: '20px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '12px', 
                            background: p.color, 
                            color: p.textColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            boxShadow: `0 8px 16px ${p.color}20`
                        }}>
                            {p.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.name}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f8fafc', marginTop: '2px' }}>{pricing[p.id]}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Disclaimer */}
            <div style={{ 
                marginTop: '1.5rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '14px', 
                background: 'rgba(99,102,241,0.05)', 
                display: 'flex', 
                gap: '0.6rem',
                alignItems: 'center',
                border: '1px solid rgba(99,102,241,0.1)'
            }}>
                <Info size={14} color="#818cf8" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Prices are researched in real-time by the AI pulse research engine. Taxes and delivery fees may apply on respective platforms.
                </p>
            </div>
        </div>
    );
};

export default PriceRadar;
