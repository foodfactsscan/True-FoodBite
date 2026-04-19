/**
 * Personalized Health Analysis Engine
 * Analyzes food products based on user's health profile
 * Returns personalized concerns (negative) and benefits (positive)
 */

// ─── Disease / Condition nutrient rules ───
// Each condition maps to nutrients that should be LIMITED or ENCOURAGED
const CONDITION_RULES = {
    // Chronic Diseases
    'diabetes': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 5, label: 'Sugar', unit: 'g', reason: 'High sugar spikes blood glucose levels, worsening diabetes control' },
            { nutrient: 'carbohydrates_100g', threshold: 30, label: 'Carbohydrates', unit: 'g', reason: 'High carbs can cause blood sugar spikes' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber slows sugar absorption and improves insulin response' },
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein helps stabilize blood sugar levels' },
        ],
        avoidIngredients: ['high fructose corn syrup', 'dextrose', 'maltodextrin', 'corn syrup', 'refined sugar'],
        severity: 'high'
    },
    'hypertension': {
        limit: [
            { nutrient: 'sodium_100g', threshold: 0.4, label: 'Sodium', unit: 'g', reason: 'High sodium raises blood pressure significantly' },
            { nutrient: 'salt_100g', threshold: 1.0, label: 'Salt', unit: 'g', reason: 'Excess salt worsens hypertension' },
        ],
        encourage: [
            { nutrient: 'potassium_100g', threshold: 200, label: 'Potassium', unit: 'mg', reason: 'Potassium helps lower blood pressure' },
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber supports cardiovascular health' },
        ],
        avoidIngredients: ['msg', 'monosodium glutamate', 'sodium benzoate'],
        severity: 'high'
    },
    'heart-disease': {
        limit: [
            { nutrient: 'saturated-fat_100g', threshold: 2, label: 'Saturated Fat', unit: 'g', reason: 'Saturated fat raises LDL cholesterol and worsens heart disease' },
            { nutrient: 'trans-fat_100g', threshold: 0, label: 'Trans Fat', unit: 'g', reason: 'Trans fats are extremely harmful for heart health' },
            { nutrient: 'sodium_100g', threshold: 0.4, label: 'Sodium', unit: 'g', reason: 'Excess sodium increases strain on the heart' },
            { nutrient: 'cholesterol_100g', threshold: 20, label: 'Cholesterol', unit: 'mg', reason: 'Dietary cholesterol can worsen cardiovascular conditions' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber helps reduce cholesterol levels' },
        ],
        avoidIngredients: ['hydrogenated', 'partially hydrogenated', 'trans fat', 'palm oil'],
        severity: 'high'
    },
    'high-cholesterol': {
        limit: [
            { nutrient: 'saturated-fat_100g', threshold: 1.5, label: 'Saturated Fat', unit: 'g', reason: 'Saturated fat directly increases LDL cholesterol' },
            { nutrient: 'cholesterol_100g', threshold: 20, label: 'Cholesterol', unit: 'mg', reason: 'Dietary cholesterol adds to already high levels' },
            { nutrient: 'trans-fat_100g', threshold: 0, label: 'Trans Fat', unit: 'g', reason: 'Trans fats raise bad cholesterol and lower good cholesterol' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Soluble fiber binds cholesterol and removes it from the body' },
        ],
        avoidIngredients: ['hydrogenated oil', 'palm oil', 'coconut oil'],
        severity: 'high'
    },
    'kidney-disease': {
        limit: [
            { nutrient: 'sodium_100g', threshold: 0.3, label: 'Sodium', unit: 'g', reason: 'Damaged kidneys cannot filter excess sodium effectively' },
            { nutrient: 'potassium_100g', threshold: 200, label: 'Potassium', unit: 'mg', reason: 'Impaired kidneys struggle to regulate potassium' },
            { nutrient: 'proteins_100g', threshold: 8, label: 'Protein', unit: 'g', reason: 'Excess protein creates more waste for kidneys to filter' },
        ],
        encourage: [],
        avoidIngredients: ['potassium chloride', 'sodium phosphate'],
        severity: 'high'
    },
    'obesity': {
        limit: [
            { nutrient: 'energy-kcal_100g', threshold: 200, label: 'Calories', unit: 'kcal', reason: 'High-calorie foods contribute to weight gain' },
            { nutrient: 'fat_100g', threshold: 10, label: 'Total Fat', unit: 'g', reason: 'High fat content is calorie-dense and promotes weight gain' },
            { nutrient: 'sugars_100g', threshold: 8, label: 'Sugar', unit: 'g', reason: 'Sugar provides empty calories and promotes fat storage' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber promotes satiety and reduces overall calorie intake' },
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein keeps you full longer and supports metabolism' },
        ],
        avoidIngredients: ['high fructose corn syrup', 'refined sugar', 'hydrogenated'],
        severity: 'medium'
    },
    'thyroid': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 8, label: 'Sugar', unit: 'g', reason: 'Excess sugar can worsen thyroid function' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber supports metabolism affected by thyroid issues' },
        ],
        avoidIngredients: ['soy', 'soybean', 'soy lecithin'],
        severity: 'medium'
    },
    'celiac-disease': {
        limit: [],
        encourage: [],
        avoidIngredients: ['wheat', 'barley', 'rye', 'gluten', 'malt', 'semolina', 'spelt', 'triticale'],
        severity: 'high'
    },
    'lactose-intolerance': {
        limit: [],
        encourage: [],
        avoidIngredients: ['milk', 'lactose', 'whey', 'casein', 'cream', 'butter', 'cheese', 'yogurt'],
        severity: 'high'
    },
    'gout': {
        limit: [
            { nutrient: 'proteins_100g', threshold: 10, label: 'Protein', unit: 'g', reason: 'High-protein foods can increase uric acid levels' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber aids digestion and may help reduce uric acid' },
        ],
        avoidIngredients: ['yeast extract', 'anchovies', 'sardines'],
        severity: 'medium'
    },
    'ibs': {
        limit: [
            { nutrient: 'fiber_100g', threshold: 10, label: 'Fiber (excess)', unit: 'g', reason: 'Too much fiber can worsen IBS symptoms like bloating' },
            { nutrient: 'fat_100g', threshold: 10, label: 'Fat', unit: 'g', reason: 'High-fat foods can trigger IBS flare-ups' },
        ],
        encourage: [],
        avoidIngredients: ['sorbitol', 'mannitol', 'xylitol', 'inulin', 'chicory', 'garlic powder', 'onion powder'],
        severity: 'medium'
    },
    'pcod-pcos': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 5, label: 'Sugar', unit: 'g', reason: 'Sugar spikes insulin, worsening PCOS hormonal imbalance' },
            { nutrient: 'carbohydrates_100g', threshold: 25, label: 'Carbohydrates', unit: 'g', reason: 'Excess carbs increase insulin resistance in PCOS' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber improves insulin sensitivity' },
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein helps balance blood sugar and hormones' },
        ],
        avoidIngredients: ['refined sugar', 'high fructose corn syrup', 'soy'],
        severity: 'medium'
    },
    'asthma': {
        limit: [],
        encourage: [],
        avoidIngredients: ['sulfites', 'sulfur dioxide', 'sodium bisulfite', 'sodium metabisulfite', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'],
        severity: 'medium'
    },
    'liver-disease': {
        limit: [
            { nutrient: 'fat_100g', threshold: 5, label: 'Fat', unit: 'g', reason: 'The liver processes all fat; excess fat overloads a damaged liver' },
            { nutrient: 'sugars_100g', threshold: 5, label: 'Sugar', unit: 'g', reason: 'Fructose is processed by the liver and can cause fatty liver' },
            { nutrient: 'sodium_100g', threshold: 0.3, label: 'Sodium', unit: 'g', reason: 'Sodium causes fluid retention, worsening liver conditions' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Adequate protein supports liver repair' },
        ],
        avoidIngredients: ['alcohol', 'high fructose corn syrup'],
        severity: 'high'
    },
};

// Temporary health issue rules (less severe, shorter-term)
const TEMPORARY_ISSUE_RULES = {
    'cold-flu': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 10, label: 'Sugar', unit: 'g', reason: 'Sugar suppresses immune function during illness' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein supports immune system recovery' },
        ],
        avoidIngredients: [],
        note: 'Stay hydrated and choose warm, easy-to-digest foods'
    },
    'acidity-gerd': {
        limit: [
            { nutrient: 'fat_100g', threshold: 8, label: 'Fat', unit: 'g', reason: 'High-fat foods relax the lower esophageal sphincter, causing acid reflux' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber absorbs stomach acid and reduces reflux symptoms' },
        ],
        avoidIngredients: ['citric acid', 'vinegar', 'chili', 'cayenne', 'black pepper'],
        note: 'Avoid spicy, acidic, and fried foods'
    },
    'constipation': {
        limit: [],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 5, label: 'Fiber', unit: 'g', reason: 'Fiber adds bulk to stool and promotes regular bowel movements' },
        ],
        avoidIngredients: [],
        note: 'Choose high-fiber foods and drink plenty of water'
    },
    'diarrhea': {
        limit: [
            { nutrient: 'fiber_100g', threshold: 5, label: 'Fiber', unit: 'g', reason: 'Too much fiber can worsen diarrhea' },
            { nutrient: 'fat_100g', threshold: 5, label: 'Fat', unit: 'g', reason: 'Fat is harder to digest and can worsen loose stools' },
        ],
        encourage: [],
        avoidIngredients: ['sorbitol', 'mannitol', 'xylitol', 'lactose', 'caffeine'],
        note: 'Stick to bland, easy-to-digest foods (BRAT diet)'
    },
    'headache-migraine': {
        limit: [
            { nutrient: 'sodium_100g', threshold: 0.5, label: 'Sodium', unit: 'g', reason: 'High sodium can trigger or worsen headaches' },
        ],
        encourage: [],
        avoidIngredients: ['msg', 'monosodium glutamate', 'aspartame', 'tyramine', 'nitrates', 'nitrites'],
        note: 'Avoid processed foods with MSG and artificial sweeteners'
    },
    'bloating': {
        limit: [
            { nutrient: 'sodium_100g', threshold: 0.5, label: 'Sodium', unit: 'g', reason: 'Sodium causes water retention and bloating' },
        ],
        encourage: [],
        avoidIngredients: ['sorbitol', 'mannitol', 'xylitol', 'inulin', 'chicory root', 'carbonated'],
        note: 'Avoid sugar alcohols and carbonated ingredients'
    },
    'skin-issues': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 8, label: 'Sugar', unit: 'g', reason: 'Sugar triggers inflammation and can worsen acne/eczema' },
            { nutrient: 'saturated-fat_100g', threshold: 3, label: 'Saturated Fat', unit: 'g', reason: 'Saturated fat promotes skin inflammation' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber promotes gut health which improves skin' },
        ],
        avoidIngredients: ['refined sugar', 'hydrogenated oil'],
        note: 'Focus on anti-inflammatory, whole foods'
    },
    'fatigue': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 10, label: 'Sugar', unit: 'g', reason: 'Sugar causes energy crashes after initial spike' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein provides sustained energy' },
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber provides slow-release energy' },
        ],
        avoidIngredients: [],
        note: 'Choose complex carbs and protein for sustained energy'
    },
    'joint-pain': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 8, label: 'Sugar', unit: 'g', reason: 'Sugar promotes inflammation in joints' },
            { nutrient: 'saturated-fat_100g', threshold: 3, label: 'Saturated Fat', unit: 'g', reason: 'Saturated fat triggers inflammation pathways' },
        ],
        encourage: [],
        avoidIngredients: ['msg', 'aspartame', 'refined sugar'],
        note: 'Anti-inflammatory diet recommended'
    },
    'weight-gain-recent': {
        limit: [
            { nutrient: 'energy-kcal_100g', threshold: 200, label: 'Calories', unit: 'kcal', reason: 'Calorie-dense foods contribute to recent weight gain' },
            { nutrient: 'sugars_100g', threshold: 8, label: 'Sugar', unit: 'g', reason: 'Sugar promotes fat storage' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein helps preserve muscle during weight management' },
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber promotes fullness and reduces overeating' },
        ],
        avoidIngredients: [],
        note: 'Focus on nutrient-dense, low-calorie foods'
    },
    'allergy-season': {
        limit: [],
        encourage: [],
        avoidIngredients: ['histamine', 'sulfites', 'benzoates'],
        note: 'Avoid known allergens and histamine-rich foods'
    },
    'pregnancy': {
        limit: [
            { nutrient: 'sodium_100g', threshold: 0.5, label: 'Sodium', unit: 'g', reason: 'High sodium can worsen pregnancy-related swelling' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein is essential for fetal development' },
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Fiber prevents pregnancy constipation' },
            { nutrient: 'iron_100g', threshold: 1, label: 'Iron', unit: 'mg', reason: 'Iron prevents pregnancy anemia' },
        ],
        avoidIngredients: ['caffeine', 'alcohol', 'aspartame', 'saccharin'],
        note: 'Ensure adequate folate, iron, and calcium intake'
    },
};

// Goal-based rules
const GOAL_RULES = {
    'weight-loss': {
        limit: [
            { nutrient: 'energy-kcal_100g', threshold: 150, label: 'Calories', unit: 'kcal', reason: 'Lower calories needed for weight loss' },
            { nutrient: 'sugars_100g', threshold: 5, label: 'Sugar', unit: 'g', reason: 'Sugar prevents fat burning' },
            { nutrient: 'fat_100g', threshold: 8, label: 'Total Fat', unit: 'g', reason: 'Reducing fat intake aids weight loss' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 8, label: 'Protein', unit: 'g', reason: 'High protein preserves muscle and boosts metabolism' },
            { nutrient: 'fiber_100g', threshold: 5, label: 'Fiber', unit: 'g', reason: 'Fiber keeps you full and reduces cravings' },
        ],
    },
    'weight-gain': {
        limit: [],
        encourage: [
            { nutrient: 'energy-kcal_100g', threshold: 200, label: 'Calories', unit: 'kcal', reason: 'More calories needed for healthy weight gain' },
            { nutrient: 'proteins_100g', threshold: 8, label: 'Protein', unit: 'g', reason: 'Protein supports muscle building' },
            { nutrient: 'carbohydrates_100g', threshold: 20, label: 'Carbohydrates', unit: 'g', reason: 'Carbs provide energy for muscle growth' },
        ],
    },
    'muscle-building': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 8, label: 'Sugar', unit: 'g', reason: 'Excess sugar promotes fat gain instead of muscle' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 10, label: 'Protein', unit: 'g', reason: 'High protein is essential for muscle protein synthesis' },
            { nutrient: 'energy-kcal_100g', threshold: 150, label: 'Calories', unit: 'kcal', reason: 'Adequate calories fuel muscle growth' },
        ],
    },
    'maintain-health': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 10, label: 'Sugar', unit: 'g', reason: 'Moderate sugar intake supports overall health' },
            { nutrient: 'sodium_100g', threshold: 0.6, label: 'Sodium', unit: 'g', reason: 'Moderate sodium supports heart health' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Regular fiber intake supports digestive health' },
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Adequate protein maintains body functions' },
        ],
    },
    'improve-digestion': {
        limit: [
            { nutrient: 'fat_100g', threshold: 8, label: 'Fat', unit: 'g', reason: 'High fat slows digestion' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 5, label: 'Fiber', unit: 'g', reason: 'Fiber is key for healthy digestion' },
        ],
    },
    'boost-immunity': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 8, label: 'Sugar', unit: 'g', reason: 'Sugar weakens immune response' },
        ],
        encourage: [
            { nutrient: 'proteins_100g', threshold: 5, label: 'Protein', unit: 'g', reason: 'Protein builds immune cells' },
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Gut health (via fiber) drives 70% of immunity' },
        ],
    },
    'better-skin': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 5, label: 'Sugar', unit: 'g', reason: 'Sugar triggers glycation, aging the skin' },
            { nutrient: 'saturated-fat_100g', threshold: 3, label: 'Saturated Fat', unit: 'g', reason: 'Saturated fat promotes skin inflammation' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 3, label: 'Fiber', unit: 'g', reason: 'Gut health directly impacts skin clarity' },
        ],
    },
    'manage-diabetes': {
        limit: [
            { nutrient: 'sugars_100g', threshold: 3, label: 'Sugar', unit: 'g', reason: 'Strict sugar control for diabetes management' },
            { nutrient: 'carbohydrates_100g', threshold: 20, label: 'Carbohydrates', unit: 'g', reason: 'Carb counting is essential for diabetes' },
        ],
        encourage: [
            { nutrient: 'fiber_100g', threshold: 5, label: 'Fiber', unit: 'g', reason: 'Fiber dramatically improves blood sugar control' },
            { nutrient: 'proteins_100g', threshold: 8, label: 'Protein', unit: 'g', reason: 'Protein stabilizes blood glucose' },
        ],
    },
};

