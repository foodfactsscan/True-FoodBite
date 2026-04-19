// Helper to parse and categorize additives from product data
export const parseAdditives = (product) => {
    const additives = [];

    if (!product.additives_tags) return additives;

    // Known additives database with concern levels
    const additiveDatabase = {
        // Preservatives
        'en:e200': { name: 'Sorbic Acid', level: 'safe' },
        'en:e202': { name: 'Potassium Sorbate', level: 'safe' },
        'en:e211': { name: 'Sodium Benzoate', level: 'minimal' },
        'en:e330': { name: 'Citric Acid', level: 'safe' },
        'en:e412': { name: 'Guar Gum', level: 'safe' },
        'en:e466': { name: 'Carboxymethyl Cellulose', level: 'minimal' },

        // Emulsifiers
        'en:e322': { name: 'Lecithin (Soy)', level: 'safe' },
        'en:e471': { name: 'Mono/Diglycerides', level: 'minimal' },
        'en:e472e': { name: 'DATEM', level: 'minimal' },
        'en:e481': { name: 'Sodium Stearoyl Lactylate', level: 'minimal' },

        // Colors
        'en:e102': { name: 'Tartrazine', level: 'moderate' },
        'en:e110': { name: 'Sunset Yellow', level: 'moderate' },
        'en:e122': { name: 'Carmoisine', level: 'moderate' },
        'en:e129': { name: 'Allura Red', level: 'moderate' },
        'en:e133': { name: 'Brilliant Blue', level: 'moderate' },
        'en:e150a': { name: 'Caramel I', level: 'safe' },
        'en:e150c': { name: 'Caramel III', level: 'minimal' },
        'en:e150d': { name: 'Caramel IV', level: 'minimal' },

        // Flavor enhancers
        'en:e621': { name: 'MSG (Monosodium Glutamate)', level: 'moderate' },
        'en:e627': { name: 'Disodium Guanylate', level: 'minimal' },
        'en:e631': { name: 'Disodium Inosinate', level: 'minimal' },
        'en:e635': { name: 'Disodium 5-Ribonucleotides', level: 'minimal' },

        // Sweeteners
        'en:e950': { name: 'Acesulfame K', level: 'moderate' },
        'en:e951': { name: 'Aspartame', level: 'moderate' },
        'en:e952': { name: 'Cyclamate', level: 'moderate' },
        'en:e954': { name: 'Saccharin', level: 'moderate' },
        'en:e955': { name: 'Sucralose', level: 'minimal' },
        'en:e960': { name: 'Stevia', level: 'safe' },

        // Acidity regulators & Leavening agents
        'en:e296': { name: 'Malic Acid', level: 'safe' },
        'en:e334': { name: 'Tartaric Acid', level: 'safe' },
        'en:e338': { name: 'Phosphoric Acid', level: 'minimal' },
        'en:e500': { name: 'Sodium Carbonate', level: 'safe' },
        'en:e500i': { name: 'Sodium Carbonate', level: 'safe' },
        'en:e500ii': { name: 'Sodium Hydrogen Carbonate (Baking Soda)', level: 'safe' },
        'en:e501': { name: 'Potassium Carbonate', level: 'safe' },
        'en:e501i': { name: 'Potassium Carbonate', level: 'safe' },
        'en:e503': { name: 'Ammonium Carbonate', level: 'safe' },
        'en:e503ii': { name: 'Ammonium Hydrogen Carbonate', level: 'safe' },
        'en:e450': { name: 'Diphosphates', level: 'minimal' },
        'en:e451': { name: 'Triphosphates', level: 'minimal' },
        'en:e451i': { name: 'Pentasodium Triphosphate', level: 'minimal' },
        'en:e452': { name: 'Polyphosphates', level: 'minimal' },
        'en:e452i': { name: 'Sodium Polyphosphate', level: 'minimal' },
        'en:e508': { name: 'Potassium Chloride', level: 'safe' },

        // Antioxidants
        'en:e300': { name: 'Ascorbic Acid (Vitamin C)', level: 'safe' },
        'en:e306': { name: 'Tocopherol (Vitamin E)', level: 'safe' },
        'en:e307': { name: 'Alpha-Tocopherol', level: 'safe' },
        'en:e319': { name: 'TBHQ', level: 'moderate' },
        'en:e320': { name: 'BHA', level: 'moderate' },
        'en:e321': { name: 'BHT', level: 'moderate' },
    };

    product.additives_tags.forEach(tag => {
        const code = tag.replace('en:', '').toUpperCase();
        const info = additiveDatabase[tag] || { name: 'Unknown Additive', level: 'minimal' };

        additives.push({
            code: code,
            name: info.name,
            level: info.level
        });
    });

    return additives;
};

// Helper to parse ingredients list - Enhanced for TruthIn-style display
export const parseIngredients = (product) => {
    if (!product.ingredients_text) return [];

    let text = product.ingredients_text;

    // Remove parenthetical E-numbers from base ingredients for cleaner display
    // e.g., "Leavening Agents (E500ii, E503ii)" becomes "Leavening Agents"
    text = text.replace(/\s*\([E\d\s,]+\)/gi, '');

    // Split by comma and clean up
    let ingredients = text
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0 && ing.length < 100); // Skip overly long items

    // Further split ingredients that have "and" or "&" in them
    const expandedIngredients = [];
    ingredients.forEach(ing => {
        if (ing.includes(' and ')) {
            expandedIngredients.push(...ing.split(' and ').map(i => i.trim()));
        } else if (ing.includes(' & ')) {
            expandedIngredients.push(...ing.split(' & ').map(i => i.trim()));
        } else {
            expandedIngredients.push(ing);
        }
    });

    // Capitalize first letter of each ingredient for consistency
    const formattedIngredients = expandedIngredients.map(ing => {
        ing = ing.trim();
        if (ing.length === 0) return null;
        // Capitalize first letter only if all lowercase
        if (ing === ing.toLowerCase()) {
            return ing.charAt(0).toUpperCase() + ing.slice(1);
        }
        return ing;
    }).filter(Boolean);

    return formattedIngredients.slice(0, 32); // Limit to 32 like the reference app
};

// Helper to detect artificial ingredients
export const detectArtificialIngredients = (ingredientsText) => {
    if (!ingredientsText) return [];

    const artificial = [];
    const lowerText = ingredientsText.toLowerCase();

    if (lowerText.includes('artificial flavor') || lowerText.includes('artificial flavour')) {
        artificial.push({ name: 'Artificial Flavors', level: 'minimal' });
    }

    if (lowerText.includes('artificial color') || lowerText.includes('artificial colour')) {
        artificial.push({ name: 'Artificial Colors', level: 'moderate' });
    }

    if (lowerText.includes('preservative')) {
        artificial.push({ name: 'Preservatives', level: 'minimal' });
    }

    return artificial;
};
