import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight } from 'lucide-react';

const BetterRatedOptions = ({ alternatives = [] }) => {
    console.log('🎯 BetterRatedOptions received:', alternatives.length, 'alternatives');

    // Don't render if no REAL alternatives
    if (!alternatives || alternatives.length === 0) return null;

    const gradeColor = {
        'A': '#22c55e', 'B': '#84cc16', 'C': '#eab308', 'D': '#f97316', 'E': '#ef4444'
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <CheckCircle size={20} color="#fff" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#e2e8f0' }}>
                        Healthier Alternatives
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                        Better rated options in the same category
                    </p>
                </div>
            </div>

            {/* Horizontal scroll container */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '0.75rem',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.15) transparent',
            }}>
                {alternatives.map((alt, idx) => {
                    const grade = alt.nutrition_grades ? alt.nutrition_grades.toUpperCase() : '?';
                    const color = gradeColor[grade] || '#94a3b8';
                    const name = alt.product_name || 'Unknown Product';
                    const brand = alt.brands || '';
                    const image = alt.image_front_url || alt.image_front_small_url || alt.image_url;
                    const barcode = alt._id || alt.code;

                    return (
                        <Link
                            to={`/product/${barcode}`}
                            key={barcode || idx}
                            style={{ textDecoration: 'none', color: 'inherit', flex: '0 0 180px', scrollSnapAlign: 'start' }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    height: '100%',
                                }}
                                whileHover={{ y: -4, background: 'rgba(255,255,255,0.08)' }}
                            >
                                {/* Product Image */}
                                <div style={{
                                    width: '100%', height: '120px',
                                    background: '#fff', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '0.6rem', position: 'relative', overflow: 'hidden',
                                }}>
                                    {/* Grade Badge */}
                                    <div style={{
                                        position: 'absolute', top: '6px', right: '6px',
                                        background: color, color: '#fff',
                                        fontWeight: '800', fontSize: '0.75rem',
                                        width: '28px', height: '28px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '50%', zIndex: 2,
                                        boxShadow: `0 2px 8px ${color}60`,
                                    }}>
                                        {grade}
                                    </div>

                                    {image ? (
                                        <img
                                            src={image}
                                            alt={name}
                                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                                            onError={(e) => { e.target.src = 'https://placehold.co/150x150/f1f5f9/94a3b8?text=No+Image'; }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '2.5rem' }}>📦</div>
                                    )}
                                </div>

                                {/* Product Name */}
                                <p style={{
                                    fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0',
                                    lineHeight: '1.3', marginBottom: '0.2rem',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                }}>
                                    {name}
                                </p>

                                {/* Brand */}
                                {brand && (
                                    <p style={{
                                        fontSize: '0.72rem', color: '#64748b', margin: 0,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {brand}
                                    </p>
                                )}

                                {/* View link */}
                                <div style={{
                                    marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    fontSize: '0.72rem', color: '#22c55e', fontWeight: '600',
                                }}>
                                    View Details <ChevronRight size={12} />
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BetterRatedOptions;
