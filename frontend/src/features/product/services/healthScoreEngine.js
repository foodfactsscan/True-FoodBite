/**
 * Health Score Engine (0–100 scale)
 * Generates:
 *   1. Overall health score (0–100)
 *   2. Summary report text ("Good for daily use", "Avoid if diabetic", etc.)
 *   3. Breakdown by category (nutrition, processing, additives, allergens)
 *   4. Personalized verdict based on user health profile
 */

// ─── Additive risk database ───────────────────────────────────────────────────
const ADDITIVE_RISK = {
    high: [
        'e102', 'e110', 'e122', 'e124', 'e129', 'e133', // artificial colours
        'e211', 'e212', 'e213', // sodium benzoate family
        'e320', 'e321', // BHA / BHT
        'e951', 'e950', 'e954', 'e955', // artificial sweeteners
        'e621', // MSG
        'e249', 'e250', 'e251', 'e252', // nitrites/nitrates
        'partially hydrogenated', 'trans fat', 'tbhq',
    ],
    moderate: [
        'e330', 'e331', 'e332', 'e333', // citric acid family (generally safe but flag)
        'e412', 'e414', 'e415', // gums
        'e433', 'e434', 'e435', 'e436', // polysorbates
        'e471', 'e472', // mono/diglycerides
        'e500', 'e501', // sodium/potassium carbonates
    ],
    safe: [
        'e100', 'e101', 'e140', 'e160a', 'e160c', // natural colours
        'e270', // lactic acid
        'e300', 'e301', 'e302', // ascorbic acid (vitamin C)
        'e306', 'e307', 'e308', 'e309', // tocopherols (vitamin E)
        'e322', // lecithin
        'e375', // niacin
        'e440', // pectin
    ],
};

