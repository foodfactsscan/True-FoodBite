import React from 'react';
import { motion } from 'framer-motion';

const NutrientPieChart = ({ nutriments }) => {
    // Extract values safely
    const fat = Number(nutriments.fat_100g) || 0;
    const carbs = Number(nutriments.carbohydrates_100g) || 0;
    const protein = Number(nutriments.proteins_100g) || 0;

    // Check if we have valid data (sometimes values are NaN or string 'N/A')
    const isValid = (val) => !isNaN(val) && val >= 0;

    if (!isValid(fat) || !isValid(carbs) || !isValid(protein)) return null;

    const total = fat + carbs + protein;
    const calories = Math.round(Number(nutriments['energy-kcal_100g']) || (Number(nutriments.energy_100g) / 4.184) || 0);

    if (total === 0) return null;

    // Calculate percentages relative to total weight (approx)
    const fatPct = (fat / total) * 100;
    const carbsPct = (carbs / total) * 100;
    const proteinPct = (protein / total) * 100;

    // Chart configuration
    const size = 200;
    const strokeWidth = 18;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke lengths (arc lengths)
    const carbsArc = (carbsPct / 100) * circumference;
    const proteinArc = (proteinPct / 100) * circumference;
    const fatArc = (fatPct / 100) * circumference;

    return (
        <div className="glass-card" style={{
            marginTop: '2rem',
            marginBottom: '2rem',
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle background glow for cleaner look */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <h3 style={{
                width: '100%',
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--color-text)', // Matched to theme
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
            }}>
                Nutrient Breakdown
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--color-bg)',
                    background: 'var(--color-text)', // High contrast badge
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px'
                }}>
                    per 100g
                </span>
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '3rem', width: '100%', position: 'relative' }}>

                {/* Donut Chart */}
                <div style={{ position: 'relative', width: size, height: size }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                        <defs>
                            <linearGradient id="gradCarbs" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <linearGradient id="gradProtein" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#4f46e5" />
                            </linearGradient>
                            <linearGradient id="gradFat" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f87171" />
                                <stop offset="100%" stopColor="#dc2626" />
                            </linearGradient>
                        </defs>

                        {/* Track - Darker and subtler */}
                        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />

                        {/* Segments - Rendering sequentially */}
                        {/* 1. Carbs */}
                        <motion.circle
                            cx={center} cy={center} r={radius}
                            fill="none" stroke="url(#gradCarbs)" strokeWidth={strokeWidth} strokeLinecap="round"
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${carbsArc} ${circumference}` }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        />

                        {/* 2. Protein */}
                        <motion.circle
                            cx={center} cy={center} r={radius}
                            fill="none" stroke="url(#gradProtein)" strokeWidth={strokeWidth} strokeLinecap="round"
                            style={{ strokeDashoffset: -carbsArc }}
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${proteinArc} ${circumference}` }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        />

                        {/* 3. Fat */}
                        <motion.circle
                            cx={center} cy={center} r={radius}
                            fill="none" stroke="url(#gradFat)" strokeWidth={strokeWidth} strokeLinecap="round"
                            style={{ strokeDashoffset: -(carbsArc + proteinArc) }}
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${fatArc} ${circumference}` }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        />
                    </svg>

                    {/* Center Label */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center', pointerEvents: 'none'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: 1 }}>
                            {calories}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                            KCAL
                        </div>
                    </div>
                </div>

                {/* Legend - Responsive layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: '220px' }}>
                    <LegendRow label="Carbohydrates" value={carbs} color="#fbbf24" total={total} />
                    <LegendRow label="Proteins" value={protein} color="#818cf8" total={total} />
                    <LegendRow label="Fats" value={fat} color="#f87171" total={total} />
                </div>
            </div>
        </div>
    );
};

const LegendRow = ({ label, value, color, total }) => {
    const percentage = Math.round((value / total) * 100) || 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, boxShadow: `0 0 10px ${color}` }}></div>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{percentage}% of breakdown</div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text)' }}>{Math.round(value * 10) / 10}g</div>
            </div>
        </div>
    );
};

export default NutrientPieChart;
