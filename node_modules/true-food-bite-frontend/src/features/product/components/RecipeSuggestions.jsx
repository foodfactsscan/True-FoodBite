import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, Users, Flame, ChevronDown, ChevronUp, Sparkles, Leaf } from 'lucide-react';

/**
 * RecipeSuggestions — generates recipe ideas based on scanned product/ingredients.
 * Uses a local recipe database (no API needed).
 *
 * Props:
 *   product - product data from OpenFoodFacts
 */

const RECIPE_DB = [
    // Dairy
    {
        keywords: ['milk', 'cream', 'yogurt', 'curd', 'paneer', 'cheese', 'butter'], recipes: [
            { title: 'Paneer Tikka Masala', time: '35 min', servings: 4, calories: 280, veg: true, steps: ['Marinate paneer in yogurt & spices', 'Grill or air-fry until golden', 'Make onion-tomato gravy', 'Add paneer, simmer 10 min', 'Garnish with cream & coriander'], ingredients: ['250g paneer', '1 cup yogurt', 'Onion, tomato, spices', 'Cream for garnish'] },
            { title: 'Mango Lassi', time: '5 min', servings: 2, calories: 150, veg: true, steps: ['Blend yogurt with mango pulp', 'Add sugar/honey if needed', 'Serve chilled with cardamom'], ingredients: ['1 cup yogurt', '1 cup mango pulp', 'Sugar to taste', 'Cardamom powder'] },
            { title: 'Palak Paneer', time: '30 min', servings: 3, calories: 240, veg: true, steps: ['Blanch and puree spinach', 'Sauté paneer cubes', 'Cook spinach gravy with cream', 'Add paneer, simmer'], ingredients: ['200g paneer', '300g spinach', 'Cream, onion, garlic', 'Spices'] },
        ]
    },
    // Grains / Flour
    {
        keywords: ['wheat', 'flour', 'atta', 'bread', 'roti', 'maida', 'oats', 'cereal', 'rice', 'grain'], recipes: [
            { title: 'Masala Oats Bowl', time: '15 min', servings: 2, calories: 220, veg: true, steps: ['Sauté onion, tomato, green chilli', 'Add oats and water', 'Cook 5 min, add spices', 'Top with coriander & lemon'], ingredients: ['1 cup oats', 'Onion, tomato', 'Green chilli, turmeric', 'Salt, cumin seeds'] },
            { title: 'Whole Wheat Veggie Wrap', time: '20 min', servings: 2, calories: 310, veg: true, steps: ['Make thin rotis with atta', 'Prepare mixed veg filling', 'Spread mint chutney', 'Roll up and toast lightly'], ingredients: ['Whole wheat atta', 'Mixed vegetables', 'Mint chutney', 'Cheese (optional)'] },
            { title: 'Brown Rice Pulao', time: '25 min', servings: 3, calories: 260, veg: true, steps: ['Wash and soak brown rice', 'Sauté whole spices and veggies', 'Add rice and water', 'Cook until fluffy'], ingredients: ['1.5 cups brown rice', 'Mixed veggies', 'Whole spices', 'Ghee'] },
        ]
    },
    // Snacks / Chips
    {
        keywords: ['chips', 'snack', 'crisp', 'kurkure', 'namkeen', 'bhujia', 'mixture'], recipes: [
            { title: 'Baked Veggie Chips (healthier swap)', time: '25 min', servings: 4, calories: 120, veg: true, steps: ['Thinly slice beetroot, sweet potato', 'Toss with olive oil & salt', 'Bake at 180°C for 15 min', 'Let cool until crispy'], ingredients: ['Beetroot, sweet potato, carrot', 'Olive oil', 'Salt, pepper', 'Chaat masala'] },
            { title: 'Roasted Makhana', time: '10 min', servings: 3, calories: 90, veg: true, steps: ['Dry roast makhana (fox nuts)', 'Add ghee, turmeric, chilli powder', 'Toss well, let cool', 'Store in airtight container'], ingredients: ['2 cups makhana', '1 tsp ghee', 'Turmeric, chilli powder', 'Salt'] },
        ]
    },
    // Beverages
    {
        keywords: ['juice', 'drink', 'soda', 'cola', 'beverage', 'tea', 'coffee', 'tang'], recipes: [
            { title: 'Fresh Fruit Infused Water', time: '5 min', servings: 4, calories: 15, veg: true, steps: ['Slice fruits (lemon, cucumber, mint)', 'Add to water pitcher', 'Refrigerate 2 hours', 'Drink throughout the day'], ingredients: ['Lemon slices', 'Cucumber slices', 'Fresh mint', '1L water'] },
            { title: 'Turmeric Golden Latte', time: '8 min', servings: 1, calories: 90, veg: true, steps: ['Heat milk with turmeric', 'Add cinnamon, black pepper', 'Sweeten with honey', 'Serve warm'], ingredients: ['1 cup milk', '1 tsp turmeric', 'Cinnamon, black pepper', 'Honey'] },
        ]
    },
    // Noodles / Instant
    {
        keywords: ['noodle', 'instant', 'maggi', 'pasta', 'ramen', 'vermicelli'], recipes: [
            { title: 'Veggie Stir-Fry Noodles (healthier)', time: '20 min', servings: 2, calories: 280, veg: true, steps: ['Cook whole wheat noodles al dente', 'Stir-fry veggies in sesame oil', 'Add soy sauce, vinegar, garlic', 'Toss with noodles, serve hot'], ingredients: ['Whole wheat noodles', 'Bell peppers, carrot, cabbage', 'Soy sauce, sesame oil', 'Garlic, ginger'] },
            { title: 'Ragi Vermicelli Upma', time: '15 min', servings: 2, calories: 190, veg: true, steps: ['Roast ragi vermicelli in ghee', 'Sauté mustard seeds, curry leaves, veggies', 'Add water and vermicelli', 'Cook until soft'], ingredients: ['Ragi vermicelli', 'Onion, peas, carrot', 'Mustard seeds, curry leaves', 'Ghee'] },
        ]
    },
    // Chocolate / Sweets
    {
        keywords: ['chocolate', 'cocoa', 'candy', 'sweet', 'biscuit', 'cookie', 'cake', 'sugar', 'dessert', 'bournvita'], recipes: [
            { title: 'Banana Oat Energy Bites', time: '15 min', servings: 12, calories: 80, veg: true, steps: ['Mash ripe bananas', 'Mix with oats, cocoa, honey', 'Roll into balls', 'Chill for 30 min — healthy treat!'], ingredients: ['2 ripe bananas', '1.5 cups oats', '2 tbsp cocoa', 'Honey, nuts'] },
            { title: 'Dark Chocolate Chia Pudding', time: '10 min + 4hr', servings: 2, calories: 160, veg: true, steps: ['Mix milk, chia, cocoa, honey', 'Stir well and refrigerate 4 hrs', 'Top with fruits and nuts', 'High protein dessert!'], ingredients: ['1 cup milk', '3 tbsp chia seeds', '1 tbsp cocoa', 'Honey, berries'] },
        ]
    },
    // Oil / Fat
    {
        keywords: ['oil', 'ghee', 'fat', 'margarine', 'cooking oil'], recipes: [
            { title: 'Herb-Infused Cooking Oil', time: '10 min', servings: 10, calories: 40, veg: true, steps: ['Warm olive oil on low heat', 'Add rosemary, garlic, peppercorns', 'Cool and bottle', 'Use for healthier cooking'], ingredients: ['1 cup olive oil', 'Fresh rosemary', 'Garlic cloves', 'Peppercorns'] },
        ]
    },
    // Generic / healthy
    {
        keywords: ['protein', 'dal', 'lentil', 'chickpea', 'rajma', 'chana', 'beans', 'soy', 'tofu'], recipes: [
            { title: 'Protein-Packed Dal Tadka', time: '25 min', servings: 3, calories: 200, veg: true, steps: ['Boil toor dal until soft', 'Make tadka with ghee, cumin, garlic', 'Add tomato, turmeric, chilli', 'Pour tadka over dal'], ingredients: ['1 cup toor dal', 'Ghee, cumin, garlic', 'Tomato, turmeric', 'Coriander for garnish'] },
            { title: 'Chana Salad Bowl', time: '10 min', servings: 2, calories: 250, veg: true, steps: ['Drain and rinse chickpeas', 'Add chopped onion, tomato, cucumber', 'Dress with lemon, chaat masala', 'Top with pomegranate seeds'], ingredients: ['1 can chickpeas', 'Onion, tomato, cucumber', 'Lemon, chaat masala', 'Pomegranate'] },
        ]
    },
];

