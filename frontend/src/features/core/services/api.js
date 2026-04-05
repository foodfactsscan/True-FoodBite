
const BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const PRODUCT_URL_V0 = 'https://world.openfoodfacts.org/api/v0/product';
const PRODUCT_URL_V2 = 'https://world.openfoodfacts.net/api/v2/product';
const INDIA_PRODUCT_URL = 'https://in.openfoodfacts.org/api/v0/product';

// Import Indian products database for barcode lookup
import { INDIAN_PRODUCTS_DB } from './indianProductsDb';

// Simple in-memory cache with localStorage fallback for persistence
const memoryCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for memory cache
const PERSISTENT_CACHE_KEY = 'factsscan_products_v1';

// Initialize persistent cache from localStorage
const getPersistentCache = () => {
    try {
        const stored = localStorage.getItem(PERSISTENT_CACHE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.warn('Failed to load persistent cache:', e);
        return {};
    }
};

const savePersistentCache = (cacheObj) => {
    try {
        localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(cacheObj));
    } catch (e) {
        console.warn('Failed to save persistent cache:', e);
        // If localStorage is full, we might want to clear old items here
        if (e.name === 'QuotaExceededError') {
            const keys = Object.keys(cacheObj);
            if (keys.length > 50) {
                const reducedCache = {};
                keys.slice(-50).forEach(k => reducedCache[k] = cacheObj[k]);
                localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(reducedCache));
            }
        }
    }
};

const getCached = (key) => {
    // Check memory first
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    // Check localStorage fallback
    const pCache = getPersistentCache();
    if (pCache[key]) {
        // Only return if not excessively old (e.g., 30 days)
        if (Date.now() - pCache[key].timestamp < 30 * 24 * 60 * 60 * 1000) {
            // Re-populate memory cache
            memoryCache.set(key, pCache[key]);
            return pCache[key].data;
        }
    }
    return null;
};

const setCache = (key, data, duration = CACHE_DURATION) => {
    const cacheEntry = { data, timestamp: Date.now() };
    memoryCache.set(key, cacheEntry);

    // Persist products specifically to localStorage for offline access
    if (key.startsWith('product_')) {
        const pCache = getPersistentCache();
        pCache[key] = cacheEntry;
        savePersistentCache(pCache);
    }
};

// Timeout wrapper for fetch with retry
const fetchWithTimeout = async (url, timeout = 12000, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'FactsScan/2.0 - Indian Food Scanner App - factsscan.com'
                }
            });
            clearTimeout(id);

            if (response.ok) {
                return response;
            }

            if (i < retries) {
                await new Promise(resolve => setTimeout(resolve, 800));
                continue;
            }

            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            clearTimeout(id);
            if (i === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
};

// Quick fetch with no retries (for parallel fallback calls)
const quickFetch = async (url, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'FactsScan/2.0 - Indian Food Scanner App' }
        });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        clearTimeout(id);
        return null;
    }
};

