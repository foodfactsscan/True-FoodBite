/**
 * ============================================================
 * True-FoodBite Comprehensive Nutrition & Food Research DB
 * ============================================================
 * Research curated from:
 * - ICMR (Indian Council of Medical Research)
 * - WHO (World Health Organization)
 * - FSSAI (Food Safety and Standards Authority of India)
 * - IARC (International Agency for Research on Cancer)
 * - European Food Safety Authority (EFSA)
 * ============================================================
 */

// ─── ADDITIVES DEEP RESEARCH ────────────────────────────────────────────────────
export const ADDITIVE_DATA = {
    'e102': {
        commonName: 'Tartrazine (Yellow Dye)',
        madeFrom: 'Petroleum by-product (coal tar derivative)',
        usedFor: 'Gives bright yellow/orange colour to foods like snacks, sweets, and beverages.',
        pros: ['Extremely stable colour', 'Cost-effective for high-volume manufacturing'],
        cons: ['Linked to hyperactivity and ADHD in children (EU warning required)', 'Banned in Austria and Norway', 'Known trigger for asthma and hives in sensitive individuals'],
        indianContext: 'Widely used in Indian namkeens, instant noodles, and orange-coloured sweets.',
        whoSays: 'UK Food Standards Agency recommends excluding this from children\'s diets due to behavioural links.',
    },
    'e110': {
        commonName: 'Sunset Yellow (Orange Dye)',
        madeFrom: 'Petroleum-derived azo dye',
        usedFor: 'Provides sunset orange hue to juices, biscuits, and confectionery.',
        pros: ['Brilliant colour retention', 'Resistant to light and heat degradation'],
        cons: ['Part of the "Southampton Six" — linked to hyperactivity/ADHD', 'Associated with abdominal pain and indigestion'],
        indianContext: 'Frequently found in mango-flavoured drinks and orange cream biscuits.',
        whoSays: 'EFSA mandates the label: "May have an adverse effect on activity and attention in children."',
    },
    'e211': {
        commonName: 'Sodium Benzoate (Preservative)',
        madeFrom: 'Synthetic industrial chemical (benzoic acid + sodium hydroxide)',
        usedFor: 'Powerful anti-microbial used in acidic fruit juices, sodas, and pickles.',
        pros: ['Very effective at preventing mould and spoilage', 'Cheap preservation method'],
        cons: ['Forms BENZENE (carcinogen) when combined with Vitamin C (Ascorbic Acid)', 'Can damage DNA mitochondria (oxidative stress)', 'Linked to clinical hyperactivity'],
        indianContext: 'Highly prevalent in Indian squashes, fruit syrups, and long-shelf-life pickles.',
        whoSays: 'Critical concern: Avoid products combining E211 with Vitamin C (E300).',
    },
    'e621': {
        commonName: 'MSG (Monosodium Glutamate)',
        madeFrom: 'Fermented starch, sugar beets, or sugarcane',
        usedFor: 'Savoury Umami taste enhancer. Makes processed food "crave-able".',
        pros: ['Enhances taste profile significantly', 'Naturally occurs in tomatoes and aged cheese'],
        cons: ['Highly addictive — engineered for "Bliss Point" overeating', 'Can trigger "MSG Symptom Complex": headaches, flushing, and sweating in sensitive individuals', 'Migraine trigger for many'],
        indianContext: 'Ubiquitous in instant noodles, Chinese-Indian cuisine, and masala-coated chips.',
        whoSays: 'FDA considers it safe, but acknowledges "MSG symptom complex" for subsets of the population.',
    },
    'e951': {
        commonName: 'Aspartame (Artificial Sweetener)',
        madeFrom: 'Synthetic amino acid chain (phenylalanine + aspartic acid)',
        usedFor: 'Chemical sugar substitute in "Diet" or "Sugar-Free" products.',
        pros: ['Zero calories', '200x sweeter than sugar'],
        cons: ['IARC (2023): "Possibly carcinogenic to humans" (Group 2B)', 'Safety during pregnancy under debate', 'Must be avoided by people with PKU'],
        indianContext: 'Common in India\'s growing "Diet Soda" and sugar-free biscuit market.',
        whoSays: 'WHO/IARC 2023 classification has significantly increased the concern level for this chemical.',
    },
    'e320': {
        commonName: 'BHA (Antioxidant)',
        madeFrom: 'Synthetic petroleum derivative',
        usedFor: 'Stops oils and fats from going rancid in snacks.',
        pros: ['Dramatically extends shelf life of fried foods'],
        cons: ['Listed by US National Toxicology Program as "reasonably anticipated to be a human carcinogen"', 'Known endocrine disruptor'],
        indianContext: 'Standard in Indian heavy-fried packaged namkeens and fried snacks.',
        whoSays: 'Precautionary principle: Limit exposure due to carcinogenic risk shown in animal studies.',
    },
    'e223': {
        commonName: 'Sodium Metabisulphite',
        madeFrom: 'Industrial sulphur-based chemical',
        usedFor: 'Bleaching agent and preservative in fruit concentrates and baked goods.',
        pros: ['Prevents browning in fruits and vegetables'],
        cons: ['Powerful allergen — can cause severe respiratory distress and anaphylaxis in asthmatics', 'Destroys Vitamin B1 (Thiamine) in the body'],
        indianContext: 'Common in dried fruits, fruit squashes, and some wheat products.',
        whoSays: 'Must be clearly labelled; extremely dangerous for those with sulphur sensitivity.',
    },
};