// ─── INS / E-number label explainer ───────────────────────────────────────────
export const ADDITIVE_DICTIONARY = {
    'e100': { name: 'Curcumin / Turmeric', risk: 'safe', desc: 'Natural yellow colour from turmeric. Antioxidant properties.' },
    'e101': { name: 'Riboflavin (Vitamin B2)', risk: 'safe', desc: 'Essential vitamin, used as yellow food colour.' },
    'e102': { name: 'Tartrazine', risk: 'high', desc: 'Synthetic yellow dye linked to hyperactivity in children. Banned in some countries.' },
    'e104': { name: 'Quinoline Yellow', risk: 'moderate', desc: 'Synthetic greenish-yellow dye. May cause allergic reactions.' },
    'e110': { name: 'Sunset Yellow FCF', risk: 'high', desc: 'Synthetic orange dye linked to hyperactivity in children.' },
    'e120': { name: 'Cochineal / Carmine', risk: 'moderate', desc: 'Natural red dye from insects. Not suitable for vegetarians/vegans.' },
    'e122': { name: 'Carmoisine / Azorubine', risk: 'high', desc: 'Synthetic red dye. Linked to hyperactivity. Banned in some countries.' },
    'e124': { name: 'Ponceau 4R', risk: 'high', desc: 'Synthetic red dye linked to hyperactivity in children.' },
    'e129': { name: 'Allura Red AC', risk: 'high', desc: 'Synthetic red dye linked to hyperactivity. Widely used in soft drinks.' },
    'e131': { name: 'Patent Blue V', risk: 'moderate', desc: 'Synthetic blue dye. May cause allergic reactions.' },
    'e132': { name: 'Indigotine / Indigo Carmine', risk: 'moderate', desc: 'Synthetic blue dye. Generally considered safe in small amounts.' },
    'e133': { name: 'Brilliant Blue FCF', risk: 'high', desc: 'Synthetic blue dye. Not recommended for children.' },
    'e140': { name: 'Chlorophyll', risk: 'safe', desc: 'Natural green pigment from plants. Completely safe.' },
    'e141': { name: 'Copper Chlorophyll', risk: 'safe', desc: 'Semi-synthetic green colour. Generally safe.' },
    'e150a': { name: 'Plain Caramel', risk: 'safe', desc: 'Caramelised sugar. Natural colour.' },
    'e150d': { name: 'Sulphite Ammonia Caramel', risk: 'moderate', desc: 'Contains 4-MEI, a byproduct that may be carcinogenic in high amounts.' },
    'e160a': { name: 'Beta-Carotene', risk: 'safe', desc: 'Natural orange pigment from carrots. Precursor to Vitamin A.' },
    'e160c': { name: 'Paprika Extract', risk: 'safe', desc: 'Natural red-orange colour from paprika.' },
    'e170': { name: 'Calcium Carbonate', risk: 'safe', desc: 'Chalk. Used as white colour and calcium supplement.' },
    'e200': { name: 'Sorbic Acid', risk: 'safe', desc: 'Preservative. Generally considered safe.' },
    'e202': { name: 'Potassium Sorbate', risk: 'safe', desc: 'Common preservative. Generally safe.' },
    'e210': { name: 'Benzoic Acid', risk: 'moderate', desc: 'Preservative. Can cause allergic reactions in sensitive individuals.' },
    'e211': { name: 'Sodium Benzoate', risk: 'high', desc: 'Preservative that may form benzene (carcinogen) with vitamin C. Linked to hyperactivity.' },
    'e220': { name: 'Sulphur Dioxide', risk: 'moderate', desc: 'Preservative. Can trigger asthma and allergic reactions.' },
    'e223': { name: 'Sodium Metabisulphite', risk: 'moderate', desc: 'Preservative. Can cause allergic reactions, especially in asthmatics.' },
    'e249': { name: 'Potassium Nitrite', risk: 'high', desc: 'Preservative in processed meats. Can form carcinogenic nitrosamines.' },
    'e250': { name: 'Sodium Nitrite', risk: 'high', desc: 'Preservative in processed meats. Linked to increased cancer risk when heated.' },
    'e270': { name: 'Lactic Acid', risk: 'safe', desc: 'Natural acid found in milk. pH regulator.' },
    'e282': { name: 'Calcium Propionate', risk: 'moderate', desc: 'Bread preservative. May cause migraines in sensitive individuals.' },
    'e300': { name: 'Ascorbic Acid (Vitamin C)', risk: 'safe', desc: 'Essential vitamin. Antioxidant. Beneficial.' },
    'e301': { name: 'Sodium Ascorbate', risk: 'safe', desc: 'Form of Vitamin C. Antioxidant.' },
    'e306': { name: 'Tocopherol (Vitamin E)', risk: 'safe', desc: 'Natural antioxidant. Beneficial.' },
    'e307': { name: 'Alpha-Tocopherol (Vitamin E)', risk: 'safe', desc: 'Synthetic form of Vitamin E. Antioxidant.' },
    'e316': { name: 'Sodium Erythorbate', risk: 'safe', desc: 'Antioxidant similar to Vitamin C.' },
    'e320': { name: 'BHA (Butylated Hydroxyanisole)', risk: 'high', desc: 'Synthetic antioxidant. Possible carcinogen. Banned in some countries.' },
    'e321': { name: 'BHT (Butylated Hydroxytoluene)', risk: 'high', desc: 'Synthetic antioxidant. Endocrine disruptor concerns.' },
    'e322': { name: 'Lecithin', risk: 'safe', desc: 'Natural emulsifier from soy/sunflower. Beneficial for brain health.' },
    'e330': { name: 'Citric Acid', risk: 'safe', desc: 'Natural acid from citrus fruits. Flavour enhancer and preservative.' },
    'e331': { name: 'Sodium Citrate', risk: 'safe', desc: 'Salt of citric acid. Used as flavour and preservative.' },
    'e375': { name: 'Niacin (Vitamin B3)', risk: 'safe', desc: 'Essential vitamin. Added to fortified foods.' },
    'e401': { name: 'Sodium Alginate', risk: 'safe', desc: 'Natural thickener from seaweed.' },
    'e407': { name: 'Carrageenan', risk: 'moderate', desc: 'Thickener from seaweed. Some studies link to inflammation.' },
    'e410': { name: 'Locust Bean Gum', risk: 'safe', desc: 'Natural thickener. Prebiotic fibre.' },
    'e412': { name: 'Guar Gum', risk: 'safe', desc: 'Natural thickener from guar beans.' },
    'e414': { name: 'Gum Arabic / Acacia Gum', risk: 'safe', desc: 'Natural plant gum. Good source of fibre.' },
    'e415': { name: 'Xanthan Gum', risk: 'safe', desc: 'Common thickener. Generally safe but may cause bloating.' },
    'e420': { name: 'Sorbitol', risk: 'moderate', desc: 'Sugar alcohol. Can cause digestive issues in large amounts.' },
    'e422': { name: 'Glycerol', risk: 'safe', desc: 'Moisturiser and sweetener. Generally safe.' },
    'e433': { name: 'Polysorbate 80', risk: 'moderate', desc: 'Emulsifier. Some studies suggest gut microbiome effects.' },
    'e440': { name: 'Pectin', risk: 'safe', desc: 'Natural gelling agent from fruits. Source of dietary fibre.' },
    'e441': { name: 'Gelatin', risk: 'safe', desc: 'Animal-derived protein. Not suitable for vegetarians/vegans.' },
    'e450': { name: 'Diphosphates', risk: 'moderate', desc: 'Leavening agent. Excess phosphate may affect kidney health.' },
    'e460': { name: 'Cellulose', risk: 'safe', desc: 'Plant fibre. Anti-caking agent.' },
    'e466': { name: 'Carboxymethyl Cellulose', risk: 'moderate', desc: 'Modified cellulose. Some studies link to gut inflammation.' },
    'e471': { name: 'Mono- and Diglycerides', risk: 'safe', desc: 'Emulsifier. May contain trans fats.' },
    'e481': { name: 'Sodium Stearoyl Lactylate', risk: 'safe', desc: 'Dough strengthener. Generally safe.' },
    'e500': { name: 'Sodium Bicarbonate (Baking Soda)', risk: 'safe', desc: 'Leavening agent. Completely safe.' },
    'e503': { name: 'Ammonium Carbonate', risk: 'safe', desc: 'Leavening agent in baking.' },
    'e507': { name: 'Hydrochloric Acid', risk: 'safe', desc: 'pH regulator. Safe in food quantities.' },
    'e509': { name: 'Calcium Chloride', risk: 'safe', desc: 'Firming agent. Adds calcium.' },
    'e551': { name: 'Silicon Dioxide', risk: 'safe', desc: 'Anti-caking agent. Passes through body.' },
    'e621': { name: 'Monosodium Glutamate (MSG)', risk: 'high', desc: 'Flavour enhancer. May cause headaches and sensitivity in some people.' },
    'e627': { name: 'Disodium Guanylate', risk: 'moderate', desc: 'Flavour enhancer. Often used with MSG.' },
    'e631': { name: 'Disodium Inosinate', risk: 'moderate', desc: 'Flavour enhancer. Often used with MSG.' },
    'e635': { name: 'Disodium Ribonucleotides', risk: 'moderate', desc: 'Flavour enhancer. Combination of E627 and E631.' },
    'e900': { name: 'Dimethyl Polysiloxane', risk: 'moderate', desc: 'Anti-foaming agent. Used in frying oils at fast food chains.' },
    'e903': { name: 'Carnauba Wax', risk: 'safe', desc: 'Natural plant wax. Used for coating.' },
    'e904': { name: 'Shellac', risk: 'safe', desc: 'Natural coating from lac insects. Not suitable for vegans.' },
    'e920': { name: 'L-Cysteine', risk: 'moderate', desc: 'Amino acid. May be derived from human hair or feathers. Not suitable for vegans.' },
    'e950': { name: 'Acesulfame Potassium (Ace-K)', risk: 'high', desc: 'Artificial sweetener. Some concern about long-term safety.' },
    'e951': { name: 'Aspartame', risk: 'high', desc: 'Artificial sweetener. IARC classified as "possibly carcinogenic" (Group 2B) in 2023.' },
    'e952': { name: 'Cyclamate', risk: 'high', desc: 'Artificial sweetener. Banned in the US.' },
    'e954': { name: 'Saccharin', risk: 'high', desc: 'Artificial sweetener. Previous cancer links debunked but remains controversial.' },
    'e955': { name: 'Sucralose', risk: 'moderate', desc: 'Artificial sweetener. Some studies suggest gut microbiome effects.' },
    'e960': { name: 'Steviol Glycosides (Stevia)', risk: 'safe', desc: 'Natural sweetener from stevia plant. Generally safe.' },
    'e965': { name: 'Maltitol', risk: 'moderate', desc: 'Sugar alcohol. Can cause digestive issues in large amounts.' },
    // INS codes (Indian / Codex)
    'ins 621': { name: 'Monosodium Glutamate (MSG)', risk: 'high', desc: 'Same as E621. Flavour enhancer.' },
    'ins 211': { name: 'Sodium Benzoate', risk: 'high', desc: 'Same as E211. Preservative.' },
    'ins 300': { name: 'Ascorbic Acid (Vitamin C)', risk: 'safe', desc: 'Same as E300. Beneficial antioxidant.' },
    'ins 322': { name: 'Lecithin', risk: 'safe', desc: 'Same as E322. Natural emulsifier.' },
    'ins 330': { name: 'Citric Acid', risk: 'safe', desc: 'Same as E330. Natural acid.' },
    'ins 471': { name: 'Mono- and Diglycerides', risk: 'safe', desc: 'Same as E471. Emulsifier.' },
    'ins 500': { name: 'Sodium Bicarbonate', risk: 'safe', desc: 'Same as E500. Baking soda.' },
};