// BMI calculation
export const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return parseFloat(bmi.toFixed(1));
};

export const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6', advice: 'Consider calorie-dense, nutritious foods' };
    if (bmi < 25) return { label: 'Normal', color: '#22c55e', advice: 'Maintain a balanced diet' };
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b', advice: 'Focus on portion control and nutrient-dense foods' };
    return { label: 'Obese', color: '#ef4444', advice: 'Choose low-calorie, high-fiber foods' };
};

/**
 * Main analysis function
 * @param {Object} product - Product data from Open Food Facts
 * @param {Object} userProfile - User's health profile
 * @returns {Object} Personalized analysis with concerns and benefits
 */
export const calculateDailyRecommendations = (userProfile) => {
    if (!userProfile || !userProfile.weightKg) {
        // Defaults for average adult
        return { calories: 2000, sugar: 50, salt: 6, protein: 50 };
    }

    const { weightKg, heightCm, age, gender, goal } = userProfile;

    // Basal Metabolic Rate (Mifflin-St Jeor Equation)
    let bmr = (10 * weightKg) + (6.25 * (heightCm || 170)) - (5 * (age || 30));
    if (gender === 'male') bmr += 5;
    else bmr -= 161;

    // TDEE (Sedentary factor 1.2)
    let tdee = bmr * 1.2;

    // Adjust based on goal
    if (goal === 'weight-loss') tdee -= 500;
    if (goal === 'weight-gain' || goal === 'muscle-building') tdee += 500;

    // Nutrients (Standard recommendations)
    // Sugar: < 10% of total calories (1g sugar = 4kcal)
    const sugarLimit = (tdee * 0.1) / 4;
    // Protein: 0.8g to 1.5g per kg
    const proteinTarget = goal === 'muscle-building' ? weightKg * 1.6 : weightKg * 1.0;
    // Salt: < 6g (WHO recommendation)
    const saltLimit = 6;

    return {
        calories: Math.round(Math.max(1200, tdee)),
        sugar: Math.round(sugarLimit),
        salt: saltLimit,
        protein: Math.round(proteinTarget)
    };
};

