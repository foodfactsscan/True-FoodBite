/**
 * ============================================================
 * FoodBite Timing & Season Intelligence Engine
 * ============================================================
 * Based on: Ayurvedic principles, Indian Dietetics (NIN Hyderabad),
 * Sports Nutrition science, and Indian climate data.
 *
 * Factors analyzed:
 *  1. TIME OF DAY  — Morning / Afternoon / Evening / Night
 *  2. SEASON       — Summer / Monsoon / Winter (Indian Climate Calendar)
 *  3. PRODUCT TYPE — High-sugar, High-fat, High-protein, Fried, Dairy, etc.
 * ============================================================
 */

// ─── Time Slot Definitions ────────────────────────────────────────────────────
export const TIME_SLOTS = {
    EARLY_MORNING: { label: 'Early Morning', icon: '🌅', hours: [5, 6, 7] },
    MORNING:       { label: 'Morning',       icon: '☀️',  hours: [8, 9, 10] },
    MIDDAY:        { label: 'Midday',        icon: '🌞',  hours: [11, 12, 13] },
    AFTERNOON:     { label: 'Afternoon',     icon: '🌤️', hours: [14, 15, 16] },
    EVENING:       { label: 'Evening',       icon: '🌆',  hours: [17, 18, 19] },
    NIGHT:         { label: 'Night',         icon: '🌙',  hours: [20, 21, 22] },
    LATE_NIGHT:    { label: 'Late Night',    icon: '🌌',  hours: [23, 0, 1, 2, 3, 4] },
};

// ─── Indian Season Definitions (Based on IMD Calendar) ───────────────────────
export const SEASONS = {
    SUMMER:  { label: 'Summer',      icon: '🌡️', months: [3, 4, 5] },        // Mar–May
    MONSOON: { label: 'Monsoon',     icon: '🌧️', months: [6, 7, 8, 9] },    // Jun–Sep
    AUTUMN:  { label: 'Post-Monsoon',icon: '🍂',  months: [10, 11] },         // Oct–Nov
    WINTER:  { label: 'Winter',      icon: '❄️', months: [12, 1, 2] },       // Dec–Feb
};

/**
 * Get the current time slot
 * @returns {object} - current slot info
 */
export function getCurrentTimeSlot() {
    const hour = new Date().getHours();
    for (const [key, slot] of Object.entries(TIME_SLOTS)) {
        if (slot.hours.includes(hour)) return { key, ...slot };
    }
    return { key: 'NIGHT', ...TIME_SLOTS.NIGHT };
}

/**
 * Get the current Indian season
 * @returns {object} - current season info
 */
export function getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-indexed
    for (const [key, season] of Object.entries(SEASONS)) {
        if (season.months.includes(month)) return { key, ...season };
    }
    return { key: 'SUMMER', ...SEASONS.SUMMER };
}

/**
 * Classify a food product based on its nutritional profile
 * @param {object} product - OpenFoodFacts product object
 * @returns {object} - classification flags
 */
