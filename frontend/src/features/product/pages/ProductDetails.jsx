
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductByBarcode, getHealthierAlternatives } from '../../core/services/api';
import { parseAdditives, parseIngredients } from '../services/additiveParser';
import NutrientPieChart from '../components/NutrientPieChart';
import DetailedNutrients from '../components/DetailedNutrients';
import BetterRatedOptions from '../components/BetterRatedOptions';
import AllNutrientsSheet from '../components/AllNutrientsSheet';
import PersonalizedAnalysis from '../components/PersonalizedAnalysis';
import HealthScoreCard from '../components/HealthScoreCard';
import FoodTimingAdvisor from '../components/FoodTimingAdvisor';
import LabelInterpreter from '../components/LabelInterpreter';
import RecipeSuggestions from '../components/RecipeSuggestions';
import IngredientBreakdown from '../components/IngredientBreakdown';
import { useAuth } from '../../auth/context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import historyService from '../../user/services/historyService';
import UserTracker from '../../user/components/UserTracker';

const ProductDetails = () => {
    const { barcode } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [alternatives, setAlternatives] = useState([]);
    const [detectedAllergens, setDetectedAllergens] = useState([]);
    const [showAllNutrients, setShowAllNutrients] = useState(false);
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductByBarcode(barcode);

                if (data && data.product) {
                    setProduct(data.product);

                    if (data.product.allergens_tags) {
                        const found = data.product.allergens_tags.map(tag => tag.replace('en:', '').replace('fr:', ''));
                        setDetectedAllergens(found);
                    }

                    historyService.addToHistory(data.product);

                    // Fetch alternatives in background after product is set
                    const grade = data.product.nutrition_grades;
                    const categoryTag = data.product.categories_tags?.[0]
                        || data.product.main_category
                        || data.product.categories?.split(',')[0]?.trim();

                    if (categoryTag) {
                        getHealthierAlternatives(categoryTag, grade || 'c')
                            .then(apiAlts => {
                                const filtered = (apiAlts || []).filter(a => (a._id || a.code) !== barcode && a.product_name);
                                setAlternatives(filtered);
                            })
                            .catch(err => console.error('Alternatives fetch error:', err));
                    }
                }
            } catch (error) {
                console.error('Fetch product error:', error);
            } finally {
                setLoading(false);
            }
        };
        if (barcode) fetchProduct();
    }, [barcode]);

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
    if (!product) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Product Not Found</div>;

    const grade = product.nutrition_grades?.toUpperCase() || '?';
    const novaGroup = product.nova_group;
    const novaColor = { 1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444' }[novaGroup] || '#94a3b8';
    const novaText = { 1: 'Unprocessed', 2: 'Processed Culinary', 3: 'Processed', 4: 'Ultra Processed' }[novaGroup] || 'Unknown';
    const isVegetarian = product.labels_tags?.some(tag => tag.includes('vegetarian')) || product.ingredients_analysis_tags?.some(tag => tag.includes('vegetarian'));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container" style={{ paddingBottom: '6rem' }}>
            <div style={{ paddingTop: '2rem', marginBottom: '2rem' }}>
                <Link to="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
                    <ChevronLeft size={20} /> Back to Search
                </Link>
            </div>

            <div className="product-grid">
                {/* LEFT COLUMN: FIXED/STICKY IMAGE */}
                <div className="sticky-image-container">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="glass-panel" 
                        style={{ 
                            padding: '2.5rem', 
                            borderRadius: '32px', 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid rgba(255,255,255,0.08)',
                            textAlign: 'center',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ 
                            background: '#fff', 
                            borderRadius: '20px', 
                            padding: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            minHeight: '350px'
                        }}>
                            <img 
                                src={product.image_front_url || 'https://placehold.co/400x600?text=No+Image'} 
                                alt={product.product_name} 
                                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} 
                            />
                        </div>
                        <div style={{ textAlign: 'left', padding: '0 0.5rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Barcode</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.05em' }}>{barcode}</div>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                             {product.quantity && <span className="chip" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>{product.quantity}</span>}
                             <span className="chip" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>{product.brands}</span>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: SCROLLING DETAILS */}
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 className="product-title-main" style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                            {product.product_name}
                        </h1>
                        <p style={{ fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '1.5rem' }}>
                            {product.brands}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                            {isVegetarian && (
                                <div style={{ 
                                    padding: '0.5rem 1rem', 
                                    borderRadius: '12px', 
                                    background: 'rgba(34, 197, 94, 0.1)', 
                                    color: '#4ade80',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    border: '1px solid rgba(34, 197, 94, 0.2)'
                                }}>
                                    Vegetarian
                                </div>
                            )}
                            <div style={{ 
                                padding: '0.5rem 1rem', 
                                borderRadius: '12px', 
                                background: `${novaColor}15`, 
                                color: novaColor,
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                border: `1px solid ${novaColor}20`
                            }}>
                                NOVA {novaGroup}: {novaText}
                            </div>
                        </div>
                    </div>

                    <PersonalizedAnalysis product={product} />
                    <HealthScoreCard product={product} />
                    <FoodTimingAdvisor product={product} />
                    <UserTracker product={product} isAuthenticated={isAuthenticated} />
                    
                    <div style={{ marginTop: '3rem' }}>
                        <DetailedNutrients product={product} />
                        <IngredientBreakdown product={product} />
                        <BetterRatedOptions alternatives={alternatives} />
                        <RecipeSuggestions product={product} />
                    </div>
                </div>
            </div>

            <AllNutrientsSheet product={product} show={showAllNutrients} onClose={() => setShowAllNutrients(false)} />
        </motion.div>
    );
};

export default ProductDetails;
