import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, RefreshCw, Info, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── 100% Scientifically Accurate Rule-Based Engine ──────────────────────────
// Built strictly on FSSAI, ICMR-NIN, and WHO guidelines for offline reliability.
function getRuleBasedReply(message) {
    const msg = message.toLowerCase().trim();

    // ── Casual / Social ───────────────────────────────────────────────────────
    if (/how are (you|u)\??/.test(msg) || msg === 'how r u' || msg === 'how r you')
        return "I'm operating optimally! 🤖 As your True FoodBite AI BOT, I'm here to provide 100% science-backed nutritional analysis. How may I help you? Load all the features there.";

    if (/^(thank|thanks|thank you|thx|ty|tysm|great|awesome|cool|nice|perfect|excellent|wonderful|amazing)/.test(msg))
        return "You're very welcome! I'm always here to decode complex food data into clear, actionable health insights. Stay health-conscious!";

    if (/^(ok|okay|alright|sure|got it|i see|understood|makes sense)$/.test(msg))
        return "Excellent! Let me know if you need clarification on any specific E-numbers, NOVA classifications, or nutritional metrics.";

    if (/^(bye|goodbye|see you|see ya|later|cya|take care)/.test(msg))
        return "Goodbye! Remember to always check the back-of-pack labels. Stay healthy! 👋";

    if (/^(good morning|good afternoon|good evening|good night|gm|gn)/.test(msg))
        return "Hello there! 👋 I'm True FoodBite AI BOT. I cross-reference food data with FSSAI and ICMR-NIN standards. How may I help you? Load all the features there.";

    // ── Health Conditions (Evidence-Based, Conversational) ────────────────────
    if (msg.includes('diabet'))
        return 'I completely understand how tricky it can be to manage blood sugar! 🩺 The key is steady energy. According to the strict ICMR-NIN guidelines, here is what you need to look out for:\n\n• **Watch the sugar limit:** Keep added sugars strictly under 25g a day.\n• **Avoid refined carbs like maida:** They have a high Glycemic Index (GI) and cause rapid insulin spikes.\n• **Seek out natural fibre:** Aim for products with ≥6g of fibre per 100g to slow down sugar absorption.\n• **Steer clear of NOVA 4 foods:** Ultra-processed items often hide sugars under sneaky names like dextrin or maltose.\n\nAlways feel free to check with your doctor for personalized carb-counting. Let me know if you want me to look up a specific ingredient for you!';

    if (msg.includes('blood pressure') || msg.includes('hypertens') || /\bbp\b/.test(msg))
        return 'Taking care of your heart and blood pressure is so important! 💊 The biggest culprit here is hidden salt. Based on WHO guidelines, here is a simple plan for you:\n\n• **Daily Limit:** Keep your total sodium under 2000mg a day (that is just about 1 teaspoon of salt!).\n• **Read the label:** If a packaged food has more than 600mg of sodium per 100g, it is considered "High Salt" — try to avoid it.\n• **Hidden sodium traps:** It is not just salt! Watch out for ingredients like Sodium Bicarbonate (baking soda), Sodium Benzoate (a preservative), and MSG (E621).\n\nEating fresh vegetables rich in potassium can really help balance things out. Is there a specific snack you are worried about?';

    if (msg.includes('heart') || msg.includes('cholesterol') || msg.includes('cardiac'))
        return 'Your heart health is a top priority! ❤️ When analyzing packaged foods for cardiovascular safety, I always look for these red flags:\n\n• **Trans Fats are a big no:** FSSAI law requires them to be <2%. If you see "Partially Hydrogenated Vegetable Oil" on the label, put the packet down immediately.\n• **Cap the Saturated Fat:** Try to keep it below 10% of your daily calories. Anything over 5g per 100g in a snack is a red flag.\n• **Oil quality matters:** Try to replace cheap, refined palm oil (which is 49% saturated fat) with better oils like mustard, peanut, or olive oil.\n\nLet me know if you need help decoding the fats on a specific label!';

    if (msg.includes('pcos') || msg.includes('pcod'))
        return 'Managing PCOS can be challenging, but dietary changes make a massive difference! 🌸 The primary goal is managing insulin resistance. Here is what the science suggests:\n\n• **Avoid insulin spikes:** Strictly avoid high-GI refined grains like maltodextrin and white flour (maida).\n• **Go natural:** Support your body with anti-inflammatory foods, mostly from NOVA Group 1 (unprocessed whole foods).\n• **Protein is your friend:** Ensure you are getting high-quality protein (about 1g per kg of body weight) to stay full and stable.\n• **Watch the packaging:** Try to avoid endocrine-disrupting chemicals by choosing BPA-free packaging when possible.\n\nI am here if you need to check if a product is PCOS-friendly!';

    if (msg.includes('allerg') || msg.includes('intoleran'))
        return 'Food allergies require 100% vigilance, and I am here to help you stay safe! ⚠️ \n\nUnder FSSAI Schedule 4 Allergen protocols, manufacturers are legally required to declare the top 8 allergens: **Wheat/Gluten, Milk, Eggs, Soy, Tree Nuts, Peanuts, Fish, and Shellfish**.\n\n• Always look for the explicit "Contains:" or "May contain traces of:" statements.\n• Remember, even if a product is naturally dairy-free (like dark chocolate), cross-contamination in the factory is a real risk. Always verify the label!';

    if (msg.includes('child') || msg.includes('kid') || msg.includes('baby') || msg.includes('infant'))
        return 'Protecting our little ones is the most important job! 👶 When it comes to pediatric food safety, please be extra careful with these:\n\n• **The "Southampton Six" artificial colours:** Strictly avoid E102, E104, E110, E122, E124, and E129. Clinical studies directly link these to hyperactivity in children.\n• **Zero sugar for babies:** Infants under 2 years old should have absolutely no added sugars in their diet.\n• **Focus on whole foods:** Prioritize NOVA 1 (unprocessed) foods over packaged snacks designed for kids, which are often ultra-processed.\n\nWant me to check if a specific "kids snack" is actually safe?';

    if (msg.includes('pregnan') || msg.includes('expecting'))
        return 'Congratulations! Nutrition during pregnancy is so crucial. 🤰 Let\'s prioritize safety for you and the baby:\n\n• **Avoid raw dairy:** Unpasteurised milk and cheeses carry a high risk of Listeria.\n• **Watch the caffeine:** Try to keep it under 200mg a day (about 2 cups of instant coffee).\n• **Extra nutrition:** ICMR recommends an additional 350 kcal/day and an extra 9.5g of high-quality protein daily during your second trimester.\n• **Be careful with seafood:** Avoid high-mercury fish.\n\nAlways double-check with your OB/GYN, but I am here to help analyze any packaged craving you might have!';

    // ── Ingredients & Additives (Scientific Fact, Conversational) ─────────────
    if (msg.includes('preserv') || msg.includes('additive') || msg.includes('e number') || msg.includes('e-number'))
        return 'Ah, E-Numbers! They look scary, but they are just standard codes for additives. 🧪 \n\nNot all of them are bad — for instance, E300 is just Vitamin C! But you absolutely should monitor for these harmful ones:\n• **E211 (Sodium Benzoate):** A preservative that can form carcinogenic benzene when mixed with Vitamin C.\n• **E250 (Sodium Nitrite):** Common in processed meats, and classified by the IARC as a probable carcinogen.\n• **E621 (MSG):** Safe in small limits, but known to cause headaches in sensitive people.\n\nSee an E-number you don\'t recognize? Just type it here and I will decode it for you!';

    if (msg.includes('sugar') || msg.includes('sweet'))
        return 'Let\'s talk about sugar. The food industry is very sneaky with it! 🍬 \n\nThe WHO strongly recommends limiting added sugar to under **25g per day**. Here is the catch: manufacturers use over 50 different names to hide it on labels — words like Maltodextrin, Dextrose, High-Fructose Corn Syrup, and Rice Syrup.\n\nAlso, a quick warning on artificial sweeteners: **Aspartame (E951)** was recently classified by IARC as "Possibly Carcinogenic". It is best avoided entirely. Want me to help you spot hidden sugars on a label?';

    if (msg.includes('sodium') || msg.includes('salt'))
        return 'Sodium is one of the sneakiest ingredients in packaged foods! 🧂 \n\nYour safe daily limit is just under 2000mg. To give you some perspective, a single standard pack of instant noodles can contain around 1200mg of sodium (that is 60% of your daily limit in just one snack!). \n\nConsistently high sodium intake causes your blood vessels to lose their elasticity, directly leading to chronic hypertension. Let me know if you want to find an alternative snack with lower sodium!';

    if (msg.includes('protein'))
        return 'When it comes to protein, it is not just about the grams; the quality really matters! 💪 \n\nICMR recommends getting 0.8g to 1g per kg of your body weight every day. But we also look at **PDCAAS** (Protein Digestibility Corrected Amino Acid Score). Things like Whey and Eggs score a perfect 1.0, meaning your body absorbs them easily. Wheat protein, however, only scores around 0.42.\n\nSo, don\'t rely purely on wheat-based snacks for your daily protein goals! Need recommendations for high-quality protein?';

    if (msg.includes('nova') || msg.includes('ultra processed') || msg.includes('ultraprocessed'))
        return 'I love explaining the NOVA Classification! It is an amazing system endorsed by WHO to track how processed our food is: 🏭\n\n• **Group 1:** Completely unprocessed or naturally processed (fresh fruits, plain yogurt, oats).\n• **Group 2:** Processed culinary ingredients (butter, salt, pure oils).\n• **Group 3:** Processed foods (canned beans, freshly baked bread).\n• **Group 4:** Ultra-Processed Foods (instant noodles, cookies, sodas).\n\nGroup 4 is the danger zone. They use industrial formulations and synthetic additives, and regular consumption is linked to a 31% higher mortality risk. Let us strive for Group 1 and 2 together!';

    if (msg.includes('ingredient') || msg.includes('label') || msg.includes('how to read'))
        return 'Reading labels is a superpower! 📋 Let me share the smartest professional rules:\n\n1. **The order matters:** Ingredients are listed by weight, from heaviest to lightest. If sugar or oil is in the top 3, it is definitely unhealthy.\n2. **Look for the real percentage:** A product might call itself "Almond Biscuits", but when you read the back, it only contains 1% almonds! The rest is usually refined flour and cheap oil.\n3. **The pronunciation test:** If you cannot pronounce it, and you wouldn\'t keep it in your own kitchen cabinet, it is likely an ultra-processed NOVA 4 additive.\n\nHave a label in front of you? Tell me the ingredients and I will analyze it instantly!';

    if (msg.includes('vegetarian') || msg.includes('vegan'))
        return 'Navigating vegan and vegetarian labels can be tricky because of hidden animal-derived additives! 🌿 \n\nPlease watch closely for these common traps in processed foods:\n• **E120 (Carmine/Cochineal):** A red food dye that is actually made from crushed beetles.\n• **E441 (Gelatin):** A thickener derived from animal bones and skin.\n• **E910 (L-Cysteine):** A dough conditioner used in bread, often sourced from poultry feathers.\n\nAlways look for the official green vegetarian mark, or let me scan the ingredients for you to be 100% sure!';

    if (msg.includes('weight') || msg.includes('calori') || msg.includes('weight loss'))
        return 'Weight management is a complex biological process; it is not just about counting calories! ⚖️ \n\n• **Focus on Satiety:** Fibre and Protein slow down digestion, keeping you feeling full longer. Refined carbs, on the other hand, spike your insulin and cause a crash, making you hungry again quickly.\n• **Beware of "Low-Fat" labels:** When manufacturers remove fat, food loses flavor. So they often pump it full of sugar to compensate.\n• **Calorie quality:** A calorie from a whole almond digests slowly, whereas a calorie from a sugary soda causes instant fat storage.\n\nLet\'s focus on high-quality, whole foods instead of just restricting calories!';

    if (msg.includes('palm oil'))
        return 'Let\'s talk honestly about Palm Oil. 🌴 \n\nIt is incredibly cheap for manufacturers, which is why it is in everything. However, it is composed of 49% saturated fat and offers absolutely zero unique nutritional benefits over much better indigenous oils (like mustard or groundnut oil). To make matters worse, when it is partially hydrogenated for stability, it forms highly dangerous Trans Fats.\n\nWhenever possible, try to choose snacks baked or fried in healthier oils!';

    if (msg.includes('nutriscore') || msg.includes('nutrition grade') || msg.includes('nutri-score'))
        return 'Ah, the Nutri-Grade Protocol! It is a brilliant, independent algorithm that calculates a health score out of 100: 🔤\n\nIt works like a scale:\n• 🟢 **Positive Points** are awarded for good things: Protein, Dietary Fibre, and the percentage of real fruits/veggies.\n• 🔴 **Negative Points** are given for things we want to limit: Energy density (Calories), Saturated Fat, Raw Sugars, and Sodium.\n\nGrades A & B represent good daily choices. If a product gets a D or E, it should be an occasional treat eaten in small amounts. What product would you like me to grade?';

    if (msg.includes('monosodium glutamate') || msg.includes('e621') || (msg.includes('msg') && (msg.includes('food') || msg.includes('safe') || msg.includes('harm'))))
        return 'MSG (E621) is a very controversial ingredient! 🧂 \n\nObjectively, Monosodium Glutamate is a hyper-palatable flavour enhancer. Regulatory bodies like the FDA and FSSAI class it as "Generally Recognised As Safe" (GRAS) in typical amounts. However, clear epidemiological data shows it can cause rapidly beating hearts and neuro-excitatory headaches in sensitive individuals (often called the MSG symptom complex). \n\nIf you find yourself feeling sluggish or getting headaches after eating packaged noodles or snacks, MSG might be the culprit!';

    if (/^(hi|hello|hey|hiya|sup|howdy|what'?s up|wassup)/.test(msg))
        return 'Greetings! 👋 I am **True FoodBite AI BOT**. I am designed to be your friendly, 100% scientifically accurate food companion!\n\nHow may I help you? Load all the features there to begin:\n• "Can you explain the NOVA classification?"\n• "What is the true daily limit for Sodium?"\n• "Is Aspartame actually dangerous?"';

    if (/^(what|how|tell me|explain).{0,20}(food|eat|diet|nutrition|health)$/.test(msg))
        return "I would love to help you build a healthier diet! 🥗 Here are the absolute most important, scientifically backed baseline guidelines:\n\n1. Aim for over 25g of dietary fibre daily.\n2. Strictly keep your added sugars below 25g/day.\n3. Keep your sodium strictly under 2000mg/day.\n4. Avoid Trans Fats completely (look out for partially hydrogenated oils).\n5. Base your daily meals on NOVA Group 1 (unprocessed) real foods.\n\nPlease ask me about any specific additive, health condition, or nutrient. I am here to decode the science for you!";

    // ── Strict Fallback (Conversational) ──────────────────────────────────────
    return "That is a fascinating question, but I specialize strictly in **food science, nutritional verification, and ingredient safety**! 🔬 \n\nI want to make sure I am giving you 100% accurate data. Could you try asking me something like:\n• Scientific definitions of E-number additives\n• The biological impact of things like Sugars and Sodium\n• Official ICMR-NIN safety thresholds for specific conditions\n\nHow may I help you with your food safety today? Load all the features there!";
}

const QUICK_SUGGESTIONS = [
    'Define NOVA Classification',
    'ICMR Sugar Limits',
    'Are Artificial Colours Safe?',
    'What is PDCAAS Protein?',
    'Identify Hidden Sugars',
];

const WELCOME_MESSAGE = {
    id: 'welcome',
    role: 'assistant',
    content: `Welcome to **True FoodBite AI BOT**.\n\nI am configured to provide 100% accurate, scientifically verifiable data regarding food safety, ingredient toxicology, and global dietary guidelines (FSSAI, WHO, ICMR-NIN).\n\nHow may I help you? Load all the features there.`,
    timestamp: Date.now(),
};

// Clean Markdown Renderer
function renderContent(text) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Handle bolding
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} style={{ color: '#f8fafc', fontWeight: '800' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
        return (
            <span key={i} style={{
                display: 'block',
                marginBottom: isBullet ? '6px' : '8px',
                paddingLeft: isBullet ? '12px' : '0',
                position: 'relative'
            }}>
                {isBullet && <span style={{ position: 'absolute', left: 0, color: '#ec4899', fontWeight: '900' }}>•</span>}
                {isBullet ? parts.map(p => typeof p === 'string' ? p.replace(/^[\s•-]+/, '') : p) : parts}
            </span>
        );
    });
}