export function classifyProduct(product) {
    const n = product.nutriments || {};
    const ingredientText = (product.ingredients_text || '').toLowerCase();
    const categories = (product.categories_tags || []).join(' ').toLowerCase();
    const nova = product.nova_group || 3;

    const sugar = n.sugars_100g ?? 0;
    const fat = n.fat_100g ?? 0;
    const satFat = n['saturated-fat_100g'] ?? 0;
    const protein = n.proteins_100g ?? 0;
    const fiber = n.fiber_100g ?? 0;
    const sodium = n.sodium_100g ?? 0;
    const kcal = n['energy-kcal_100g'] ?? 0;
    const carbs = n.carbohydrates_100g ?? 0;

    const isBeverage = categories.includes('beverage') || categories.includes('drink')
        || categories.includes('juice') || categories.includes('soda');
    const isDairy = categories.includes('dairy') || categories.includes('milk')
        || ingredientText.includes('milk') || ingredientText.includes('curd') || ingredientText.includes('yogurt');
    const isFried = ingredientText.includes('fried') || ingredientText.includes('crispy')
        || categories.includes('chips') || categories.includes('snack');
    const isSweet = categories.includes('chocolate') || categories.includes('candy')
        || categories.includes('biscuit') || categories.includes('sweet') || categories.includes('dessert');
    const isCaffeinated = ingredientText.includes('caffeine') || ingredientText.includes('coffee')
        || ingredientText.includes('tea') || categories.includes('energy drink');
    const isHighProtein = protein > 15;
    const isHighFiber = fiber > 5;
    const isHighSugar = sugar > 20;
    const isHighFat = fat > 20 || satFat > 7;
    const isHighSodium = sodium > 0.4;
    const isUPF = nova === 4;
    const isHighCalorie = kcal > 400;
    const isLowCalorie = kcal < 100 && kcal > 0;
    const isCarbHeavy = carbs > 40 && fiber < 3;

    return {
        isBeverage, isDairy, isFried, isSweet, isCaffeinated,
        isHighProtein, isHighFiber, isHighSugar, isHighFat,
        isHighSodium, isUPF, isHighCalorie, isLowCalorie, isCarbHeavy,
        sugar, fat, satFat, protein, fiber, sodium, kcal, carbs, nova
    };
}

/**
 * Generate time-of-day + seasonal advice for a product
 * @param {object} product - OpenFoodFacts product
 * @returns {object} { timeAdvice, seasonAdvice, overallRating, bestTime, worstTime }
 */
export function generateFoodTimingAdvice(product) {
    const c = classifyProduct(product);
    const slot = getCurrentTimeSlot();
    const season = getCurrentSeason();

    const timeAdvice = getTimeAdvice(c, slot);
    const seasonAdvice = getSeasonAdvice(c, season);
    const bestTime = getBestConsumptionTime(c);
    const worstTime = getWorstConsumptionTime(c);

    return {
        currentSlot: slot,
        currentSeason: season,
        timeAdvice,
        seasonAdvice,
        bestTime,
        worstTime,
    };
}

// ─── Time-of-Day Analysis ─────────────────────────────────────────────────────

