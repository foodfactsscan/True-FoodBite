import express from 'express';
import bcrypt from 'bcryptjs';
import { usersDB, profilesDB, ingredientsDB, flaggedDB, adminLogDB } from '../db.js';

const router = express.Router();

// ─── Admin credentials (hardcoded for simplicity) ─────────────────────────────
const ADMIN_EMAIL = 'admin@factsscan.com';
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
function logAdminAction(action, details = {}) {
    const id = `log_${Date.now()}`;
    adminLogDB.set(id, {
        action,
        details,
        timestamp: new Date().toISOString(),
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/admin/login — Admin login
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            logAdminAction('admin_login', { email });
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
router.get('/stats', authenticateAdmin, (req, res) => {
    try {
        const allUsers = usersDB.getAll();
        const allProfiles = profilesDB.getAll();
        const allIngredients = ingredientsDB.getAll();
        const allFlagged = flaggedDB.getAll();

        const userList = Object.values(allUsers);
        const profileList = Object.values(allProfiles);

        // Compute analytics
        const totalUsers = userList.length;
        const verifiedUsers = userList.filter(u => u.isVerified).length;
        const unverifiedUsers = totalUsers - verifiedUsers;

        // Scan counts from profiles with history
        let totalScans = 0;
        let topProducts = {};
        profileList.forEach(p => {
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

        // Signups over time (last 30 days)
        const now = Date.now();
        const signupsByDay = {};
        userList.forEach(u => {
            const day = (u.createdAt || '').substring(0, 10);
            if (day) signupsByDay[day] = (signupsByDay[day] || 0) + 1;
        });

        // Condition distribution from profiles
        const conditionCounts = {};
        profileList.forEach(p => {
            (p.chronicDiseases || []).forEach(d => {
                conditionCounts[d] = (conditionCounts[d] || 0) + 1;
            });
        });

        // Goal distribution
        const goalCounts = {};
        profileList.forEach(p => {
            if (p.goal) goalCounts[p.goal] = (goalCounts[p.goal] || 0) + 1;
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                verifiedUsers,
                unverifiedUsers,
                totalProfiles: profileList.length,
                totalScans,
                totalIngredients: Object.keys(allIngredients).length,
                totalFlagged: Object.keys(allFlagged).length,
                topProducts: topProductsList,
                signupsByDay,
                conditionCounts,
                goalCounts,
                recentLogs: Object.values(adminLogDB.getAll()).slice(-20).reverse(),
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
router.get('/users', authenticateAdmin, (req, res) => {
    try {
        const allUsers = usersDB.getAll();
        const allProfiles = profilesDB.getAll();

        const users = Object.values(allUsers).map(u => {
            const profile = allProfiles[u.email] || {};
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
router.delete('/users/:email', authenticateAdmin, (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase();
        if (!usersDB.has(email)) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        usersDB.delete(email);
        profilesDB.delete(email);
        logAdminAction('delete_user', { email });
        res.json({ success: true, message: `User ${email} deleted` });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/admin/users/:email/toggle-verify — Toggle user verification
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/users/:email/toggle-verify', authenticateAdmin, (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase();
        const user = usersDB.get(email);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isVerified = !user.isVerified;
        user.updatedAt = new Date().toISOString();
        usersDB.set(email, user);
        logAdminAction('toggle_verify', { email, isVerified: user.isVerified });
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
        const user = usersDB.get(email);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.updatedAt = new Date().toISOString();
        usersDB.set(email, user);
        logAdminAction('change_user_password', { email });
        res.json({ success: true, message: `Password updated for ${email}` });
    } catch (error) {
        console.error('Admin change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENTS DATABASE CRUD
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/ingredients — List all custom ingredients
router.get('/ingredients', authenticateAdmin, (req, res) => {
    try {
        const all = ingredientsDB.getAll();
        const list = Object.entries(all).map(([id, data]) => ({ id, ...data }));
        res.json({ success: true, ingredients: list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/admin/ingredients — Add a new ingredient
router.post('/ingredients', authenticateAdmin, (req, res) => {
    try {
        const { name, code, category, riskLevel, description, alternateNames } = req.body;

        if (!name) return res.status(400).json({ success: false, message: 'Ingredient name is required' });

        const id = `ing_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const ingredient = {
            name,
            code: code || '',
            category: category || 'general',
            riskLevel: riskLevel || 'safe',
            description: description || '',
            alternateNames: alternateNames || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        ingredientsDB.set(id, ingredient);
        logAdminAction('add_ingredient', { id, name });
        res.json({ success: true, ingredient: { id, ...ingredient } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/ingredients/:id — Update an ingredient
router.put('/ingredients/:id', authenticateAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const existing = ingredientsDB.get(id);
        if (!existing) return res.status(404).json({ success: false, message: 'Ingredient not found' });

        const { name, code, category, riskLevel, description, alternateNames } = req.body;
        const updated = {
            ...existing,
            name: name !== undefined ? name : existing.name,
            code: code !== undefined ? code : existing.code,
            category: category !== undefined ? category : existing.category,
            riskLevel: riskLevel !== undefined ? riskLevel : existing.riskLevel,
            description: description !== undefined ? description : existing.description,
            alternateNames: alternateNames !== undefined ? alternateNames : existing.alternateNames,
            updatedAt: new Date().toISOString(),
        };

        ingredientsDB.set(id, updated);
        logAdminAction('update_ingredient', { id, name: updated.name });
        res.json({ success: true, ingredient: { id, ...updated } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/admin/ingredients/:id — Delete an ingredient
router.delete('/ingredients/:id', authenticateAdmin, (req, res) => {
    try {
        const { id } = req.params;
        if (!ingredientsDB.has(id)) return res.status(404).json({ success: false, message: 'Ingredient not found' });
        const name = ingredientsDB.get(id)?.name;
        ingredientsDB.delete(id);
        logAdminAction('delete_ingredient', { id, name });
        res.json({ success: true, message: 'Ingredient deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FLAGGED SUBSTANCES CRUD
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/flagged — List all flagged substances
router.get('/flagged', authenticateAdmin, (req, res) => {
    try {
        const all = flaggedDB.getAll();
        const list = Object.entries(all).map(([id, data]) => ({ id, ...data }));
        res.json({ success: true, flagged: list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/admin/flagged — Flag a harmful substance
router.post('/flagged', authenticateAdmin, (req, res) => {
    try {
        const { name, code, severity, reason, source, affectedProducts } = req.body;

        if (!name) return res.status(400).json({ success: false, message: 'Substance name is required' });

        const id = `flag_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const flagged = {
            name,
            code: code || '',
            severity: severity || 'moderate', // low, moderate, high, critical
            reason: reason || '',
            source: source || 'Admin',
            affectedProducts: affectedProducts || [],
            isActive: true,
            createdAt: new Date().toISOString(),
        };

        flaggedDB.set(id, flagged);
        logAdminAction('flag_substance', { id, name, severity });
        res.json({ success: true, flagged: { id, ...flagged } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/flagged/:id — Update a flagged substance
router.put('/flagged/:id', authenticateAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const existing = flaggedDB.get(id);
        if (!existing) return res.status(404).json({ success: false, message: 'Flagged substance not found' });

        const { name, code, severity, reason, source, affectedProducts, isActive } = req.body;
        const updated = {
            ...existing,
            name: name !== undefined ? name : existing.name,
            code: code !== undefined ? code : existing.code,
            severity: severity !== undefined ? severity : existing.severity,
            reason: reason !== undefined ? reason : existing.reason,
            source: source !== undefined ? source : existing.source,
            affectedProducts: affectedProducts !== undefined ? affectedProducts : existing.affectedProducts,
            isActive: isActive !== undefined ? isActive : existing.isActive,
            updatedAt: new Date().toISOString(),
        };

        flaggedDB.set(id, updated);
        logAdminAction('update_flagged', { id, name: updated.name });
        res.json({ success: true, flagged: { id, ...updated } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/admin/flagged/:id — Remove a flagged substance
router.delete('/flagged/:id', authenticateAdmin, (req, res) => {
    try {
        const { id } = req.params;
        if (!flaggedDB.has(id)) return res.status(404).json({ success: false, message: 'Not found' });
        const name = flaggedDB.get(id)?.name;
        flaggedDB.delete(id);
        logAdminAction('unflag_substance', { id, name });
        res.json({ success: true, message: 'Flagged substance removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/admin/logs — Activity log
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/logs', authenticateAdmin, (req, res) => {
    try {
        const all = adminLogDB.getAll();
        const logs = Object.entries(all)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 100);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