export const analyzeProductForUser = (product, userProfile) => {
    if (!product || !userProfile) return null;

    const nutriments = product.nutriments || {};
    const ingredientsText = (product.ingredients_text || '').toLowerCase();
    const concerns = [];
    const benefits = [];
    const notes = [];

    // 1. Analyze based on chronic diseases
    const chronicDiseases = userProfile.chronicDiseases || [];
    chronicDiseases.forEach(disease => {
        const rules = CONDITION_RULES[disease];
        if (!rules) return;

        // Check nutrient limits
        (rules.limit || []).forEach(rule => {
            const value = nutriments[rule.nutrient] || 0;
            if (value > rule.threshold) {
                concerns.push({
                    type: 'chronic',
                    source: disease,
                    severity: rules.severity || 'medium',
                    label: rule.label,
                    value: parseFloat(value.toFixed(1)),
                    unit: rule.unit,
                    threshold: rule.threshold,
                    reason: rule.reason,
                    icon: '⚠️'
                });
            }
        });

        // Check encouraged nutrients
        (rules.encourage || []).forEach(rule => {
            const value = nutriments[rule.nutrient] || 0;
            if (value >= rule.threshold) {
                benefits.push({
                    type: 'chronic',
                    source: disease,
                    label: rule.label,
                    value: parseFloat(value.toFixed(1)),
                    unit: rule.unit,
                    reason: rule.reason,
                    icon: '✅'
                });
            }
        });

        // Check avoid ingredients
        (rules.avoidIngredients || []).forEach(ingredient => {
            if (ingredientsText.includes(ingredient)) {
                concerns.push({
                    type: 'ingredient',
                    source: disease,
                    severity: rules.severity || 'medium',
                    label: `Contains "${ingredient}"`,
                    reason: `This ingredient should be avoided with ${formatDiseaseName(disease)}`,
                    icon: '🚫'
                });
            }
        });
    });

    // 2. Analyze based on temporary health issues
    const tempIssues = userProfile.temporaryIssues || [];
    tempIssues.forEach(issue => {
        const rules = TEMPORARY_ISSUE_RULES[issue];
        if (!rules) return;

        (rules.limit || []).forEach(rule => {
            const value = nutriments[rule.nutrient] || 0;
            if (value > rule.threshold) {
                concerns.push({
                    type: 'temporary',
                    source: issue,
                    severity: 'medium',
                    label: rule.label,
                    value: parseFloat(value.toFixed(1)),
                    unit: rule.unit,
                    threshold: rule.threshold,
                    reason: rule.reason,
                    icon: '⚡'
                });
            }
        });

        (rules.encourage || []).forEach(rule => {
            const value = nutriments[rule.nutrient] || 0;
            if (value >= rule.threshold) {
                benefits.push({
                    type: 'temporary',
                    source: issue,
                    label: rule.label,
                    value: parseFloat(value.toFixed(1)),
                    unit: rule.unit,
                    reason: rule.reason,
                    icon: '💚'
                });
            }
        });

        (rules.avoidIngredients || []).forEach(ingredient => {
            if (ingredientsText.includes(ingredient)) {
                concerns.push({
                    type: 'ingredient',
                    source: issue,
                    severity: 'medium',
                    label: `Contains "${ingredient}"`,
                    reason: `This ingredient may worsen ${formatDiseaseName(issue)}`,
                    icon: '🚫'
                });
            }
        });

        if (rules.note) {
            notes.push({ source: issue, text: rules.note });
        }
    });

    // 3. Analyze based on goal
    const goal = userProfile.goal;
    if (goal && GOAL_RULES[goal]) {
        const goalRules = GOAL_RULES[goal];

        (goalRules.limit || []).forEach(rule => {
            const value = nutriments[rule.nutrient] || 0;
            if (value > rule.threshold) {
                concerns.push({
                    type: 'goal',
                    source: goal,
                    severity: 'low',
                    label: rule.label,
                    value: parseFloat(value.toFixed(1)),
                    unit: rule.unit,
                    threshold: rule.threshold,
                    reason: rule.reason,
                    icon: '🎯'
                });
            }
        });

        (goalRules.encourage || []).forEach(rule => {
            const value = nutriments[rule.nutrient] || 0;
            if (value >= rule.threshold) {
                benefits.push({
                    type: 'goal',
                    source: goal,
                    label: rule.label,
                    value: parseFloat(value.toFixed(1)),
                    unit: rule.unit,
                    reason: rule.reason,
                    icon: '🎯'
                });
            }
        });
    }

    // 4. BMI-based analysis
    const bmi = calculateBMI(userProfile.weightKg, userProfile.heightCm);
    if (bmi) {
        const bmiCat = getBMICategory(bmi);
        if (bmi >= 30) {
            // Obese
            const calories = nutriments['energy-kcal_100g'] || 0;
            if (calories > 200) {
                concerns.push({
                    type: 'bmi',
                    source: 'BMI Analysis',
                    severity: 'medium',
                    label: 'High Calories',
                    value: parseFloat(calories.toFixed(0)),
                    unit: 'kcal/100g',
                    reason: `With BMI ${bmi} (${bmiCat.label}), high-calorie foods should be limited`,
                    icon: '⚖️'
                });
            }
        } else if (bmi < 18.5) {
            // Underweight
            const calories = nutriments['energy-kcal_100g'] || 0;
            const protein = nutriments['proteins_100g'] || 0;
            if (calories >= 150 && protein >= 5) {
                benefits.push({
                    type: 'bmi',
                    source: 'BMI Analysis',
                    label: 'Good for Weight Gain',
                    value: parseFloat(calories.toFixed(0)),
                    unit: 'kcal/100g',
                    reason: `With BMI ${bmi} (${bmiCat.label}), calorie-dense nutritious foods are recommended`,
                    icon: '⚖️'
                });
            }
        }
    }

    // 5. Age-based warnings
    const age = userProfile.age;
    if (age) {
        if (age >= 60) {
            const sodium = nutriments['sodium_100g'] || 0;
            if (sodium > 0.5) {
                concerns.push({
                    type: 'age',
                    source: 'Age-based',
                    severity: 'medium',
                    label: 'High Sodium for Seniors',
                    value: parseFloat((sodium * 1000).toFixed(0)),
                    unit: 'mg',
                    reason: 'Seniors are more sensitive to sodium; excess can raise blood pressure',
                    icon: '👴'
                });
            }
        }
        if (age < 12) {
            const caffeine = ingredientsText.includes('caffeine') || ingredientsText.includes('coffee') || ingredientsText.includes('tea extract');
            if (caffeine) {
                concerns.push({
                    type: 'age',
                    source: 'Age-based',
                    severity: 'high',
                    label: 'Contains Caffeine',
                    reason: 'Caffeine is not recommended for children under 12',
                    icon: '👶'
                });
            }
        }
    }

    // Deduplicate concerns by label + source
    const uniqueConcerns = [];
    const seenConcerns = new Set();
    concerns.forEach(c => {
        const key = `${c.label}-${c.source}`;
        if (!seenConcerns.has(key)) {
            seenConcerns.add(key);
            uniqueConcerns.push(c);
        }
    });

    // Sort: high severity first
    const severityOrder = { high: 0, medium: 1, low: 2 };
    uniqueConcerns.sort((a, b) => (severityOrder[a.severity] || 1) - (severityOrder[b.severity] || 1));

    // Deduplicate benefits
    const uniqueBenefits = [];
    const seenBenefits = new Set();
    benefits.forEach(b => {
        const key = `${b.label}-${b.source}`;
        if (!seenBenefits.has(key)) {
            seenBenefits.add(key);
            uniqueBenefits.push(b);
        }
    });

    // Calculate overall personalized score
    const totalIssues = uniqueConcerns.length;
    const totalBenefits = uniqueBenefits.length;
    const highSeverity = uniqueConcerns.filter(c => c.severity === 'high').length;

    let personalScore;
    if (totalIssues === 0 && totalBenefits === 0) {
        personalScore = 'neutral';
    } else if (highSeverity >= 2) {
        personalScore = 'avoid';
    } else if (highSeverity === 1 && totalIssues >= 3) {
        personalScore = 'avoid';
    } else if (totalIssues >= 3) {
        personalScore = 'caution';
    } else if (totalIssues > totalBenefits) {
        personalScore = 'caution';
    } else if (totalBenefits > totalIssues && totalIssues <= 1) {
        personalScore = 'good';
    } else {
        personalScore = 'moderate';
    }

    const scoreInfo = {
        avoid: { label: 'Not Recommended For You', color: '#ef4444', emoji: '🔴', bg: 'rgba(239, 68, 68, 0.1)' },
        caution: { label: 'Consume With Caution', color: '#f59e0b', emoji: '🟡', bg: 'rgba(245, 158, 11, 0.1)' },
        moderate: { label: 'Okay in Moderation', color: '#3b82f6', emoji: '🔵', bg: 'rgba(59, 130, 246, 0.1)' },
        good: { label: 'Good Choice For You', color: '#22c55e', emoji: '🟢', bg: 'rgba(34, 197, 94, 0.1)' },
        neutral: { label: 'No Specific Impact', color: '#94a3b8', emoji: '⚪', bg: 'rgba(148, 163, 184, 0.1)' },
    };

    return {
        score: personalScore,
        scoreInfo: scoreInfo[personalScore],
        concerns: uniqueConcerns,
        benefits: uniqueBenefits,
        notes,
        bmi: bmi ? { value: bmi, category: getBMICategory(bmi) } : null,
        profileSummary: {
            hasChronicDiseases: chronicDiseases.length > 0,
            hasTemporaryIssues: tempIssues.length > 0,
            hasGoal: !!goal,
            totalFactors: chronicDiseases.length + tempIssues.length + (goal ? 1 : 0)
        }
    };
};

