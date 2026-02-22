
import authService from './authService';

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

        if (exists) {
            list = list.filter(i => i.barcode !== barcode);
        } else {
            const item = {
                barcode,
                productName: product.product_name || 'Unknown',
                brand: product.brands || '',
                image: product.image_front_small_url || product.image_front_url || '',
                timestamp: new Date().toISOString()
            };
            list = [item, ...list];
        }

        this._set(KEYS.FAVORITES, list);
        // Sync with server if endpoint exists
        return list;
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
    saveNote(barcode, text) {
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
        return notes;
    }

    getNote(barcode) {
        const notes = this._get(KEYS.NOTES);
        return notes[barcode]?.text || "";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DAILY INTAKE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Log consumption of a product
     * @param {Object} product - The product object
     * @param {Number} grams - Amount consumed in grams
     */
    logConsumption(product, grams = 100) {
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
        return updated;
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

        return {
            summary,
            entries: dailyEntries
        };
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
