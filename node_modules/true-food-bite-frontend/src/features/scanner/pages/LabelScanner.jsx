/**
 * LabelScanner — OCR-based food label scanning page
 * Supports: camera capture, image upload, drag-and-drop
 * Extracts: ingredients + nutrition panel from food labels
 */
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileText, AlertTriangle, X, Check, ChevronDown, ChevronUp, RotateCcw, ZoomIn, Clipboard, ArrowRight, ScanLine, Loader, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeLabelImage } from '../services/ocrService';

// ─── Risk Categorization ──────────────────────────────────────────────────────
const HIGH_RISK_INGREDIENTS = [
    'msg', 'monosodium glutamate', 'aspartame', 'acesulfame', 'sucralose',
    'sodium nitrite', 'sodium nitrate', 'bha', 'bht', 'tbhq',
    'potassium bromate', 'propyl paraben', 'butylated hydroxyanisole',
    'butylated hydroxytoluene', 'high fructose corn syrup', 'hfcs',
    'partially hydrogenated', 'hydrogenated oil', 'trans fat',
    'artificial color', 'artificial flavour', 'artificial flavor',
    'red 40', 'yellow 5', 'yellow 6', 'blue 1', 'red 3',
    'sodium benzoate', 'potassium sorbate', 'calcium disodium edta',
];

const MODERATE_RISK_INGREDIENTS = [
    'palm oil', 'refined oil', 'sugar', 'salt', 'maida', 'refined flour',
    'corn syrup', 'dextrose', 'maltodextrin', 'modified starch',
    'emulsifier', 'stabilizer', 'preservative', 'thickener',
    'carrageenan', 'soy lecithin', 'xanthan gum', 'guar gum',
];

function categorizeIngredient(name) {
    const lower = name.toLowerCase();
    if (HIGH_RISK_INGREDIENTS.some(r => lower.includes(r))) return 'high';
    if (MODERATE_RISK_INGREDIENTS.some(r => lower.includes(r))) return 'moderate';
    return 'safe';
}

