import { useState } from 'react';

const ServingSizeTabs = ({ product, onServingSizeChange }) => {
    const [activeTab, setActiveTab] = useState('per100g');

    // Get serving size - could be in various formats (string with 'g', number, etc.)
    const getServingSize = () => {
        // Try to get serving size from different possible fields
        if (product.serving_quantity) {
            const parsed = parseFloat(product.serving_quantity);
            return isNaN(parsed) ? 80 : Math.round(parsed);
        }
        if (product.serving_size) {
            // Extract number from string like "80g", "80 g", "80 grams", etc.
            const match = product.serving_size.match(/(\d+\.?\d*)/);
            if (match) {
                const parsed = parseFloat(match[1]);
                return isNaN(parsed) ? 80 : Math.round(parsed);
            }
        }
        return 80; // Default to 80g
    };

    const servingSize = getServingSize();

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (onServingSizeChange) {
            onServingSizeChange(tab);
        }
    };

    return (
        <div style={{
            display: 'flex',
            gap: '0',
            marginBottom: '2rem',
            background: 'rgba(255,255,255,0.05)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            maxWidth: '350px'
        }}>
            <button
                onClick={() => handleTabChange('per100g')}
                style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: activeTab === 'per100g' ? '#7c3aed' : 'transparent',
                    color: '#fff',
                    fontWeight: activeTab === 'per100g' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease'
                }}
            >
                Per 100 g
            </button>
            <button
                onClick={() => handleTabChange('perServing')}
                style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: activeTab === 'perServing' ? '#7c3aed' : 'transparent',
                    color: activeTab === 'perServing' ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontWeight: activeTab === 'perServing' ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease'
                }}
            >
                Per {servingSize} g
            </button>
        </div>
    );
};

export default ServingSizeTabs;
