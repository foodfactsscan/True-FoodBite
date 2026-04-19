import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Ingredient from '../models/Ingredient.js';
import Flagged from '../models/Flagged.js';
import AdminLog from '../models/AdminLog.js';

const router = express.Router();

// ─── Admin credentials (hardcoded for simplicity) ─────────────────────────────
const ADMIN_EMAIL = 'admin@truefoodbite.com';
const ADMIN_PASSWORD = 'admin123';

// ─── Admin authentication middleware ──────────────────────────────────────────
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['x-admin-token'];
    if (!authHeader || authHeader !== 'admin-session-active') {
        return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }
    next();
};

// Helper: log admin action
async function logAdminAction(action, details = {}) {
    try {
        await AdminLog.create({ action, details });
    } catch (err) {
        console.error('Failed to log admin action:', err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/admin/login — Admin login
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            await logAdminAction('admin_login', { email });
            return res.json({ success: true, message: 'Admin login successful', token: 'admin-session-active' });
        }
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/admin/stats — Dashboard analytics
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const [allUsers, allProfiles, ingredientCount, flaggedCount, recentLogs] = await Promise.all([
            User.find({}).lean(),
            Profile.find({}).lean(),
            Ingredient.countDocuments(),
            Flagged.countDocuments(),
            AdminLog.find({}).sort({ createdAt: -1 }).limit(20).lean(),
        ]);

        const totalUsers = allUsers.length;
        const verifiedUsers = allUsers.filter(u => u.isVerified).length;
        const unverifiedUsers = totalUsers - verifiedUsers;

        let totalScans = 0;
        let topProducts = {};
        allProfiles.forEach(p => {
            const history = p.history || [];
            totalScans += history.length;
            history.forEach(h => {
                const name = h.productName || 'Unknown';
                topProducts[name] = (topProducts[name] || 0) + 1;
            });
        });

        const topProductsList = Object.entries(topProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, scans: count }));

        const signupsByDay = {};
        allUsers.forEach(u => {
            const day = (u.createdAt ? new Date(u.createdAt).toISOString() : '').substring(0, 10);
            if (day) signupsByDay[day] = (signupsByDay[day] || 0) + 1;
        });

        const conditionCounts = {};
        allProfiles.forEach(p => {
            (p.chronicDiseases || []).forEach(d => {
                conditionCounts[d] = (conditionCounts[d] || 0) + 1;
            });
        });

        const goalCounts = {};
        allProfiles.forEach(p => {
            if (p.goal) goalCounts[p.goal] = (goalCounts[p.goal] || 0) + 1;
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                verifiedUsers,
                unverifiedUsers,
                totalProfiles: allProfiles.length,
                totalScans,
                totalIngredients: ingredientCount,
                totalFlagged: flaggedCount,
                topProducts: topProductsList,
                signupsByDay,
                conditionCounts,
                goalCounts,
                recentLogs,
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/admin/users — List all users
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const allUsers = await User.find({}).select('+password').lean();
        const allProfiles = await Profile.find({}).lean();

        const profileMap = {};
        allProfiles.forEach(p => { profileMap[p.email] = p; });

        const users = allUsers.map(u => {
            const profile = profileMap[u.email] || {};
            const scanCount = (profile.history || []).length;
            return {
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                passwordHash: u.password || '',
                isVerified: u.isVerified,
                createdAt: u.createdAt,
                lastLogin: u.lastLogin || null,
                scanCount,
                chronicDiseases: profile.chronicDiseases || [],
                goal: profile.goal || '',
            };
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/admin/users/:email — Delete a user
// ═══════════════════════════════════════════════════════════════════════════════
router.delete('/users/:email', authenticateAdmin, async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase();
        const user = await User.findOneAndDelete({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await Profile.findOneAndDelete({ email });
        await logAdminAction('delete_user', { email });
        res.json({ success: true, message: `User ${email} deleted` });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/admin/users/:email/toggle-verify — Toggle user verification
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/users/:email/toggle-verify', authenticateAdmin, async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase();
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isVerified = !user.isVerified;
        await user.save();
        await logAdminAction('toggle_verify', { email, isVerified: user.isVerified });
        res.json({ success: true, message: `User ${email} is now ${user.isVerified ? 'verified' : 'unverified'}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/admin/users/:email/password — Admin changes a user's password
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/users/:email/password', authenticateAdmin, async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase();
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
        }

        user.password = newPassword; // hashed by pre-save hook
        await user.save();
        await logAdminAction('change_user_password', { email });
        res.json({ success: true, message: `Password updated for ${email}` });
    } catch (error) {
        console.error('Admin change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENTS DATABASE CRUD
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/ingredients', authenticateAdmin, async (req, res) => {
    try {
        const list = await Ingredient.find({}).lean();
        res.json({ success: true, ingredients: list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/ingredients', authenticateAdmin, async (req, res) => {
    try {
        const { name, code, category, riskLevel, description, alternateNames } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Ingredient name is required' });

        const ingredient = await Ingredient.create({ name, code, category, riskLevel, description, alternateNames });
        await logAdminAction('add_ingredient', { id: ingredient._id, name });
        res.json({ success: true, ingredient });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/ingredients/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, category, riskLevel, description, alternateNames } = req.body;

        const ingredient = await Ingredient.findByIdAndUpdate(id,
            { $set: { name, code, category, riskLevel, description, alternateNames } },
            { new: true, runValidators: true }
        );
        if (!ingredient) return res.status(404).json({ success: false, message: 'Ingredient not found' });

        await logAdminAction('update_ingredient', { id, name: ingredient.name });
        res.json({ success: true, ingredient });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/ingredients/:id', authenticateAdmin, async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
        if (!ingredient) return res.status(404).json({ success: false, message: 'Ingredient not found' });

        await logAdminAction('delete_ingredient', { id: req.params.id, name: ingredient.name });
        res.json({ success: true, message: 'Ingredient deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FLAGGED SUBSTANCES CRUD
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/flagged', authenticateAdmin, async (req, res) => {
    try {
        const list = await Flagged.find({}).lean();
        res.json({ success: true, flagged: list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/flagged', authenticateAdmin, async (req, res) => {
    try {
        const { name, code, severity, reason, source, affectedProducts } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Substance name is required' });

        const flagged = await Flagged.create({ name, code, severity, reason, source, affectedProducts });
        await logAdminAction('flag_substance', { id: flagged._id, name, severity });
        res.json({ success: true, flagged });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/flagged/:id', authenticateAdmin, async (req, res) => {
    try {
        const { name, code, severity, reason, source, affectedProducts, isActive } = req.body;

        const flagged = await Flagged.findByIdAndUpdate(req.params.id,
            { $set: { name, code, severity, reason, source, affectedProducts, isActive } },
            { new: true, runValidators: true }
        );
        if (!flagged) return res.status(404).json({ success: false, message: 'Flagged substance not found' });

        await logAdminAction('update_flagged', { id: req.params.id, name: flagged.name });
        res.json({ success: true, flagged });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/flagged/:id', authenticateAdmin, async (req, res) => {
    try {
        const flagged = await Flagged.findByIdAndDelete(req.params.id);
        if (!flagged) return res.status(404).json({ success: false, message: 'Not found' });

        await logAdminAction('unflag_substance', { id: req.params.id, name: flagged.name });
        res.json({ success: true, message: 'Flagged substance removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/admin/logs — Activity log
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/logs', authenticateAdmin, async (req, res) => {
    try {
        const logs = await AdminLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