// ─── NUTRIENT CONCERN RESEARCH ──────────────────────────────────────────────────
export const NUTRIENT_RESEARCH = {
    'saturated-fat': {
        label: 'Saturated Fat',
        icon: '🔥',
        color: '#ef4444',
        what: 'Fats that are solid at room temperature. Higher quantities are typically found in red meat, butter, and tropical oils like PALM OIL.',
        why: 'Directly raises LDL ("bad") cholesterol, clogging arteries and increasing heart disease risk.',
        indianContext: 'Indians have a high genetic risk for cardiovascular disease. The heavy use of Palm Oil in Indian packaged snacks makes this a critical health metric.',
        whoSays: 'ICMR/WHO recommends limiting to <10% of total calorie intake.',
        limit: '20-30g per day depending on activity.',
    },
    'sodium': {
        label: 'Sodium (Salt)',
        icon: '🧂',
        color: '#f59e0b',
        what: 'The "tasty" part of salt. Essential for nerves but catastrophic in modern processed quantities.',
        why: 'Holds excess water in the bloodstream, raising blood pressure (hypertension) and straining the heart and kidneys.',
        indianContext: 'Indians consume double the WHO-recommended salt limit (~11g vs 5g). This is the leading cause of hypertension in the country.',
        whoSays: 'WHO Goal: Global reduction of 30% by 2025 to prevent millions of strokes.',
        limit: '<2000mg sodium per day (5g salt).',
    },
    'sugars': {
        label: 'Added Sugars',
        icon: '🍬',
        color: '#ec4899',
        what: 'Industrial sugars (sucrose, corn syrup) added for flavour and texture — providing "empty calories".',
        why: 'Causes sharp insulin spikes leading to insulin resistance, fatty liver, and type 2 diabetes.',
        indianContext: 'India is the "Diabetes Capital of the World". Hidden sugars in "healthy" foods are a major contributor.',
        whoSays: 'WHO: Reduce free sugar to <5% of energy intake for additional health benefits.',
        limit: '<25g (6 teaspoons) per day.',
    },
    'trans-fat': {
        label: 'Trans Fat',
        icon: '🚫',
        color: '#dc2626',
        what: 'Industrial fat created by adding hydrogen to vegetable oil. The most toxic dietary fat.',
        why: 'Double damage: Raises bad cholesterol AND lowers good cholesterol. Strongly linked to sudden heart death.',
        indianContext: 'FSSAI has mandated <2% trans fats, but many unorganised sectors and cheap snacks still use vanaspati.',
        whoSays: 'WHO: Eliminating industrial trans fat is one of the most effective ways to save lives globally.',
        limit: 'ZERO (Strictly avoid).',
    },
};

// ─── POSITIVE NUTRIENT RESEARCH ──────────────────────────────────────────────────
export const POSITIVE_RESEARCH = {
    'proteins': {
        label: 'Protein',
        icon: '💪',
        color: '#22c55e',
        what: 'The "Building Blocks" of life. Necessary for muscle repair, immune function, and hormones.',
        why: 'Increases metabolism, promotes satiety (stops hunger), and preserves muscle mass.',
        indianContext: '80% of Indian diets are protein-deficient. Protein in packaged food (especially from pulses/millets) is highly beneficial.',
        whoSays: 'ICMR RDA: 0.8g to 1.0g per kg of body weight for healthy adults.',
        benefit: 'Essential for growth and tissue repair.',
    },
    'fiber': {
        label: 'Dietary Fiber',
        icon: '🌾',
        color: '#84cc16',
        what: 'Indigestible plant parts that keep the digestive system running smoothly.',
        why: 'Lowers cholesterol, regulates blood sugar, and feeds "good" gut bacteria (prebiotic).',
        indianContext: 'Traditional Indian whole grains are fibre-rich, but modern "Maida" based products are stripped of it.',
        whoSays: 'National Institute of Nutrition (NIN) recommends 40g/day for healthy gut and heart.',
        benefit: 'Critical for heart health and diabetes management.',
    },
};

// ─── NOVA PROCESSING RESEARCH ──────────────────────────────────────────────────
export const NOVA_RESEARCH = {
    1: {
        label: 'Unprocessed/Natural',
        color: '#22c55e',
        desc: 'Plain foods from nature. No factory ingredients. The healthiest foundation.',
        impact: 'Safe and essential.'
    },
    2: {
        label: 'Processed Culinary',
        color: '#84cc16',
        desc: 'Extracted from nature (oils, flour, salt). Used for home cooking.',
        impact: 'Fine in moderation.'
    },
    3: {
        label: 'Processed',
        color: '#f59e0b',
        desc: 'Simple ingredients from Group 1 + 2. Preserved or seasoned.',
        impact: 'Read labels for salt/sugar.'
    },
    4: {
        label: '⚠️ Ultra-Processed (UPF)',
        icon: '🏭',
        color: '#ef4444',
        desc: 'Industrial formulations with chemicals (emulsifiers, dyes) never found in a home kitchen.',
        impact: 'Linked to 10% higher cancer risk (BMJ Study). Avoid where possible.',
        alarm: true
    }
};
