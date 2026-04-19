import express from 'express';
import { authenticateToken } from './auth-simple.js';
import Profile from '../models/Profile.js';

const router = express.Router();

// ═══════════════════════════════════════════
// GET /api/profile - Get user profile
// ═══════════════════════════════════════════
router.get('/', authenticateToken, async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.userEmail });
        res.json({ success: true, profile: profile || null });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// PUT /api/profile - Create or update profile
// ═══════════════════════════════════════════
router.put('/', authenticateToken, async (req, res) => {
    try {
        const {
            firstName, lastName, profilePhoto, gender,
            age, heightCm, weightKg, goal,
            chronicDiseases, temporaryIssues, customHealthIssues, customGoals
        } = req.body;

        const update = {
            email: req.userEmail,
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
            ...(profilePhoto !== undefined && { profilePhoto }),
            ...(gender !== undefined && { gender }),
            ...(age !== undefined && { age }),
            ...(heightCm !== undefined && { heightCm }),
            ...(weightKg !== undefined && { weightKg }),
            ...(goal !== undefined && { goal }),
            ...(chronicDiseases !== undefined && { chronicDiseases }),
            ...(temporaryIssues !== undefined && { temporaryIssues }),
            ...(customHealthIssues !== undefined && { customHealthIssues }),
            ...(customGoals !== undefined && { customGoals }),
        };

        const profile = await Profile.findOneAndUpdate(
            { email: req.userEmail },
            { $set: update },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ success: true, message: 'Profile updated successfully', profile });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// DELETE /api/profile/temporary-issue
// ═══════════════════════════════════════════
router.delete('/temporary-issue', authenticateToken, async (req, res) => {
    try {
        const { issue } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { email: req.userEmail },
            { $pull: { temporaryIssues: issue } },
            { new: true }
        );
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json({ success: true, profile });
    } catch (error) {
        console.error('Delete temporary issue error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// POST /api/profile/history - Add scan to history
// ═══════════════════════════════════════════
router.post('/history', authenticateToken, async (req, res) => {
    try {
        const { barcode, productName, brand, image, grade } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode is required' });

        const historyItem = {
            barcode,
            productName: productName || 'Unknown Product',
            brand: brand || '',
            image: image || '',
            grade: grade || '?',
            scannedAt: new Date()
        };

        // Remove existing entry for same barcode, add new to top, limit to 50
        let profile = await Profile.findOneAndUpdate(
            { email: req.userEmail },
            { $pull: { history: { barcode } } },
            { new: true, upsert: true }
        );

        profile = await Profile.findOneAndUpdate(
            { email: req.userEmail },
            {
                $push: {
                    history: {
                        $each: [historyItem],
                        $position: 0,
                        $slice: 50
                    }
                }
            },
            { new: true }
        );

        res.json({ success: true, history: profile.history });
    } catch (error) {
        console.error('Add history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// DELETE /api/profile/history/:barcode
// ═══════════════════════════════════════════
router.delete('/history/:barcode', authenticateToken, async (req, res) => {
    try {
        const { barcode } = req.params;
        const profile = await Profile.findOneAndUpdate(
            { email: req.userEmail },
            { $pull: { history: { barcode } } },
            { new: true }
        );
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json({ success: true, history: profile.history });
    } catch (error) {
        console.error('Delete history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// POST /api/profile/favorites (Toggle Favorite)
// ═══════════════════════════════════════════
router.post('/favorites', authenticateToken, async (req, res) => {
    try {
        const { barcode, productName, brand, image } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode is required' });

        const profile = await Profile.findOne({ email: req.userEmail });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const isFavorite = profile.favorites.some(f => f.barcode === barcode);
        if (isFavorite) {
            // Remove it
            profile.favorites = profile.favorites.filter(f => f.barcode !== barcode);
        } else {
            // Add it
            profile.favorites.unshift({ barcode, productName, brand, image, timestamp: new Date() });
        }

        await profile.save();
        res.json({ success: true, favorites: profile.favorites });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// POST /api/profile/notes
// ═══════════════════════════════════════════
router.post('/notes', authenticateToken, async (req, res) => {
    try {
        const { barcode, text } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode is required' });

        const profile = await Profile.findOne({ email: req.userEmail });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Filter out existing note for this barcode
        profile.notes = profile.notes.filter(n => n.barcode !== barcode);

        // If text is provided, add the new note
        if (text && text.trim() !== '') {
            profile.notes.push({ barcode, text: text.trim(), updatedAt: new Date() });
        }

        await profile.save();
        res.json({ success: true, notes: profile.notes });
    } catch (error) {
        console.error('Save note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// POST /api/profile/intake
// ═══════════════════════════════════════════
router.post('/intake', authenticateToken, async (req, res) => {
    try {
        const { barcode, name, grams, nutrients } = req.body;
        if (!barcode) return res.status(400).json({ message: 'Barcode is required' });

        const profile = await Profile.findOne({ email: req.userEmail });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Add to front of the array
        profile.intake.unshift({
            barcode,
            name,
            grams: grams || 100,
            timestamp: new Date(),
            nutrients: nutrients || { calories: 0, sugar: 0, salt: 0, fat: 0, protein: 0 }
        });

        // Prune older than 30 days automatically
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        profile.intake = profile.intake.filter(entry => new Date(entry.timestamp) > cutoff);

        await profile.save();
        res.json({ success: true, intake: profile.intake });
    } catch (error) {
        console.error('Log intake error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