// Normalize product data to ensure all required fields exist
const normalizeProduct = (product) => {
    if (!product) return null;

    // Ensure nutriments object exists with all required fields
    const n = product.nutriments || {};
    product.nutriments = {
        energy_100g: n.energy_100g || n['energy-kcal_100g'] || 0,
        'energy-kcal_100g': n['energy-kcal_100g'] || n.energy_100g || 0,
        fat_100g: n.fat_100g || 0,
        'saturated-fat_100g': n['saturated-fat_100g'] || 0,
        sugars_100g: n.sugars_100g || 0,
        proteins_100g: n.proteins_100g || 0,
        fiber_100g: n.fiber_100g || 0,
        salt_100g: n.salt_100g || 0,
        sodium_100g: n.sodium_100g || (n.salt_100g ? n.salt_100g * 400 : 0),
        carbohydrates_100g: n.carbohydrates_100g || 0,
        ...n
    };

    // --- DEDUPLICATE NAME & BRAND ---
    // Universal logic to prevent "Pepsi Pepsi" or "7up 7up"
    if (product.product_name && product.brands) {
        const brand = product.brands.split(',')[0].trim().toLowerCase();
        let name = product.product_name.trim();
        let nameLower = name.toLowerCase();

        // If name starts with brand + space/separator (e.g. "7up - Sparkling")
        if (nameLower.startsWith(brand)) {
            let nextChar = nameLower.charAt(brand.length);
            // Check if it's a separator or space
            if (!nextChar || nextChar === ' ' || nextChar === '-' || nextChar === ':') {
                let stripped = name.substring(brand.length).trim();
                // Clean up leading separators: "- Sparkling" -> "Sparkling"
                if (stripped.startsWith('-') || stripped.startsWith(':')) {
                    stripped = stripped.substring(1).trim();
                }
                
                // Only use if we didn't destroy the name entirely
                if (stripped.length > 1) {
                    product.product_name = stripped;
                }
            }
        }
    }

    // Ensure nutrient_levels exists
    if (!product.nutrient_levels) {
        const fat = product.nutriments.fat_100g;
        const sugar = product.nutriments.sugars_100g;
        const salt = product.nutriments.salt_100g;
        const satFat = product.nutriments['saturated-fat_100g'];

        product.nutrient_levels = {
            fat: fat > 17.5 ? 'high' : fat > 3 ? 'moderate' : 'low',
            sugars: sugar > 22.5 ? 'high' : sugar > 5 ? 'moderate' : 'low',
            salt: salt > 1.5 ? 'high' : salt > 0.3 ? 'moderate' : 'low',
            'saturated-fat': satFat > 5 ? 'high' : satFat > 1.5 ? 'moderate' : 'low',
        };
    }

    // Ensure labels_tags is an array
    if (!product.labels_tags) product.labels_tags = [];
    if (!product.categories_tags) product.categories_tags = [];
    if (!product.additives_tags) product.additives_tags = [];

    // Ensure quantity is present (try to extract from name if missing)
    if (!product.quantity && !product.product_quantity && product.product_name) {
        // Regex to match quantity patterns: 50g, 50 g, 1kg, 1 kg, 500ml, 1 L, etc.
        const qtyMatch = product.product_name.match(/\b(\d+(\.\d+)?)\s*(g|kg|ml|l|L|Gm|Gms)\b/i);
        if (qtyMatch) {
            product.quantity = qtyMatch[0].replace(/\s+/g, '').toLowerCase(); // Normalize: " 50 g " -> "50g"
        }
    }

    return product;
};

// Check if product has meaningful data
const hasGoodData = (product) => {
    if (!product) return false;
    const n = product.nutriments || {};
    const hasNutrients = (n.energy_100g || n['energy-kcal_100g'] || n.fat_100g || n.proteins_100g);
    const hasName = product.product_name && product.product_name !== 'Unknown' && product.product_name.length > 1;
    return hasName && hasNutrients;
};

// Merge two product objects, preferring the one with more data
const mergeProducts = (primary, secondary) => {
    if (!secondary) return primary;
    if (!primary) return secondary;

    const merged = { ...primary };

    // Fill in missing fields from secondary
    if (!merged.image_front_url && secondary.image_front_url) merged.image_front_url = secondary.image_front_url;
    if (!merged.nutrition_grades && secondary.nutrition_grades) merged.nutrition_grades = secondary.nutrition_grades;
    if (!merged.nova_group && secondary.nova_group) merged.nova_group = secondary.nova_group;
    if (!merged.ingredients_text && secondary.ingredients_text) merged.ingredients_text = secondary.ingredients_text;
    if (!merged.allergens_tags?.length && secondary.allergens_tags?.length) merged.allergens_tags = secondary.allergens_tags;
    if (!merged.labels_tags?.length && secondary.labels_tags?.length) merged.labels_tags = secondary.labels_tags;
    if (!merged.categories && secondary.categories) merged.categories = secondary.categories;
    if (!merged.categories_tags?.length && secondary.categories_tags?.length) merged.categories_tags = secondary.categories_tags;
    if (!merged.additives_tags?.length && secondary.additives_tags?.length) merged.additives_tags = secondary.additives_tags;
    if (!merged.ingredients_analysis_tags?.length && secondary.ingredients_analysis_tags?.length) merged.ingredients_analysis_tags = secondary.ingredients_analysis_tags;
    if (!merged.quantity && secondary.quantity) merged.quantity = secondary.quantity;

    // If primary nutrients are mostly 0 but secondary has data, use secondary
    const pNut = merged.nutriments || {};
    const sNut = secondary.nutriments || {};
    const pHasData = (pNut.energy_100g || pNut.fat_100g || pNut.proteins_100g);
    const sHasData = (sNut.energy_100g || sNut.fat_100g || sNut.proteins_100g);

    if (!pHasData && sHasData) {
        merged.nutriments = { ...sNut };
    }

    return merged;
};