function getTimeAdvice(c, slot) {
    const { key } = slot;
    const advices = [];

    // === EARLY MORNING (5–7 AM) ===
    if (key === 'EARLY_MORNING') {
        if (c.isDairy) advices.push({ severity: 'warning', text: 'Dairy is best consumed after sunrise; heavy on an empty stomach.' });
        if (c.isCaffeinated) advices.push({ severity: 'danger', text: '☕ Caffeine on an empty stomach spikes cortisol — wait until 9–11 AM.' });
        if (c.isFried) advices.push({ severity: 'danger', text: '🍟 Fried foods are very hard to digest at dawn — avoid on empty stomach.' });
        if (c.isHighSugar) advices.push({ severity: 'danger', text: '🍬 High sugar first thing causes insulin spike and energy crash by mid-morning.' });
        if (c.isHighProtein && !c.isUPF) advices.push({ severity: 'safe', text: '💪 Protein early morning is excellent for metabolism activation.' });
        if (c.isHighFiber && !c.isUPF) advices.push({ severity: 'safe', text: '🌾 High fibre in the morning keeps you satiated longer throughout the day.' });
        if (advices.length === 0) advices.push({ severity: 'neutral', text: 'Reasonable for early morning if consumed in small portions.' });
    }

    // === MORNING (8–10 AM) ===
    else if (key === 'MORNING') {
        if (c.isHighCalorie && !c.isHighProtein) advices.push({ severity: 'warning', text: 'High-calorie foods in the morning are okay only if the day is very active.' });
        if (c.isCaffeinated) advices.push({ severity: 'safe', text: '☕ 9–11 AM is the optimal time for caffeine — cortisol is naturally dropping.' });
        if (c.isHighSugar) advices.push({ severity: 'warning', text: '🍬 Sugar in morning is burnt off during the day — manageable but not ideal daily.' });
        if (c.isFried) advices.push({ severity: 'warning', text: 'Fried foods in morning will cause sluggishness — better reserved for lunch.' });
        if (c.isHighProtein && c.isHighFiber) advices.push({ severity: 'safe', text: '✅ Perfect morning food — protein + fibre for sustained energy and focus.' });
        if (advices.length === 0) advices.push({ severity: 'safe', text: 'Morning is a generally good time for most foods.' });
    }

    // === MIDDAY (11 AM–1 PM) ===
    else if (key === 'MIDDAY') {
        if (c.isFried) advices.push({ severity: 'safe', text: '🌞 Midday is the best time for heavier fried foods — digestion is strongest.' });
        if (c.isDairy) advices.push({ severity: 'safe', text: '🥛 Dairy digests best at midday when digestive enzymes are at peak.' });
        if (c.isHighCalorie) advices.push({ severity: 'warning', text: '⚠️ High calories at lunch: ensure you are physically active in the afternoon.' });
        if (c.isHighSugar) advices.push({ severity: 'warning', text: 'High sugar at lunch causes a post-lunch energy crash. Opt for complex carbs.' });
        if (c.isHighProtein) advices.push({ severity: 'safe', text: '💪 Great protein timing for muscle repair and sustained afternoon performance.' });
        if (advices.length === 0) advices.push({ severity: 'safe', text: 'Suitable for midday consumption.' });
    }

    // === AFTERNOON (2–4 PM) ===
    else if (key === 'AFTERNOON') {
        if (c.isSweet || c.isHighSugar) advices.push({ severity: 'warning', text: '🍫 Sweet cravings are natural at 3 PM but high-sugar snacks lead to a 4 PM slump.' });
        if (c.isCaffeinated) advices.push({ severity: 'warning', text: '⚠️ Caffeine after 3 PM disrupts sleep onset. Use sparingly.' });
        if (c.isHighProtein && c.isLowCalorie) advices.push({ severity: 'safe', text: '✅ High-protein low-calorie snack — ideal afternoon fix.' });
        if (c.isFried && c.isHighCalorie) advices.push({ severity: 'danger', text: 'Heavy fried snacks in the afternoon will spike triglycerides and cause fatigue.' });
        if (c.isHighFiber) advices.push({ severity: 'safe', text: '🌾 Good fibre now maintains afternoon energy and prevents overeating at dinner.' });
        if (advices.length === 0) advices.push({ severity: 'safe', text: 'Reasonable for afternoon snacking in moderation.' });
    }

    // === EVENING (5–7 PM) ===
    else if (key === 'EVENING') {
        if (c.isHighCalorie && c.isHighFat) advices.push({ severity: 'danger', text: '⚠️ Very high calorie + high fat in the evening gets stored as fat — metabolism slows.' });
        if (c.isDairy && !c.isHighFat) advices.push({ severity: 'safe', text: '🥛 Light dairy in the evening is traditional and healthy (eg. warm milk, lassi).' });
        if (c.isCaffeinated) advices.push({ severity: 'danger', text: '🚫 Avoid caffeine after 5 PM — disrupts melatonin and deep sleep quality.' });
        if (c.isHighSodium) advices.push({ severity: 'warning', text: '🧂 High sodium in the evening causes overnight water retention and blood pressure risk.' });
        if (c.isHighProtein) advices.push({ severity: 'safe', text: '💪 Evening protein intake supports overnight muscle repair — excellent timing.' });
        if (advices.length === 0) advices.push({ severity: 'neutral', text: 'Moderate evening snack — keep portions controlled.' });
    }

    // === NIGHT (8–10 PM) ===
    else if (key === 'NIGHT') {
        if (c.isHighCalorie) advices.push({ severity: 'danger', text: '🛑 High calories at night: metabolism is at its lowest — high fat storage risk.' });
        if (c.isHighSugar) advices.push({ severity: 'danger', text: '🚫 Sugar at night spikes insulin when body needs stable glucose for sleep.' });
        if (c.isFried) advices.push({ severity: 'danger', text: '🚫 Fried food at night: extremely difficult to digest, causes acid reflux and weight gain.' });
        if (c.isCaffeinated) advices.push({ severity: 'danger', text: '🚫 Caffeine at night — severely disrupts circadian rhythm and sleep quality.' });
        if (c.isDairy && !c.isHighFat) advices.push({ severity: 'safe', text: '✅ Warm milk at night: promotes melatonin via tryptophan — excellent sleep aid.' });
        if (c.isHighProtein && !c.isUPF) advices.push({ severity: 'safe', text: '✅ Protein at night (non-UPF) supports overnight muscle protein synthesis.' });
        if (advices.length === 0) advices.push({ severity: 'warning', text: 'Night eating should be light — digestive system is resting.' });
    }

    // === LATE NIGHT (11 PM–4 AM) ===
    else if (key === 'LATE_NIGHT') {
        advices.push({ severity: 'danger', text: '🚫 Late-night eating bypasses your body\'s fat-burning window and disrupts sleep hormones. Avoid.' });
        if (c.isHighFat || c.isFried) advices.push({ severity: 'danger', text: 'Fatty/fried foods at this hour are linked to fatty liver risk and severe indigestion.' });
    }

    return advices;
}

