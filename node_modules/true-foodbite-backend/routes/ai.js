import express from 'express';

const router = express.Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// POST /api/ai/chat - Food safety Q&A chat assistant
router.post('/chat', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { message, history, productContext } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Use rule-based responses if no API key
        if (!apiKey) {
            return res.json({ success: true, reply: getRuleBasedReply(message), isRuleBased: true });
        }

        // Build system context
        const systemContext = `You are NutriBot, a friendly and knowledgeable food safety and nutrition assistant for the True FoodBite app — an Indian food scanner and health app.

Your expertise:
- Food safety, nutrition, and health
- Common Indian packaged foods and their ingredients
- Additives, preservatives, and E-numbers
- Dietary needs for conditions like diabetes, hypertension, PCOS, heart disease, etc.
- General healthy eating advice tailored for Indian diets
- Explaining food labels and nutrition facts

Rules:
- Keep responses concise (3-5 sentences max for simple questions, slightly longer for complex ones)
- Use simple language avoid jargon
- Use emojis sparingly for friendliness
- If asked about a specific product in context, refer to it by name
- Always remind users to consult a doctor for medical advice
- Never diagnose or prescribe
- Be encouraging and positive
- Format lists with bullet points when helpful
${productContext ? `\nCurrent product being viewed:\n${productContext}` : ''}`;

        // Build conversation history for Gemini
        const contents = [];

        // Add history
        if (history && history.length > 0) {
            history.slice(-6).forEach(msg => {  // Last 6 messages for context
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            });
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemContext }] },
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 512,
                }
            })
        });

        if (!response.ok) {
            const fallbackReply = getRuleBasedReply(message);
            return res.json({ success: true, reply: fallbackReply, isRuleBased: true });
        }

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

        res.json({ success: true, reply });

    } catch (error) {
        console.error('Chat error:', error);
        const fallbackReply = getRuleBasedReply(req.body?.message || '');
        res.json({ success: true, reply: fallbackReply, isRuleBased: true });
    }
});

// Local rule-based fallback for when Gemini is unavailable
function getRuleBasedReply(message) {
    const msg = message.toLowerCase();

    if (msg.includes('diabet')) {
        return '🩺 For diabetics, watch out for high sugar content (>5g/100g), refined carbs, and high glycemic ingredients like maida (refined flour). Prefer products with whole grains, fiber, and low sugar. Always check the Nutrition Grade — aim for A or B. Consult your doctor for personalized advice.';
    }
    if (msg.includes('blood pressure') || msg.includes('hypertens') || msg.includes('bp')) {
        return '💊 For high blood pressure, limit sodium intake to under 2000mg/day. Avoid products with >600mg sodium per 100g. Watch out for ingredients like sodium chloride, sodium benzoate, and MSG. Potassium-rich foods can help balance blood pressure.';
    }
    if (msg.includes('heart') || msg.includes('cholesterol') || msg.includes('cardiac')) {
        return '❤️ For heart health, limit saturated fat (<10% of calories) and avoid trans fats entirely. Check for hydrogenated vegetable oil in the ingredients — a sign of trans fats. Opt for products with NOVA group 1 or 2 and Nutriscore A or B.';
    }
    if (msg.includes('pcos') || msg.includes('pcod')) {
        return '🌸 For PCOS, focus on low glycemic index foods, high fiber, and anti-inflammatory ingredients. Avoid refined sugars, processed foods, and products with high NOVA scores. Omega-3 rich foods can be beneficial.';
    }
    if (msg.includes('allerg') || msg.includes('intoleran')) {
        return '⚠️ Always check the allergens section on the product page. Common allergens include gluten (wheat, barley), dairy (milk, lactose), nuts, soy, and eggs. Our app highlights detected allergens in red at the top of every product page.';
    }
    if (msg.includes('child') || msg.includes('kid') || msg.includes('baby') || msg.includes('infant')) {
        return "👶 For children, avoid products with artificial colors (E102, E110, E122, E129, E133), excess sugar, and high sodium. These have been linked to hyperactivity. Choose products with NOVA Group 1 or 2. Whole foods are always the best choice for growing children.";
    }
    if (msg.includes('preserv') || msg.includes('additive') || msg.includes('e number') || msg.includes('e-number')) {
        return '🧪 E-numbers are EU codes for food additives. Not all are harmful! E300 (Vitamin C) and E101 (Vitamin B2) are beneficial. Watch out for E621 (MSG), E211 (Sodium Benzoate), and artificial colors like E102 and E110. Our app color codes additives by risk level.';
    }
    if (msg.includes('sugar') || msg.includes('sweet')) {
        return '🍬 WHO recommends limiting added sugar to less than 25g/day (about 6 teaspoons). "No added sugar" doesn\'t mean sugar-free — check for natural sugars too. Artificial sweeteners like aspartame and acesulfame-K are lower in calories but have mixed research on long-term effects.';
    }
    if (msg.includes('sodium') || msg.includes('salt')) {
        return '🧂 The recommended daily sodium limit is 2000mg (about 1 teaspoon of salt). Many packaged snacks and instant noodles exceed 50% of this in one serving. Check labels — anything over 600mg per 100g is considered high sodium.';
    }
    if (msg.includes('protein')) {
        return '💪 Most adults need 0.8-1.2g of protein per kg of body weight daily. Look for products with at least 10g protein per serving. Good sources in packaged Indian foods include yogurt-based products, legume-based snacks, and fortified cereals.';
    }
    if (msg.includes('nova') || msg.includes('processing') || msg.includes('ultra processed') || msg.includes('ultraprocessed')) {
        return '🏭 The NOVA classification ranks how processed a food is:\n• NOVA 1: Unprocessed (fruits, veggies, plain dairy)\n• NOVA 2: Culinary ingredients (oil, salt, sugar)\n• NOVA 3: Processed (canned, pickled)\n• NOVA 4: Ultra-processed (snacks, instant noodles, sodas)\n\nTry to minimize NOVA 4 foods in your diet.';
    }
    if (msg.includes('ingredient') || msg.includes('label') || msg.includes('read') && msg.includes('food')) {
        return '📋 Reading food labels: Ingredients are listed from most to least by weight. If sugar is in the first 3, it\'s a high-sugar product. Look for short, recognizable ingredient lists. "Enriched", "refined", or "hydrogenated" are red flags. Our app highlights key ingredients for you!';
    }
    if (msg.includes('vegetarian') || msg.includes('vegan')) {
        return '🌿 For vegetarians, watch for hidden animal-derived additives like gelatin (E441), cochineal/carmine red (E120), and L-cysteine (E910) in breads. Our app displays a green Vegetarian badge when a product is confirmed vegetarian by Open Food Facts.';
    }
    if (msg.includes('weight') || msg.includes('diet') || msg.includes('calori') || msg.includes('lose') || msg.includes('fat')) {
        return '⚖️ For weight management, focus on calorie density. High satiety foods with protein and fiber keep you full longer. Avoid ultra-processed foods (NOVA 4) which are engineered to be hyper-palatable. Even "diet" or "light" products can be high in sugar or artificial sweeteners.';
    }
    if (msg.includes('safe') && (msg.includes('pregnan') || msg.includes('expecting'))) {
        return '🤰 During pregnancy, avoid high-mercury fish, raw or unpasteurized products, and excess caffeine (<200mg/day). Be cautious with artificial sweeteners and high-sodium foods. Always consult your OB/GYN for personalized dietary advice during pregnancy.';
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('help')) {
        return 'Hi! 👋 I\'m NutriBot, your food safety assistant. You can ask me about:\n• "Is this product safe for diabetics?"\n• "What are the harmful additives?"\n• "How much sodium is too much?"\n• "Explain NOVA groups"\n\nWhat would you like to know?';
    }

    return 'That\'s a great question! 🤔 For accurate food safety advice tailored to your specific situation, I recommend:\n\n1. Checking the full product details page which shows detailed nutrient analysis\n2. Consulting a registered dietitian for personalized advice\n3. Looking up the specific ingredients on our product scanner\n\nIs there something specific about food safety or nutrition I can help you with?';
}