/**
 * MAIN PRODUCT LOOKUP - Multi-source search with smart fallback
 */
export const getProductByBarcode = async (barcode) => {
    const cacheKey = `product_${barcode}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    console.log(`🔍 Searching for barcode: ${barcode}`);

    // STEP 1: Check local Indian DB first (instant, 0ms)
    let localProduct = null;
    if (INDIAN_PRODUCTS_DB[barcode]) {
        console.log('✅ Found in local Indian DB:', barcode);
        localProduct = { ...INDIAN_PRODUCTS_DB[barcode] };
    }

    // STEP 2: Query multiple OpenFoodFacts sources IN PARALLEL
    const isIndianBarcode = barcode.startsWith('890');

    const apiCalls = [
        // World API v0 (most complete)
        quickFetch(`${PRODUCT_URL_V0}/${barcode}.json`),
        // World API v2 (newer data format)
        quickFetch(`${PRODUCT_URL_V2}/${barcode}?fields=product_name,brands,image_front_url,nutrition_grades,nova_group,nutriments,nutrient_levels,ingredients_text,allergens_tags,labels_tags,categories,categories_tags,additives_tags,ingredients_analysis_tags,quantity,serving_size,serving_quantity`),
    ];

    // Add India-specific API for Indian barcodes
    if (isIndianBarcode) {
        apiCalls.push(quickFetch(`${INDIA_PRODUCT_URL}/${barcode}.json`));
    }

    try {
        const results = await Promise.all(apiCalls);

        let bestProduct = localProduct;

        // Check each API result
        for (const data of results) {
            if (data && data.status === 1 && data.product && hasGoodData(data.product)) {
                if (!bestProduct || !hasGoodData(bestProduct)) {
                    bestProduct = data.product;
                } else {
                    // Merge for most complete data
                    bestProduct = mergeProducts(bestProduct, data.product);
                }
            }
        }

        if (bestProduct && hasGoodData(bestProduct)) {
            const normalized = normalizeProduct(bestProduct);
            const result = { status: 1, product: normalized };
            setCache(cacheKey, result);
            console.log('✅ Product found:', normalized.product_name);
            return result;
        }

        // If we have a local product even if API failed
        if (localProduct) {
            const normalized = normalizeProduct(localProduct);
            const result = { status: 1, product: normalized };
            setCache(cacheKey, result);
            return result;
        }

    } catch (error) {
        console.warn('API calls failed:', error.message);

        // Return local product if available
        if (localProduct) {
            const normalized = normalizeProduct(localProduct);
            const result = { status: 1, product: normalized };
            setCache(cacheKey, result);
            return result;
        }
    }

    // STEP 3: Try one more time with direct v0 call (with retries)
    try {
        const response = await fetchWithTimeout(`${PRODUCT_URL_V0}/${barcode}.json`, 15000, 3);
        const data = await response.json();
        if (data.status === 1 && data.product) {
            const normalized = normalizeProduct(data.product);
            const result = { status: 1, product: normalized };
            setCache(cacheKey, result);
            console.log('✅ Product found on retry:', normalized.product_name);
            return result;
        }
    } catch (error) {
        console.warn('Retry also failed:', error.message);
    }

    // STEP 5: AI Fallback - Use Gemini to search for product
    console.log('🤖 Trying AI-powered search...');
    try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${BACKEND_URL}/api/products/${barcode}`);

        if (response.ok) {
            const data = await response.json();
            if (data.status === 1 && data.product) {
                const normalized = normalizeProduct(data.product);
                const result = {
                    status: 1,
                    product: { ...normalized, ai_generated: true }
                };
                setCache(cacheKey, result, 7200000); // Cache for 2 hours only
                console.log('✅ AI found product:', normalized.product_name);
                return result;
            }
        }
    } catch (error) {
        console.warn('AI search failed:', error.message);
    }

    // STEP 6: Product not found anywhere
    console.log('❌ Product not found:', barcode);
    return null;
};