// ─── Season Analysis ──────────────────────────────────────────────────────────

function getSeasonAdvice(c, season) {
    const { key } = season;
    const advices = [];

    // === SUMMER (Mar–May) ===
    if (key === 'SUMMER') {
        if (c.isHighSodium) advices.push({ severity: 'warning', text: '🌡️ Salt raises blood pressure, especially risky in summer heat. Limit intake.' });
        if (c.isCaffeinated) advices.push({ severity: 'danger', text: '☕ Caffeine is dehydrating — dangerous in extreme summer heat. Drink extra water.' });
        if (c.isFried) advices.push({ severity: 'danger', text: '🔥 Fried foods increase body heat (pitta). Avoid to prevent heat rash and skin issues.' });
        if (c.isHighFiber && !c.isUPF) advices.push({ severity: 'safe', text: '🥗 Fibre-rich foods in summer aid digestion which slows in heat. Excellent choice.' });
        if (c.isBeverage && c.isHighSugar) advices.push({ severity: 'danger', text: '🥤 Sugary drinks in summer: temporarily cooling but worsen dehydration. Opt for nimbu pani/coconut water.' });
        if (c.isDairy) advices.push({ severity: 'warning', text: '🥛 Heavy dairy in peak summer can cause bloating. Curd/lassi is better than cold milk.' });
    }

    // === MONSOON (Jun–Sep) ===
    else if (key === 'MONSOON') {
        if (c.isFried) advices.push({ severity: 'warning', text: '🌧️ Fried snacks are popular in monsoon but increase digestive infections risk. Consume fresh and hot.' });
        if (isDairyAndHeavy(c)) advices.push({ severity: 'danger', text: '⚠️ Heavy dairy in monsoon spoils faster and is linked to higher gut infection rates.' });
        if (c.isUPF) advices.push({ severity: 'danger', text: '🏭 Ultra-processed foods in monsoon worsen immunity — season demands immune-boosting foods.' });
        if (c.isHighFiber && !c.isFried) advices.push({ severity: 'safe', text: '✅ Fibre keeps digestion robust during monsoon when gut bacteria shift.' });
        if (c.isHighProtein && !c.isUPF) advices.push({ severity: 'safe', text: '💪 Protein maintains immunity during monsoon illnesses prevalence. Good choice.' });
    }

    // === AUTUMN / POST-MONSOON (Oct–Nov) ===
    else if (key === 'AUTUMN') {
        if (c.isHighSugar) advices.push({ severity: 'warning', text: 'Festival season sugars: enjoyable but watch frequency — post-monsoon metabolism is adjusting.' });
        if (c.isHighProtein) advices.push({ severity: 'safe', text: '✅ Protein helps rebuild energy reserves after the monsoon period.' });
        if (advices.length === 0) advices.push({ severity: 'safe', text: '🍂 Post-monsoon season: most foods are well-tolerated. Season of balanced digestion.' });
    }

    // === WINTER (Dec–Feb) ===
    else if (key === 'WINTER') {
        if (c.isFried && !c.isUPF) advices.push({ severity: 'safe', text: '✅ Winter is the best time for occasional fried food — high metabolism handles it better.' });
        if (c.isDairy) advices.push({ severity: 'safe', text: '🥛 Dairy is excellent in winter — nourishing, warming, and easy to digest.' });
        if (c.isHighCalorie && !c.isUPF) advices.push({ severity: 'safe', text: '✅ Higher calorie intake in winter is natural — body generates heat from food. Acceptable.' });
        if (c.isBeverage && !c.isDairy) advices.push({ severity: 'warning', text: '🧊 Cold beverages in winter weaken digestion. Prefer warm versions.' });
        if (c.isUPF) advices.push({ severity: 'warning', text: '🏭 UPF foods offer no warmth or nourishment in winter. Choose whole foods.' });
    }

    if (advices.length === 0) {
        advices.push({ severity: 'neutral', text: `Generally suitable for ${season.label} season.` });
    }
    return advices;
}