router.post('/analyze', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({
                success: false,
                error: 'GEMINI_API_KEY not configured',
                fallback: true
            });
        }

        const { productName, productBrands, nutrients, ingredientsText, customHealthIssues, customGoals } = req.body;

        if ((!customHealthIssues || customHealthIssues.length === 0) && (!customGoals || customGoals.length === 0)) {
            return res.json({ success: true, concerns: [], benefits: [], notes: [] });
        }

        // Build prompt
        const nutrientSummary = nutrients ? Object.entries(nutrients)
            .filter(([key, val]) => typeof val === 'number' && key.includes('_100g'))
            .map(([key, val]) => `${key.replace('_100g', '')}: ${val}`)
            .slice(0, 20)
            .join(', ') : 'Not available';

        const prompt = `You are a nutrition and health expert AI. Analyze whether this food product is suitable for a person with these specific health conditions and goals.

PRODUCT:
- Name: ${productName || 'Unknown'}
- Brand: ${productBrands || 'Unknown'}
- Key Nutrients per 100g: ${nutrientSummary}
- Ingredients: ${ingredientsText || 'Not available'}

USER'S CUSTOM HEALTH CONDITIONS:
${(customHealthIssues || []).map((issue, i) => `${i + 1}. ${issue}`).join('\n') || 'None'}

USER'S CUSTOM GOALS:
${(customGoals || []).map((goal, i) => `${i + 1}. ${goal}`).join('\n') || 'None'}

INSTRUCTIONS:
1. Analyze this product SPECIFICALLY for the user's stated conditions and goals.
2. Identify concrete concerns (negative impacts) and benefits (positive aspects).
3. For each concern or benefit, explain WHY in 1-2 sentences.
4. Be specific — reference actual nutrients or ingredients from the product.
5. If a condition or goal is unclear, still try your best interpretation.

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "concerns": [
    { "label": "short title", "reason": "specific explanation referencing the product", "source": "which condition/goal this relates to", "severity": "high or medium or low" }
  ],
  "benefits": [
    { "label": "short title", "reason": "specific explanation referencing the product", "source": "which condition/goal this relates to" }
  ],
  "overallNote": "A single sentence summary of whether this product is suitable"
}

If there are no concerns, return an empty array for concerns. Same for benefits. Always include overallNote.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', response.status, errorData);
            return res.json({
                success: false,
                error: `Gemini API error: ${response.status}`,
                fallback: true
            });
        }

        const data = await response.json();

        // Extract text from Gemini response
        const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from the response (handle potential markdown code fences)
        let parsed;
        try {
            // Try to extract JSON from the response text
            let jsonStr = textContent.trim();
            // Remove markdown code fences if present
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }
            parsed = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', textContent);
            return res.json({
                success: false,
                error: 'Failed to parse AI response',
                rawText: textContent,
                fallback: true
            });
        }

        res.json({
            success: true,
            concerns: (parsed.concerns || []).map(c => ({
                ...c,
                type: 'ai-custom',
                icon: '🤖'
            })),
            benefits: (parsed.benefits || []).map(b => ({
                ...b,
                type: 'ai-custom',
                icon: '🤖'
            })),
            overallNote: parsed.overallNote || '',
        });

    } catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: true
        });
    }
});

export default router;
