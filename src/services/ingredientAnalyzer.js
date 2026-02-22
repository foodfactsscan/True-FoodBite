/**
 * Advanced Ingredient Analyzer — Universal Indian Food Product Analysis
 * Features:
 *   1. Category classification (additive, preservative, color, sweetener, oil, etc.)
 *   2. Hidden ingredient detection (casein→milk, maltodextrin→sugar source, etc.)
 *   3. Risk scoring (safe / moderate / risky)
 *   4. Natural vs Artificial classification
 *   5. Vegan / Vegetarian status
 *   6. Allergen detection (Big-8 + Indian allergens)
 *   7. Ultra-processed indicator (NOVA group)
 *   8. E-number / INS additive resolution
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENT KNOWLEDGE BASE
// Each entry: [pattern, { category, risk, natural, vegan, allergens, hidden, ultraProcessed }]
// risk: 'safe' | 'moderate' | 'risky'
// ═══════════════════════════════════════════════════════════════════════════════

const DB = [
    // ─── OILS & FATS ───
    { p: 'palm oil', cat: 'oil', risk: 'moderate', nat: true, veg: true, vegan: true, up: true, note: 'High in saturated fat; environmental concerns' },
    { p: 'refined palm oil', cat: 'oil', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, note: 'Refined, high saturated fat' },
    { p: 'palmolein', cat: 'oil', risk: 'moderate', nat: true, veg: true, vegan: true, up: true },
    { p: 'hydrogenated', cat: 'oil', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Contains trans fats — linked to heart disease', hidden: 'Trans Fat source' },
    { p: 'partially hydrogenated', cat: 'oil', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Trans fat source — avoid', hidden: 'Trans Fat' },
    { p: 'interesterified', cat: 'oil', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, note: 'Chemically modified fat' },
    { p: 'vanaspati', cat: 'oil', risk: 'risky', nat: false, veg: true, vegan: true, up: true, hidden: 'Trans Fat source' },
    { p: 'shortening', cat: 'oil', risk: 'risky', nat: false, veg: true, vegan: true, up: true, hidden: 'Trans Fat source' },
    { p: 'margarine', cat: 'oil', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'soybean oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['soy'] },
    { p: 'sunflower oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'mustard oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['mustard'] },
    { p: 'coconut oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'groundnut oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['peanut'] },
    { p: 'sesame oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['sesame'] },
    { p: 'olive oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'rice bran oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'cottonseed oil', cat: 'oil', risk: 'moderate', nat: true, veg: true, vegan: true },
    { p: 'canola oil', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'vegetable oil', cat: 'oil', risk: 'moderate', nat: true, veg: true, vegan: true, note: 'Unspecified source — may be palm' },
    { p: 'edible oil', cat: 'oil', risk: 'moderate', nat: true, veg: true, vegan: true, note: 'Unspecified source' },
    { p: 'cocoa butter', cat: 'oil', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'butter', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'] },
    { p: 'ghee', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'] },

    // ─── SUGARS & SWEETENERS ───
    { p: 'sugar', cat: 'sweetener', risk: 'moderate', nat: true, veg: true, vegan: true, up: false, note: 'Added sugar — limit intake' },
    { p: 'cane sugar', cat: 'sweetener', risk: 'moderate', nat: true, veg: true, vegan: true },
    { p: 'invert sugar', cat: 'sweetener', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'brown sugar', cat: 'sweetener', risk: 'moderate', nat: true, veg: true, vegan: true },
    { p: 'jaggery', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'honey', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: false },
    { p: 'high fructose corn syrup', cat: 'sweetener', risk: 'risky', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden sugar — linked to obesity', note: 'Highly processed sugar' },
    { p: 'corn syrup', cat: 'sweetener', risk: 'risky', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden sugar source' },
    { p: 'glucose syrup', cat: 'sweetener', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden sugar source' },
    { p: 'liquid glucose', cat: 'sweetener', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden sugar source' },
    { p: 'maltodextrin', cat: 'sweetener', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden sugar — high glycemic index', note: 'Raises blood sugar rapidly' },
    { p: 'dextrose', cat: 'sweetener', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden sugar (glucose)' },
    { p: 'fructose', cat: 'sweetener', risk: 'moderate', nat: true, veg: true, vegan: true },
    { p: 'maltose', cat: 'sweetener', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'lactose', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'], hidden: 'Milk sugar — dairy derived' },
    { p: 'sucrose', cat: 'sweetener', risk: 'moderate', nat: true, veg: true, vegan: true },
    { p: 'aspartame', cat: 'artificial_sweetener', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Artificial sweetener — controversial safety concerns' },
    { p: 'acesulfame', cat: 'artificial_sweetener', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Artificial sweetener' },
    { p: 'sucralose', cat: 'artificial_sweetener', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Artificial sweetener — 600x sweeter than sugar' },
    { p: 'saccharin', cat: 'artificial_sweetener', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Artificial sweetener' },
    { p: 'stevia', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'sorbitol', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'xylitol', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'erythritol', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'mannitol', cat: 'sweetener', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'isomalt', cat: 'sweetener', risk: 'safe', nat: false, veg: true, vegan: true },
    { p: 'maltitol', cat: 'sweetener', risk: 'safe', nat: false, veg: true, vegan: true },

    // ─── PRESERVATIVES ───
    { p: 'sodium benzoate', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Can form benzene with vitamin C — carcinogen concern' },
    { p: 'potassium sorbate', cat: 'preservative', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'calcium propionate', cat: 'preservative', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'sorbic acid', cat: 'preservative', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'benzoic acid', cat: 'preservative', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'sodium nitrite', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Forms nitrosamines (carcinogenic) when heated', hidden: 'Carcinogen precursor' },
    { p: 'sodium nitrate', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, hidden: 'Carcinogen precursor' },
    { p: 'potassium nitrate', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'sodium metabisulphite', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, allergen: ['sulphite'], note: 'Allergen — can trigger asthma' },
    { p: 'sulphur dioxide', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, allergen: ['sulphite'] },
    { p: 'bha', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Possible carcinogen (IARC Group 2B)' },
    { p: 'bht', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Possible endocrine disruptor' },
    { p: 'tbhq', cat: 'preservative', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Linked to tumors in high doses' },
    { p: 'edta', cat: 'preservative', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'nisin', cat: 'preservative', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'tocopherol', cat: 'preservative', risk: 'safe', nat: true, veg: true, vegan: true, note: 'Vitamin E — natural antioxidant' },
    { p: 'ascorbic acid', cat: 'preservative', risk: 'safe', nat: true, veg: true, vegan: true, note: 'Vitamin C' },
    { p: 'citric acid', cat: 'acidity_regulator', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'class ii preservative', cat: 'preservative', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, note: 'Synthetic preservative — check specific type' },

    // ─── ARTIFICIAL COLORS ───
    { p: 'tartrazine', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Yellow 5 — linked to hyperactivity in children' },
    { p: 'sunset yellow', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Yellow 6 — banned in some countries' },
    { p: 'allura red', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Red 40 — linked to hyperactivity' },
    { p: 'brilliant blue', cat: 'artificial_color', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'carmoisine', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'ponceau', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'indigo carmine', cat: 'artificial_color', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'fast green', cat: 'artificial_color', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'erythrosine', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'Red 3 — thyroid concerns' },
    { p: 'quinoline yellow', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'synthetic colour', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'synthetic color', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'artificial colo', cat: 'artificial_color', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'permitted synthetic', cat: 'artificial_color', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    // Natural colors
    { p: 'caramel colour', cat: 'color', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, note: 'May contain 4-MEI (carcinogen) if Class III/IV' },
    { p: 'annatto', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'beta carotene', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'curcumin', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'chlorophyll', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'natural colour', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'natural color', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'beetroot red', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'lycopene', cat: 'color', risk: 'safe', nat: true, veg: true, vegan: true },

    // ─── FLAVOR ENHANCERS ───
    { p: 'monosodium glutamate', cat: 'flavor_enhancer', risk: 'risky', nat: false, veg: true, vegan: true, up: true, note: 'MSG — can cause headaches in sensitive individuals' },
    { p: 'msg', cat: 'flavor_enhancer', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'disodium guanylate', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Used with MSG — boosts umami taste' },
    { p: 'disodium inosinate', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Used with MSG' },
    { p: 'disodium 5-ribonucleotides', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'MSG booster combination' },
    { p: 'hydrolysed vegetable protein', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden MSG source — contains free glutamate' },
    { p: 'hydrolyzed vegetable protein', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden MSG source' },
    { p: 'hydrolysed groundnut protein', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden MSG source', allergen: ['peanut'] },
    { p: 'hydrolysed soy protein', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden MSG source', allergen: ['soy'] },
    { p: 'yeast extract', cat: 'flavor_enhancer', risk: 'moderate', nat: true, veg: true, vegan: true, up: true, hidden: 'Natural MSG source — contains free glutamate' },
    { p: 'autolysed yeast', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'Hidden MSG source' },
    { p: 'flavour enhancer', cat: 'flavor_enhancer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'artificial flavou', cat: 'flavoring', risk: 'risky', nat: false, veg: true, vegan: true, up: true },
    { p: 'nature identical', cat: 'flavoring', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, note: 'Chemically synthesized to mimic natural flavors' },
    { p: 'natural flavou', cat: 'flavoring', risk: 'safe', nat: true, veg: true, vegan: true },

    // ─── EMULSIFIERS & STABILIZERS ───
    { p: 'soy lecithin', cat: 'emulsifier', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['soy'] },
    { p: 'lecithin', cat: 'emulsifier', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'mono and diglycerides', cat: 'emulsifier', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, hidden: 'May contain trans fat traces' },
    { p: 'polysorbate', cat: 'emulsifier', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'carrageenan', cat: 'stabilizer', risk: 'moderate', nat: true, veg: true, vegan: true, note: 'Linked to gut inflammation in some studies' },
    { p: 'guar gum', cat: 'stabilizer', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'xanthan gum', cat: 'stabilizer', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'pectin', cat: 'stabilizer', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'agar', cat: 'stabilizer', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'gelatin', cat: 'stabilizer', risk: 'safe', nat: true, veg: false, vegan: false, note: 'Animal-derived (not vegetarian)' },
    { p: 'locust bean gum', cat: 'stabilizer', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'cellulose', cat: 'stabilizer', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'sodium cmc', cat: 'stabilizer', risk: 'safe', nat: false, veg: true, vegan: true, up: true },
    { p: 'modified starch', cat: 'stabilizer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true, note: 'Chemically modified — ultra-processed' },
    { p: 'stearoyl lactylate', cat: 'emulsifier', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },

    // ─── DAIRY (allergens) ───
    { p: 'casein', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'], hidden: 'Milk protein — dairy derived' },
    { p: 'caseinate', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'], hidden: 'Milk protein' },
    { p: 'whey', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'], hidden: 'Dairy byproduct' },
    { p: 'milk solid', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'] },
    { p: 'milk powder', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'] },
    { p: 'cream', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'] },
    { p: 'cheese', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'] },
    { p: 'paneer', cat: 'dairy', risk: 'safe', nat: true, veg: true, vegan: false, allergen: ['milk'] },
    { p: 'condensed milk', cat: 'dairy', risk: 'moderate', nat: true, veg: true, vegan: false, allergen: ['milk'] },

    // ─── GRAINS & FLOURS ───
    { p: 'wheat flour', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['gluten'] },
    { p: 'refined wheat flour', cat: 'grain', risk: 'moderate', nat: false, veg: true, vegan: true, allergen: ['gluten'], up: true, note: 'Stripped of fiber and nutrients' },
    { p: 'maida', cat: 'grain', risk: 'moderate', nat: false, veg: true, vegan: true, allergen: ['gluten'], up: true, hidden: 'Refined wheat flour — low nutrition', note: 'Bleached, refined — spikes blood sugar' },
    { p: 'wheat gluten', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['gluten'] },
    { p: 'rice flour', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'corn flour', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'gram flour', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'besan', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'semolina', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['gluten'] },
    { p: 'oat', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'ragi', cat: 'grain', risk: 'safe', nat: true, veg: true, vegan: true },

    // ─── SALT ───
    { p: 'salt', cat: 'mineral', risk: 'moderate', nat: true, veg: true, vegan: true, note: 'Excessive sodium linked to hypertension' },
    { p: 'iodised salt', cat: 'mineral', risk: 'safe', nat: true, veg: true, vegan: true },

    // ─── SPICES (natural, safe) ───
    ...['turmeric', 'coriander', 'cumin', 'black pepper', 'cardamom', 'cinnamon', 'clove',
        'nutmeg', 'fennel', 'fenugreek', 'ginger', 'garlic', 'onion', 'chilli', 'chili',
        'mustard seed', 'asafoetida', 'hing', 'curry leaves', 'mint', 'basil', 'oregano',
        'bay leaf', 'star anise', 'mace', 'ajwain', 'carom', 'poppy seeds', 'nigella',
        'kalonji', 'dried mango', 'amchur', 'tamarind', 'kokum', 'saffron'].map(s => ({
            p: s, cat: 'spice', risk: 'safe', nat: true, veg: true, vegan: true
        })),

    // ─── NUTS & ALLERGENS ───
    { p: 'peanut', cat: 'nut', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['peanut'] },
    { p: 'groundnut', cat: 'nut', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['peanut'] },
    { p: 'almond', cat: 'nut', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['tree_nut'] },
    { p: 'cashew', cat: 'nut', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['tree_nut'] },
    { p: 'walnut', cat: 'nut', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['tree_nut'] },
    { p: 'pistachio', cat: 'nut', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['tree_nut'] },
    { p: 'sesame', cat: 'seed', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['sesame'] },
    { p: 'soy', cat: 'legume', risk: 'safe', nat: true, veg: true, vegan: true, allergen: ['soy'] },
    { p: 'coconut', cat: 'fruit', risk: 'safe', nat: true, veg: true, vegan: true },

    // ─── LEAVENING ───
    { p: 'baking soda', cat: 'leavening', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'baking powder', cat: 'leavening', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'sodium bicarbonate', cat: 'leavening', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'calcium carbonate', cat: 'mineral', risk: 'safe', nat: true, veg: true, vegan: true },
    { p: 'yeast', cat: 'leavening', risk: 'safe', nat: true, veg: true, vegan: true },

    // ─── PROCESSING INDICATORS ───
    { p: 'edible starch', cat: 'processing_aid', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'modified starch', cat: 'processing_aid', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'resistant maltodextrin', cat: 'processing_aid', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'silicon dioxide', cat: 'processing_aid', risk: 'safe', nat: false, veg: true, vegan: true, up: true, note: 'Anti-caking agent' },
    { p: 'anti-caking', cat: 'processing_aid', risk: 'safe', nat: false, veg: true, vegan: true, up: true },
    { p: 'anticaking', cat: 'processing_aid', risk: 'safe', nat: false, veg: true, vegan: true, up: true },

    // ─── MEAT & ANIMAL PRODUCTS ───
    ...['chicken', 'mutton', 'lamb', 'beef', 'pork', 'fish', 'shrimp', 'prawn', 'gelatin',
        'lard', 'tallow', 'anchovy', 'shellac', 'carmine', 'cochineal', 'egg', 'egg powder',
        'honey', 'wax', 'beeswax'].map(m => ({
            p: m, cat: 'meat', risk: 'safe', nat: true, veg: false, vegan: false
        })),

    // ─── STABILIZERS & ADDITIVES (Expanded) ───
    { p: 'sodium polyphosphate', cat: 'stabilizer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'sodium acid pyrophosphate', cat: 'stabilizer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'sodium tripolyphosphate', cat: 'stabilizer', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
    { p: 'modified starch', cat: 'additive', risk: 'moderate', nat: false, veg: true, vegan: true, up: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SMART SPLITTER — Handles nested parentheses correctly
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Splits a string into components but keeps content inside parentheses together.
 * Example: "Oil (Palm, Rice), Salt" -> ["Oil (Palm, Rice)", "Salt"]
 */