// ─── Component ────────────────────────────────────────────────────────────────
const LabelScanner = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [showRawText, setShowRawText] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const navigate = useNavigate();

    // ── Image selection ───────────────────────────────────────────────────────
    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }
        setError('');
        setResults(null);
        setImageFile(file);

        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const clearImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setResults(null);
        setError('');
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    // ── Analysis ──────────────────────────────────────────────────────────────
    const analyzeImage = async () => {
        if (!imageFile && !imagePreview) return;

        setAnalyzing(true);
        setError('');
        setProgress(0);
        setResults(null);
        setProgressLabel('Preparing image...');

        try {
            const result = await analyzeLabelImage(
                imageFile || imagePreview,
                (p) => {
                    setProgress(p);
                    if (p < 15) setProgressLabel('Preprocessing image...');
                    else if (p < 40) setProgressLabel('Initializing OCR engine...');
                    else if (p < 80) setProgressLabel('Recognizing text...');
                    else if (p < 95) setProgressLabel('Parsing results...');
                    else setProgressLabel('Done!');
                }
            );

            if (!result.rawText || result.rawText.trim().length < 5) {
                setError('Could not detect any text in the image. Try a clearer photo with better lighting.');
            } else {
                setResults(result);
            }
        } catch (err) {
            console.error('OCR error:', err);
            setError('Failed to analyze the image. Please try again with a different photo.');
        } finally {
            setAnalyzing(false);
        }
    };

    // ── Copy text ─────────────────────────────────────────────────────────────
    const copyText = () => {
        if (!results?.rawText) return;
        navigator.clipboard.writeText(results.rawText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // ── Retry with new image ──────────────────────────────────────────────────
    const retry = () => {
        clearImage();
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="container"
            style={{ paddingBottom: '4rem', maxWidth: '900px', margin: '0 auto' }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 className="section-title" style={{ fontSize: '2rem' }}>
                    📸 Label Scanner
                </h1>
                <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Take a photo or upload an image of any food label — we'll extract the ingredients and nutritional information using AI-powered OCR.
                </p>
            </div>

            {/* ── Upload Area (when no image selected) ── */}
            {!imagePreview && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ maxWidth: '600px', margin: '0 auto' }}>

                    {/* Drag & Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${dragOver ? '#7c3aed' : 'rgba(255,255,255,0.15)'}`,
                            borderRadius: 'var(--radius-2xl)',
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            background: dragOver ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                            marginBottom: '1.5rem',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))',
                            marginBottom: '1.5rem'
                        }}>
                            <Upload size={36} color="#a855f7" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Drop label image here
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            or click to browse files
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.78rem' }}>
                            Supports JPEG, PNG, WebP • Works with low-quality photos
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => cameraInputRef.current?.click()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem',
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)', border: 'none',
                                borderRadius: 'var(--radius-full)', color: '#fff', fontSize: '0.95rem',
                                fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.3)'
                            }}>
                            <Camera size={20} /> Take Photo
                        </motion.button>

                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none',
                                borderRadius: 'var(--radius-full)', color: '#fff', fontSize: '0.95rem',
                                fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
                            }}>
                            <Upload size={20} /> Upload Image
                        </motion.button>
                    </div>

                    {/* Hidden inputs */}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} style={{ display: 'none' }} />
                </motion.div>
            )}

            {/* ── Image Preview + Analyze ── */}
            {imagePreview && !results && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                        {/* Image */}
                        <div style={{ position: 'relative', background: '#000' }}>
                            <img src={imagePreview} alt="Label preview"
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
                            <button onClick={clearImage} style={{
                                position: 'absolute', top: '0.75rem', right: '0.75rem',
                                background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                                borderRadius: 'var(--radius-full)', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            {analyzing ? (
                                <>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{
                                            height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)',
                                            overflow: 'hidden', marginBottom: '0.75rem'
                                        }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                    height: '100%', borderRadius: '3px',
                                                    background: 'linear-gradient(90deg, #7c3aed, #ec4899)'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{progressLabel}</span>
                                            <span style={{ color: '#a855f7', fontWeight: '600', fontSize: '0.85rem' }}>{progress}%</span>
                                        </div>
                                    </div>
                                    <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#a855f7' }}>
                                        <Loader size={18} className="animate-spin" /> Analyzing label...
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={analyzeImage}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem',
                                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)', border: 'none',
                                            borderRadius: 'var(--radius-full)', color: '#fff', fontSize: '1rem',
                                            fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
                                        }}>
                                        <ScanLine size={20} /> Analyze Label
                                    </motion.button>
                                    <button onClick={clearImage}
                                        style={{
                                            padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-full)',
                                            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
                                            color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem'
                                        }}>
                                        Change Image
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Error ── */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            maxWidth: '600px', margin: '1.5rem auto', padding: '1.2rem 1.5rem', borderRadius: 'var(--radius-lg)',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            display: 'flex', alignItems: 'center', gap: '1rem'
                        }}>
                        <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ color: '#ef4444', fontWeight: '600', marginBottom: '0.2rem' }}>Detection Issue</p>
                            <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</p>
                        </div>
                        <button onClick={retry} style={{
                            padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.15)',
                            border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}>
                            <RotateCcw size={14} /> Retry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════════════
                RESULTS
            ══════════════════════════════════════════════════════════════════ */}
            {results && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '700px', margin: '0 auto' }}>

                    {/* Confidence bar */}
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Check size={18} color="#22c55e" /> OCR Confidence
                            </span>
                            <span style={{
                                color: results.confidence > 70 ? '#22c55e' : results.confidence > 40 ? '#f59e0b' : '#ef4444',
                                fontWeight: '700', fontSize: '1.2rem'
                            }}>
                                {Math.round(results.confidence)}%
                            </span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: '4px', width: `${results.confidence}%`,
                                background: results.confidence > 70
                                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                    : results.confidence > 40
                                        ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                                        : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                transition: 'width 1s ease'
                            }} />
                        </div>
                        {results.confidence < 50 && (
                            <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                ⚠️ Low confidence — try a clearer, well-lit photo for better results
                            </p>
                        )}
                    </div>

                    {/* Image + actions bar */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <button onClick={retry} style={{
                            flex: 1, minWidth: '140px', padding: '0.7rem', borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                            color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                        }}>
                            <RotateCcw size={16} /> Scan New Label
                        </button>
                        <button onClick={copyText} style={{
                            flex: 1, minWidth: '140px', padding: '0.7rem', borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(255,255,255,0.1)', background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                            color: copied ? '#22c55e' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                        }}>
                            {copied ? <><Check size={16} /> Copied!</> : <><Clipboard size={16} /> Copy Raw Text</>}
                        </button>
                        <button onClick={() => setShowRawText(!showRawText)} style={{
                            flex: 1, minWidth: '140px', padding: '0.7rem', borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(255,255,255,0.1)', background: showRawText ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
                            color: showRawText ? '#a855f7' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                        }}>
                            <Eye size={16} /> {showRawText ? 'Hide' : 'Show'} Raw Text
                        </button>
                    </div>

                    {/* Raw text */}
                    <AnimatePresence>
                        {showRawText && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                                <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={16} /> Raw OCR Output
                                    </h3>
                                    <pre style={{
                                        whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.82rem',
                                        color: '#94a3b8', lineHeight: '1.6', fontFamily: 'monospace',
                                        background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', maxHeight: '300px', overflow: 'auto'
                                    }}>
                                        {results.rawText || '(no text detected)'}
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Ingredients Section ── */}
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🧪 Ingredients Detected
                            {results.ingredients.found && (
                                <span style={{
                                    fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px',
                                    background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: '600'
                                }}>
                                    {results.ingredients.ingredients.length} found
                                </span>
                            )}
                        </h3>

                        {results.ingredients.found ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {results.ingredients.ingredients.map((ing, i) => {
                                    const risk = categorizeIngredient(ing);
                                    const colors = {
                                        safe: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#4ade80' },
                                        moderate: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
                                        high: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#f87171' },
                                    };
                                    const c = colors[risk];
                                    return (
                                        <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{
                                                padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem',
                                                background: c.bg, border: `1px solid ${c.border}`, color: c.color,
                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                                            }}>
                                            {risk === 'high' && <AlertTriangle size={12} />}
                                            {risk === 'safe' && <Check size={12} />}
                                            {ing}
                                        </motion.span>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                No ingredients section detected. Try a clearer photo focused on the ingredients list.
                            </p>
                        )}

                        {/* Risk Legend */}
                        {results.ingredients.found && (
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                {[
                                    { label: 'Safe', color: '#4ade80', icon: <Check size={10} /> },
                                    { label: 'Moderate Risk', color: '#fbbf24', icon: null },
                                    { label: 'High Risk', color: '#f87171', icon: <AlertTriangle size={10} /> },
                                ].map(l => (
                                    <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: l.color }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                                        {l.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Nutrition Section ── */}
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📊 Nutrition Information
                            {results.nutrition.servingSize && (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '400' }}>
                                    (per {results.nutrition.servingSize})
                                </span>
                            )}
                        </h3>

                        {results.nutrition.found ? (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {results.nutrition.items.map((item, i) => {
                                    // Visual bar based on daily value estimates
                                    const dvEstimates = {
                                        'Energy': 2000, 'Calories': 2000, 'Total Fat': 65, 'Saturated Fat': 20,
                                        'Trans Fat': 2, 'Cholesterol': 300, 'Sodium': 2400,
                                        'Total Carbohydrate': 300, 'Sugar': 50, 'Added Sugar': 25,
                                        'Dietary Fiber': 25, 'Protein': 50,
                                    };
                                    const dv = dvEstimates[item.name];
                                    const pct = dv ? Math.min(100, (item.value / dv) * 100) : null;
                                    const barColor = pct && pct > 75 ? '#ef4444' : pct && pct > 40 ? '#f59e0b' : '#22c55e';

                                    return (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.8rem',
                                                borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                                                borderBottom: '1px solid rgba(255,255,255,0.04)'
                                            }}>
                                            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</span>
                                            <span style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0' }}>
                                                {item.value}{item.unit}
                                            </span>
                                            {pct !== null && (
                                                <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: barColor, transition: 'width 0.5s' }} />
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                No nutrition table detected. Try a photo that clearly shows the nutrition facts panel.
                            </p>
                        )}
                    </div>

                    {/* ── Tips ── */}
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#a855f7' }}>💡 Tips for better results</h4>
                        <ul style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.8', paddingLeft: '1.2rem', margin: 0 }}>
                            <li>Use good lighting — natural daylight works best</li>
                            <li>Keep the label flat and avoid shadows</li>
                            <li>Capture just the relevant section (ingredients or nutrition table)</li>
                            <li>For rotated labels, the system will auto-detect and correct orientation</li>
                            <li>High-resolution photos produce significantly better results</li>
                        </ul>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default LabelScanner;
