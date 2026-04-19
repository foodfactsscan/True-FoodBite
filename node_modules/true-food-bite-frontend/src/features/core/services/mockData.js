// Mock data for demo purposes when API fails or product not in database
export const DEMO_PRODUCTS = {
    '8901063010031': {
        _id: '8901063010031',
        product_name: 'Parle-G Gold Biscuits',
        brands: 'Parle',
        image_front_url: 'https://placehold.co/400x400/1e293b/84cc16?text=Parle-G',
        image_front_small_url: 'https://placehold.co/200x200/1e293b/84cc16?text=Parle-G',
        nutrition_grades: 'c',
        nova_group: 4,
        nutriments: {
            energy_100g: 1950,
            fat_100g: 12.5,
            sugars_100g: 22.8,
            proteins_100g: 7.2,
            fiber_100g: 2.1,
            salt_100g: 0.8
        },
        nutrient_levels: {
            fat: 'moderate',
            sugars: 'high',
            salt: 'low'
        },
        ingredients_text: 'Wheat Flour, Sugar, Edible Vegetable Oil (Palm Oil), Invert Sugar Syrup, Leavening Agents, Milk Solids, Salt, Emulsifiers',
        labels_tags: ['vegetarian'],
        categories: 'Biscuits, Sweet Biscuits',
        categories_tags: ['en:biscuits', 'en:sweet-biscuits']
    },
    '8901063100220': {
        _id: '8901063100220',
        product_name: 'Bru Instant Coffee',
        brands: 'Bru',
        image_front_url: 'https://placehold.co/400x400/1e293b/84cc16?text=Bru+Coffee',
        image_front_small_url: 'https://placehold.co/200x200/1e293b/84cc16?text=Bru+Coffee',
        nutrition_grades: 'b',
        nova_group: 3,
        nutriments: {
            energy_100g: 350,
            fat_100g: 0.5,
            sugars_100g: 2.1,
            proteins_100g: 12.8,
            fiber_100g: 15.2,
            salt_100g: 0.1
        },
        nutrient_levels: {
            fat: 'low',
            sugars: 'low',
            salt: 'low'
        },
        ingredients_text: 'Coffee (70%), Chicory Extract (30%)',
        labels_tags: ['vegan', 'vegetarian'],
        categories: 'Instant Coffee, Beverages',
        categories_tags: ['en:instant-coffee', 'en:beverages']
    },
    '8901058866438': {
        _id: '8901058866438',
        product_name: 'Maggi 2-Minute Noodles Masala',
        brands: 'Maggi, Nestle',
        image_front_url: 'https://placehold.co/400x400/1e293b/84cc16?text=Maggi+Noodles',
        image_front_small_url: 'https://placehold.co/200x200/1e293b/84cc16?text=Maggi',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: {
            energy_100g: 1900,
            fat_100g: 15.2,
            saturated_fat_100g: 7.8,
            sugars_100g: 3.5,
            proteins_100g: 9.8,
            fiber_100g: 2.8,
            salt_100g: 2.9
        },
        nutrient_levels: {
            fat: 'high',
            'saturated-fat': 'high',
            sugars: 'low',
            salt: 'high'
        },
        ingredients_text: 'Refined Wheat Flour, Palm Oil, Salt, Wheat Gluten, Guar Gum, Spices, MSG (E621), Flavor Enhancers',
        additives_tags: ['en:e621'],
        labels_tags: ['vegetarian'],
        categories: 'Instant Noodles, Snacks',
        categories_tags: ['en:instant-noodles', 'en:snacks']
    },
    '8901063034266': {
        _id: '8901063034266',
        product_name: 'Britannia Good Day Butter Cookies',
        brands: 'Britannia',
        image_front_url: 'https://placehold.co/400x400/1e293b/84cc16?text=Good+Day',
        image_front_small_url: 'https://placehold.co/200x200/1e293b/84cc16?text=Good+Day',
        nutrition_grades: 'd',
        nova_group: 4,
        nutriments: {
            energy_100g: 2100,
            fat_100g: 19.5,
            saturated_fat_100g: 9.2,
            sugars_100g: 28.5,
            proteins_100g: 6.8,
            fiber_100g: 1.5,
            salt_100g: 0.7
        },
        nutrient_levels: {
            fat: 'high',
            'saturated-fat': 'high',
            sugars: 'high',
            salt: 'low'
        },
        ingredients_text: 'Refined Wheat Flour, Sugar, Edible Vegetable Oil (Palm Oil), Butter, Milk Solids, Glucose Syrup, Leavening Agents, Salt, Emulsifiers (E322, E471), Artificial Flavors',
        additives_tags: ['en:e322', 'en:e471'],
        labels_tags: ['vegetarian'],
        categories: 'Cookies, Biscuits',
        categories_tags: ['en:cookies', 'en:biscuits']
    },
    '8901430029520': {
        _id: '8901430029520',
        product_name: 'Amul Butter - Pasteurised',
        brands: 'Amul',
        image_front_url: 'https://placehold.co/400x400/1e293b/84cc16?text=Amul+Butter',
        image_front_small_url: 'https://placehold.co/200x200/1e293b/84cc16?text=Amul',
        nutrition_grades: 'e',
        nova_group: 3,
        nutriments: {
            energy_100g: 3000,
            fat_100g: 80.0,
            saturated_fat_100g: 50.0,
            sugars_100g: 2.0,
            proteins_100g: 1.2,
            fiber_100g: 0,
            salt_100g: 1.5
        },
        nutrient_levels: {
            fat: 'high',
            'saturated-fat': 'high',
            sugars: 'low',
            salt: 'moderate'
        },
        ingredients_text: 'Cream, Salt, Milk Solids',
        labels_tags: ['vegetarian'],
        categories: 'Dairy, Butter',
        categories_tags: ['en:dairy', 'en:butter']
    },
    // Known working international products
    '3017620422003': {
        _id: '3017620422003',
        product_name: 'Nutella',
        brands: 'Ferrero',
        image_front_url: 'https://placehold.co/400x400/1e293b/84cc16?text=Nutella',
        image_front_small_url: 'https://placehold.co/200x200/1e293b/84cc16?text=Nutella',
        nutrition_grades: 'e',
        nova_group: 4,
        nutriments: {
            energy_100g: 2252,
            fat_100g: 30.9,
            saturated_fat_100g: 10.6,
            sugars_100g: 56.3,
            proteins_100g: 6.3,
            fiber_100g: 0,
            salt_100g: 0.107
        },
        nutrient_levels: {
            fat: 'high',
            'saturated-fat': 'high',
            sugars: 'high',
            salt: 'low'
        },
        ingredients_text: 'Sugar, Palm Oil, Hazelnuts (13%), Skimmed Milk Powder (8.7%), Fat-Reduced Cocoa (7.4%), Emulsifier: Lecithins (Soya), Vanillin',
        additives_tags: ['en:e322'],
        labels_tags: ['vegetarian'],
        categories: 'Spreads, Chocolate spreads',
        categories_tags: ['en:spreads', 'en:chocolate-spreads']
    }
};