function smartSplit(text) {
    const results = [];
    let current = "";
    let depth = 0;

    // Normalize string: remove extra spaces, fix common OCR errors
    const normalized = text.replace(/\s+/g, ' ').trim();

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        if (char === '(' || char === '[' || char === '{') depth++;
        if (char === ')' || char === ']' || char === '}') depth--;

        if (depth === 0 && (char === ',' || char === ';' || char === '•' || char === '*')) {
            if (current.trim()) results.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    if (current.trim()) results.push(current.trim());
    return results.filter(s => s.length >= 2);
}

/**
 * Recursive Parser: Handles "Parent (Child1, Child2)" structures
 */
function parseIngredientTree(name) {
    const match = name.match(/^([^(]+)\((.+)\)$/);
    if (match) {
        const parentName = match[1].trim();
        const childrenStr = match[2];
        const children = smartSplit(childrenStr).map(child => parseIngredientTree(child));

        const parentAnalysis = analyzeIngredient(parentName);
        return {
            ...parentAnalysis,
            name: parentName,
            isParent: true,
            children: children
        };
    }
    return analyzeIngredient(name);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALLERGEN LABELS
// ═══════════════════════════════════════════════════════════════════════════════
const ALLERGEN_LABELS = {
    milk: '🥛 Milk/Dairy', gluten: '🌾 Gluten/Wheat', peanut: '🥜 Peanut',
    tree_nut: '🌰 Tree Nuts', soy: '🫘 Soy', sesame: '🫘 Sesame',
    mustard: '🟡 Mustard', sulphite: '⚠️ Sulphites', fish: '🐟 Fish',
    shellfish: '🦐 Shellfish', egg: '🥚 Egg',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY LABELS
// ═══════════════════════════════════════════════════════════════════════════════
const CAT_LABELS = {
    oil: '🛢️ Oil/Fat', sweetener: '🍬 Sweetener', artificial_sweetener: '⚗️ Artificial Sweetener',
    preservative: '🧪 Preservative', artificial_color: '🎨 Artificial Color',
    color: '🎨 Color', flavor_enhancer: '🧂 Flavor Enhancer', flavoring: '🧂 Flavoring',
    emulsifier: '🔬 Emulsifier', stabilizer: '🔬 Stabilizer',
    dairy: '🥛 Dairy', grain: '🌾 Grain/Flour', spice: '🌶️ Spice',
    nut: '🥜 Nut', seed: '🌱 Seed', legume: '🫘 Legume', fruit: '🍎 Fruit',
    mineral: '⚙️ Mineral', leavening: '🫧 Leavening', meat: '🍖 Meat/Animal',
    acidity_regulator: '⚗️ Acidity Regulator', processing_aid: '⚙️ Processing Aid',
    additive: '🧪 Additive', unknown: '❓ Other',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

function lookupIngredient(name) {
    const lower = name.toLowerCase().trim();
    // Exact match first, then partial
    for (const entry of DB) {
        if (lower === entry.p || lower.includes(entry.p) || entry.p.includes(lower)) {
            return entry;
        }
    }
    // Check for E-number / INS patterns
    if (/^(?:e|ins)[\s-]?\d{3,4}/i.test(lower)) {
        return { p: lower, cat: 'additive', risk: 'moderate', nat: false, veg: true, vegan: true, up: true };
    }
    return null;
}

/**
 * Analyze a single ingredient string.
 * Returns a rich object with all classifications.
 */
export function analyzeIngredient(name) {
    const entry = lookupIngredient(name);
    const lower = name.toLowerCase().trim();

    if (entry) {
        return {
            name,
            category: entry.cat,
            categoryLabel: CAT_LABELS[entry.cat] || CAT_LABELS.unknown,
            risk: entry.risk || 'safe',
            isNatural: entry.nat !== false,
            isArtificial: entry.nat === false,
            isVegetarian: entry.veg !== false,
            isVegan: entry.vegan !== false,
            allergens: (entry.allergen || []).map(a => ({ key: a, label: ALLERGEN_LABELS[a] || a })),
            isUltraProcessed: entry.up === true,
            hiddenInfo: entry.hidden || null,
            note: entry.note || null,
        };
    }

    // Default: unknown ingredient — assume safe, natural
    return {
        name,
        category: 'unknown',
        categoryLabel: CAT_LABELS.unknown,
        risk: 'safe',
        isNatural: true,
        isArtificial: false,
        isVegetarian: true,
        isVegan: true,
        allergens: [],
        isUltraProcessed: false,
        hiddenInfo: null,
        note: null,
    };
}

/**
 * Analyze a full ingredient list.
 * @param {string[]} ingredients — array of ingredient names
 * @returns Full analysis report
 */
export function analyzeIngredientList(ingredients) {
    if (!ingredients || ingredients.length === 0) {
        return {
            ingredients: [],
            summary: { total: 0, safe: 0, moderate: 0, risky: 0 },
            allergens: [],
            hiddenIngredients: [],
            categories: {},
            isVegetarian: true,
            isVegan: true,
            ultraProcessedCount: 0,
            novaGroup: 1,
            overallRisk: 'safe',
        };
    }

    const analyzed = ingredients.map(parseIngredientTree);

    // Flatten for global stats but keep tree for UI
    const flatIngredients = [];
    function flatten(list) {
        list.forEach(ing => {
            flatIngredients.push(ing);
            if (ing.children) flatten(ing.children);
        });
    }
    flatten(analyzed);

    // Summary counts based on all ingredients (including nested)
    const summary = { total: flatIngredients.length, safe: 0, moderate: 0, risky: 0 };
    flatIngredients.forEach(a => { summary[a.risk]++; });

    // Collect allergens (deduplicated)
    const allergenSet = new Map();
    flatIngredients.forEach(a => {
        a.allergens.forEach(al => {
            if (!allergenSet.has(al.key)) allergenSet.set(al.key, al);
        });
    });

    // Hidden ingredients
    const hidden = flatIngredients.filter(a => a.hiddenInfo).map(a => ({
        ingredient: a.name,
        hiddenAs: a.hiddenInfo,
    }));

    // Category breakdown
    const categories = {};
    flatIngredients.forEach(a => {
        if (!categories[a.category]) categories[a.category] = { label: a.categoryLabel, items: [], count: 0 };
        categories[a.category].items.push(a.name);
        categories[a.category].count++;
    });

    // Veg/Vegan status
    const isVegetarian = flatIngredients.every(a => a.isVegetarian);
    const isVegan = flatIngredients.every(a => a.isVegan);

    // Ultra-processed count
    const ultraProcessedCount = flatIngredients.filter(a => a.isUltraProcessed).length;

    // NOVA group estimation
    let novaGroup = 1;
    if (ultraProcessedCount > 0) novaGroup = 4;
    else if (flatIngredients.some(a => a.category === 'preservative' || a.category === 'emulsifier')) novaGroup = 3;
    else if (flatIngredients.some(a => a.category === 'oil' || a.category === 'sweetener')) novaGroup = 2;

    // Overall risk
    let overallRisk = 'safe';
    if (summary.risky > 0) overallRisk = 'risky';
    else if (summary.moderate > summary.safe) overallRisk = 'moderate';
    else if (summary.moderate > 0) overallRisk = 'moderate';

    return {
        ingredients: analyzed,
        summary,
        allergens: Array.from(allergenSet.values()),
        hiddenIngredients: hidden,
        categories,
        isVegetarian,
        isVegan,
        ultraProcessedCount,
        novaGroup,
        overallRisk,
    };
}

/**
 * Analyze raw ingredient text string (from product data or OCR).
 */
export function analyzeIngredientText(text) {
    if (!text) return analyzeIngredientList([]);
    const parts = smartSplit(text);
    return analyzeIngredientList(parts);
}
