/**
 * SearchAutocomplete — Live Instant Search Dropdown
 * ================================================================
 * HOW IT WORKS:
 *   - As user types ANY character (not a pure number/barcode),
 *     it queries OpenFoodFacts API after 300ms debounce
 *   - Shows a dropdown BELOW the search bar with up to 10 results
 *   - Each result shows: product image, name, brand, Nutri-Grade
 *   - Click any result → goes straight to that product page
 *   - Keyboard: ↑↓ to navigate, Enter to select, Esc to close
 *   - The dropdown renders relative to the OUTER WRAPPER div
 *     (NOT inside the pill container) so it is never clipped
 * ================================================================
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, TrendingUp, ChevronRight } from 'lucide-react';

// ─── Nutri-Grade colors ───────────────────────────────────────────
const GRADE = {
    a: { bg: '#16a34a', label: 'A' },
    b: { bg: '#65a30d', label: 'B' },
    c: { bg: '#ca8a04', label: 'C' },
    d: { bg: '#ea580c', label: 'D' },
    e: { bg: '#dc2626', label: 'E' },
};

// ─── Debounce ────────────────────────────────────────────────────
function useDebounce(val, ms) {
    const [deb, setDeb] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setDeb(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return deb;
}

// ─── Fetch suggestions from OpenFoodFacts ────────────────────────
async function fetchSuggestions(query) {
    const q = encodeURIComponent(query.trim());
    const fields = 'fields=_id,product_name,brands,image_front_small_url,nutrition_grades';
    const base = `https://world.openfoodfacts.org/cgi/search.pl?action=process&json=1&page_size=8&sort_by=popularity&${fields}`;

    const [indiaRes, globalRes] = await Promise.allSettled([
        fetch(`${base}&search_terms=${q}&tagtype_0=countries&tag_contains_0=contains&tag_0=india`,
            { headers: { 'User-Agent': 'True FoodBite/2.0' } }
        ).then(r => r.json()),
        fetch(`${base}&search_terms=${q}`,
            { headers: { 'User-Agent': 'True FoodBite/2.0' } }
        ).then(r => r.json()),
    ]);

    const india = indiaRes.status === 'fulfilled' ? (indiaRes.value?.products || []) : [];
    const global = globalRes.status === 'fulfilled' ? (globalRes.value?.products || []) : [];

    const seen = new Set();
    const results = [];
    for (const p of [...india, ...global]) {
        const id = p._id || p.code;
        if (!id || seen.has(id) || !p.product_name || p.product_name.length < 2) continue;
        seen.add(id);
        results.push(p);
        if (results.length >= 10) break;
    }
    return results;
}

// ════════════════════════════════════════════════════════════════
// Main Component
// Props:
//   value       — controlled input value
//   onChange    — (string) => void
//   onSubmit    — () => void  (called when form should submit)
//   loading     — bool (search in progress)
//   isOffline   — bool
// ════════════════════════════════════════════════════════════════
const SearchAutocomplete = ({ value, onChange, onSubmit, loading, isOffline }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);

    const inputRef = useRef(null);
    const wrapperRef = useRef(null);   // outer wrapper — dropdown is relative to THIS
    const listRef = useRef(null);
    const navigate = useNavigate();

    const debounced = useDebounce(value, 300);
    const isBarcode = /^\d+$/.test(debounced.trim());

    // ── Fetch suggestions whenever debounced query changes ──────
    useEffect(() => {
        const q = debounced.trim();
        if (!q || q.length < 1 || isBarcode) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        let cancelled = false;
        setFetching(true);

        fetchSuggestions(q)
            .then(res => {
                if (cancelled) return;
                setSuggestions(res);
                setOpen(res.length > 0);
                setFetching(false);
                setActiveIdx(-1);
            })
            .catch(() => {
                if (!cancelled) { setSuggestions([]); setFetching(false); }
            });

        return () => { cancelled = true; };
    }, [debounced, isBarcode]);

    // ── Close on outside click ──────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setActiveIdx(-1);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Navigate to product ─────────────────────────────────────
    const selectProduct = useCallback((product) => {
        const id = product._id || product.code;
        if (!id) return;
        setOpen(false);
        setSuggestions([]);
        setActiveIdx(-1);
        onChange('');
        navigate(`/product/${id}`);
    }, [navigate, onChange]);

    // ── Scroll active item into view ────────────────────────────
    useEffect(() => {
        if (activeIdx >= 0 && listRef.current) {
            const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
            el?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIdx]);

    // ── Keyboard handler ────────────────────────────────────────
    const handleKeyDown = (e) => {
        if (!open || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, -1));
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            e.stopPropagation();
            selectProduct(suggestions[activeIdx]);
        } else if (e.key === 'Escape') {
            setOpen(false);
            setActiveIdx(-1);
        }
    };

    const handleChange = (e) => {
        onChange(e.target.value);
        setActiveIdx(-1);
    };

    const handleClear = () => {
        onChange('');
        setSuggestions([]);
        setOpen(false);
        inputRef.current?.focus();
    };

    return (
        /**
         * OUTER WRAPPER — position:relative so the dropdown (position:absolute)
         * is anchored to this element, NOT the pill container.
         * This ensures the dropdown is NEVER clipped.
         */
        <div ref={wrapperRef} style={{ position: 'relative', flex: 1 }}>

            {/* ── INPUT ROW (inside the pill) ── */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Search
                    size={20}
                    style={{ marginLeft: '1.2rem', color: '#64748b', flexShrink: 0, pointerEvents: 'none' }}
                />
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="search"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={isOffline ? 'Search cached products...' : 'Type to search any food product...'}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setOpen(true);
                    }}
                    style={{
                        flex: 1, background: 'transparent', border: 'none',
                        color: '#f1f5f9', padding: '1rem 0.75rem',
                        fontSize: '1rem', outline: 'none',
                    }}
                />
                {/* Spinner or clear button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingRight: '0.5rem', flexShrink: 0 }}>
                    {fetching && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                            style={{ display: 'flex' }}
                        >
                            <Loader size={16} color="#6366f1" />
                        </motion.div>
                    )}
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Clear search"
                            style={{
                                background: 'rgba(255,255,255,0.08)', border: 'none',
                                color: '#94a3b8', cursor: 'pointer', padding: '0.3rem',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                            }}
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── FOCUS BACKDROP — Dims background when searching ── */}
            <AnimatePresence>
                {open && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: '-200vh', /* Large enough to cover everything */
                            background: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 9000,
                            pointerEvents: 'none', /* Click through to close */
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════
                DROPDOWN — absolutely positioned relative to wrapperRef
            ════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {open && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 14px)',
                            left: 0,
                            right: 0,
                            zIndex: 10000,
                            background: 'rgba(10, 15, 28, 0.96)',
                            backdropFilter: 'blur(50px)',
                            borderRadius: '28px',
                            border: '1px solid rgba(255,255,255,0.14)',
                            boxShadow: '0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(99,102,241,0.25)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '0.8rem 1.4rem',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            <TrendingUp size={14} color="#6366f1" />
                            <span style={{
                                fontSize: '0.7rem', fontWeight: '800', color: '#64748b',
                                textTransform: 'uppercase', letterSpacing: '0.1em'
                            }}>
                                Trending Results For "{debounced}"
                            </span>
                        </div>

                        {/* Scrollable list */}
                        <div
                            ref={listRef}
                            style={{ 
                                maxHeight: '420px', 
                                overflowY: 'auto', 
                                scrollbarWidth: 'none', /* Hide scrollbar for cleaner look */
                                msOverflowStyle: 'none'
                            }}
                        >
                            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                            {suggestions.map((product, idx) => {
                                const grade = product.nutrition_grades?.toLowerCase();
                                const gs = GRADE[grade];
                                const isActive = idx === activeIdx;

                                return (
                                    <button
                                        key={product._id || idx}
                                        data-idx={idx}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            selectProduct(product);
                                        }}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.85rem 1.4rem',
                                            background: isActive
                                                ? 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(99,102,241,0.02))'
                                                : 'transparent',
                                            border: 'none',
                                            borderBottom: idx < suggestions.length - 1
                                                ? '1px solid rgba(255,255,255,0.04)'
                                                : 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {/* Product image */}
                                        <div style={{
                                            width: '50px', height: '50px', flexShrink: 0,
                                            borderRadius: '14px', overflow: 'hidden',
                                            background: product.image_front_small_url ? '#fff' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                                        }}>
                                            {product.image_front_small_url ? (
                                                <img
                                                    src={product.image_front_small_url}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    onError={e => { e.target.parentNode.innerHTML = '<span style="font-size:1.4rem">🍱</span>'; }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '1.4rem' }}>🍱</span>
                                            )}
                                        </div>

                                        {/* Name + Brand */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: '800', fontSize: '0.95rem', color: isActive ? '#fff' : '#e2e8f0',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                letterSpacing: '-0.01em',
                                            }}>
                                                {product.product_name}
                                            </div>
                                            {product.brands && (
                                                <div style={{
                                                    fontSize: '0.78rem', color: isActive ? '#94a3b8' : '#64748b', marginTop: '3px',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {product.brands.split(',')[0].trim()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Nutri-Grade */}
                                        {gs && (
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                                                background: gs.bg, color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '900', fontSize: '0.9rem',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                            }}>
                                                {gs.label}
                                            </div>
                                        )}

                                        {/* Arrow */}
                                        <ChevronRight size={16} color={isActive ? '#6366f1' : '#1e293b'} style={{ flexShrink: 0, transform: isActive ? 'translateX(2px)' : 'none', transition: 'transform 0.2s' }} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '0.7rem 1.4rem',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.01)',
                        }}>
                            <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: '500' }}>↑↓ Navigate · Enter Select · Esc Close</span>
                            <span style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: '700' }}>View Detailed Analysis →</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchAutocomplete;
