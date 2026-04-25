import axios from 'axios';

/**
 * AI-powered product lookup service using Gemini AI
 * UPGRADE: V2 Absolute Accuracy Architecture
 * Now performs multi-platform pricing research (Blinkit, Amazon, Instamart, Flipkart)
 */
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

export async function searchProductWithAI(barcode) {
    // Runtime injection to ensure .env is ready
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_key_here') {
        console.log('⚠️ Gemini API key not configured');
        return null;
    }

    try {
        console.log(`🤖 [V2] Triggering Full-Spectrum AI Research Pulse: ${barcode}`);
        
        const prompt = `You are a high-precision medical-grade food science orchestrator for the Indian & Global market.
        BARCODE: ${barcode}
        
        RESEARCH MISSION:
        1. VIRTUAL SURF: Research this barcode across Blinkit, Swiggy Instamart, Amazon India, and Flipkart Minutes.
        2. EXTRACT TRUTH: Find the EXACT "As Printed on Label" ingredients text, Net Weight, and Manufacturer.
        3. MULTI-PLATFORM PRICING: Find the exact price on: Blinkit, Amazon India, Swiggy Instamart, Flipkart Minutes.
        4. HIERARCHY UNROLLING: Unroll all grouped ingredients into primary chemical/scientific entries.
        5. SCIENTIFIC HARMONIZATION: Map every ingredient to its Scientific Name and provide a clinical explanation.
        
        REQUIRED JSON SCHEMA:
        {
          "product_name": "Exact Name Found",
          "brands": "Main Company / Brand",
          "quantity": "Net Weight",
          "price": "Market Average (INR)",
          "pricing": {
             "blinkit": "₹...", "amazon": "₹...", "instamart": "₹...", "flipkart_minutes": "₹..."
          },
          "ingredients_text": "📄 RAW_LABEL_TEXT_EXACTLY_AS_PRINTED",
          "ingredients": [
            {
              "text": "Name on Label",
              "scientific_name": "Scientific Name",
              "explanation": "Health impact insight",
              "percent_estimate": XX.XX,
              "risk_level": "safe|caution|danger",
              "id": "en:ingredient-id"
            }
          ],
          "nutriments": {
            "energy_100g": kcal, "fat_100g": g, "proteins_100g": g, "carbohydrates_100g": g, "sugars_100g": g, "salt_100g": g
          }
        }
        All fields are MANDATORY. Return VALID JSON ONLY.
        `;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
            })
        });

        if (!response.ok) {
            // Fallback to v1beta if v1 fails
            const betaUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
            const retry = await fetch(`${betaUrl}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
                })
            });
            if (!retry.ok) return null;
            const data = await retry.json();
            return processAIData(data, barcode);
        }

        const data = await response.json();
        return processAIData(data, barcode);

    } catch (error) {
        console.error('V2 Research Logic Error:', error.message);
        return null;
    }
}

function processAIData(data, barcode) {
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const parsed = JSON.parse(text);
        if (!parsed || !parsed.product_name) return null;

        if (parsed.pricing) {
            const p = parsed.pricing;
            parsed.price = p.blinkit || p.amazon || p.instamart || p.flipkart_minutes || parsed.price || '₹...';
        }

        console.log(`🎯 [V2] Research Complete: ${parsed.product_name} | Price: ${parsed.price}`);

        return {
            ...parsed,
            code: barcode,
            ingredients_source: 'ai_refined'
        };
    } catch (e) { return null; }
}
