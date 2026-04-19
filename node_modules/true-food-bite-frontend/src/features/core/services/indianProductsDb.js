
// Massive database of popular Indian products for fallback
// Categories: Biscuits, Snacks, Beverages, Chocolates, Dairy, Instant Food, Staples

export const INDIAN_PRODUCTS_DB = {
    // --- BISCUITS & COOKIES ---
    '8901063010031': {
        _id: '8901063010031',
        product_name: 'Parle-G Original Gluco Biscuits',
        quantity: '65g',
        brands: 'Parle',
        image_front_url: 'https://placehold.co/400x400/ea580c/ffffff?text=Parle-G',
        nutrition_grades: 'c',
        nova_group: 4,
        nutriments: { energy_100g: 1950, fat_100g: 12.5, 'saturated-fat_100g': 4.2, sugars_100g: 22.8, proteins_100g: 7.2, fiber_100g: 2.1, salt_100g: 0.8, sodium_100g: 320 },
        nutrient_levels: { fat: 'moderate', sugars: 'high', salt: 'low' },
        ingredients_text: 'Wheat Flour, Sugar, Edible Vegetable Oil (Palm Oil), Invert Sugar Syrup, Leavening Agents (E500ii, E503ii), Milk Solids, Salt, Emulsifiers (E322)',
        additives_tags: ['en:e500ii', 'en:e503ii', 'en:e322'],
        labels_tags: ['vegetarian'],
        categories: 'Biscuits, Sweet Biscuits',
        categories_tags: ['en:biscuits', 'en:sweet-biscuits']
    },
    '8901063034266': {
        _id: '8901063034266',
        product_name: 'Britannia Good Day Butter Cookies',
        quantity: '75g',
        brands: 'Britannia',
        image_front_url: 'https://placehold.co/400x400/f59e0b/ffffff?text=Good+Day',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2100, fat_100g: 22.5, sugars_100g: 26.5, proteins_100g: 6.8, fiber_100g: 1.5, salt_100g: 0.7 },
        ingredients_text: 'Refined Wheat Flour, Sugar, Palm Oil, Butter, Milk Solids, Invert Syrup, Salt, Emulsifiers'
    },
    '8901063029415': {
        _id: '8901063029415',
        product_name: 'Britannia Marie Gold',
        quantity: '89g',
        brands: 'Britannia',
        image_front_url: 'https://placehold.co/400x400/eab308/ffffff?text=Marie+Gold',
        nutrition_grades: 'c',
        nova_group: 4,
        nutriments: { energy_100g: 1850, fat_100g: 10.5, sugars_100g: 20.8, proteins_100g: 8.2, fiber_100g: 3.1, salt_100g: 0.9 },
        ingredients_text: 'Wheat Flour, Sugar, Palm Oil, Invert Syrup, Leavening Agents, Milk Solids, Salt'
    },
    '7622201844976': {
        _id: '7622201844976',
        product_name: 'Oreo Vanilla Creme Biscuits',
        quantity: '120g',
        brands: 'Cadbury',
        image_front_url: 'https://placehold.co/400x400/292524/ffffff?text=Oreo',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2050, fat_100g: 19.5, sugars_100g: 38.0, proteins_100g: 4.8, fiber_100g: 1.5, salt_100g: 0.5 },
        ingredients_text: 'Wheat Flour, Sugar, Palm Oil, Cocoa Solids, Invert Syrup, Leavening Agents, Salt, Emulsifiers'
    },
    '8901725134762': {
        _id: '8901725134762',
        product_name: 'Sunfeast Dark Fantasy Choco Fills',
        quantity: '75g',
        brands: 'Sunfeast',
        image_front_url: 'https://placehold.co/400x400/7f1d1d/ffffff?text=Dark+Fantasy',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2150, fat_100g: 24.5, sugars_100g: 36.0, proteins_100g: 5.2, fiber_100g: 1.8, salt_100g: 0.4 },
        ingredients_text: 'Choco Creme, Wheat Flour, Hydrogenated Vegetable Oil, Sugar, Invert Syrup, Liquid Glucose, Cocoa Powder'
    },
    '8901725181230': {
        _id: '8901725181230',
        product_name: 'Sunfeast Mom\'s Magic Cashew & Almond',
        quantity: '75g',
        brands: 'Sunfeast',
        image_front_url: 'https://placehold.co/400x400/ca8a04/ffffff?text=Moms+Magic',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 2080, fat_100g: 21.0, sugars_100g: 24.0, proteins_100g: 6.5, fiber_100g: 2.0, salt_100g: 0.6 },
        ingredients_text: 'Wheat Flour, Sugar, Palm Oil, Cashew (2%), Almond (1%), Milk Solids, Butter, Salt'
    },

    // --- SNACKS & CHIPS ---
    '8901491100511': {
        _id: '8901491100511',
        product_name: 'Lays India\'s Magic Masala',
        quantity: '52g',
        brands: 'Lays',
        image_front_url: 'https://placehold.co/400x400/1e3a8a/ffffff?text=Lays+Magic',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 2280, fat_100g: 34.5, sugars_100g: 2.0, proteins_100g: 6.8, fiber_100g: 4.1, salt_100g: 1.8 },
        nutrient_levels: { fat: 'high', sugars: 'low', salt: 'high' },
        ingredients_text: 'Potato, Edible Vegetable Oil (Palmolein, Rice Bran), Spices & Condiments (Onion, Garlic, Chilli, Coriander)'
    },
    '8901491502018': {
        _id: '8901491502018',
        product_name: 'Lays American Style Cream & Onion',
        quantity: '52g',
        brands: 'Lays',
        image_front_url: 'https://placehold.co/400x400/16a34a/ffffff?text=Lays+Green',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 2260, fat_100g: 33.0, sugars_100g: 4.5, proteins_100g: 6.5, fiber_100g: 3.8, salt_100g: 1.6 },
        ingredients_text: 'Potato, Edible Vegetable Oil, Sugar, Salt, Milk Solids, Onion Powder, Parsley, Cheese Powder'
    },
    '8901491101839': {
        _id: '8901491101839',
        product_name: 'Kurkure Masala Munch',
        quantity: '82g',
        brands: 'Kurkure',
        image_front_url: 'https://placehold.co/400x400/ea580c/ffffff?text=Kurkure',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2320, fat_100g: 36.0, sugars_100g: 1.5, proteins_100g: 5.8, fiber_100g: 2.0, salt_100g: 2.1 },
        ingredients_text: 'Rice Meal, Corn Meal, Gram Meal, Edible Vegetable Oil, Spices & Condiments, Salt'
    },
    '8904004400262': {
        _id: '8904004400262',
        product_name: 'Haldiram\'s Aloo Bhujia',
        brands: 'Haldirams',
        image_front_url: 'https://placehold.co/400x400/dc2626/ffffff?text=Aloo+Bhujia',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 2450, fat_100g: 42.0, sugars_100g: 0.5, proteins_100g: 10.0, fiber_100g: 3.5, salt_100g: 2.5 },
        ingredients_text: 'Potatoes, Edible Vegetable Oil, Chickpea Flour (Besan), Moth Bean Flour, Salt, Spices'
    },
    '8904004400019': {
        _id: '8904004400019',
        product_name: 'Haldiram\'s Bhujia Sev',
        brands: 'Haldirams',
        image_front_url: 'https://placehold.co/400x400/dc2626/ffffff?text=Bhujia+Sev',
        nutrition_grades: 'd',
        nutriments: { energy_100g: 2400, fat_100g: 40.0, sugars_100g: 0.5, proteins_100g: 12.0, fiber_100g: 4.0, salt_100g: 2.4 },
        ingredients_text: 'Chickpea Flour, Moth Bean Flour, Edible Vegetable Oil, Salt, Spices'
    },

    // --- INSTANT FOODS ---
    '8901058866438': {
        _id: '8901058866438',
        product_name: 'Maggi 2-Minute Noodles Masala',
        brands: 'Nestle',
        image_front_url: 'https://placehold.co/400x400/fbbf24/000000?text=Maggi',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 1900, fat_100g: 15.2, 'saturated-fat_100g': 7.8, sugars_100g: 3.5, proteins_100g: 9.8, fiber_100g: 2.8, salt_100g: 2.9, sodium_100g: 1160 },
        nutrient_levels: { fat: 'high', 'saturated-fat': 'high', sugars: 'low', salt: 'high' },
        ingredients_text: 'Refined Wheat Flour, Palm Oil, Wheat Gluten, Salt, Thickeners (E412, E466), Onion Powder, Garlic Powder, Turmeric Powder, Red Chilli Powder, Coriander Powder, Cumin Powder, Black Pepper Powder, Ginger Powder, Fenugreek Powder, Cardamom Powder, Clove Powder, Cinnamon Powder, Bay Leaf, Spices & Condiments, Hydrolysed Groundnut Protein, Flavor Enhancers (E621, E635), Sugar, Caramel Color (E150c), Citric Acid (E330), Maltodextrin, Dehydrated Vegetables (Carrot, Peas), Modified Starch, Yeast Extract',
        additives_tags: ['en:e412', 'en:e466', 'en:e621', 'en:e635', 'en:e150c', 'en:e330'],
        labels_tags: ['vegetarian'],
        categories: 'Instant Noodles, Snacks',
        categories_tags: ['en:instant-noodles', 'en:snacks']
    },
    '8901725189328': {
        _id: '8901725189328',
        product_name: 'Sunfeast YiPPee! Magic Masala Noodles',
        brands: 'Sunfeast',
        image_front_url: 'https://placehold.co/400x400/ef4444/ffffff?text=YiPPee',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 1920, fat_100g: 14.8, sugars_100g: 3.2, proteins_100g: 9.0, fiber_100g: 3.0, salt_100g: 2.8 },
        ingredients_text: 'Refined Wheat Flour, Palm Oil, Salt, Spices, Dehydrated Vegetables'
    },
    '8901058837131': {
        _id: '8901058837131',
        product_name: 'Maggi Hot Heads Spicy Instant Noodles',
        brands: 'Nestle',
        image_front_url: 'https://placehold.co/400x400/991b1b/ffffff?text=Maggi+Spicy',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 1950, fat_100g: 16.0, sugars_100g: 4.0, proteins_100g: 9.5, fiber_100g: 2.5, salt_100g: 3.2 },
    },

    // --- BEVERAGES ---
    '8901764031206': {
        _id: '8901764031206',
        product_name: 'Thumbs Up (750ml)',
        quantity: '750ml',
        brands: 'Coca Cola',
        image_front_url: 'https://placehold.co/400x400/000000/ffffff?text=Thums+Up',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 180, fat_100g: 0, sugars_100g: 10.6, proteins_100g: 0, fiber_100g: 0, salt_100g: 0 },
        ingredients_text: 'Carbonated Water, Sugar, Acidity Regulator (338), Caffeine, Natural Color (150d)'
    },
    '5449000000996': {
        _id: '5449000000996',
        product_name: 'Coca-Cola Original Taste',
        quantity: '750ml',
        brands: 'Coca Cola',
        image_front_url: 'https://placehold.co/400x400/dc2626/ffffff?text=Coca+Cola',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 180, fat_100g: 0, sugars_100g: 10.6, proteins_100g: 0, fiber_100g: 0, salt_100g: 0 },
        ingredients_text: 'Carbonated Water, Sugar, Color (150d), Phosphoric Acid, Natural Flavors, Caffeine'
    },
    '8901063100220': {
        _id: '8901063100220',
        product_name: 'Bru Instant Coffee',
        quantity: '50g',
        brands: 'Bru',
        image_front_url: 'https://placehold.co/400x400/57534e/ffffff?text=Bru+Coffee',
        nutrition_grades: 'b',
        nova_group: 3,
        nutriments: { energy_100g: 350, fat_100g: 0.5, sugars_100g: 2.0, proteins_100g: 12.0, fiber_100g: 15.0, salt_100g: 0.1 },
        ingredients_text: 'Instant Coffee, Chicory Mixture'
    },
    '8901063140028': {
        _id: '8901063140028',
        product_name: 'Nescafe Classic Instant Coffee',
        quantity: '50g',
        brands: 'Nescafe',
        image_front_url: 'https://placehold.co/400x400/57534e/ffffff?text=Nescafe',
        nutrition_grades: 'b',
        nova_group: 3,
        nutriments: { energy_100g: 340, fat_100g: 0.2, sugars_100g: 1.0, proteins_100g: 11.0, fiber_100g: 14.0, salt_100g: 0.1 },
        ingredients_text: 'Coffee Beans'
    },
    '8901888002685': {
        _id: '8901888002685',
        product_name: 'Real Fruit Power Mixed Fruit',
        quantity: '1L',
        brands: 'Dabur',
        image_front_url: 'https://placehold.co/400x400/ea580c/ffffff?text=Real+Juice',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 220, fat_100g: 0, sugars_100g: 13.5, proteins_100g: 0.5, fiber_100g: 0.5, salt_100g: 0.05 },
        ingredients_text: 'Water, Mixed Fruit Concentrate, Sugar, Acidity Regulator, Antioxidant'
    },

    // --- DAIRY ---
    '8901430029520': {
        _id: '8901430029520',
        product_name: 'Amul Butter - Pasteurised',
        quantity: '100g',
        brands: 'Amul',
        image_front_url: 'https://placehold.co/400x400/fcd34d/000000?text=Amul+Butter',
        nutrition_grades: 'e',
        nova_group: 3,
        nutriments: { energy_100g: 3000, fat_100g: 80.0, sugars_100g: 2.0, proteins_100g: 1.2, fiber_100g: 0, salt_100g: 1.5 },
        ingredients_text: 'Cream, Salt'
    },
    '8901430000574': {
        _id: '8901430000574',
        product_name: 'Amul Taaza Toned Milk',
        quantity: '1L',
        brands: 'Amul',
        image_front_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Amul+Taaza',
        nutrition_grades: 'a',
        nova_group: 1,
        nutriments: { energy_100g: 240, fat_100g: 3.0, sugars_100g: 4.7, proteins_100g: 3.0, fiber_100g: 0, salt_100g: 0.1 },
        ingredients_text: 'Toned Milk'
    },
    '8901058000016': {
        _id: '8901058000016',
        product_name: 'Amul Cheese Cubes',
        quantity: '200g',
        brands: 'Amul',
        image_front_url: 'https://placehold.co/400x400/fbbf24/000000?text=Amul+Cheese',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 1300, fat_100g: 25.0, sugars_100g: 1.5, proteins_100g: 20.0, fiber_100g: 0, salt_100g: 2.5 },
        ingredients_text: 'Cheese, Milk Solids, Emulsifiers, Salt, Preservatives'
    },

    // --- CHOCOLATES ---
    '7622201416258': {
        _id: '7622201416258',
        product_name: 'Cadbury Dairy Milk Silk',
        quantity: '60g',
        brands: 'Cadbury',
        image_front_url: 'https://placehold.co/400x400/5b21b6/ffffff?text=Dairy+Milk',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2230, fat_100g: 31.0, sugars_100g: 56.0, proteins_100g: 8.0, fiber_100g: 1.2, salt_100g: 0.2 },
        ingredients_text: 'Sugar, Milk Solids, Cocoa Butter, Cocoa Solids, Emulsifiers'
    },
    '8901058863611': {
        _id: '8901058863611',
        product_name: 'Nestle KitKat',
        quantity: '37g',
        brands: 'Nestle',
        image_front_url: 'https://placehold.co/400x400/dc2626/ffffff?text=KitKat',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2150, fat_100g: 28.0, sugars_100g: 49.0, proteins_100g: 7.5, fiber_100g: 1.5, salt_100g: 0.3 },
        ingredients_text: 'Sugar, Wheat Flour, Milk Solids, Cocoa Butter, Cocoa Mass, Palm Oil, Emulsifiers, Yeast, Salt'
    },
    '3017620422003': {
        _id: '3017620422003',
        product_name: 'Nutella Hazelnut Spread',
        quantity: '350g',
        brands: 'Ferrero',
        image_front_url: 'https://placehold.co/400x400/7f1d1d/ffffff?text=Nutella',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2250, fat_100g: 30.9, sugars_100g: 56.3, proteins_100g: 6.3, fiber_100g: 0, salt_100g: 0.1 },
        ingredients_text: 'Sugar, Palm Oil, Hazelnuts, Skimmed Milk Powder, Fat-Reduced Cocoa, Emulsifier (Soy Lecithin), Vanillin'
    },

    // --- STAPLES & SPICES ---
    '8901725012312': {
        _id: '8901725012312',
        product_name: 'Aashirvaad Superior MP Atta',
        quantity: '1kg',
        brands: 'Aashirvaad',
        image_front_url: 'https://placehold.co/400x400/d97706/ffffff?text=Atta',
        nutrition_grades: 'a',
        nova_group: 1,
        nutriments: { energy_100g: 1450, fat_100g: 1.5, sugars_100g: 0.5, proteins_100g: 11.5, fiber_100g: 10.5, salt_100g: 0 },
        ingredients_text: 'Whole Wheat'
    },
    '8901035035048': {
        _id: '8901035035048',
        product_name: 'Tata Salt - Vacuum Evaporated',
        quantity: '1kg',
        brands: 'Tata',
        image_front_url: 'https://placehold.co/400x400/ef4444/ffffff?text=Tata+Salt',
        nutrition_grades: 'd',
        nova_group: 2,
        nutriments: { energy_100g: 0, fat_100g: 0, sugars_100g: 0, proteins_100g: 0, fiber_100g: 0, salt_100g: 99.0 },
        ingredients_text: 'Edible Common Salt, Iodine, Anti-caking Agent'
    },
    '8901786191001': {
        _id: '8901786191001',
        product_name: 'Everest Meat Masala',
        brands: 'Everest',
        image_front_url: 'https://placehold.co/400x400/991b1b/ffffff?text=Everest',
        nutrition_grades: 'c',
        nova_group: 3,
        nutriments: { energy_100g: 1200, fat_100g: 12.0, sugars_100g: 2.0, proteins_100g: 10.0, fiber_100g: 15.0, salt_100g: 15.0 },
        ingredients_text: 'Chilli, Coriander, Cumin, Black Pepper, Garlic, Ginger, Salt, Turmeric'
    },

    // --- ADDITIONAL POPULAR PRODUCTS ---
    '8901058853755': {
        _id: '8901058853755',
        product_name: 'Maggi 2-Minute Noodles Masala',
        quantity: '70g',
        brands: 'Nestle Maggi',
        image_front_url: 'https://placehold.co/400x400/fbbf24/000000?text=Maggi+70g',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 1900, fat_100g: 15.2, 'saturated-fat_100g': 7.8, sugars_100g: 3.5, proteins_100g: 9.8, fiber_100g: 2.8, salt_100g: 2.9, sodium_100g: 1160 },
        nutrient_levels: { fat: 'high', 'saturated-fat': 'high', sugars: 'low', salt: 'high' },
        ingredients_text: 'Refined Wheat Flour, Palm Oil, Wheat Gluten, Salt, Spices, Flavor Enhancers (E621, E635), Sugar, Dehydrated Vegetables',
        additives_tags: ['en:e621', 'en:e635'],
        labels_tags: ['vegetarian'],
        categories: 'Instant Noodles, Snacks',
        categories_tags: ['en:instant-noodles', 'en:snacks']
    },
    '8901058000494': {
        _id: '8901058000494',
        product_name: 'KitKat Chocolate Bar',
        quantity: '37g',
        brands: 'Nestle',
        image_front_url: 'https://placehold.co/400x400/dc2626/ffffff?text=KitKat',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2150, fat_100g: 28.0, 'saturated-fat_100g': 17.0, sugars_100g: 49.0, proteins_100g: 7.5, fiber_100g: 1.5, salt_100g: 0.3 },
        nutrient_levels: { fat: 'high', 'saturated-fat': 'high', sugars: 'high', salt: 'low' },
        ingredients_text: 'Sugar, Wheat Flour, Milk Solids, Cocoa Butter, Cocoa Mass, Palm Oil, Emulsifiers (Soy Lecithin, E476), Yeast, Salt, Raising Agent (E500ii), Natural Vanilla Flavouring',
        additives_tags: ['en:e322', 'en:e476', 'en:e500ii'],
        allergens_tags: ['en:milk', 'en:gluten', 'en:soybeans'],
        labels_tags: ['vegetarian'],
        categories: 'Chocolates, Confectionery',
        categories_tags: ['en:chocolates', 'en:confectionery']
    },
    '8901233006478': {
        _id: '8901233006478',
        product_name: 'Cadbury Dairy Milk Chocolate',
        quantity: '13.2g',
        brands: 'Cadbury',
        image_front_url: 'https://placehold.co/400x400/5b21b6/ffffff?text=Dairy+Milk',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2230, fat_100g: 31.0, 'saturated-fat_100g': 19.0, sugars_100g: 56.0, proteins_100g: 8.0, fiber_100g: 1.2, salt_100g: 0.2 },
        nutrient_levels: { fat: 'high', 'saturated-fat': 'high', sugars: 'high', salt: 'low' },
        ingredients_text: 'Sugar, Milk Solids, Cocoa Butter, Cocoa Solids, Emulsifiers (Soy Lecithin, E476)',
        additives_tags: ['en:e322', 'en:e476'],
        allergens_tags: ['en:milk', 'en:soybeans'],
        labels_tags: ['vegetarian'],
        categories: 'Chocolates, Milk Chocolates',
        categories_tags: ['en:chocolates', 'en:milk-chocolates']
    },
    '8901719000010': {
        _id: '8901719000010',
        product_name: 'Parle-G Gluco Biscuits',
        quantity: 'Small Pack',
        brands: 'Parle',
        image_front_url: 'https://placehold.co/400x400/ea580c/ffffff?text=Parle-G',
        nutrition_grades: 'c',
        nova_group: 4,
        nutriments: { energy_100g: 1950, fat_100g: 12.5, 'saturated-fat_100g': 4.2, sugars_100g: 22.8, proteins_100g: 7.2, fiber_100g: 2.1, salt_100g: 0.8, sodium_100g: 320 },
        nutrient_levels: { fat: 'moderate', 'saturated-fat': 'moderate', sugars: 'high', salt: 'low' },
        ingredients_text: 'Wheat Flour, Sugar, Edible Vegetable Oil (Palm Oil), Invert Sugar Syrup, Leavening Agents (E500ii, E503ii), Milk Solids, Salt, Emulsifiers (E322)',
        additives_tags: ['en:e500ii', 'en:e503ii', 'en:e322'],
        labels_tags: ['vegetarian'],
        categories: 'Biscuits, Sweet Biscuits',
        categories_tags: ['en:biscuits', 'en:sweet-biscuits']
    },
    '8901725010103': {
        _id: '8901725010103',
        product_name: 'Aashirvaad Whole Wheat Atta',
        quantity: '1kg',
        brands: 'Aashirvaad',
        image_front_url: 'https://placehold.co/400x400/d97706/ffffff?text=Aashirvaad',
        nutrition_grades: 'a',
        nova_group: 1,
        nutriments: { energy_100g: 1450, fat_100g: 1.5, 'saturated-fat_100g': 0.3, sugars_100g: 0.5, proteins_100g: 11.5, fiber_100g: 10.5, salt_100g: 0 },
        nutrient_levels: { fat: 'low', 'saturated-fat': 'low', sugars: 'low', salt: 'low' },
        ingredients_text: 'Whole Wheat Flour (100%)',
        labels_tags: ['vegetarian'],
        categories: 'Grains, Flour, Wheat Flour',
        categories_tags: ['en:grains', 'en:flour', 'en:wheat-flour']
    },
    '8901020000067': {
        _id: '8901020000067',
        product_name: 'Tata Salt Iodised',
        quantity: '1kg',
        brands: 'Tata Salt',
        image_front_url: 'https://placehold.co/400x400/ef4444/ffffff?text=Tata+Salt',
        nutrition_grades: 'd',
        nova_group: 2,
        nutriments: { energy_100g: 0, fat_100g: 0, sugars_100g: 0, proteins_100g: 0, fiber_100g: 0, salt_100g: 99.0, sodium_100g: 39600 },
        nutrient_levels: { fat: 'low', sugars: 'low', salt: 'high' },
        ingredients_text: 'Iodised Salt, Anti-caking Agent (E536)',
        additives_tags: ['en:e536'],
        categories: 'Salt, Iodised Salt',
        categories_tags: ['en:salt', 'en:iodised-salt']
    },
    '8901262010107': {
        _id: '8901262010107',
        product_name: 'Amul Pasteurised Butter',
        quantity: '100g',
        brands: 'Amul',
        image_front_url: 'https://placehold.co/400x400/fcd34d/000000?text=Amul',
        nutrition_grades: 'e',
        nova_group: 3,
        nutriments: { energy_100g: 3000, fat_100g: 80.0, 'saturated-fat_100g': 52.0, sugars_100g: 2.0, proteins_100g: 1.2, fiber_100g: 0, salt_100g: 1.5 },
        nutrient_levels: { fat: 'high', 'saturated-fat': 'high', sugars: 'low', salt: 'moderate' },
        ingredients_text: 'Pasteurised Cream, Salt',
        allergens_tags: ['en:milk'],
        categories: 'Dairy, Butter',
        categories_tags: ['en:dairies', 'en:butter']
    },
    '8901233020115': {
        _id: '8901233020115',
        product_name: 'Cadbury Bournvita Health Drink',
        quantity: '500g',
        brands: 'Cadbury',
        image_front_url: 'https://placehold.co/400x400/7f1d1d/ffffff?text=Bournvita',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 1600, fat_100g: 2.0, 'saturated-fat_100g': 1.0, sugars_100g: 70.0, proteins_100g: 7.0, fiber_100g: 4.5, salt_100g: 0.5 },
        nutrient_levels: { fat: 'low', 'saturated-fat': 'low', sugars: 'high', salt: 'low' },
        ingredients_text: 'Sugar, Cocoa Solids, Malt Extract, Milk Solids, Liquid Glucose, Minerals, Vitamins, Emulsifier (Soy Lecithin)',
        additives_tags: ['en:e322'],
        allergens_tags: ['en:milk', 'en:soybeans'],
        labels_tags: ['vegetarian'],
        categories: 'Health Drinks, Malted Drinks',
        categories_tags: ['en:beverages', 'en:malted-drinks']
    },

    // --- NEW ADDITIONS (Feb 2026) ---
    '8901063142268': {
        _id: '8901063142268',
        product_name: 'Britannia 50-50 Maska Chaska',
        quantity: '50g',
        brands: 'Britannia',
        image_front_url: 'https://placehold.co/400x400/facc15/000000?text=50-50',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 2050, fat_100g: 22.0, sugars_100g: 9.0, proteins_100g: 7.5, salt_100g: 2.2 },
        ingredients_text: 'Wheat Flour, Vegetable Oil, Sugar, Raising Agents, Salt, Butter, Milk Solids'
    },
    '8901719102431': {
        _id: '8901719102431',
        product_name: 'Parle Hide & Seek Chocolate Chip Cookies',
        quantity: '100g',
        brands: 'Parle',
        image_front_url: 'https://placehold.co/400x400/451a03/ffffff?text=Hide&Seek',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2080, fat_100g: 23.0, sugars_100g: 33.0, proteins_100g: 6.0, salt_100g: 0.6 },
        ingredients_text: 'Wheat Flour, Chocolate Chips (Sugar, Cocoa Mass, Cocoa Butter, Dextrose, Emulsifier), Sugar, Edible Vegetable Oil, Invert Sugar Syrup'
    },
    '8901262010015': {
        _id: '8901262010015',
        product_name: 'Amul Kool Cafe',
        quantity: '200ml',
        brands: 'Amul',
        image_front_url: 'https://placehold.co/400x400/78350f/ffffff?text=Amul+Kool',
        nutrition_grades: 'c',
        nova_group: 3,
        nutriments: { energy_100g: 90, fat_100g: 3.2, sugars_100g: 10.0, proteins_100g: 2.8, salt_100g: 0.1 },
        ingredients_text: 'Double Toned Flavoured Milk, Sugar, Coffee'
    },
    '8901764012200': {
        _id: '8901764012200',
        product_name: 'Maaza Mango Drink',
        quantity: '600ml',
        brands: 'Maaza',
        image_front_url: 'https://placehold.co/400x400/fbbf24/000000?text=Maaza',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 60, fat_100g: 0, sugars_100g: 14.8, proteins_100g: 0, salt_100g: 0 },
        ingredients_text: 'Water, Mango Pulp (19.5%), Sugar, Acidity Regulator (330), Antioxidant (300)'
    },
    '8901764052009': {
        _id: '8901764052009',
        product_name: 'Limca Lime & Lemony Drink',
        quantity: '750ml',
        brands: 'Limca',
        image_front_url: 'https://placehold.co/400x400/84cc16/ffffff?text=Limca',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 44, fat_100g: 0, sugars_100g: 11.0, proteins_100g: 0, salt_100g: 0 },
        ingredients_text: 'Carbonated Water, Sugar, Acidity Regulator (330), Stabilizers, Flavours'
    },
    '8901058852390': {
        _id: '8901058852390',
        product_name: 'Nestle KitKat Dessert Delight',
        quantity: '50g',
        brands: 'Nestle',
        image_front_url: 'https://placehold.co/400x400/991b1b/ffffff?text=KitKat+Dark',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2200, fat_100g: 26.0, sugars_100g: 45.0, proteins_100g: 7.0, salt_100g: 0.2 },
        ingredients_text: 'Dark Chocolate, Wheat Flour, Sugar, Palm Oil, Cocoa Solids, Milk Solids'
    },
    '8901058895014': {
        _id: '8901058895014',
        product_name: 'Nestle Munch Max',
        quantity: '25g',
        brands: 'Nestle',
        image_front_url: 'https://placehold.co/400x400/b91c1c/ffffff?text=Munch+Max',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2050, fat_100g: 20.0, sugars_100g: 42.0, proteins_100g: 5.0, salt_100g: 0.3 },
        ingredients_text: 'Sugar, Wheat Flour, Vegetable Fat, Cocoa Solids, Milk Solids'
    },
    '8901063019010': {
        _id: '8901063019010',
        product_name: 'Kissan Mixed Fruit Jam',
        quantity: '500g',
        brands: 'Kissan',
        image_front_url: 'https://placehold.co/400x400/be123c/ffffff?text=Kissan+Jam',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: { energy_100g: 290, fat_100g: 0.1, sugars_100g: 70.0, proteins_100g: 0.2, salt_100g: 0.05 },
        ingredients_text: 'Sugar, Mixed Fruit Pulp, Pectin (E440), Acidity Regulator, Preservative'
    },
    '8901088001717': {
        _id: '8901088001717',
        product_name: 'Saffola Gold Edible Oil',
        quantity: '1L',
        brands: 'Saffola',
        image_front_url: 'https://placehold.co/400x400/fbbf24/ffffff?text=Saffola',
        nutrition_grades: 'c',
        nova_group: 2,
        nutriments: { energy_100g: 900, fat_100g: 100.0, 'saturated-fat_100g': 20.0, sugars_100g: 0, proteins_100g: 0, salt_100g: 0 },
        ingredients_text: 'Refined Rice Bran Oil (80%), Refined Safflower Oil (20%), Antioxidants (319, 330), Vitamins A & D'
    },
    '8901725113644': {
        _id: '8901725113644',
        product_name: 'Bingo! Mad Angles Achaari Masti',
        quantity: '72g',
        brands: 'Bingo',
        image_front_url: 'https://placehold.co/400x400/dc2626/ffffff?text=Mad+Angles',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: { energy_100g: 2280, fat_100g: 32.8, sugars_100g: 4.2, proteins_100g: 6.8, salt_100g: 2.1 },
        ingredients_text: 'Rice Grits, Corn Grits, Gram Grits, Refined Palmolein, Sugar, Salt, Spices & Condiments'
    }
};
