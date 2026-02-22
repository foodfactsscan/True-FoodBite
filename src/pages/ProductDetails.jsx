
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductByBarcode, getHealthierAlternatives } from '../services/api';
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
import { useAuth } from '../context/AuthContext';
import historyService from '../services/historyService';
import UserTracker from '../components/UserTracker';

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

                // Calculate TruthIn Rating
                const rating = calculateTruthInRating(data.product);
                setTruthInRating(rating);

                // Allergen Checks
                if (data.product.allergens_tags) {
                    const found = data.product.allergens_tags.map(tag => tag.replace('en:', '').replace('fr:', ''));
                    setDetectedAllergens(found);
                }

                // Log to history
                historyService.addToHistory(data.product);


                // Fetch Healthier Alternatives - with robust Indian product fallback
                const fetchAlternatives = async () => {
                    const grade = data.product.nutrition_grades;
                    const categoryTag = data.product.categories_tags?.[0]
                        || data.product.main_category
                        || data.product.categories?.split(',')[0]?.trim();

                    console.log('🔍 Product category:', categoryTag, '| Grade:', grade);

                    let alternatives = [];

                    // Step 1: Try OpenFoodFacts API
                    if (categoryTag) {
                        try {
                            const apiAlts = await getHealthierAlternatives(categoryTag, grade || 'c');
                            console.log('✅ API returned:', apiAlts?.length || 0, 'alternatives');
                            alternatives = (apiAlts || []).filter(a =>
                                (a._id || a.code) !== barcode && a.product_name
                            );
                        } catch (err) {
                            console.error('❌ API error:', err);
                        }
                    }

                    // Step 2: Fallback to local Indian DB if API returned few/no results
                    if (alternatives.length < 3) {
                        console.log('⚠️ Few API results, adding from Indian DB...');
                        const { INDIAN_PRODUCTS_DB } = await import('../services/indianProductsDb');

                        // Detect category type from product
                        const productName = (data.product.product_name || '').toLowerCase();
                        const categories = (data.product.categories || '').toLowerCase();
                        const keywords = (data.product._keywords || []).join(' ').toLowerCase();
                        const text = `${productName} ${categories} ${keywords}`;

                        let categoryKeywords = [];

                        // 1. Chocolates & Sweets
                        if (text.includes('chocolate') || text.includes('cocoa') || text.includes('candy') || text.includes('bar')) {
                            categoryKeywords = ['chocolate', 'candy', 'bar'];
                        }
                        // 2. Biscuits & Cookies
                        else if (text.includes('biscuit') || text.includes('cookie') || text.includes('cracker') || text.includes('rusk')) {
                            categoryKeywords = ['biscuit', 'cookie', 'cracker'];
                        }
                        // 3. Noodles & Pasta
                        else if (text.includes('noodle') || text.includes('pasta') || text.includes('macaroni') || text.includes('vermicelli') || text.includes('instant food')) {
                            categoryKeywords = ['noodle', 'pasta', 'instant'];
                        }
                        // 4. Chips & Namkeen (Savory Snacks)
                        else if (text.includes('chips') || text.includes('crisp') || text.includes('namkeen') || text.includes('bhujia') || text.includes('mixture') || text.includes('sev')) {
                            categoryKeywords = ['chips', 'namkeen', 'bhujia', 'snack']; // 'snack' here maps to savory usually
                        }
                        // 5. Beverages
                        else if (text.includes('beverage') || text.includes('drink') || text.includes('juice') || text.includes('soda') || text.includes('cola') || text.includes('coffee') || text.includes('tea')) {
                            categoryKeywords = ['beverage', 'drink', 'juice', 'coffee', 'tea'];
                        }
                        // 6. Dairy
                        else if (text.includes('milk') || text.includes('butter') || text.includes('cheese') || text.includes('paneer') || text.includes('dairy')) {
                            categoryKeywords = ['milk', 'butter', 'cheese', 'dairy'];
                        }
                        // 7. Staples
                        else if (text.includes('atta') || text.includes('flour') || text.includes('rice') || text.includes('dal') || text.includes('pulse') || text.includes('oil') || text.includes('ghee') || text.includes('salt') || text.includes('sugar') || text.includes('spice') || text.includes('masala')) {
                            categoryKeywords = ['atta', 'flour', 'salt', 'sugar', 'spice', 'masala', 'oil'];
                        }
                        // 8. General Snacks (Fallback but try to be safe)
                        else if (text.includes('snack')) {
                            categoryKeywords = ['snack', 'biscuit', 'chips']; // Broad snack
                        }
                        else {
                            // If completely unknown, don't show random stuff. 
                            // Or maybe show top rated healthy items generally? No, risks irrelevance.
                            // Let's show nothing or a "Try these healthy snacks" mix.
                            // User said: "don't show biscuits for noodles".
                            // So safest is EMPTY if no match.
                            categoryKeywords = [];
                        }

                        // Find matching products from Indian DB
                        const localAlts = Object.values(INDIAN_PRODUCTS_DB).filter(p => {
                            if (p._id === barcode) return false; // Skip current product
                            const pName = (p.product_name || '').toLowerCase();
                            const pCat = (p.categories || '').toLowerCase();
                            return categoryKeywords.some(kw => pName.includes(kw) || pCat.includes(kw));
                        });

                        // Add local alternatives that aren't already in the list
                        const existingIds = new Set(alternatives.map(a => a._id || a.code));
                        const uniqueLocal = localAlts.filter(p => !existingIds.has(p._id));
                        alternatives = [...alternatives, ...uniqueLocal];

                        console.log('✅ Added', uniqueLocal.length, 'from Indian DB. Total:', alternatives.length);
                    }

                    console.log('🎯 Final alternatives count:', alternatives.length);
                    setAlternatives(alternatives);
                };

                fetchAlternatives();
            }
            setLoading(false);
        };

        if (barcode) fetchProduct();
    }, [barcode]);

    useEffect(() => {
        const handleStatus = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);

        if (product && isAuthenticated && !authLoading && navigator.onLine) {
            // Add to history silently
            historyService.addToHistory(product).catch(err => console.error('History sync error:', err));
        }

        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, [product, isAuthenticated, authLoading]);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <Link to="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                    <ChevronLeft size={20} /> Back to Search
                </Link>

                {/* Skeleton Loader */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                    <div className="glass-card animate-pulse" style={{ height: '400px', borderRadius: 'var(--radius-2xl)' }}></div>
                    <div>
                        <div className="glass-card animate-pulse" style={{ height: '60px', marginBottom: '1rem', borderRadius: 'var(--radius-xl)' }}></div>
                        <div className="glass-card animate-pulse" style={{ height: '200px', marginBottom: '1rem', borderRadius: 'var(--radius-xl)' }}></div>
                        <div className="glass-card animate-pulse" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                <h2 style={{ marginBottom: '1rem' }}>Product Not Found</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                    We couldn't find this product in our international database.
                </p>
                <Link to="/scan" className="btn-primary">
                    Try Another Product
                </Link>
            </div>
        );
    }

    const isUnknown = product.product_name === 'Unknown Pacakged Food';
    const grade = product.nutrition_grades && product.nutrition_grades !== 'unknown' ? product.nutrition_grades.toUpperCase() : '?';
    const gradeColor = { 'A': '#22c55e', 'B': '#84cc16', 'C': '#eab308', 'D': '#f97316', 'E': '#ef4444' }[grade] || '#94a3b8';

    // NOVA Group (Processing Level)
    const novaGroup = product.nova_group;
    const novaColor = { 1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444' }[novaGroup] || '#94a3b8';
    const novaText = { 1: 'Unprocessed', 2: 'Processed Culinary', 3: 'Processed', 4: 'Ultra Processed' }[novaGroup] || 'Unknown';

    const isVegetarian = product.labels_tags?.some(tag => tag.includes('vegetarian')) || product.ingredients_analysis_tags?.some(tag => tag.includes('vegetarian'));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container"
            style={{ paddingBottom: '6rem' }}
        >
            <Link to="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                <ChevronLeft size={20} /> Back to Search
            </Link>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start', justifyContent: 'center' }}>

                {/* Left Column: Image & Highlights (Sticky) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ flex: '1 1 350px', maxWidth: '450px', position: 'sticky', top: '6rem', zIndex: 10 }}
                >
                    <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-2xl)', textAlign: 'center', background: '#fff' }}>
                        <img
                            src={product.image_front_url || 'https://placehold.co/400x400?text=No+Image'}
                            alt={product.product_name}
                            style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Quick Status Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                        {isVegetarian && (
                            <div style={{
                                padding: '0.5rem 1rem', borderRadius: '50px',
                                background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600'
                            }}>
                                <Leaf size={16} /> Vegetarian
                            </div>
                        )}
                        <div style={{
                            padding: '0.5rem 1rem', borderRadius: '50px',
                            background: `${novaColor}20`, color: novaColor,
                            border: `1px solid ${novaColor}40`,
                            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600'
                        }}>
                            <Activity size={16} /> NOVA {novaGroup}: {novaText}
                        </div>
                    </div>

                    {detectedAllergens.length > 0 && (
                        <div className="glass-panel" style={{
                            marginTop: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-xl)',
                            border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.5rem' }}>
                                <AlertTriangle />
                                <h3 style={{ margin: 0 }}>Allergen Alert</h3>
                            </div>
                            <p style={{ color: '#ffbaba' }}>Contains: <strong>{detectedAllergens.join(', ')}</strong></p>
                        </div>
                    )}
                </motion.div>

                {/* Right Column: Nutrition & Analysis (Scrollable) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ flex: '1 1 400px', minWidth: '300px' }}
                >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                                {product.product_name}
                                {(() => {
                                    // Get quantity from various potential fields
                                    let quantity = product.quantity || product.product_quantity;

                                    // Or try to build it from value + unit
                                    if (!quantity && product.net_weight_value && product.net_weight_unit) {
                                        quantity = `${product.net_weight_value}${product.net_weight_unit}`;
                                    }

                                    if (!quantity) return null;

                                    // Clean up quantity string (trim, lowercase for check)
                                    const cleanQty = quantity.toString().trim();
                                    const lowerName = (product.product_name || '').toLowerCase();

                                    // Don't show if already in name (simple check)
                                    // e.g. Name: "Maggi 70g", Qty: "70 g" -> avoid "Maggi 70g (70 g)"
                                    // Remove spaces for robust comparison: "70 g" -> "70g"
                                    const condensedQty = cleanQty.replace(/\s+/g, '').toLowerCase();
                                    const condensedName = lowerName.replace(/\s+/g, '');

                                    if (condensedName.includes(condensedQty)) return null;

                                    return <span style={{ fontSize: '0.6em', color: 'var(--color-text-muted)', marginLeft: '0.5rem', fontWeight: '400' }}>({cleanQty})</span>;
                                })()}
                            </h1>
                            {product.ai_generated && (
                                <span style={{
                                    padding: '0.35rem 0.9rem',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}>
                                    🤖 AI Generated
                                </span>
                            )}
                            {isOffline && (
                                <span style={{
                                    padding: '0.35rem 0.9rem',
                                    borderRadius: '20px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}>
                                    📦 Cached Data
                                </span>
                            )}
                        </div>
                        {isOffline && (
                            <p style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '0.5rem', marginBottom: '0' }}>
                                ⚠️ You are viewing this product offline. Some details might be outdated.
                            </p>
                        )}
                        {product.ai_generated && (
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: '0' }}>
                                ⚠️ Product data estimated by AI - nutritional values are approximate
                            </p>
                        )}
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>{product.brands}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', marginTop: '1rem' }}>
                        {product.brands && <span className="chip" style={{ background: 'var(--color-primary-glow)', color: '#fff' }}>{product.brands.split(',')[0]}</span>}
                        {product.quantity && <span className="chip">{product.quantity}</span>}
                        {product.categories_tags && <span className="chip">{product.categories_tags[0]?.replace('en:', '').split('-').join(' ')}</span>}
                    </div>

                    {/* ★ Personalized Health Analysis ★ */}
                    {!isUnknown && <PersonalizedAnalysis product={product} />}

                    {/* ★ Health Score Card (0–100) ★ */}
                    {!isUnknown && <HealthScoreCard product={product} />}

                    {/* ★ Label Interpreter (E-numbers) ★ */}
                    {!isUnknown && <LabelInterpreter ingredientText={product.ingredients_text} />}

                    {/* ★ Advanced Ingredient Analysis ★ */}
                    {!isUnknown && <ProductIngredientAnalysis ingredientText={product.ingredients_text} />}

                    {/* ★ Recipe Suggestions ★ */}
                    {!isUnknown && <RecipeSuggestions product={product} />}
                    {isUnknown && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid #eab308' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#eab308', fontWeight: 'bold' }}>
                                <AlertTriangle />
                                Product Data Missing
                            </div>
                            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                                We found the barcode <strong>{product._id}</strong> but don't have detailed data yet.
                                <br />Be the first to add this Indian product!
                            </p>
                            <button className="btn-secondary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                                + Add Nutrition Info
                            </button>
                        </div>
                    )}

                    {/* ★ Personal Tracking (Favorites, Notes, Intake) ★ */}
                    <UserTracker product={product} isAuthenticated={isAuthenticated} />

                    {/* TruthIn Rating System */}
                    {!isUnknown && truthInRating && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '3rem 0' }}>
                            <TruthInRating rating={truthInRating} />
                        </div>
                    )}

                    {/* Rating Breakdown */}
                    <RatingBreakdown breakdown={truthInRating?.breakdown} />

                    {/* Nutrient Visualization */}
                    {!isUnknown && product.nutriments && <NutrientPieChart nutriments={product.nutriments} />}

                    {/* What Should Concern You Section */}
                    {!isUnknown && (
                        <ConcernSection
                            product={product}
                            additives={parseAdditives(product)}
                            ingredients={parseIngredients(product)}
                        />
                    )}

                    {/* What You'll Like Section */}
                    {!isUnknown && <PositiveSection product={product} />}

                    {/* Detailed Nutrients with Progress Bars */}
                    {!isUnknown && <DetailedNutrients product={product} onAllNutrientsClick={() => setShowAllNutrients(true)} />}

                    {/* All Ingredients Button */}
                    {!isUnknown && (
                        <button
                            style={{
                                width: '100%',
                                padding: '1rem',
                                marginBottom: '2rem',
                                borderRadius: 'var(--radius-xl)',
                                border: 'none',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '1rem'
                            }}
                            className="glass-card"
                        >
                            All Ingredients
                            <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                    )}

                    {/* Better Rated Options */}
                    {!isUnknown && <BetterRatedOptions alternatives={alternatives} />}
                </motion.div>
            </div>




            {/* All Nutrients Bottom Sheet */}
            <AllNutrientsSheet
                product={product}
                show={showAllNutrients}
                onClose={() => setShowAllNutrients(false)}
            />
        </motion.div>
    );
};

const NutritionRow = ({ label, value, percent, color, high }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.8rem', borderRadius: '12px',
        background: 'rgba(255,255,255,0.02)',
        border: high ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)'
    }}>
        <div style={{ width: '100px', fontWeight: '500', color: high ? '#ef4444' : 'var(--color-text)' }}>{label}</div>
        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ height: '100%', background: color }}
            />
        </div>
        <div style={{ width: '60px', textAlign: 'right', fontWeight: 'bold' }}>{value}</div>
    </div>
);

// Render All Nutrients Sheet
const renderAllNutrientsSheet = (product, showAllNutrients, setShowAllNutrients) => (
    <AllNutrientsSheet
        product={product}
        show={showAllNutrients}
        onClose={() => setShowAllNutrients(false)}
    />
);

export default ProductDetails;
