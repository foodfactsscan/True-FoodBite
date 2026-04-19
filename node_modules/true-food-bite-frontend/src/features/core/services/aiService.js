// AI Analysis Service — calls backend Gemini endpoint for custom health entries
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AIService {
    getAuthHeader() {
        const token = localStorage.getItem('factsscan_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Analyze a product against the user's custom health entries using Gemini AI
     * @param {Object} product - Product data from Open Food Facts
     * @param {string[]} customHealthIssues - User's custom health issues
     * @param {string[]} customGoals - User's custom goals
     * @returns {Object} AI analysis results with concerns and benefits
     */
    async analyzeProduct(product, customHealthIssues, customGoals) {
        try {
            if ((!customHealthIssues || customHealthIssues.length === 0) &&
                (!customGoals || customGoals.length === 0)) {
                return { success: true, concerns: [], benefits: [], overallNote: '' };
            }

            const response = await fetch(`${API_URL}/ai/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({
                    productName: product.product_name || '',
                    productBrands: product.brands || '',
                    nutrients: product.nutriments || {},
                    ingredientsText: product.ingredients_text || '',
                    customHealthIssues,
                    customGoals
                })
            });

            const data = await response.json();

            if (data.fallback) {
                // AI not available — return empty but don't error
                return {
                    success: true,
                    concerns: [],
                    benefits: [],
                    overallNote: '',
                    aiUnavailable: true
                };
            }

            return {
                success: data.success,
                concerns: data.concerns || [],
                benefits: data.benefits || [],
                overallNote: data.overallNote || ''
            };
        } catch (error) {
            console.error('AI analysis error:', error);
            return {
                success: false,
                concerns: [],
                benefits: [],
                overallNote: '',
                aiUnavailable: true,
                error: error.message
            };
        }
    }
}

const aiService = new AIService();
export default aiService;