/**
 * Look up an additive / E-number / INS code
 * @param {string} code - e.g. "e621", "INS 621", "621"
 * @returns {object|null}
 */
export function lookupAdditive(code) {
    const normalized = code.toLowerCase().trim()
        .replace(/^ins\s*/i, 'ins ')
        .replace(/^e-?/i, 'e');

    if (ADDITIVE_DICTIONARY[normalized]) return { code: normalized, ...ADDITIVE_DICTIONARY[normalized] };

    // Try e-number form
    const nums = normalized.replace(/\D/g, '');
    if (nums && ADDITIVE_DICTIONARY[`e${nums}`]) return { code: `e${nums}`, ...ADDITIVE_DICTIONARY[`e${nums}`] };
    if (nums && ADDITIVE_DICTIONARY[`ins ${nums}`]) return { code: `ins ${nums}`, ...ADDITIVE_DICTIONARY[`ins ${nums}`] };

    return null;
}

/**
 * Detect and explain all additives in an ingredient text
 */
export function detectAdditives(ingredientText) {
    if (!ingredientText) return [];
    const text = ingredientText.toLowerCase();
    const found = [];

    for (const [code, info] of Object.entries(ADDITIVE_DICTIONARY)) {
        if (text.includes(code) || text.includes(info.name.toLowerCase())) {
            found.push({ code, ...info });
        }
    }
    return found;
}

