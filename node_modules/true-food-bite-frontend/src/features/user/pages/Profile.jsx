import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Save, AlertCircle, CheckCircle, Activity, Shield, Plus, X, Edit3, Heart, Target, Thermometer, Scale, History, ChevronRight } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import profileService from '../services/profileService';
import { CHRONIC_DISEASES_LIST, TEMPORARY_ISSUES_LIST, GOALS_LIST, GENDER_LIST, calculateBMI, getBMICategory } from '../../product/services/personalizedEngine';

const Profile = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState(0);
    const [history, setHistory] = useState([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        age: '',
        heightCm: '',
        weightKg: '',
        goal: '',
        chronicDiseases: [],
        temporaryIssues: [],
        customHealthIssues: [],
        customGoals: []
    });

    // Custom input states
    const [customIssueInput, setCustomIssueInput] = useState('');
    const [customGoalInput, setCustomGoalInput] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadProfile();
    }, [isAuthenticated]);

    const loadProfile = async () => {
        setIsLoading(true);
        const result = await profileService.getProfile();

        if (result.success && result.profile) {
            setFormData({
                firstName: result.profile.firstName || user?.firstName || '',
                lastName: result.profile.lastName || user?.lastName || '',
                email: user?.email || '',
                gender: result.profile.gender || '',
                age: result.profile.age || '',
                heightCm: result.profile.heightCm || '',
                weightKg: result.profile.weightKg || '',
                goal: result.profile.goal || '',
                chronicDiseases: result.profile.chronicDiseases || [],
                temporaryIssues: result.profile.temporaryIssues || [],
                customHealthIssues: result.profile.customHealthIssues || [],
                customGoals: result.profile.customGoals || []
            });
            setHistory(result.profile.history || []);
        } else {
            setFormData(prev => ({
                ...prev,
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || ''
            }));
        }
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (saveSuccess) setSaveSuccess(false);
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === '') {
            setFormData(prev => ({ ...prev, [name]: '' }));
            if (saveSuccess) setSaveSuccess(false);
            return;
        }

        // Age: only whole numbers (no decimals)
        if (name === 'age') {
            if (/^\d{0,3}$/.test(value)) {
                const num = parseInt(value, 10);
                if (!isNaN(num) && num >= 0 && num <= 100) {
                    setFormData(prev => ({ ...prev, [name]: value }));
                }
            }
            if (saveSuccess) setSaveSuccess(false);
            return;
        }

        // Height / Weight: allow up to 2 decimal places only
        if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (saveSuccess) setSaveSuccess(false);
    };

    const handleMultiSelect = (category, item) => {
        setFormData(prev => {
            const list = prev[category] || [];
            if (list.includes(item)) {
                return { ...prev, [category]: list.filter(i => i !== item) };
            } else {
                return { ...prev, [category]: [...list, item] };
            }
        });
        if (saveSuccess) setSaveSuccess(false);
    };

    const addCustomIssue = () => {
        const text = customIssueInput.trim();
        if (!text) return;
        if (formData.customHealthIssues.includes(text)) return;
        setFormData(prev => ({
            ...prev,
            customHealthIssues: [...prev.customHealthIssues, text]
        }));
        setCustomIssueInput('');
        if (saveSuccess) setSaveSuccess(false);
    };

    const removeCustomIssue = (issue) => {
        setFormData(prev => ({
            ...prev,
            customHealthIssues: prev.customHealthIssues.filter(i => i !== issue)
        }));
        if (saveSuccess) setSaveSuccess(false);
    };

    const addCustomGoal = () => {
        const text = customGoalInput.trim();
        if (!text) return;
        if (formData.customGoals.includes(text)) return;
        setFormData(prev => ({
            ...prev,
            customGoals: [...prev.customGoals, text]
        }));
        setCustomGoalInput('');
        if (saveSuccess) setSaveSuccess(false);
    };

    const removeCustomGoal = (goal) => {
        setFormData(prev => ({
            ...prev,
            customGoals: prev.customGoals.filter(g => g !== goal)
        }));
        if (saveSuccess) setSaveSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSaveSuccess(false);

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('First and Last Name are required.');
            setIsSaving(false);
            return;
        }

        const payload = {
            ...formData,
            age: formData.age ? parseInt(formData.age) : null,
            heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
            weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        };

        const result = await profileService.updateProfile(payload);
        setIsSaving(false);

        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 4000);
        } else {
            setError(result.error || 'Failed to update profile.');
        }
    };

    // BMI calculation
    const bmi = calculateBMI(parseFloat(formData.weightKg) || 0, parseFloat(formData.heightCm) || 0);
    const bmiCategory = bmi ? getBMICategory(bmi) : null;

    if (isLoading) {
        return (
            <div style={{ ...pageStyle, textAlign: 'center', paddingTop: '8rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
                <p style={{ color: '#94a3b8' }}>Loading your health profile...</p>
            </div>
        );
    }

    const sections = [
        { title: 'Personal Info', icon: <User size={18} />, color: '#3b82f6' },
        { title: 'Body Metrics', icon: <Scale size={18} />, color: '#8b5cf6' },
        { title: 'Health Goal', icon: <Target size={18} />, color: '#22c55e' },
        { title: 'Health Conditions', icon: <Heart size={18} />, color: '#ef4444' },
        { title: 'Current Issues', icon: <Thermometer size={18} />, color: '#f59e0b' },
        { title: 'Custom Entries', icon: <Edit3 size={18} />, color: '#06b6d4' },
        { title: 'Scan History', icon: <History size={18} />, color: '#ec4899' },
    ];

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '2.5rem' }}
                >
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Your Health Profile
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
                        We analyze products specifically for YOUR health. The more we know, the better our suggestions.
                    </p>
                </motion.div>

                {/* Section Nav Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {sections.map((sec, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                setActiveSection(idx);
                                document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: '600', border: 'none',
                                background: activeSection === idx ? `${sec.color}20` : 'rgba(255,255,255,0.05)',
                                color: activeSection === idx ? sec.color : '#94a3b8',
                                transition: 'all 0.2s',
                            }}
                        >
                            {sec.icon} {sec.title}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ═══════════ Section 1: Personal Info ═══════════ */}
                    <SectionCard id="section-0" title="Personal Information" icon={<User size={20} />} color="#3b82f6" desc="Your basic details">
                        <div style={gridTwo}>
                            <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Enter first name" />
                            <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Enter last name" />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ ...inputBaseStyle, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                                <Shield size={16} />
                                {formData.email || 'Not set'}
                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#475569' }}>Read-only</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={labelStyle}>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                style={selectStyle}
                            >
                                <option value="" style={optionStyle}>-- Select Gender --</option>
                                {GENDER_LIST.map(g => <option key={g.id} value={g.id} style={optionStyle}>{g.label}</option>)}
                            </select>
                        </div>
                    </SectionCard>

                    {/* ═══════════ Section 2: Body Metrics ═══════════ */}
                    <SectionCard id="section-1" title="Body Metrics" icon={<Scale size={20} />} color="#8b5cf6" desc="Used for BMI calculation and personalized serving suggestions">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Age <span style={{ color: '#64748b', fontWeight: '400' }}>(years)</span></label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleNumberChange}
                                    placeholder="e.g. 25"
                                    style={inputBaseStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Height <span style={{ color: '#64748b', fontWeight: '400' }}>(cm)</span></label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="heightCm"
                                    value={formData.heightCm}
                                    onChange={handleNumberChange}
                                    placeholder="e.g. 175"
                                    style={inputBaseStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Weight <span style={{ color: '#64748b', fontWeight: '400' }}>(kg)</span></label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="weightKg"
                                    value={formData.weightKg}
                                    onChange={handleNumberChange}
                                    placeholder="e.g. 70"
                                    style={inputBaseStyle}
                                />
                            </div>
                        </div>

                        {/* BMI Display */}
                        {bmi && bmiCategory && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    marginTop: '1.5rem', padding: '1.25rem',
                                    background: `${bmiCategory.color}12`,
                                    border: `1px solid ${bmiCategory.color}40`,
                                    borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', gap: '1rem'
                                }}
                            >
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '50%',
                                    background: `${bmiCategory.color}25`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.3rem', fontWeight: '800', color: bmiCategory.color
                                }}>
                                    {bmi}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', color: bmiCategory.color, fontSize: '1.05rem' }}>
                                        BMI: {bmiCategory.label}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{bmiCategory.advice}</div>
                                </div>
                            </motion.div>
                        )}
                    </SectionCard>

                    {/* ═══════════ Section 3: Health Goal ═══════════ */}
                    <SectionCard id="section-2" title="Your Health Goal" icon={<Target size={20} />} color="#22c55e" desc="What are you aiming for? This guides our product recommendations.">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                            {GOALS_LIST.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    label={goal.label}
                                    selected={formData.goal === goal.id}
                                    onClick={() => setFormData(prev => ({ ...prev, goal: prev.goal === goal.id ? '' : goal.id }))}
                                    color="#22c55e"
                                />
                            ))}
                        </div>
                    </SectionCard>

                    {/* ═══════════ Section 4: Chronic Diseases ═══════════ */}
                    <SectionCard id="section-3" title="Permanent Health Conditions" icon={<Heart size={20} />} color="#ef4444" desc="Chronic diseases you live with. Products will always be checked against these.">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                            {CHRONIC_DISEASES_LIST.map(disease => (
                                <CheckCard
                                    key={disease.id}
                                    label={disease.label}
                                    checked={formData.chronicDiseases.includes(disease.id)}
                                    onClick={() => handleMultiSelect('chronicDiseases', disease.id)}
                                    color="#ef4444"
                                />
                            ))}
                        </div>
                    </SectionCard>

                    {/* ═══════════ Section 5: Temporary Issues ═══════════ */}
                    <SectionCard id="section-4" title="Temporary Health Issues" icon={<Thermometer size={20} />} color="#f59e0b" desc="Short-term conditions you're experiencing right now. Remove them when you feel better.">
                        {/* Selected badges */}
                        {formData.temporaryIssues.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {formData.temporaryIssues.map(id => {
                                    const issue = TEMPORARY_ISSUES_LIST.find(i => i.id === id);
                                    return issue ? (
                                        <span key={id} style={badgeStyle('#f59e0b')}>
                                            {issue.label}
                                            <button type="button" onClick={() => handleMultiSelect('temporaryIssues', id)} style={badgeBtnStyle}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                            {TEMPORARY_ISSUES_LIST.filter(i => !formData.temporaryIssues.includes(i.id)).map(issue => (
                                <button
                                    key={issue.id}
                                    type="button"
                                    onClick={() => handleMultiSelect('temporaryIssues', issue.id)}
                                    style={addCardStyle}
                                >
                                    <Plus size={14} style={{ color: '#f59e0b', flexShrink: 0 }} /> {issue.label}
                                </button>
                            ))}
                        </div>
                    </SectionCard>

                    {/* ═══════════ Section 6: Custom Entries (AI-powered) ═══════════ */}
                    <SectionCard id="section-5" title="Custom Entries" icon={<Edit3 size={20} />} color="#06b6d4" desc="Type anything not listed above — allergies, vitamin deficiencies, surgeries, dietary preferences, or personal goals. Our AI will analyze products for these too.">

                        {/* Custom Health Issues */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ ...labelStyle, fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={16} color="#f97316" />
                                Custom Health Issues / Conditions
                            </label>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                E.g. "Vitamin D deficiency", "Nut allergy", "Had knee surgery", "Iron deficiency anemia"
                            </p>

                            {/* Existing custom issues */}
                            {formData.customHealthIssues.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                    {formData.customHealthIssues.map((issue, idx) => (
                                        <span key={idx} style={badgeStyle('#f97316')}>
                                            {issue}
                                            <button type="button" onClick={() => removeCustomIssue(issue)} style={badgeBtnStyle}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={customIssueInput}
                                    onChange={(e) => setCustomIssueInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomIssue(); } }}
                                    placeholder="Type a health issue and press Enter or click Add..."
                                    style={{ ...inputBaseStyle, flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomIssue}
                                    disabled={!customIssueInput.trim()}
                                    style={{
                                        padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none',
                                        background: customIssueInput.trim() ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'rgba(255,255,255,0.05)',
                                        color: customIssueInput.trim() ? '#fff' : '#475569',
                                        fontWeight: '600', cursor: customIssueInput.trim() ? 'pointer' : 'default',
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                    }}
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                        </div>

                        {/* Custom Goals */}
                        <div>
                            <label style={{ ...labelStyle, fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Target size={16} color="#22c55e" />
                                Custom Goals / Preferences
                            </label>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                E.g. "Reduce sugar intake", "High protein diet", "Avoid artificial colors", "Keto diet"
                            </p>

                            {/* Existing custom goals */}
                            {formData.customGoals.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                    {formData.customGoals.map((goal, idx) => (
                                        <span key={idx} style={badgeStyle('#22c55e')}>
                                            {goal}
                                            <button type="button" onClick={() => removeCustomGoal(goal)} style={badgeBtnStyle}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={customGoalInput}
                                    onChange={(e) => setCustomGoalInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomGoal(); } }}
                                    placeholder="Type a goal or preference and press Enter or click Add..."
                                    style={{ ...inputBaseStyle, flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomGoal}
                                    disabled={!customGoalInput.trim()}
                                    style={{
                                        padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none',
                                        background: customGoalInput.trim() ? 'linear-gradient(135deg, #22c55e, #06b6d4)' : 'rgba(255,255,255,0.05)',
                                        color: customGoalInput.trim() ? '#fff' : '#475569',
                                        fontWeight: '600', cursor: customGoalInput.trim() ? 'pointer' : 'default',
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                    }}
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                        </div>

                        {/* AI disclaimer */}
                        <div style={{
                            marginTop: '1.5rem', padding: '1rem', borderRadius: '12px',
                            background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)',
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>🤖</span>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                                <strong style={{ color: '#06b6d4' }}>AI-Powered Analysis:</strong> Custom entries are analyzed by Gemini AI when you scan products.
                                The AI evaluates your specific conditions against each product's ingredients and nutrition to give you personalized insights.
                            </div>
                        </div>
                    </SectionCard>

                    {/* ═══════════ Section 6: Scan History ═══════════ */}
                    <SectionCard id="section-6" title="Scan History" icon={<History size={20} />} color="#ec4899" desc="Products you have recently scanned.">
                        {history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                <History size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No scan history yet.</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/scan')}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '50px',
                                        background: 'rgba(236, 72, 153, 0.1)',
                                        color: '#ec4899',
                                        border: '1px solid rgba(236, 72, 153, 0.3)',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Start Scanning
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {history.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => navigate(`/product/${item.barcode}`)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem',
                                            padding: '1rem', borderRadius: '16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover:bg-white/5"
                                    >
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden',
                                            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <img
                                                src={item.image || 'https://placehold.co/100x100?text=No+Img'}
                                                alt={item.productName}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.productName}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {item.brand}
                                            </div>
                                        </div>
                                        {/* Grade Badge */}
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: item.grade?.toLowerCase() === 'a' ? '#22c55e' : (item.grade?.toLowerCase() === 'e' ? '#ef4444' : '#f59e0b'),
                                            color: '#fff', fontWeight: '800', fontSize: '0.9rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                            {item.grade?.toUpperCase() || '?'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* ═══════════ Sticky Save Bar ═══════════ */}
                    <div style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0,
                        padding: '1rem 1.5rem',
                        background: 'rgba(10, 10, 25, 0.95)',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 100,
                    }}>
                        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <AnimatePresence>
                                    {saveSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontWeight: '600' }}
                                        >
                                            <CheckCircle size={20} /> Profile saved successfully!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {error && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</span>}
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                style={{
                                    padding: '0.8rem 2.5rem', borderRadius: '14px', border: 'none',
                                    background: isSaving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    color: '#fff', fontWeight: '700', fontSize: '1rem',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    transition: 'all 0.3s', boxShadow: isSaving ? 'none' : '0 4px 20px rgba(59, 130, 246, 0.4)'
                                }}
                            >
                                {isSaving ? (
                                    <>⏳ Saving...</>
                                ) : (
                                    <><Save size={18} /> Save Profile</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Bottom spacer for fixed bar */}
                    <div style={{ height: '80px' }} />

                </form>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   Reusable UI Components
   ═══════════════════════════════════════════ */

const SectionCard = ({ id, title, icon, color, desc, children }) => (
    <motion.div
        id={id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
            padding: '2rem', marginBottom: '1.5rem', borderRadius: '20px',
            background: 'rgba(15, 20, 40, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color
            }}>
                {icon}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>{title}</h2>
        </div>
        {desc && <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', marginLeft: '3rem' }}>{desc}</p>}
        {children}
    </motion.div>
);

const InputField = ({ label, name, value, onChange, required, placeholder }) => (
    <div>
        <label style={labelStyle}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            style={inputBaseStyle}
        />
    </div>
);

const GoalCard = ({ label, selected, onClick, color }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            padding: '1rem 1.25rem', borderRadius: '14px', cursor: 'pointer',
            border: selected ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.08)',
            background: selected ? `${color}15` : 'rgba(255,255,255,0.03)',
            color: selected ? '#e2e8f0' : '#94a3b8',
            fontWeight: selected ? '700' : '500', fontSize: '0.95rem',
            textAlign: 'left', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}
    >
        {selected ? <CheckCircle size={16} color={color} /> : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #475569' }} />}
        {label}
    </button>
);

const CheckCard = ({ label, checked, onClick, color }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
            border: checked ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.08)',
            background: checked ? `${color}12` : 'rgba(255,255,255,0.03)',
            color: checked ? '#e2e8f0' : '#94a3b8',
            fontWeight: checked ? '600' : '400', fontSize: '0.9rem',
            textAlign: 'left', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}
    >
        <div style={{
            width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
            border: checked ? `2px solid ${color}` : '2px solid #475569',
            background: checked ? color : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
        }}>
            {checked && <CheckCircle size={12} color="#fff" />}
        </div>
        {label}
    </button>
);

/* ═══════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════ */

const pageStyle = {
    padding: '2rem 1.5rem 8rem',
    minHeight: '100vh',
};

const gridTwo = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#94a3b8',
};

const inputBaseStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(15, 20, 40, 0.8)',
    border: '1.5px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

const selectStyle = {
    ...inputBaseStyle,
    cursor: 'pointer',
    WebkitAppearance: 'auto',
    MozAppearance: 'auto',
    appearance: 'auto',
};

const optionStyle = {
    background: '#1a1a2e',
    color: '#e2e8f0',
    padding: '0.5rem',
};

const badgeStyle = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.4rem 0.85rem', borderRadius: '50px',
    background: `${color}18`, border: `1px solid ${color}40`,
    color, fontSize: '0.85rem', fontWeight: '600',
});

const badgeBtnStyle = {
    background: 'none', border: 'none', color: 'inherit',
    cursor: 'pointer', padding: 0, display: 'flex',
};

const addCardStyle = {
    padding: '0.7rem 0.85rem', borderRadius: '10px', cursor: 'pointer',
    border: '1.5px dashed rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.02)',
    color: '#94a3b8', fontSize: '0.88rem', fontWeight: '500',
    textAlign: 'left', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
};

export default Profile;
