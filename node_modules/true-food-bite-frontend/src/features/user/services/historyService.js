import authService from '../../auth/services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const KEYS = {
    HISTORY: 'factsscan_history_cache',
    FAVORITES: 'factsscan_favorites_cache',
    NOTES: 'factsscan_notes_cache',
    INTAKE: 'factsscan_intake_cache'
};

class TrackingService {
    // ═══════════════════════════════════════════════════════════════════════════════
    // LOCAL STORAGE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════
    _get(key) {
        try {
            const cached = localStorage.getItem(key);
            return cached ? JSON.parse(cached) : (key === KEYS.NOTES ? {} : []);
        } catch (e) {
            return key === KEYS.NOTES ? {} : [];
        }
    }

    _set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) { }
    }

    // Call this specifically on app loaded to sync all data if logged in
    async syncDataFromServer(profileData) {
        if (!profileData) return;
        if (profileData.history) this._set(KEYS.HISTORY, profileData.history);
        if (profileData.favorites) this._set(KEYS.FAVORITES, profileData.favorites);
        
        if (profileData.notes) {
            const notesMap = {};
            profileData.notes.forEach(n => {
                notesMap[n.barcode] = { text: n.text, updatedAt: n.updatedAt };
            });
            this._set(KEYS.NOTES, notesMap);
        }
        
        if (profileData.intake) this._set(KEYS.INTAKE, profileData.intake);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PAST SCANS (HISTORY)
    // ═══════════════════════════════════════════════════════════════════════════════
    async addToHistory(product) {
        const item = {
            barcode: product._id || product.code,
            productName: product.product_name || 'Unknown',
            brand: product.brands || '',
            image: product.image_front_small_url || product.image_front_url || '',
            score: product.truthInScore || 0,
            grade: product.nutrition_grades || '?',
            timestamp: new Date().toISOString()
        };

        const list = this._get(KEYS.HISTORY);
        const filtered = list.filter(i => i.barcode !== item.barcode);
        const updated = [item, ...filtered].slice(0, 100);
        this._set(KEYS.HISTORY, updated);

        if (authService.isAuthenticated() && navigator.onLine) {
            try {
                await fetch(`${API_URL}/profile/history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
                    body: JSON.stringify(item)
                });
            } catch (e) { console.error('History sync error', e); }
        }
        return updated;
    }

    getHistory() {
        return this._get(KEYS.HISTORY);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // FAVORITES (SAVED PRODUCTS)
    // ═══════════════════════════════════════════════════════════════════════════════
    async toggleFavorite(product) {
        const barcode = product._id || product.code;
        let list = this._get(KEYS.FAVORITES);
        const exists = list.find(i => i.barcode === barcode);

        const itemPayload = {
            barcode,
            productName: product.product_name || 'Unknown',
            brand: product.brands || '',
            image: product.image_front_small_url || product.image_front_url || '',
        };

        if (exists) {
            list = list.filter(i => i.barcode !== barcode);
        } else {
            const item = { ...itemPayload, timestamp: new Date().toISOString() };
            list = [item, ...list];
        }

        this._set(KEYS.FAVORITES, list);

        // Sync with server if authenticated
        if (authService.isAuthenticated() && navigator.onLine) {
            try {
                const res = await fetch(`${API_URL}/profile/favorites`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
                    body: JSON.stringify(itemPayload)
                });
                const data = await res.json();
                if (data.favorites) this._set(KEYS.FAVORITES, data.favorites);
            } catch (e) { console.error('Favorite sync error', e); }
        }
        
        return this._get(KEYS.FAVORITES);
    }

    isFavorite(barcode) {
        const list = this._get(KEYS.FAVORITES);
        return list.some(i => i.barcode === barcode);
    }

    getFavorites() {
        return this._get(KEYS.FAVORITES);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PERSONAL NOTES
    // ═══════════════════════════════════════════════════════════════════════════════
    async saveNote(barcode, text) {
        const notes = this._get(KEYS.NOTES);
        if (!text || text.trim() === "") {
            delete notes[barcode];
        } else {
            notes[barcode] = {
                text: text.trim(),
                updatedAt: new Date().toISOString()
            };
        }
        this._set(KEYS.NOTES, notes);

        if (authService.isAuthenticated() && navigator.onLine) {
            try {
                const res = await fetch(`${API_URL}/profile/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
                    body: JSON.stringify({ barcode, text })
                });
                const data = await res.json();
                if (data.notes) {
                    const notesMap = {};
                    data.notes.forEach(n => {
                        notesMap[n.barcode] = { text: n.text, updatedAt: n.updatedAt };
                    });
                    this._set(KEYS.NOTES, notesMap);
                }
            } catch (e) { console.error('Note sync error', e); }
        }
        
        return this._get(KEYS.NOTES);
    }

    getNote(barcode) {
        const notes = this._get(KEYS.NOTES);
        return notes[barcode]?.text || "";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DAILY INTAKE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════════
    async logConsumption(product, grams = 100) {
        const nutriments = product.nutriments || {};
        const factor = grams / 100;

        const entry = {
            barcode: product._id || product.code,
            name: product.product_name || 'Unknown',
            grams,
            timestamp: new Date().toISOString(),
            nutrients: {
                calories: (nutriments['energy-kcal_100g'] || nutriments.energy_kcal || 0) * factor,
                sugar: (nutriments.sugars_100g || 0) * factor,
                salt: (nutriments.salt_100g || 0) * factor,
                fat: (nutriments.fat_100g || 0) * factor,
                protein: (nutriments.proteins_100g || 0) * factor
            }
        };

        const intake = this._get(KEYS.INTAKE);
        const updated = [entry, ...intake];
        this._set(KEYS.INTAKE, updated);

        if (authService.isAuthenticated() && navigator.onLine) {
            try {
                const res = await fetch(`${API_URL}/profile/intake`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
                    body: JSON.stringify(entry)
                });
                const data = await res.json();
                if (data.intake) this._set(KEYS.INTAKE, data.intake);
            } catch (e) { console.error('Intake sync error', e); }
        }
        return this._get(KEYS.INTAKE);
    }

    getDailySummary(dateString) {
        const targetDate = dateString ? new Date(dateString) : new Date();
        const intake = this._get(KEYS.INTAKE);

        const dailyEntries = intake.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate.getDate() === targetDate.getDate() &&
                entryDate.getMonth() === targetDate.getMonth() &&
                entryDate.getFullYear() === targetDate.getFullYear();
        });

        const summary = dailyEntries.reduce((acc, curr) => {
            acc.calories += curr.nutrients.calories;
            acc.sugar += curr.nutrients.sugar;
            acc.salt += curr.nutrients.salt;
            acc.fat += curr.nutrients.fat;
            acc.protein += curr.nutrients.protein;
            acc.totalCount += 1;
            return acc;
        }, { calories: 0, sugar: 0, salt: 0, fat: 0, protein: 0, totalCount: 0 });

        return { sum: summary, summary, entries: dailyEntries };
    }

    clearOldIntake(daysToKeep = 30) {
        const intake = this._get(KEYS.INTAKE);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);

        const filtered = intake.filter(entry => new Date(entry.timestamp) > cutoff);
        this._set(KEYS.INTAKE, filtered);
    }
}

const trackingService = new TrackingService();
export default trackingService;