// Helper to format disease/issue names
const formatDiseaseName = (id) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Export constants for dropdowns
export const CHRONIC_DISEASES_LIST = [
    { id: 'diabetes', label: 'Diabetes (Type 1 / Type 2)' },
    { id: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
    { id: 'heart-disease', label: 'Heart Disease / Cardiovascular' },
    { id: 'high-cholesterol', label: 'High Cholesterol' },
    { id: 'kidney-disease', label: 'Kidney Disease (CKD)' },
    { id: 'liver-disease', label: 'Liver Disease / Fatty Liver' },
    { id: 'obesity', label: 'Obesity' },
    { id: 'thyroid', label: 'Thyroid Disorder (Hypo/Hyper)' },
    { id: 'celiac-disease', label: 'Celiac Disease (Gluten Intolerance)' },
    { id: 'lactose-intolerance', label: 'Lactose Intolerance' },
    { id: 'gout', label: 'Gout' },
    { id: 'ibs', label: 'IBS (Irritable Bowel Syndrome)' },
    { id: 'pcod-pcos', label: 'PCOD / PCOS' },
    { id: 'asthma', label: 'Asthma' },
];

export const TEMPORARY_ISSUES_LIST = [
    { id: 'cold-flu', label: 'Cold / Flu' },
    { id: 'acidity-gerd', label: 'Acidity / GERD' },
    { id: 'constipation', label: 'Constipation' },
    { id: 'diarrhea', label: 'Diarrhea' },
    { id: 'headache-migraine', label: 'Headache / Migraine' },
    { id: 'bloating', label: 'Bloating / Gas' },
    { id: 'skin-issues', label: 'Skin Issues (Acne / Eczema)' },
    { id: 'fatigue', label: 'Fatigue / Low Energy' },
    { id: 'joint-pain', label: 'Joint Pain / Inflammation' },
    { id: 'weight-gain-recent', label: 'Recent Weight Gain' },
    { id: 'allergy-season', label: 'Seasonal Allergies' },
    { id: 'pregnancy', label: 'Pregnancy' },
];

export const GOALS_LIST = [
    { id: 'weight-loss', label: 'Lose Weight' },
    { id: 'weight-gain', label: 'Gain Weight' },
    { id: 'muscle-building', label: 'Build Muscle' },
    { id: 'maintain-health', label: 'Maintain Health' },
    { id: 'improve-digestion', label: 'Improve Digestion' },
    { id: 'boost-immunity', label: 'Boost Immunity' },
    { id: 'better-skin', label: 'Better Skin & Hair' },
    { id: 'manage-diabetes', label: 'Manage Diabetes' },
];

export const GENDER_LIST = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
];