// ─── Main health score calculator ─────────────────────────────────────────────

/**
 * Calculate a comprehensive health score (0–100)
 * Aligned with Nutri-Score 2024 (Solid/Beverage) + Indian Food Safety Context
 */
export function calculateHealthScore(product, userProfile = null) {
    if (!product) return { score: 0, grade: 'E', summary: 'No product data available.' };

    const nutriments = product.nutriments || {};
    const levels = product.nutrient_levels || {};
    const novaGroup = product.nova_group || null;
    const ingredientText = (product.ingredients_text || '').toLowerCase();
    
    // Determine if it's a beverage (Beverages have MUCH stricter sugar rules)
    const categoryTags = (product.categories_tags || []).join(' ').toLowerCase();
    const isBeverage = categoryTags.includes('beverage') || 
                       categoryTags.includes('drink') || 
                       categoryTags.includes('soda') || 
                       categoryTags.includes('juice') ||
                       categoryTags.includes('liquid');

    // ── 1. Nutrition score (0–40 points) ─────────────────────────────────────
    let nutritionScore = 15; // Start conservative

    // SUGARS (Strictest Nutri-Score 2024 thresholds)
    const sugar100g = nutriments.sugars_100g ?? null;
    if (sugar100g !== null) {
        if (isBeverage) {
            if (sugar100g > 10) nutritionScore -= 20; // Beverages are punished hard
            else if (sugar100g > 6) nutritionScore -= 12;
            else if (sugar100g > 3) nutritionScore -= 6;
            else if (sugar100g <= 0.5) nutritionScore += 5;
        } else {
            if (sugar100g > 45) nutritionScore -= 15;
            else if (sugar100g > 25) nutritionScore -= 10;
            else if (sugar100g > 10) nutritionScore -= 5;
            else if (sugar100g <= 2) nutritionScore += 5;
        }
    }

    // SODIUM / SALT (-15 max)
    const sodium100g = nutriments.sodium_100g ?? (nutriments.salt_100g ? nutriments.salt_100g / 2.5 : null);
    if (sodium100g !== null) {
        if (sodium100g > 0.9) nutritionScore -= 15; // Extreme salt
        else if (sodium100g > 0.4) nutritionScore -= 10;
        else if (sodium100g > 0.2) nutritionScore -= 5;
        else if (sodium100g <= 0.05) nutritionScore += 3;
    }

    // SATURATED FAT (-10 max)
    const satFat = nutriments['saturated-fat_100g'] ?? null;
    if (satFat !== null) {
        if (satFat > 10) nutritionScore -= 10;
        else if (satFat > 4) nutritionScore -= 6;
        else if (satFat > 2) nutritionScore -= 3;
        else if (satFat <= 1) nutritionScore += 2;
    }

    // PROTEIN & FIBER REWARDS (+10 max)
    const protein = nutriments.proteins_100g ?? 0;
    const fiber = nutriments.fiber_100g ?? 0;
    if (protein > 15) nutritionScore += 5;
    else if (protein > 5) nutritionScore += 2;
    
    if (fiber > 6) nutritionScore += 5;
    else if (fiber > 3) nutritionScore += 2;

    nutritionScore = Math.max(0, Math.min(40, nutritionScore));

    // ── 2. Processing score (0–25 points) ────────────────────────────────────
    let processingScore = 15; // neutral
    if (novaGroup === 1) processingScore = 25; // Unprocessed
    else if (novaGroup === 2) processingScore = 18; // Culinary ingredients
    else if (novaGroup === 3) processingScore = 10; // Processed
    else if (novaGroup === 4) processingScore = 0;  // Ultra Processed - 0 points automatically

    // Detect hidden markers of ultra-processing
    const upfMarkers = ['hydrogenated', 'maltodextrin', 'dextrose', 'inverted sugar', 'syrup', 'artificial flavour', 'emulsifier'];
    const foundMarkers = upfMarkers.filter(m => ingredientText.includes(m));
    processingScore = Math.max(0, processingScore - foundMarkers.length * 2.5);

    // ── 3. Additives score (0–20 points) ──────────────────────────────────────
    let additivesScore = 20;
    const allAdditives = detectAdditives(ingredientText);
    
    allAdditives.forEach(a => {
        if (a.risk === 'high') additivesScore -= 6;
        else if (a.risk === 'moderate') additivesScore -= 2;
    });
    
    additivesScore = Math.max(0, Math.min(20, additivesScore));

    // ── 4. Ingredient quality (0–15 points) ───────────────────────────────────
    let ingredientScore = 7; // Neutral
    
    // INDIAN CONTEXT PENALTIES
    if (ingredientText.includes('maida') || ingredientText.includes('refined wheat')) ingredientScore -= 5;
    if (ingredientText.includes('palm oil') || ingredientText.includes('vegetable fat (palm)')) ingredientScore -= 4;
    
    // WHOLE FOOD REWARDS
    const wholeFoods = ['whole wheat', 'multigrain', 'millet', 'ragi', 'jowar', 'seeds', 'oats', 'chickpea', 'lentil'];
    const foundWhole = wholeFoods.filter(w => ingredientText.includes(w));
    ingredientScore += foundWhole.length * 2.5;

    ingredientScore = Math.max(0, Math.min(15, ingredientScore));

    // ── Total score ──────────────────────────────────────────────────────────
    let totalScore = Math.round(nutritionScore + processingScore + additivesScore + ingredientScore);
    totalScore = Math.max(0, Math.min(100, totalScore));

    // ── Grade mapping (Scientific Grade Logic) ─────────────────────────────────
    let grade, gradeColor, gradeLabel;
    if (totalScore >= 75) { grade = 'A'; gradeColor = '#22c55e'; gradeLabel = 'Superior'; }
    else if (totalScore >= 60) { grade = 'B'; gradeColor = '#84cc16'; gradeLabel = 'Healthy Choice'; }
    else if (totalScore >= 40) { grade = 'C'; gradeColor = '#eab308'; gradeLabel = 'Cautionary'; }
    else if (totalScore >= 20) { grade = 'D'; gradeColor = '#f97316'; gradeLabel = 'Poor Health Profile'; }
    else { grade = 'E'; gradeColor = '#ef4444'; gradeLabel = 'Highly Processed / Avoid'; }

    // ── Summary report text ───────────────────────────────────────────────────
    const summary = [];
    if (grade === 'A' || grade === 'B') summary.push(`✅ ${gradeLabel} - Safe for frequent consumption.`);
    else if (grade === 'C') summary.push(`⚠️ ${gradeLabel} - Limit intake due to nutritional imbalances.`);
    else summary.push(`🛑 ${gradeLabel} - Multiple high-risk ingredients detected.`);

    if (sugar100g > (isBeverage ? 6 : 20)) summary.push('🍬 Sugar overload detected');
    if (sodium100g > 0.4) summary.push('🧂 High sodium (Salt) impact');
    if (ingredientText.includes('palm oil')) summary.push('🌴 Contains Palm Oil (Saturated Fat & Environment)');
    if (ingredientText.includes('maida')) summary.push('🌾 Refined Maida: Zero fiber calories');
    if (novaGroup === 4) summary.push('🏭 Industrial UPF (Ultra Processed Food)');
    if (fiber > 4) summary.push('🌾 Excellent Fibre Source');
    if (protein > 10) summary.push('💪 High Protein Quality');

    // ── Personalized verdicts ─────────────────────────────────────────────────
    const personalVerdicts = [];
    if (userProfile) {
        const userConditions = [...(userProfile.chronicDiseases || []), ...(userProfile.temporaryIssues || [])].map(c => c.toLowerCase());
        
        if (userConditions.some(c => c.includes('diab'))) {
            if (sugar100g > 5) personalVerdicts.push({ condition: 'Diabetes', verdict: '🚫 Dangerous sugar spike risk', severity: 'danger' });
            else if (sugar100g < 1) personalVerdicts.push({ condition: 'Diabetes', verdict: '✅ Diabetic safe glycemic profile', severity: 'safe' });
        }
        
        if (userConditions.some(c => c.includes('pressure') || c.includes('hyperten'))) {
            if (sodium100g > 0.3) personalVerdicts.push({ condition: 'Hypertension', verdict: '🚫 Risk: Elevates blood pressure', severity: 'danger' });
            else if (sodium100g < 0.1) personalVerdicts.push({ condition: 'Hypertension', verdict: '✅ Low sodium - Heart safe', severity: 'safe' });
        }

        if (userConditions.some(c => c.includes('weight') || c.includes('obesity'))) {
            if (novaGroup === 4 || (nutriments['energy-kcal_100g'] > 350)) 
                personalVerdicts.push({ condition: 'Weight Control', verdict: '🚫 High calorie density / UPF', severity: 'danger' });
        }

        if (userConditions.some(c => c.includes('pcos') || c.includes('pcod'))) {
            if (ingredientText.includes('refined') || ingredientText.includes('sugar'))
                personalVerdicts.push({ condition: 'PCOS/PCOD', verdict: '🚫 Insulin disruptive ingredients', severity: 'danger' });
        }

        if (userConditions.some(c => c.includes('celiac') || c.includes('gluten'))) {
            const glutenIn = ['wheat', 'barley', 'rye', 'gluten', 'semolina', 'maida'];
            if (glutenIn.some(g => ingredientText.includes(g)))
                personalVerdicts.push({ condition: 'Celiac Disease', verdict: '🚫 Contains Gluten - Not Safe', severity: 'danger' });
            else personalVerdicts.push({ condition: 'Gluten Free', verdict: '✅ Safe for Celiac consumption', severity: 'safe' });
        }

        if (userConditions.some(c => c.includes('lactose') || c.includes('dairy'))) {
            const dairyIn = ['milk', 'cheese', 'whey', 'casein', 'lactose', 'cream', 'butter'];
            if (dairyIn.some(d => ingredientText.includes(d)))
                personalVerdicts.push({ condition: 'Lactose Intolerance', verdict: '🚫 Contains Dairy - Trigger risk', severity: 'danger' });
            else personalVerdicts.push({ condition: 'Dairy Free', verdict: '✅ Safe for Lactose intolerance', severity: 'safe' });
        }
    }

    return {
        score: totalScore,
        grade,
        gradeColor,
        gradeLabel,
        breakdown: {
            nutrition: { score: Math.round(nutritionScore), max: 40, label: 'Nutrition Profiling' },
            processing: { score: Math.round(processingScore), max: 25, label: 'Processing Index' },
            additives: { score: Math.round(additivesScore), max: 20, label: 'Additive Risk' },
            ingredients: { score: Math.round(ingredientScore), max: 15, label: 'Quality Index' }
        },
        summary,
        personalVerdicts
    };
}

export default { calculateHealthScore, lookupAdditive, detectAdditives, ADDITIVE_DICTIONARY };