function matchRecipes(product) {
    if (!product) return [];
    const text = [
        product.product_name || '',
        product.categories || '',
        product.ingredients_text || '',
        product.brands || '',
    ].join(' ').toLowerCase();

    const matched = [];
    for (const category of RECIPE_DB) {
        const hits = category.keywords.filter(k => text.includes(k)).length;
        if (hits > 0) {
            for (const r of category.recipes) {
                matched.push({ ...r, relevance: hits });
            }
        }
    }

    // Sort by relevance and deduplicate
    matched.sort((a, b) => b.relevance - a.relevance);
    const seen = new Set();
    return matched.filter(r => {
        if (seen.has(r.title)) return false;
        seen.add(r.title);
        return true;
    }).slice(0, 6);
}

export default function RecipeSuggestions({ product }) {
    const [expandedIdx, setExpandedIdx] = useState(-1);
    const recipes = matchRecipes(product);

    if (recipes.length === 0) return null;

    return (
        <motion.div
            style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem',
                marginBottom: '1rem',
            }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ChefHat size={20} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Recipe Ideas</h3>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: 'auto' }}>
                    Based on this product
                </span>
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
                {recipes.map((r, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        style={{
                            borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
                        }}>
                        <button onClick={() => setExpandedIdx(expandedIdx === i ? -1 : i)}
                            style={{
                                width: '100%', padding: '0.75rem', background: 'none', border: 'none',
                                color: '#e2e8f0', cursor: 'pointer', textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                            }}>
                            <Sparkles size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{r.title}</div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12} /> {r.time}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Users size={12} /> {r.servings}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Flame size={12} /> {r.calories} kcal</span>
                                    {r.veg && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#22c55e' }}><Leaf size={12} /> Veg</span>}
                                </div>
                            </div>
                            {expandedIdx === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <AnimatePresence>
                            {expandedIdx === i && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    style={{ padding: '0 0.75rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.75rem' }}>
                                        <div>
                                            <h5 style={{ margin: '0 0 0.5rem', color: '#a78bfa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Ingredients</h5>
                                            {r.ingredients.map((ing, j) => (
                                                <div key={j} style={{ fontSize: '0.85rem', color: '#cbd5e1', padding: '0.15rem 0' }}>• {ing}</div>
                                            ))}
                                        </div>
                                        <div>
                                            <h5 style={{ margin: '0 0 0.5rem', color: '#a78bfa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Steps</h5>
                                            {r.steps.map((step, j) => (
                                                <div key={j} style={{ fontSize: '0.85rem', color: '#cbd5e1', padding: '0.15rem 0' }}>
                                                    <span style={{ color: '#a855f7', fontWeight: '700', marginRight: '0.3rem' }}>{j + 1}.</span> {step}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