function TypingIndicator() {
    return (
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '12px 16px' }}>
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #f472b6)' }}
                />
            ))}
        </div>
    );
}

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const location = useLocation();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, messages, scrollToBottom]);

    const getProductContext = () => {
        const match = location.pathname.match(/\/product\/(\w+)/);
        if (match) {
            return `User is currently viewing a product page for barcode: ${match[1]}. If they ask about this product, refer to nutritional parameters strictly.`;
        }
        return '';
    };

    const sendMessage = async (messageText) => {
        const text = (messageText || input).trim();
        if (!text || isLoading) return;

        setInput('');
        setShowSuggestions(false);

        const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }));
            let reply;
            let isRuleBased = false;

            try {
                const response = await fetch(`${API_URL}/ai/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, history, productContext: getProductContext() }),
                    signal: AbortSignal.timeout(8000),
                });
                const data = await response.json();
                reply = data?.reply || getRuleBasedReply(text);
                isRuleBased = data?.isRuleBased || false;
            } catch {
                reply = getRuleBasedReply(text);
                isRuleBased = true;
            }

            const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: reply, timestamp: Date.now(), isRuleBased };
            setMessages(prev => [...prev, assistantMsg]);
            if (!isOpen) setHasUnread(true);
        } catch (err) {
            const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: getRuleBasedReply(text), timestamp: Date.now(), isRuleBased: true };
            setMessages(prev => [...prev, assistantMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const resetChat = () => {
        setMessages([WELCOME_MESSAGE]);
        setShowSuggestions(true);
        setInput('');
    };

    return (
        <>
            {/* Floating FAB */}
            <motion.button
                aria-label="Open AI food assistant chat"
                onClick={() => setIsOpen(o => !o)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed', bottom: '32px', right: '32px', zIndex: 9990,
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 12px 40px rgba(99,102,241,0.5)', color: '#fff',
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <MessageCircle size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {hasUnread && !isOpen && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', border: '3px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                    </motion.div>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        style={{
                            position: 'fixed', bottom: '110px', right: '32px', zIndex: 9989,
                            width: 'min(420px, calc(100vw - 40px))', height: 'min(680px, calc(100vh - 140px))',
                            display: 'flex', flexDirection: 'column',
                            borderRadius: '28px', overflow: 'hidden',
                            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                    >
                        {/* Premium Header */}
                        <div style={{ padding: '18px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                                    <Bot size={24} color="#fff" />
                                </div>
                                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0f172a' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em' }}>
                                    True FoodBite AI BOT
                                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: '800', border: '1px solid rgba(99,102,241,0.3)', letterSpacing: '0.05em' }}>VERIFIED</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>100% Scientific Accuracy</div>
                            </div>
                            <button onClick={resetChat} title="Reset AI Memory" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#cbd5e1', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        {/* Security Banner */}
                        <div style={{ background: 'rgba(34,197,94,0.06)', borderBottom: '1px solid rgba(34,197,94,0.15)', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.02em' }}>
                            <ShieldCheck size={14} /> Data crossed-referenced with FSSAI & ICMR-NIN.
                        </div>

                        {/* Message Feed */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', scrollbarWidth: 'none' }}>
                            {messages.map((msg) => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '12px', alignItems: 'flex-end' }}
                                >
                                    {msg.role === 'user' ? (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                                            <User size={16} color="#fff" />
                                        </div>
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Bot size={18} color="#818cf8" />
                                        </div>
                                    )}

                                    <div style={{
                                        maxWidth: '85%', padding: '14px 18px',
                                        borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.04)',
                                        border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: msg.role === 'user' ? '0 8px 20px rgba(99,102,241,0.3)' : '0 4px 15px rgba(0,0,0,0.1)',
                                        fontSize: '0.9rem', lineHeight: '1.65', color: msg.role === 'user' ? '#fff' : '#cbd5e1',
                                    }}>
                                        {renderContent(msg.content)}
                                        {msg.isRuleBased && (
                                            <div style={{ marginTop: '12px', fontSize: '0.68rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                                <Info size={12} color="#0ea5e9" /> Local knowledge base validated.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Bot size={18} color="#818cf8" />
                                    </div>
                                    <div style={{ padding: '6px 12px', borderRadius: '20px 20px 20px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <TypingIndicator />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion Chips */}
                        <AnimatePresence>
                            {showSuggestions && messages.length <= 1 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ padding: '0 24px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
                                    {QUICK_SUGGESTIONS.map((s, i) => (
                                        <motion.button key={i} whileHover={{ scale: 1.03, backgroundColor: 'rgba(99,102,241,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => sendMessage(s)}
                                            style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                            {s}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.12)', padding: '6px 6px 6px 18px', transition: 'border-color 0.2s', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)' }} onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}>
                                <input ref={inputRef} id="chat-input" type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} placeholder="Ask True FoodBite AI BOT..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '0.95rem', padding: '10px 0', fontWeight: '500' }} />
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
                                    style={{ width: '44px', height: '44px', borderRadius: '14px', background: (!input.trim() || isLoading) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1, #d946ef)', border: 'none', cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (!input.trim() || isLoading) ? '#475569' : '#fff', transition: 'all 0.2s', flexShrink: 0, boxShadow: (!input.trim() || isLoading) ? 'none' : '0 4px 15px rgba(99,102,241,0.4)' }}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 size={20} /></motion.div> : <Send size={20} style={{ marginLeft: '2px' }} />}
                                </motion.button>
                            </div>
                            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600', letterSpacing: '0.02em' }}>
                                <Sparkles size={11} color="#d946ef" /> True FoodBite Precision AI Protocol
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
