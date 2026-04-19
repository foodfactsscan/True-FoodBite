import { useMemo } from 'react';
import { motion } from 'framer-motion';

const INGREDIENTS = [
    '🌶️', // Chilli
    '🧂', // Salt/Spice
    '🧀', // Cheese
    '🍯', // Sugar / Honey
    '🥛', // Milk
    '🍃', // Herb
    '🧅', // Onion
    '🌾', // Wheat
    '🧄', // Garlic
    '🥜', // Nuts
    '🍅', // Tomato
    '🥑', // Avocado
    '🥦', // Broccoli
    '🥕', // Carrot
    '🌽', // Corn
    '🥔', // Potato
    '🥩', // Meat
    '🥚', // Egg
    '🍞', // Bread
    '🍎', // Apple
    '🍋', // Lemon
    '☕', // Coffee
    '🍄', // Mushroom
];

export default function FloatingBackground() {
    // We use useMemo to prevent recalculating layout shifts on re-renders, 
    // ensuring absolute silky smooth animation persistence.
    const particles = useMemo(() => {
        // Enforcing exactly 30 particles to prevent clutter
        const NUM_PARTICLES = 30;
        return Array.from({ length: NUM_PARTICLES }).map((_, i) => ({
            id: i,
            // Cycle through ingredients so we get a perfectly diverse mix
            item: INGREDIENTS[i % INGREDIENTS.length],
            // MATHEMATICAL SPREAD: i / NUM_PARTICLES guarantees they spawn across 0% to 100%. 
            // We add a tiny random jitter (+/- 3%) so it looks organic and not like a rigid grid line
            leftPosition: (i / NUM_PARTICLES) * 105 + (Math.random() * 6 - 3), 
            // Subtle, complex drift on X-axis and Y-axis for organic movement
            driftX: (Math.random() - 0.5) * 100, // max 50px drift left or right
            // Slow, elegant premium speeds
            duration: Math.random() * 45 + 30, 
            // Negative delays so they are already spread out vertically when app loads
            delay: Math.random() * -60, 
            scale: Math.random() * 0.6 + 0.4, // Keep them slightly smaller so they are completely clutter free
            rotateStart: Math.random() * 360,
            rotateEnd: Math.random() * 720, // Gentle double rotation over the huge duration
        }));
    }, []);

    return (
        <div style={{
            position: 'fixed', 
            top: 0, left: 0, width: '100vw', height: '100vh', 
            overflow: 'hidden', 
            pointerEvents: 'none', // Crucial: don't block clicks!
            zIndex: -1, // Keep it behind all glassmorphic UI elements
            // Ultra-deep space design for maximum contrast with main screen UI cards
            background: 'radial-gradient(circle at bottom right, #0f172a 0%, #020617 60%, #000000 100%)' 
        }}>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{
                        y: '120vh',
                        x: 0,
                        rotate: p.rotateStart,
                        opacity: 0,
                    }}
                    animate={{
                        y: '-20vh',
                        x: p.driftX,
                        rotate: p.rotateEnd,
                        // Fade in, hold perfectly visible, fade out slowly before leaving screen
                        opacity: [0, 0.12, 0.12, 0], 
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: p.delay,
                    }}
                    style={{
                        position: 'absolute',
                        left: `${p.leftPosition}%`, // Ensures elements render at every corner and completely fill horizontal space
                        fontSize: '3.5rem',
                        scale: p.scale,
                        // Crisp clear images with deep shadow to stay rooted in the background
                        filter: 'drop-shadow(0px 15px 15px rgba(0,0,0,0.6))',
                        willChange: 'transform, opacity' // Hardware Acceleration guarantee
                    }}
                >
                    {p.item}
                </motion.div>
            ))}
        </div>
    );
}
