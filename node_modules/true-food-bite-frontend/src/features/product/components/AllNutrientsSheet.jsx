import { useState } from 'react';
import { X } from 'lucide-react';

const AllNutrientsSheet = ({ product, show, onClose }) => {
    const [activeTab, setActiveTab] = useState('per100g');

    if (!show) return null;

    const nutrients = product.nutriments || {};

    // Get serving size - could be in various formats
    const getServingSize = () => {
        // Try to get serving size from different possible fields
        if (product.serving_quantity) return parseFloat(product.serving_quantity);
        if (product.serving_size) {
            const match = product.serving_size.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : 80;
        }
        return 80; // Default to 80g
    };

    const servingSize = getServingSize();

    // Calculate values based on active tab with high precision
    const getValue = (value100g) => {
        if (!value100g || isNaN(value100g)) return 0;
        if (activeTab === 'per100g') {
            return value100g;
        } else {
            // Calculate for specific serving size
            return (value100g * servingSize) / 100;
        }
    };

    // Format number with appropriate decimal places
    const formatValue = (value, decimals = 1) => {
        if (value === 0) return '0';
        if (value < 0.01) return value.toFixed(3);
        if (value < 1) return value.toFixed(2);
        return value.toFixed(decimals);
    };

    // Get nutrient color based on type
    const getNutrientIndicator = (type) => {
        switch (type) {
            case 'positive':
                return { color: '#22c55e', dots: '🟢🟢🟢', label: 'Positive' };
            case 'negative':
                return { color: '#ef4444', dots: '🔴🔴', label: 'Negative' };
            case 'fair':
                return { color: '#eab308', dots: '🟡', label: 'Fair' };
            default:
                return { color: '#94a3b8', dots: '⚪', label: 'Low Value' };
        }
    };

    const nutrientsList = [
        {
            icon: '⚡',
            name: 'Energy',
            value: formatValue(getValue(nutrients.energy_100g || 0) / 4.184, 1),
            unit: 'kcal',
            rda: formatValue((getValue(nutrients.energy_100g || 0) / 4.184 / 2000) * 100, 1),
            type: 'fair',
            showRDA: true
        },
        {
            icon: '🥑',
            name: 'Total Fat',
            value: formatValue(getValue(nutrients.fat_100g || 0), 1),
            unit: 'g',
            rda: formatValue((getValue(nutrients.fat_100g || 0) / 65) * 100, 1),
            type: 'fair',
            showRDA: true
        },
        {
            icon: '🔥',
            name: 'Saturated Fat',
            value: formatValue(getValue(nutrients['saturated-fat_100g'] || 0), 1),
            unit: 'g',
            rda: formatValue((getValue(nutrients['saturated-fat_100g'] || 0) / 22) * 100, 1),
            type: 'negative',
            showNotMoreThan: true,
            showRDA: true
        },
        {
            icon: '🚫',
            name: 'Trans Fat',
            value: formatValue(getValue(nutrients['trans-fat_100g'] || 0), 2),
            unit: 'g',
            rda: formatValue((getValue(nutrients['trans-fat_100g'] || 0) / 2) * 100, 1),
            type: 'positive',
            showNotMoreThan: true,
            showRDA: true
        },
        {
            icon: '🧂',
            name: 'Sodium',
            value: formatValue(getValue(nutrients.sodium_100g || 0) * 10, 1),
            unit: 'mg',
            rda: formatValue((getValue(nutrients.sodium_100g || 0) / 200) * 100, 1),
            type: 'negative',
            showRDA: true
        },
        {
            icon: '🍞',
            name: 'Carbohydrates',
            value: formatValue(getValue(nutrients.carbohydrates_100g || 0), 1),
            unit: 'g',
            rda: null,
            type: 'fair',
            showRDA: false
        },
        {
            icon: '🍬',
            name: 'Total Sugars',
            value: formatValue(getValue(nutrients.sugars_100g || 0), 1),
            unit: 'g',
            rda: null,
            type: 'fair',
            showRDA: false
        },
        {
            icon: '🍭',
            name: 'Added Sugars',
            value: formatValue(getValue((nutrients.sugars_100g || 0) * 0.7), 1),
            unit: 'g',
            rda: formatValue((getValue((nutrients.sugars_100g || 0) * 0.7) / 25) * 100, 1),
            type: 'negative',
            showRDA: true
        },
        {
            icon: '🌾',
            name: 'Dietary Fiber',
            value: formatValue(getValue(nutrients.fiber_100g || 0), 1),
            unit: 'g',
            rda: formatValue((getValue(nutrients.fiber_100g || 0) / 30) * 100, 1),
            type: 'positive',
            showRDA: true
        },
        {
            icon: '💪',
            name: 'Protein',
            value: formatValue(getValue(nutrients.proteins_100g || 0), 1),
            unit: 'g',
            rda: formatValue((getValue(nutrients.proteins_100g || 0) / 75) * 100, 1),
            type: 'positive',
            showRDA: true
        }
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9998,
                    animation: 'fadeIn 0.3s ease'
                }}
            />

            {/* Bottom Sheet */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: '85vh',
                background: '#1a1a1a',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                zIndex: 9999,
                animation: 'slideUp 0.3s ease',
                overflowY: 'auto',
                paddingBottom: '2rem'
            }}>
                {/* Handle */}
                <div style={{
                    width: '80px',
                    height: '4px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '2px',
                    margin: '1rem auto'
                }} />

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 2rem 1.5rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                        All Nutrients
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Serving Size Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    margin: '0 2rem 1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-full)'
                }}>
                    <button
                        onClick={() => setActiveTab('per100g')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: activeTab === 'per100g' ? '#7c3aed' : 'transparent',
                            color: '#fff',
                            fontWeight: activeTab === 'per100g' ? '700' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Per 100g
                    </button>
                    <button
                        onClick={() => setActiveTab('perServing')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: activeTab === 'perServing' ? '#7c3aed' : 'transparent',
                            color: activeTab === 'perServing' ? '#fff' : 'rgba(255,255,255,0.5)',
                            fontWeight: activeTab === 'perServing' ? '700' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Per {servingSize}g
                    </button>
                </div>

                {/* Legend */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    padding: '0 2rem 1.5rem',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>🟢🟢🟢</span>
                        <span style={{ color: '#94a3b8' }}>Positive</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>🔴🔴</span>
                        <span style={{ color: '#94a3b8' }}>Negative</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>🟡</span>
                        <span style={{ color: '#94a3b8' }}>Fair</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>⚪</span>
                        <span style={{ color: '#94a3b8' }}>Low Value</span>
                    </div>
                </div>

                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '0.75rem 2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    fontWeight: '700',
                    fontSize: '0.9rem'
                }}>
                    <div>Nutrient</div>
                    <div style={{ textAlign: 'right' }}>RDA%</div>
                </div>

                {/* Nutrients List */}
                <div style={{ padding: '0 2rem' }}>
                    {nutrientsList.map((nutrient, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                padding: '1rem 0',
                                borderBottom: idx < nutrientsList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                alignItems: 'center'
                            }}
                        >
                            {/* Left: Icon + Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{nutrient.icon}</span>
                                <span style={{ fontWeight: '500' }}>{nutrient.name}</span>
                            </div>

                            {/* Right: Value + RDA */}
                            <div style={{ textAlign: 'right' }}>
                                {nutrient.showNotMoreThan && parseFloat(nutrient.value) > 0 && (
                                    <div style={{
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        marginBottom: '0.25rem'
                                    }}>
                                        (not more than)
                                    </div>
                                )}
                                <div style={{
                                    color: nutrient.type === 'positive' ? '#22c55e' :
                                        nutrient.type === 'negative' ? '#ef4444' :
                                            nutrient.type === 'fair' ? '#eab308' : '#94a3b8',
                                    fontWeight: '700',
                                    fontSize: '1rem'
                                }}>
                                    {nutrient.value} {nutrient.unit}
                                </div>
                                {nutrient.showRDA && nutrient.rda && (
                                    <div style={{
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.85rem',
                                        marginTop: '0.25rem'
                                    }}>
                                        {nutrient.rda}%
                                    </div>
                                )}
                                {!nutrient.showRDA && (
                                    <div style={{
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.85rem'
                                    }}>
                                        -
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AllNutrientsSheet;
