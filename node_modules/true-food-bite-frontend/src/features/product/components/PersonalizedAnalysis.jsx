import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Shield, Sparkles } from 'lucide-react';
import { analyzeProductForUser } from '../services/personalizedEngine';
import profileService from '../../user/services/profileService';
import aiService from '../../core/services/aiService';
import { useAuth } from '../../auth/context/AuthContext';

const PersonalizedAnalysis = ({ product }) => {
    const { isAuthenticated } = useAuth();
    const [analysis, setAnalysis] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [showAllConcerns, setShowAllConcerns] = useState(false);
    const [showAllBenefits, setShowAllBenefits] = useState(false);

    useEffect(() => {
        const loadAndAnalyze = async () => {
            if (!isAuthenticated || !product) {
                setLoading(false);
                return;
            }

            // Load profile
            const cached = profileService.getCachedProfile();
            let userProfile = cached;

            const result = await profileService.getProfile();
            if (result.success && result.profile) {
                userProfile = result.profile;
            }

            if (userProfile && hasHealthData(userProfile)) {
                setProfile(userProfile);

                // Rule-based analysis
                const ruleResult = analyzeProductForUser(product, userProfile);
                setAnalysis(ruleResult);

                // AI analysis for custom entries
                const hasCustom = (userProfile.customHealthIssues?.length > 0) || (userProfile.customGoals?.length > 0);
                if (hasCustom) {
                    setAiLoading(true);
                    const aiResult = await aiService.analyzeProduct(
                        product,
                        userProfile.customHealthIssues || [],
                        userProfile.customGoals || []
                    );
                    if (aiResult.success) {
                        setAiAnalysis(aiResult);
                    }
                    setAiLoading(false);
                }
            }

            setLoading(false);
        };

        loadAndAnalyze();
    }, [product, isAuthenticated]);

    const hasHealthData = (p) => {
        return (
            (p.chronicDiseases && p.chronicDiseases.length > 0) ||
            (p.temporaryIssues && p.temporaryIssues.length > 0) ||
            (p.customHealthIssues && p.customHealthIssues.length > 0) ||
            (p.customGoals && p.customGoals.length > 0) ||
            p.goal ||
            (p.weightKg && p.heightCm) ||
            p.age
        );
    };

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <div style={{
                margin: '2rem 0', padding: '1.75rem',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(236, 72, 153, 0.08))',
                border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <User size={22} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.2rem', color: '#e2e8f0' }}>Get Personalized Analysis</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Sign up and set your health profile to see how this product affects YOU</p>
                    </div>
                </div>
                <Link to="/signup" style={{
                    display: 'inline-block', padding: '0.7rem 1.8rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff',
                    fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem'
                }}>
                    Create Account →
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ height: '100px', margin: '2rem 0', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
        );
    }

    // No health profile
    if (!profile || !analysis) {
        return (
            <div style={{
                margin: '2rem 0', padding: '1.75rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(124, 58, 237, 0.08))',
                border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Shield size={22} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.2rem', color: '#e2e8f0' }}>Set Up Your Health Profile</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Add your health details to get personalized product analysis</p>
                    </div>
                </div>
                <Link to="/profile" style={{
                    display: 'inline-block', padding: '0.7rem 1.8rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff',
                    fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem'
                }}>
                    Complete Profile →
                </Link>
            </div>
        );
    }

    const { scoreInfo, concerns, benefits, notes, bmi } = analysis;

    // Merge AI results with rule-based results
    const allConcerns = [
        ...concerns,
        ...(aiAnalysis?.concerns || []).map(c => ({ ...c, icon: '🤖', type: 'ai-custom', severity: c.severity || 'medium' }))
    ];
    const allBenefits = [
        ...benefits,
        ...(aiAnalysis?.benefits || []).map(b => ({ ...b, icon: '🤖', type: 'ai-custom' }))
    ];

    const displayedConcerns = showAllConcerns ? allConcerns : allConcerns.slice(0, 4);
    const displayedBenefits = showAllBenefits ? allBenefits : allBenefits.slice(0, 4);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ margin: '2rem 0' }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%', padding: '1.25rem 1.5rem',
                    background: scoreInfo.bg,
                    border: `2px solid ${scoreInfo.color}40`,
                    borderRadius: expanded ? '20px 20px 0 0' : '20px',
                    cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'border-radius 0.3s',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>{scoreInfo.emoji}</span>
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: scoreInfo.color, marginBottom: '0.15rem' }}>
                            {scoreInfo.label}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Based on your health profile • {analysis.profileSummary.totalFactors} factor{analysis.profileSummary.totalFactors !== 1 ? 's' : ''} analyzed
                            {aiAnalysis && !aiAnalysis.aiUnavailable && ' + AI'}
                        </p>
                    </div>
                </div>
                <div style={{ color: '#94a3b8' }}>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>

            {/* Expandable body */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding: '1.5rem',
                            background: 'rgba(15, 20, 40, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderTop: 'none',
                            borderRadius: '0 0 20px 20px',
                        }}>
                            {/* BMI bar */}
                            {bmi && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    background: `${bmi.category.color}12`,
                                    border: `1px solid ${bmi.category.color}30`,
                                    borderRadius: '14px', marginBottom: '1.5rem', fontSize: '0.85rem'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                                    <span style={{ color: '#e2e8f0' }}>
                                        Your BMI: <strong style={{ color: bmi.category.color }}>{bmi.value} ({bmi.category.label})</strong>
                                        <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>— {bmi.category.advice}</span>
                                    </span>
                                </div>
                            )}

                            {/* AI overall note */}
                            {aiAnalysis?.overallNote && (
                                <div style={{
                                    padding: '0.85rem 1rem', marginBottom: '1.5rem', borderRadius: '14px',
                                    background: 'rgba(6, 182, 212, 0.08)',
                                    border: '1px solid rgba(6, 182, 212, 0.2)',
                                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                                    fontSize: '0.88rem', color: '#e2e8f0'
                                }}>
                                    <Sparkles size={18} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <strong style={{ color: '#06b6d4' }}>AI Summary: </strong>
                                        {aiAnalysis.overallNote}
                                    </div>
                                </div>
                            )}

                            {/* AI Loading */}
                            {aiLoading && (
                                <div style={{
                                    padding: '0.85rem 1rem', marginBottom: '1.5rem', borderRadius: '14px',
                                    background: 'rgba(6, 182, 212, 0.06)',
                                    border: '1px solid rgba(6, 182, 212, 0.15)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    fontSize: '0.85rem', color: '#94a3b8',
                                }}>
                                    <span style={{ animation: 'pulse 1s infinite' }}>🤖</span>
                                    AI is analyzing this product for your custom health entries...
                                </div>
                            )}

                            {/* ── Concerns ── */}
                            {allConcerns.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <AlertTriangle size={18} color="#ef4444" />
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ef4444', margin: 0 }}>
                                            What May Concern You ({allConcerns.length})
                                        </h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {displayedConcerns.map((concern, idx) => (
                                            <ConcernCard key={idx} concern={concern} />
                                        ))}
                                    </div>
                                    {allConcerns.length > 4 && (
                                        <ToggleButton
                                            expanded={showAllConcerns}
                                            onClick={() => setShowAllConcerns(!showAllConcerns)}
                                            total={allConcerns.length}
                                            color="#ef4444"
                                            label="Concerns"
                                        />
                                    )}
                                </div>
                            )}

                            {/* ── Benefits ── */}
                            {allBenefits.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <CheckCircle size={18} color="#22c55e" />
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#22c55e', margin: 0 }}>
                                            What's Good For You ({allBenefits.length})
                                        </h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {displayedBenefits.map((benefit, idx) => (
                                            <BenefitCard key={idx} benefit={benefit} />
                                        ))}
                                    </div>
                                    {allBenefits.length > 4 && (
                                        <ToggleButton
                                            expanded={showAllBenefits}
                                            onClick={() => setShowAllBenefits(!showAllBenefits)}
                                            total={allBenefits.length}
                                            color="#22c55e"
                                            label="Benefits"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            {notes.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    {notes.map((note, idx) => (
                                        <div key={idx} style={{
                                            padding: '0.7rem 1rem', background: 'rgba(59, 130, 246, 0.06)',
                                            border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '12px',
                                            fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            marginBottom: '0.4rem', color: '#e2e8f0'
                                        }}>
                                            <span>💡</span>
                                            <span><strong>{formatSourceName(note.source)}:</strong> {note.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ═══ FINAL VERDICT ═══ */}
                            {!aiLoading && (allConcerns.length > 0 || allBenefits.length > 0) && (
                                <FinalVerdict
                                    concerns={allConcerns}
                                    benefits={allBenefits}
                                    product={product}
                                    profile={profile}
                                    scoreInfo={scoreInfo}
                                    bmi={bmi}
                                />
                            )}

                            {/* Empty state */}
                            {allConcerns.length === 0 && allBenefits.length === 0 && !aiLoading && (
                                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                                    <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚪</p>
                                    <p>No specific health concerns or benefits detected for your profile.</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{
                                paddingTop: '1rem',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {analysis.profileSummary.totalFactors} health factor{analysis.profileSummary.totalFactors !== 1 ? 's' : ''} analyzed
                                    {aiAnalysis && !aiAnalysis.aiUnavailable && ' + AI analysis'}
                                </span>
                                <Link to="/profile" style={{
                                    fontSize: '0.8rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: '600'
                                }}>
                                    Edit Profile →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

const ConcernCard = ({ concern }) => {
    const borderColor = concern.severity === 'high' ? '#ef4444' : concern.severity === 'medium' ? '#f59e0b' : '#94a3b8';
    return (
        <div style={{
            padding: '0.8rem 1rem',
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.12)',
            borderRadius: '12px',
            borderLeft: `4px solid ${borderColor}`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#e2e8f0' }}>
                    {concern.icon} {concern.label}
                </span>
                {concern.value !== undefined && (
                    <span style={{
                        padding: '0.1rem 0.5rem', background: 'rgba(239, 68, 68, 0.12)',
                        borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', color: '#ef4444',
                    }}>
                        {concern.value}{concern.unit}{concern.threshold !== undefined ? ` (limit: ${concern.threshold}${concern.unit})` : ''}
                    </span>
                )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                {concern.reason}
            </p>
            <span style={{
                display: 'inline-block', marginTop: '0.35rem',
                padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.04)',
                borderRadius: '20px', fontSize: '0.7rem', color: '#64748b',
            }}>
                {formatSourceName(concern.source)}
            </span>
        </div>
    );
};

const BenefitCard = ({ benefit }) => (
    <div style={{
        padding: '0.8rem 1rem',
        background: 'rgba(34, 197, 94, 0.04)',
        border: '1px solid rgba(34, 197, 94, 0.12)',
        borderRadius: '12px',
        borderLeft: '4px solid #22c55e',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#e2e8f0' }}>
                {benefit.icon} {benefit.label}
            </span>
            {benefit.value !== undefined && (
                <span style={{
                    padding: '0.1rem 0.5rem', background: 'rgba(34, 197, 94, 0.12)',
                    borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', color: '#22c55e',
                }}>
                    {benefit.value}{benefit.unit}
                </span>
            )}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
            {benefit.reason}
        </p>
        <span style={{
            display: 'inline-block', marginTop: '0.35rem',
            padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px', fontSize: '0.7rem', color: '#64748b',
        }}>
            {formatSourceName(benefit.source)}
        </span>
    </div>
);

const ToggleButton = ({ expanded, onClick, total, color, label }) => (
    <button
        onClick={onClick}
        style={{
            marginTop: '0.6rem', background: 'none', border: 'none',
            color, cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}
    >
        {expanded ? 'Show Less' : `Show All ${total} ${label}`}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
);

const formatSourceName = (id) => {
    if (!id) return '';
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

/* ═══════════════════════════════════════════
   Final Verdict Component
   ═══════════════════════════════════════════ */
const FinalVerdict = ({ concerns, benefits, product, profile, scoreInfo, bmi }) => {
    // Calculate verdict score
    const highConcerns = concerns.filter(c => c.severity === 'high').length;
    const mediumConcerns = concerns.filter(c => c.severity === 'medium').length;
    const lowConcerns = concerns.filter(c => c.severity === 'low').length;
    const totalBenefits = benefits.length;

    // Weighted score: concerns subtract, benefits add
    const score = (totalBenefits * 1) - (highConcerns * 3) - (mediumConcerns * 2) - (lowConcerns * 1);

    // Determine verdict level
    let verdict;
    if (highConcerns >= 3 || score <= -6) {
        verdict = {
            level: 'avoid',
            emoji: '🚫',
            title: 'Best to Avoid This Product',
            color: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.08)',
            border: 'rgba(239, 68, 68, 0.25)',
        };
    } else if (highConcerns >= 1 || score <= -3) {
        verdict = {
            level: 'caution',
            emoji: '⚠️',
            title: 'Consume With Caution',
            color: '#f97316',
            bg: 'rgba(249, 115, 22, 0.08)',
            border: 'rgba(249, 115, 22, 0.25)',
        };
    } else if (score <= 0) {
        verdict = {
            level: 'moderate',
            emoji: '🔶',
            title: 'Okay in Moderation',
            color: '#eab308',
            bg: 'rgba(234, 179, 8, 0.08)',
            border: 'rgba(234, 179, 8, 0.25)',
        };
    } else if (score <= 3) {
        verdict = {
            level: 'good',
            emoji: '✅',
            title: 'Good Choice For You',
            color: '#22c55e',
            bg: 'rgba(34, 197, 94, 0.08)',
            border: 'rgba(34, 197, 94, 0.25)',
        };
    } else {
        verdict = {
            level: 'great',
            emoji: '🌟',
            title: 'Great Choice For You!',
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.08)',
            border: 'rgba(16, 185, 129, 0.25)',
        };
    }

    // Build explanation
    const explanations = [];

    if (highConcerns > 0) {
        explanations.push(`${highConcerns} serious concern${highConcerns > 1 ? 's' : ''} detected for your health conditions`);
    }
    if (mediumConcerns > 0) {
        explanations.push(`${mediumConcerns} moderate concern${mediumConcerns > 1 ? 's' : ''} to watch out for`);
    }
    if (totalBenefits > 0) {
        explanations.push(`${totalBenefits} benefit${totalBenefits > 1 ? 's' : ''} aligned with your health goals`);
    }

    // Add specific advice based on verdict
    let advice = '';
    if (verdict.level === 'avoid') {
        advice = 'This product has multiple ingredients or nutrients that could negatively impact your health based on your profile. Consider switching to a healthier alternative.';
    } else if (verdict.level === 'caution') {
        advice = 'This product has some ingredients that may not be ideal for your health conditions. If you choose to consume it, do so occasionally and in small portions.';
    } else if (verdict.level === 'moderate') {
        advice = 'This product is not harmful but not particularly beneficial either. Consuming it occasionally in moderate amounts should be fine.';
    } else if (verdict.level === 'good') {
        advice = 'This product aligns well with your health profile. It offers benefits that support your health goals with minimal concerns.';
    } else {
        advice = 'This product is an excellent match for your health profile! It provides multiple benefits that align perfectly with your goals.';
    }

    // Nutrition grade info
    const grade = product?.nutrition_grades?.toUpperCase();
    const gradeText = { 'A': 'excellent', 'B': 'good', 'C': 'average', 'D': 'poor', 'E': 'very poor' }[grade];

    return (
        <div style={{
            marginTop: '1.5rem', marginBottom: '1.5rem',
            padding: '1.25rem 1.25rem',
            background: verdict.bg,
            border: `2px solid ${verdict.border}`,
            borderRadius: '16px',
        }}>
            {/* Verdict Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '0.75rem',
            }}>
                <span style={{ fontSize: '2rem' }}>{verdict.emoji}</span>
                <div>
                    <h4 style={{
                        fontSize: '1.1rem', fontWeight: '800', color: verdict.color,
                        margin: 0, lineHeight: 1.2
                    }}>
                        Final Verdict: {verdict.title}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                        Based on {concerns.length} concern{concerns.length !== 1 ? 's' : ''} & {benefits.length} benefit{benefits.length !== 1 ? 's' : ''} from your profile
                    </p>
                </div>
            </div>

            {/* Score Summary Bar */}
            <div style={{
                display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap'
            }}>
                {highConcerns > 0 && (
                    <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                    }}>
                        ⛔ {highConcerns} High Risk
                    </span>
                )}
                {mediumConcerns > 0 && (
                    <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: 'rgba(249, 115, 22, 0.15)', color: '#f97316',
                    }}>
                        ⚠️ {mediumConcerns} Medium Risk
                    </span>
                )}
                {lowConcerns > 0 && (
                    <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: 'rgba(234, 179, 8, 0.15)', color: '#eab308',
                    }}>
                        🔸 {lowConcerns} Low Risk
                    </span>
                )}
                {totalBenefits > 0 && (
                    <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
                    }}>
                        ✅ {totalBenefits} Benefit{totalBenefits !== 1 ? 's' : ''}
                    </span>
                )}
                {gradeText && (
                    <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa',
                    }}>
                        🏷️ Nutri-Grade {grade} ({gradeText})
                    </span>
                )}
            </div>

            {/* Advice */}
            <p style={{
                fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6',
                margin: 0, padding: '0.75rem',
                background: 'rgba(0, 0, 0, 0.15)', borderRadius: '10px',
            }}>
                {advice}
            </p>

            {/* Key points */}
            {explanations.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                    {explanations.map((exp, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            fontSize: '0.8rem', color: '#94a3b8', padding: '0.2rem 0',
                        }}>
                            <span style={{ color: verdict.color }}>•</span> {exp}
                        </div>
                    ))}
                </div>
            )}

            {/* Disclaimer */}
            <p style={{
                fontSize: '0.7rem', color: '#475569', margin: '0.75rem 0 0 0',
                fontStyle: 'italic', lineHeight: '1.4'
            }}>
                ⚕️ This is an automated recommendation based on your health profile. Always consult your doctor or a nutritionist for personalized dietary advice.
            </p>
        </div>
    );
};

export default PersonalizedAnalysis;