// Common Indian brand aliases / misspellings → correct name
const BRAND_ALIASES = {
    'maggie': 'maggi', 'meggi': 'maggi', 'magi': 'maggi',
    'amool': 'amul', 'amull': 'amul',
    'haldiran': 'haldiram', 'haldirams': 'haldiram', 'haldiramms': 'haldiram',
    'parlé': 'parle', 'parleg': 'parle-g', 'parle g': 'parle-g',
    'brittania': 'britannia', 'britania': 'britannia',
    'cadburry': 'cadbury', 'cadberry': 'cadbury',
    'nestle india': 'nestle', 'nestlé': 'nestle',
    'dabuur': 'dabur', 'dabar': 'dabur',
    'patanjali': 'patanjali', 'patnjali': 'patanjali',
    'itc sunfeast': 'sunfeast', 'sun feast': 'sunfeast',
    'mtr foods': 'mtr', 'mtr ready to eat': 'mtr',
    'mother dairy': 'mother dairy', 'motherdairy': 'mother dairy',
    'kissan': 'kissan', 'kisan': 'kissan',
    'saffolla': 'saffola', 'safola': 'saffola',
    'bournvita': 'bournvita', 'bornvita': 'bournvita',
    'boost health': 'boost', 'bost': 'boost',
    'horlics': 'horlicks', 'horlix': 'horlicks',
    'complan': 'complan', 'complain': 'complan',
    'frooti': 'frooti', 'fruiti': 'frooti',
    'maaza': 'maaza', 'maza': 'maaza',
    'thumsup': 'thums up', 'thumbs up': 'thums up',
    'kurkurey': 'kurkure', 'kurkurae': 'kurkure',
    'yipee': 'yippee', 'yippy': 'yippee', 'yippie': 'yippee',
    'top raman': 'top ramen', 'topramen': 'top ramen',
    'bikano': 'bikano', 'bikanoo': 'bikano',
    'paperboat': 'paper boat', 'paper-boat': 'paper boat',
    'lijjat': 'lijjat', 'lijat': 'lijjat',
    'everest masala': 'everest', 'mdh masala': 'mdh',
    'aashirvaad': 'aashirvaad', 'ashirwad': 'aashirvaad', 'ashirvad': 'aashirvaad',
    'fortune oil': 'fortune', 'fortune foods': 'fortune',
    'tata salt': 'tata', 'tata tea': 'tata', 'tata sampann': 'tata',
};

function normalizeQuery(q) {
    let lower = q.toLowerCase().trim();
    // Check brand aliases
    for (const [alias, correct] of Object.entries(BRAND_ALIASES)) {
        if (lower === alias || lower.includes(alias)) {
            lower = lower.replace(alias, correct);
        }
    }
    return lower;
}

