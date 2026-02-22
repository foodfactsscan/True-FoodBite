import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Local rule-based fallback (works 100% offline / without backend) ─────────
function getRuleBasedReply(message) {
    const msg = message.toLowerCase().trim();

    // ── Casual / social conversation ─────────────────────────────────────────
    if (/how are (you|u)\??/.test(msg) || msg === 'how r u' || msg === 'how r you')
        return "I'm doing great, thanks for asking! 😊 I'm NutriBot — always ready to help you make healthier food choices.\n\nTry asking me:\n• \"Is this safe for diabetics?\"\n• \"What does NOVA score mean?\"\n• \"How much sugar per day is safe?\"";

    if (/who are you|what are you|tell me about yourself|what is nutribot|what can you do|what's your name|what is your name/.test(msg))
        return "I'm **NutriBot** 🤖, your AI food safety assistant built into FactsScan!\n\nI can help with:\n• Food safety for health conditions (diabetes, BP, heart, PCOS…)\n• Understanding ingredients, E-numbers & additives\n• Reading nutrition labels & NOVA scores\n• Safe foods for kids, pregnancy & more\n\nJust ask me anything food-related!";

    if (/^(thank|thanks|thank you|thx|ty|tysm|great|awesome|cool|nice|perfect|excellent|wonderful|amazing)/.test(msg))
        return "You're welcome! 😊 Feel free to ask me anything else about food safety or nutrition. Happy to help!";

    if (/^(ok|okay|alright|sure|got it|i see|understood|makes sense)$/.test(msg))
        return "Got it! 👍 Let me know if you have any other food or nutrition questions — I'm here to help!";

    if (/^(bye|goodbye|see you|see ya|later|cya|take care)/.test(msg))
        return "Goodbye! 👋 Stay healthy and keep scanning with FactsScan. Come back anytime!";

    if (msg.includes('joke') || msg.includes('funny'))
        return "Here's a food one 😄: Why did the tomato turn red? Because it saw the salad dressing! 🍅\n\nOn a serious note — I'm best at food safety questions. Ask me about ingredients, nutrition, or health conditions!";

    if (/^(good morning|good afternoon|good evening|good night|gm|gn)/.test(msg))
        return "Good to see you! 👋 I'm NutriBot, your food safety assistant. What food question can I help you with today?";

    if (/^(what|how|tell me|explain).{0,20}(food|eat|diet|nutrition|health)$/.test(msg))
        return "Great topic! 🥗 Quick healthy eating tips:\n• Choose NOVA 1 & 2 foods over ultra-processed\n• Limit sugar to <25g/day & sodium to <2000mg/day\n• Prefer whole grains over refined maida\n• Aim for Nutri-Score A or B\n\nAsk about a specific condition or ingredient for more!";

    // ── Food & nutrition topics ───────────────────────────────────────────────
    if (msg.includes('diabet'))
        return '🩺 For diabetics, watch out for high sugar (>5g/100g), refined carbs, and high-GI ingredients like maida. Prefer whole grains, fibre-rich foods, and low-sugar products. Aim for Nutri-Score A or B. Consult your doctor for personalised advice.';
    if (msg.includes('blood pressure') || msg.includes('hypertens') || /\bbp\b/.test(msg))
        return '💊 For high blood pressure, limit sodium to under 2000 mg/day. Avoid products with >600 mg sodium per 100 g. Watch for sodium chloride, sodium benzoate, and MSG in ingredients. Potassium-rich foods help balance BP.';
    if (msg.includes('heart') || msg.includes('cholesterol') || msg.includes('cardiac'))
        return '❤️ For heart health, limit saturated fat (<10% of calories) and avoid trans fats. "Hydrogenated vegetable oil" in the ingredient list = trans fats. Choose NOVA Group 1–2 products with Nutriscore A or B.';
    if (msg.includes('pcos') || msg.includes('pcod'))
        return '🌸 For PCOS, focus on low-GI foods, high fibre, and anti-inflammatory ingredients. Avoid refined sugars and ultra-processed foods (NOVA 4). Omega-3-rich foods are often recommended.';
    if (msg.includes('allerg') || msg.includes('intoleran'))
        return '⚠️ Always check the Allergens section on the product page. Common allergens: gluten, dairy, nuts, soy, eggs. FactsScan highlights detected allergens in red at the top of every product page.';
    if (msg.includes('child') || msg.includes('kid') || msg.includes('baby') || msg.includes('infant'))
        return '👶 For children, avoid artificial colours (E102, E110, E122, E129, E133), excess sugar, and high sodium — linked to hyperactivity. Choose NOVA Group 1 or 2. Whole foods are always best for growing kids.';
    if (msg.includes('preserv') || msg.includes('additive') || msg.includes('e number') || msg.includes('e-number'))
        return '🧪 E-numbers are EU codes for food additives — not all harmful. E300 (Vitamin C) is good; watch out for E621 (MSG), E211 (Sodium Benzoate), and artificial colours like E102 & E110. FactsScan colour-codes additives by risk level.';
    if (msg.includes('sugar') || msg.includes('sweet'))
        return '🍬 WHO recommends <25g added sugar/day (≈6 tsp). "No added sugar" ≠ sugar-free — check for natural sugars too. Artificial sweeteners carry mixed long-term evidence.';
    if (msg.includes('sodium') || msg.includes('salt'))
        return '🧂 Daily sodium limit: 2000 mg (≈1 tsp of salt). Many packaged snacks exceed 50% of this per serving. Anything >600 mg/100g is high sodium.';
    if (msg.includes('protein'))
        return '💪 Most adults need 0.8–1.2g protein/kg body weight daily. Look for ≥10g protein per serving. Good Indian sources: high-protein dals, fortified cereals, yogurt-based snacks.';
    if (msg.includes('nova') || msg.includes('ultra processed') || msg.includes('ultraprocessed'))
        return '🏭 NOVA classifies food by processing:\n• NOVA 1: Unprocessed (fruits, veggies, dairy)\n• NOVA 2: Culinary ingredients (oil, salt, sugar)\n• NOVA 3: Processed (canned, pickled)\n• NOVA 4: Ultra-processed (snacks, instant noodles, sodas)\n\nMinimise NOVA 4 in your daily diet.';
    if (msg.includes('ingredient') || msg.includes('label') || msg.includes('how to read'))
        return '📋 Ingredients are listed from most to least by weight. If sugar is in the first 3, it\'s high-sugar. Short, recognisable lists are best. "Enriched", "refined", or "hydrogenated" = red flags.';
    if (msg.includes('vegetarian') || msg.includes('vegan'))
        return '🌿 Watch for hidden animal-derived additives: gelatin (E441), cochineal/carmine (E120), L-cysteine (E910) in bread. FactsScan shows a green Vegetarian badge when confirmed by Open Food Facts.';
    if (msg.includes('weight') || msg.includes('calori') || msg.includes('weight loss'))
        return '⚖️ High-protein and high-fibre foods keep you fuller longer. Avoid ultra-processed NOVA 4 foods. Even "diet" or "light" products can be high in sugar or sweeteners.';
    if (msg.includes('pregnan') || msg.includes('expecting'))
        return '🤰 During pregnancy: avoid high-mercury fish, raw/unpasteurised products, excess caffeine (<200mg/day). Be cautious with artificial sweeteners and high-sodium foods. Always consult your OB/GYN.';
    if (msg.includes('nutriscore') || msg.includes('nutrition grade') || msg.includes('nutri-score'))
        return '🔤 Nutri-Score (A–E) rates nutritional quality: A = best, E = worst. It weighs positive nutrients (fibre, protein) vs negative (sugar, salt, saturated fat) per 100g.';
    if (msg.includes('maida') || msg.includes('refined flour') || msg.includes('white flour'))
        return '⚠️ Maida (refined wheat flour) is stripped of fibre & nutrients, high-GI, and linked to weight gain. Prefer 100% whole-wheat atta products.';
    if (msg.includes('monosodium glutamate') || msg.includes('e621') || (msg.includes('msg') && (msg.includes('food') || msg.includes('safe') || msg.includes('harm'))))
        return '🧂 MSG (E621) is a flavour enhancer in snacks and instant noodles. Generally safe per FSSAI & WHO at typical food levels. Some people report sensitivity — moderation is key.';
    if (/^(hi|hello|hey|hiya|sup|howdy|what'?s up|wassup)/.test(msg))
        return 'Hi! 👋 I\'m NutriBot, your food safety assistant!\n\nAsk me anything like:\n• "Is this safe for diabetics?"\n• "What are harmful additives?"\n• "How much sodium is too much?"\n• "Explain NOVA groups"';

    // ── Fallback for genuinely unrecognised queries ───────────────────────────
    return "Hmm, I'm not sure about that! 🤔 I specialise in **food safety and nutrition**. Try asking:\n\n• \"Is this safe for diabetics?\"\n• \"What is NOVA score?\"\n• \"Are artificial colours harmful?\"\n• \"How much sugar per day is safe?\"\n\nI'd love to help with anything food-related!";
}


const QUICK_SUGGESTIONS = [
    'Is this safe for diabetics?',
    'What are harmful additives?',
    'How to read food labels?',
    'Best foods for weight loss?',
    'What is NOVA score?',
    'Safe for kids?',
];

const WELCOME_MESSAGE = {
    id: 'welcome',
    role: 'assistant',
    content: `Hi! 👋 I'm **NutriBot**, your personal food safety expert.

Ask me anything about:
• Food safety for your health condition
• Ingredients, additives & E-numbers
• Nutrition tips & label reading
• Safe foods for kids, diabetics, etc.`,
    timestamp: Date.now(),
};

// Render markdown-lite: bold, bullets
function renderContent(text) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Replace **bold**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
        return (
            <span key={i} style={{ display: 'block', marginBottom: isBullet ? '2px' : '4px', paddingLeft: isBullet ? '4px' : 0 }}>
                {parts}
            </span>
        );
    });
}

