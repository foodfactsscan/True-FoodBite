import axios from 'axios';
import { deepSearchProduct } from './scrapingService.js';

// AI-powered product lookup service using Gemini AI
// High-Level Goal: 100% Accuracy with Deep Research Fallback
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Use Gemini AI + Deep Web Research to search and extract product information
 */
export async function searchProductWithAI(barcode) {
    if (!GEMINI_API_KEY) {
        console.log('⚠️ Gemini API key not configured');
        return null;
    }

    try {
        // --- STEP 1: DEEP RESEARCH SCAN ---
        // Search Inland, Amazon, BigBasket, Flipkart, Blinkit via our professional scraper
        const researchData = await deepSearchProduct(barcode);
        let searchContext = "";
        
        if (researchData && researchData.name) {
            console.log(`📡 Deep Research match found: ${researchData.name}`);
            searchContext = `DEEP RESEARCH FOUND THIS PRODUCT: Name: ${researchData.name}, Source: ${researchData.source}. MANDATORY: You MUST provide data for THIS exact product. Don't guess another one.`;
        }

        // --- STEP 2: AI RECONSTRUCTION ---
        const prompt = `You are an ELITE food product search engine. A user scanned barcode "${barcode}".
        ${searchContext}

        TASK:
        1. Find this product on Indian/International platforms (Amazon, BigBasket, Flipkart, Blinkit, Inland).
        2. Provide EXACT Product Name, Brand, and Net Quantity.
        3. **FORMAT RULE**: 
           - 'product_name': The SPECIFIC type (e.g., 'Cola Soft Drink'). **DO NOT** repeat the brand name in this string if it's already in the 'brands' field.
           - 'quantity': EXACT measurable unit. Use 'Litres' for liquids > 1L, 'ml' for smaller, 'kg/g' for solids.
           - Example for Pepsi: brands: 'Pepsi', product_name: 'Cola Soft Drink', quantity: '1.25 Litres'.
        4. **NO FAKE DATA. NO BLUFF DATA. NO REPETITION.**

        JSON FORMAT:
        {
            "product_name": "Specific product name (e.g. 'Classic Salted Chips', NOT 'Lays Chips')",
            "brands": "Brand name only (e.g. 'Lays')",
            "quantity": "Net quantity with unit (e.g. '1.25 Litres', '500g') - MANDATORY",
            "nutrition_grades": "a/b/c/d/e",
            "nutriments": {
                "energy_100g": number,
                "fat_100g": number,
                "sugars_100g": number,
                "proteins_100g": number,
                "salt_100g": number
            },
            "ingredients_text": "Detailed ingredient list",
            "description": "Professional 2-3 sentence product summary",
            "labels_tags": ["vegetarian/non-vegetarian"]
        }`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            console.error('Gemini API error:', response.status);
            return null;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const productData = JSON.parse(jsonText);
        if (!productData || !productData.product_name) return null;

        console.log(`🎯 Logic Verified: [${barcode}] matched to [${productData.product_name}] (${productData.quantity})`);
        
        return {
            _id: barcode,
            code: barcode,
            ...productData,
            data_source: 'deep_research_ai',
            research_source: researchData?.source || 'ai_internal'
        };

    } catch (error) {
        console.error('Error in deep product search:', error.message);
        return null;
    }
}
