
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductByBarcode, getHealthierAlternatives } from '../../core/services/api';
import { calculateTruthInRating } from '../services/ratingEngine';
import { parseAdditives, parseIngredients } from '../services/additiveParser';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertTriangle, CheckCircle, Leaf, Activity } from 'lucide-react';
import TruthInRating from '../components/TruthInRating';
import RatingBreakdown from '../components/RatingBreakdown';
import NutrientPieChart from '../components/NutrientPieChart';
import ConcernSection from '../components/ConcernSection';
import PositiveSection from '../components/PositiveSection';
import DetailedNutrients from '../components/DetailedNutrients';
import BetterRatedOptions from '../components/BetterRatedOptions';
import AllNutrientsSheet from '../components/AllNutrientsSheet';
import PersonalizedAnalysis from '../components/PersonalizedAnalysis';
import HealthScoreCard from '../components/HealthScoreCard';
import LabelInterpreter from '../components/LabelInterpreter';
import RecipeSuggestions from '../components/RecipeSuggestions';
import ProductIngredientAnalysis from '../components/ProductIngredientAnalysis';
import { useAuth } from '../../auth/context/AuthContext';
import historyService from '../../user/services/historyService';
import UserTracker from '../../user/components/UserTracker';

const ProductDetails = () => {
    const { barcode } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [alternatives, setAlternatives] = useState([]);
    const [detectedAllergens, setDetectedAllergens] = useState([]);
    const [truthInRating, setTruthInRating] = useState(null);
    const [showAllNutrients, setShowAllNutrients] = useState(false);
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const data = await getProductByBarcode(barcode);

            if (data && data.product) {
                setProduct(data.product);
                const rating = calculateTruthInRating(data.product);
                setTruthInRating(rating);

                if (data.product.allergens_tags) {
                    const found = data.product.allergens_tags.map(tag => tag.replace('en:', '').replace('fr:', ''));
                    setDetectedAllergens(found);
                }

                historyService.addToHistory(data.product);

                const fetchAlternatives = async () => {
                    const grade = data.product.nutrition_grades;
                    const categoryTag = data.product.categories_tags?.[0]
                        || data.product.main_category
                        || data.product.categories?.split(',')[0]?.trim();

                    let alternatives = [];
                    if (categoryTag) {
                        try {
                            const apiAlts = await getHealthierAlternatives(categoryTag, grade || 'c');
                            alternatives = (apiAlts || []).filter(a => (a._id || a.code) !== barcode && a.product_name);
                        } catch (err) { console.error(err); }
                    }
                    setAlternatives(alternatives);
                };
                fetchAlternatives();
            }
            setLoading(false);
        };
        if (barcode) fetchProduct();
    }, [barcode]);

    if (loading) return <div className="container" style={{padding: '4rem', textAlign: 'center'}}>Loading...</div>;
    if (!product) return <div className="container" style={{padding: '4rem', textAlign: 'center'}}>Product Not Found</div>;

    const grade = product.nutrition_grades?.toUpperCase() || '?';
    const novaGroup = product.nova_group;
    const novaColor = { 1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444' }[novaGroup] || '#94a3b8';
    const novaText = { 1: 'Unprocessed', 2: 'Processed Culinary', 3: 'Processed', 4: 'Ultra Processed' }[novaGroup] || 'Unknown';
    const isVegetarian = product.labels_tags?.some(tag => tag.includes('vegetarian')) || product.ingredients_analysis_tags?.some(tag => tag.includes('vegetarian'));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container" style={{ paddingBottom: '6rem' }}>
            <Link to="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                <ChevronLeft size={20} /> Back to Search
            </Link>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 350px', maxWidth: '450px' }}>
                    <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px', background: '#fff', textAlign: 'center' }}>
                        <img src={product.image_front_url || 'https://placehold.co/400x400?text=No+Image'} alt={product.product_name} style={{ maxWidth: '100%', maxHeight: '350px' }} />
                    </div>
                </div>

                <div style={{ flex: '1 1 400px' }}>
                    <div style={{ width: '100%' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '0.2rem' }}>
                            {product.product_name}
                            {product.quantity && <span style={{ fontSize: '0.5em', color: 'var(--color-text-muted)', marginLeft: '1rem' }}>{product.quantity}</span>}
                        </h1>
                        <p style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '2rem' }}>
                            {product.brands}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        {isVegetarian && <div className="chip" style={{ background: '#22c55e20', color: '#22c55e' }}>Vegetarian</div>}
                        <div className="chip" style={{ background: `${novaColor}20`, color: novaColor }}>NOVA {novaGroup}: {novaText}</div>
                    </div>

                    <PersonalizedAnalysis product={product} />
                    <HealthScoreCard product={product} />
                    <UserTracker product={product} isAuthenticated={isAuthenticated} />
                    
                    <div style={{ marginTop: '3rem' }}>
                        <TruthInRating rating={truthInRating} />
                        <RatingBreakdown breakdown={truthInRating?.breakdown} />
                        <ConcernSection product={product} additives={parseAdditives(product)} ingredients={parseIngredients(product)} />
                        <PositiveSection product={product} />
                        <DetailedNutrients product={product} onAllNutrientsClick={() => setShowAllNutrients(true)} />
                        <BetterRatedOptions alternatives={alternatives} />
                    </div>
                </div>
            </div>

            <AllNutrientsSheet product={product} show={showAllNutrients} onClose={() => setShowAllNutrients(false)} />
        </motion.div>
    );
};

export default ProductDetails;