// Search local Indian DB with fuzzy matching (name, brand, category, ingredients)
function searchLocalDB(query) {
    const q = normalizeQuery(query);
    const queryWords = q.split(/\s+/).filter(w => w.length >= 2);
    const matches = [];

    for (const [, product] of Object.entries(INDIAN_PRODUCTS_DB)) {
        const name = (product.product_name || '').toLowerCase();
        const brand = (product.brands || '').toLowerCase();
        const categories = (product.categories || '').toLowerCase();
        const ingredients = (product.ingredients_text || '').toLowerCase();
        const searchable = `${name} ${brand} ${categories} ${ingredients}`;

        // Exact substring match (highest priority)
        if (name.includes(q) || brand.includes(q)) {
            matches.push({ product, score: 100 });
            continue;
        }

        // All query words found in product data
        const wordMatches = queryWords.filter(w => searchable.includes(w));
        if (wordMatches.length === queryWords.length) {
            matches.push({ product, score: 80 });
        } else if (wordMatches.length > 0 && wordMatches.length >= queryWords.length * 0.6) {
            matches.push({ product, score: 50 + (wordMatches.length / queryWords.length) * 30 });
        }
    }

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score).map(m => m.product);
}

export const searchProducts = async (query, filters = {}, page = 1) => {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}_${page}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        // If query is a barcode (numeric), search by barcode first
        if (/^\d{8,14}$/.test(query)) {
            const barcodeResult = await getProductByBarcode(query);
            if (barcodeResult && barcodeResult.status === 1) {
                return { products: [barcodeResult.product], count: 1 };
            }
        }

        // Normalize query (fix misspellings, brand aliases)
        const normalizedQuery = normalizeQuery(query);

        // Search local DB with fuzzy matching
        const localMatches = searchLocalDB(query);

        // Build API URL
        let url = `${BASE_URL}?search_terms=${encodeURIComponent(normalizedQuery)}&search_simple=1&action=process&json=1&page=${page}&page_size=24&sort_by=popularity`;

        let filterIdx = 0;
        if (filters.vegetarian) {
            url += `&tagtype_${filterIdx}=labels&tag_contains_${filterIdx}=contains&tag_${filterIdx}=vegetarian`;
            filterIdx++;
        }

        // India-specific search URL (using proper tag filter syntax)
        const indiaUrl = url + `&tagtype_${filterIdx}=countries&tag_contains_${filterIdx}=contains&tag_${filterIdx}=india`;

        // Run India + global searches in parallel for speed
        let indiaProducts = [];
        let globalProducts = [];
        let totalCount = 0;

        const [indiaResult, globalResult] = await Promise.allSettled([
            fetchWithTimeout(indiaUrl, 10000).then(r => r.json()),
            fetchWithTimeout(url, 10000).then(r => r.json()),
        ]);

        if (indiaResult.status === 'fulfilled' && indiaResult.value?.products?.length > 0) {
            indiaProducts = indiaResult.value.products;
            totalCount = indiaResult.value.count || indiaProducts.length;
        }

        if (globalResult.status === 'fulfilled' && globalResult.value?.products?.length > 0) {
            globalProducts = globalResult.value.products;
            totalCount = Math.max(totalCount, globalResult.value.count || 0);
        }

        // Merge: Local DB first → Indian API → Global API (deduplicated)
        const seen = new Set();
        const products = [];

        const addProduct = (p) => {
            const id = p._id || p.code;
            if (id && !seen.has(id)) { seen.add(id); products.push(p); }
        };

        // 1. Local DB matches first (verified Indian products)
        localMatches.forEach(addProduct);
        // 2. India API results (confirmed Indian products from OpenFoodFacts)
        indiaProducts.forEach(addProduct);
        // 3. Global results (fill remaining)
        globalProducts.forEach(addProduct);

        totalCount = Math.max(totalCount, products.length);

        const result = { products, count: totalCount };
        setCache(cacheKey, result);
        return result;

    } catch (error) {
        console.error("Error searching products:", error);

        // Offline fallback: local DB search
        const localMatches = searchLocalDB(query);
        if (localMatches.length > 0) {
            return { products: localMatches, count: localMatches.length };
        }
        return { products: [], count: 0 };
    }
};