function TypingIndicator() {
    return (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '12px 16px' }}>
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    }}
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

    // Scroll to bottom
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

    // Get product context from current URL/page if on a product page
    const getProductContext = () => {
        const match = location.pathname.match(/\/product\/(\w+)/);
        if (match) {
            return `User is currently viewing a product page for barcode: ${match[1]}. If they ask about this product, note you only have the barcode but not the full details in this context.`;
        }
        return '';
    };

    const sendMessage = async (messageText) => {
        const text = (messageText || input).trim();
        if (!text || isLoading) return;

        setInput('');
        setShowSuggestions(false);

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Build history (exclude welcome message)
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));

            let reply;
            let isRuleBased = false;

            try {
                const response = await fetch(`${API_URL}/ai/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        history,
                        productContext: getProductContext(),
                    }),
                    signal: AbortSignal.timeout(8000), // 8-second timeout
                });

                const data = await response.json();
                reply = data?.reply || getRuleBasedReply(text);
                isRuleBased = data?.isRuleBased || false;
            } catch {
                // Backend unreachable — use local rule-based engine silently
                reply = getRuleBasedReply(text);
                isRuleBased = true;
            }

            const assistantMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: reply,
                timestamp: Date.now(),
                isRuleBased,
            };

            setMessages(prev => [...prev, assistantMsg]);
            if (!isOpen) setHasUnread(true);

        } catch (err) {
            // Absolute last resort — still show something useful
            const assistantMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: getRuleBasedReply(text),
                timestamp: Date.now(),
                isRuleBased: true,
            };
            setMessages(prev => [...prev, assistantMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const resetChat = () => {
        setMessages([WELCOME_MESSAGE]);
        setShowSuggestions(true);
        setInput('');
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                id="chat-assistant-btn"
                aria-label="Open AI food assistant chat"
                onClick={() => setIsOpen(o => !o)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: '28px',
                    right: '28px',
                    zIndex: 9990,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.45)',
                    color: '#fff',
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X size={26} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <MessageCircle size={26} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Unread badge */}
                {hasUnread && !isOpen && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            width: '18px', height: '18px', borderRadius: '50%',
                            background: '#ef4444', border: '2px solid #0a0a19',
                            fontSize: '10px', color: '#fff', fontWeight: '800',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        !
                    </motion.div>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="chat-assistant-window"
                        initial={{ opacity: 0, scale: 0.85, y: 20, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '24px',
                            zIndex: 9989,
                            width: 'min(400px, calc(100vw - 32px))',
                            maxHeight: 'min(600px, calc(100vh - 130px))',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            background: 'rgba(10, 10, 28, 0.96)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(124, 58, 237, 0.35)',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(236,72,153,0.2) 100%)',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Bot size={22} color="#fff" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    NutriBot
                                    <span style={{
                                        fontSize: '0.65rem', padding: '2px 7px', borderRadius: '20px',
                                        background: 'rgba(124,58,237,0.3)', color: '#c4b5fd',
                                        fontWeight: '600', border: '1px solid rgba(124,58,237,0.4)',
                                    }}>
                                        AI
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                    Food Safety Expert • Online
                                </div>
                            </div>
                            <button
                                onClick={resetChat}
                                title="Reset conversation"
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px', color: '#94a3b8', cursor: 'pointer',
                                    padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            >
                                <RefreshCw size={15} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(124,58,237,0.3) transparent',
                        }}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                        gap: '8px',
                                        alignItems: 'flex-end',
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #3b82f6, #7c3aed)'
                                            : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {msg.role === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} color="#fff" />}
                                    </div>

                                    {/* Bubble */}
                                    <div style={{
                                        maxWidth: '82%',
                                        padding: '10px 14px',
                                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                                            : msg.isError
                                                ? 'rgba(239,68,68,0.15)'
                                                : 'rgba(255,255,255,0.06)',
                                        border: msg.role === 'user'
                                            ? 'none'
                                            : msg.isError
                                                ? '1px solid rgba(239,68,68,0.3)'
                                                : '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: msg.role === 'user' ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                        color: '#e2e8f0',
                                    }}>
                                        {renderContent(msg.content)}
                                        {msg.isRuleBased && (
                                            <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                                                ⚡ Quick answer (AI offline mode)
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
                                >
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Bot size={14} color="#fff" />
                                    </div>
                                    <div style={{
                                        padding: '4px 8px', borderRadius: '18px 18px 18px 4px',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}>
                                        <TypingIndicator />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick suggestions */}
                        <AnimatePresence>
                            {showSuggestions && messages.length <= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        padding: '0 16px 12px',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                        flexShrink: 0,
                                    }}
                                >
                                    {QUICK_SUGGESTIONS.map((s, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => sendMessage(s)}
                                            style={{
                                                padding: '5px 11px',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(124,58,237,0.4)',
                                                background: 'rgba(124,58,237,0.1)',
                                                color: '#c4b5fd',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.22)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                                        >
                                            {s}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input area */}
                        <div style={{
                            padding: '12px 16px',
                            borderTop: '1px solid rgba(255,255,255,0.07)',
                            background: 'rgba(0,0,0,0.2)',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '14px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '4px 4px 4px 14px',
                                transition: 'border-color 0.2s',
                            }}
                                onFocus={() => { }}
                            >
                                <input
                                    ref={inputRef}
                                    id="chat-assistant-input"
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about food safety..."
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: '#e2e8f0',
                                        fontSize: '0.9rem',
                                        padding: '6px 0',
                                    }}
                                />
                                <motion.button
                                    id="chat-send-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    style={{
                                        width: '38px', height: '38px', borderRadius: '10px',
                                        background: (!input.trim() || isLoading)
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                        border: 'none',
                                        cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: (!input.trim() || isLoading) ? '#475569' : '#fff',
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                        boxShadow: (!input.trim() || isLoading) ? 'none' : '0 4px 12px rgba(124,58,237,0.4)',
                                    }}
                                >
                                    {isLoading ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Loader2 size={17} />
                                        </motion.div>
                                    ) : (
                                        <Send size={17} />
                                    )}
                                </motion.button>
                            </div>
                            <div style={{
                                marginTop: '6px', textAlign: 'center',
                                fontSize: '0.68rem', color: '#475569',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            }}>
                                <Sparkles size={10} />
                                Powered by Gemini AI • Not a substitute for medical advice
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