function isDairyAndHeavy(c) {
    return c.isDairy && (c.isHighFat || c.isHighCalorie);
}

// ─── Best / Worst Time Recommendations ───────────────────────────────────────

function getBestConsumptionTime(c) {
    if (c.isHighProtein && c.isHighFiber) return { slot: 'Morning (8–10 AM)', icon: '☀️', reason: 'Maximum metabolic benefit — sustains energy all day.' };
    if (c.isFried && !c.isUPF) return { slot: 'Midday (12–1 PM)', icon: '🌞', reason: 'Digestive fire is strongest at noon — best time for heavy foods.' };
    if (c.isDairy && !c.isHighFat) return { slot: 'Night (before sleep)', icon: '🌙', reason: 'Tryptophan in dairy promotes melatonin for restful sleep.' };
    if (c.isCaffeinated) return { slot: 'Morning (9–11 AM)', icon: '☕', reason: 'Cortisol drops here — caffeine works best without anxiety.' };
    if (c.isHighSugar) return { slot: 'Midday (12–2 PM)', icon: '🌞', reason: 'Blood sugar is managed better at peak metabolic activity.' };
    if (c.isHighCalorie) return { slot: 'Lunch (12–1 PM)', icon: '🍽️', reason: 'Calories used as fuel during afternoon activity.' };
    return { slot: 'Morning or Midday', icon: '☀️', reason: 'General foods are best early in the day for optimal metabolism.' };
}

function getWorstConsumptionTime(c) {
    if (c.isHighSugar || c.isFried || c.isHighFat) return { slot: 'Late Night (11 PM+)', icon: '🌌', reason: 'Metabolism is at its slowest — causes fat storage and sleep disruption.' };
    if (c.isCaffeinated) return { slot: 'Evening / Night (5 PM+)', icon: '🌙', reason: 'Disrupts melatonin and circadian clock, damaging sleep quality.' };
    if (c.isHighSodium) return { slot: 'Night (after 8 PM)', icon: '🧂', reason: 'Overnight salt retention causes morning puffiness and BP spikes.' };
    if (c.isDairy && c.isHighFat) return { slot: 'Early Morning (empty stomach)', icon: '🌅', reason: 'Heavy dairy is hard to digest and can cause nausea on empty stomach.' };
    return { slot: 'Late Night', icon: '🌌', reason: 'Eating late at night increases calorie storage regardless of food type.' };
}