// Category browsing with India-first approach
export const getProductsByCategory = async (category, page = 1) => {
    const cacheKey = `category_${category}_${page}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const categoryMapping = {
            'snacks': 'snacks',
            'beverages': 'beverages',
            'dairies': 'dairies',
            'fruits': 'fruits',
            'cereals-and-potatoes': 'cereals-and-potatoes',
            'plant-based-foods': 'plant-based-foods-and-beverages',
            'meats': 'meats',
            'seafood': 'seafood'
        };

        const offCategory = categoryMapping[category] || category;

        // Try India-specific first (using proper tag filter syntax)
        const url = `${BASE_URL}?tagtype_0=categories&tag_contains_0=contains&tag_0=${offCategory}&tagtype_1=countries&tag_contains_1=contains&tag_1=india&action=process&json=1&page=${page}&page_size=24&sort_by=unique_scans_n`;

        const response = await fetchWithTimeout(url, 12000);
        const data = await response.json();

        // If no India results, try global
        if (!data.products || data.products.length === 0) {
            const globalUrl = `${BASE_URL}?tagtype_0=categories&tag_contains_0=contains&tag_0=${offCategory}&action=process&json=1&page=${page}&page_size=24&sort_by=unique_scans_n`;

            const globalResponse = await fetchWithTimeout(globalUrl, 12000);
            const globalData = await globalResponse.json();

            const result = {
                products: globalData.products || [],
                count: globalData.count || 0
            };
            setCache(cacheKey, result);
            return result;
        }

        const result = {
            products: data.products || [],
            count: data.count || 0
        };
        setCache(cacheKey, result);
        return result;

    } catch (error) {
        console.error("Error fetching category:", error);
        return { products: [], count: 0 };
    }
};

// Expert curated product lists
export const getExpertCuratedProducts = async (type) => {
    const cacheKey = `expert_${type}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        let url = `${BASE_URL}?action=process&json=1&page_size=24&sort_by=unique_scans_n`;

        switch (type) {
            case 'high-protein':
                url += `&tagtype_0=categories&tag_contains_0=contains&tag_0=high-protein&tagtype_1=nutrition_grades&tag_contains_1=contains&tag_1=a`;
                break;
            case 'low-sugar':
                url += `&nutriment_0=sugars&nutriment_compare_0=lt&nutriment_value_0=5&tagtype_0=nutrition_grades&tag_contains_0=contains&tag_0=a`;
                break;
            case 'high-fiber':
                url += `&nutriment_0=fiber&nutriment_compare_0=gt&nutriment_value_0=5&tagtype_0=nutrition_grades&tag_contains_0=contains&tag_0=a`;
                break;
            case 'low-fat':
                url += `&nutriment_0=fat&nutriment_compare_0=lt&nutriment_value_0=3&tagtype_0=nutrition_grades&tag_contains_0=contains&tag_0=a`;
                break;
            default:
                return { products: [], count: 0 };
        }

        const response = await fetchWithTimeout(url, 12000);
        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            let broaderUrl = `${BASE_URL}?action=process&json=1&page_size=24&sort_by=unique_scans_n`;

            switch (type) {
                case 'high-protein':
                    broaderUrl += `&tagtype_0=categories&tag_contains_0=contains&tag_0=high-protein`;
                    break;
                case 'low-sugar':
                    broaderUrl += `&nutriment_0=sugars&nutriment_compare_0=lt&nutriment_value_0=10`;
                    break;
                case 'high-fiber':
                    broaderUrl += `&tagtype_0=categories&tag_contains_0=contains&tag_0=high-fiber`;
                    break;
                case 'low-fat':
                    broaderUrl += `&nutriment_0=fat&nutriment_compare_0=lt&nutriment_value_0=5`;
                    break;
            }

            const broaderResponse = await fetchWithTimeout(broaderUrl, 12000);
            const broaderData = await broaderResponse.json();

            const result = {
                products: broaderData.products || [],
                count: broaderData.count || 0
            };
            setCache(cacheKey, result);
            return result;
        }

        const result = {
            products: data.products || [],
            count: data.count || 0
        };
        setCache(cacheKey, result);
        return result;

    } catch (error) {
        console.error("Error fetching expert curated:", error);
        return { products: [], count: 0 };
    }
};

export const getHealthierAlternatives = async (category, currentGrade) => {
    if (!category) return [];

    const cacheKey = `alternatives_${category}_${currentGrade}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        // Clean category tag
        const cleanCat = category.replace('en:', '');

        // Fetch grade A, B, and C alternatives in parallel — max results
        const [dataA, dataB, dataC] = await Promise.all([
            quickFetch(`${BASE_URL}?tagtype_0=categories&tag_contains_0=contains&tag_0=${cleanCat}&tagtype_1=nutrition_grades&tag_contains_1=contains&tag_1=a&action=process&json=1&page_size=50&sort_by=unique_scans_n`),
            quickFetch(`${BASE_URL}?tagtype_0=categories&tag_contains_0=contains&tag_0=${cleanCat}&tagtype_1=nutrition_grades&tag_contains_1=contains&tag_1=b&action=process&json=1&page_size=50&sort_by=unique_scans_n`),
            quickFetch(`${BASE_URL}?tagtype_0=categories&tag_contains_0=contains&tag_0=${cleanCat}&tagtype_1=nutrition_grades&tag_contains_1=contains&tag_1=c&action=process&json=1&page_size=50&sort_by=unique_scans_n`),
        ]);

        let allProducts = [
            ...(dataA?.products || []),
            ...(dataB?.products || []),
            ...(dataC?.products || []),
        ];

        // If very few results, try broader category (remove prefix like en:)
        // FIXED: Only broaden if category is very specific (3+ parts) to avoid mixing unrelated items
        if (allProducts.length < 3 && cleanCat.split('-').length > 2) {
            const broadCat = cleanCat.split('-').slice(0, 2).join('-');
            const broadData = await quickFetch(`${BASE_URL}?tagtype_0=categories&tag_contains_0=contains&tag_0=${broadCat}&tagtype_1=nutrition_grades&tag_contains_1=contains&tag_1=a&action=process&json=1&page_size=50&sort_by=unique_scans_n`);
            if (broadData?.products) {
                // Filter broader results to ensure they still relate to original category
                // e.g. if original is 'instant-noodles', 'noodles' is fine.
                // But 'plant-based-foods' -> 'plant-based' is too broad.
                const relevant = broadData.products.filter(p =>
                    (p.categories_tags || []).some(t => t.includes(cleanCat.split('-')[0]))
                );
                allProducts = [...allProducts, ...relevant];
            }
        }

        // Filter: must have name and preferably an image
        const filtered = allProducts.filter(p =>
            p.product_name &&
            p.product_name.length > 1 &&
            p.product_name !== 'Unknown'
        );

        // Deduplicate by ID
        const seen = new Set();
        const unique = filtered.filter(p => {
            const id = p._id || p.code;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        // Sort ascending by grade: A first (healthiest) → B → C
        const gradeOrder = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4 };
        unique.sort((a, b) => {
            const gradeA = gradeOrder[a.nutrition_grades] ?? 5;
            const gradeB = gradeOrder[b.nutrition_grades] ?? 5;
            if (gradeA !== gradeB) return gradeA - gradeB;
            // Within same grade, prefer products with images
            const aHasImg = a.image_front_url || a.image_front_small_url ? 0 : 1;
            const bHasImg = b.image_front_url || b.image_front_small_url ? 0 : 1;
            return aHasImg - bHasImg;
        });

        return unique.slice(0, 50); // Limit to 50 best alternatives

    } catch (error) {
        console.error("Error fetching alternatives:", error);
        return [];
    }
};
