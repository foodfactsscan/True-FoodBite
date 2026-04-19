import express from 'express';
import { searchProductWithAI } from '../services/aiProductService.js';

const router = express.Router();

/**
 * GET /api/products/:barcode
 * Smart product lookup with AI fallback
 */
router.get('/:barcode', async (req, res) => {
    const { barcode } = req.params;

    try {
        console.log(`📦 Product lookup request: ${barcode}`);

        // Note: Frontend already tries OpenFoodFacts and local DB
        // This endpoint is ONLY called as a final fallback

        // Use Gemini AI to search for product
        const aiProduct = await searchProductWithAI(barcode);

        if (aiProduct) {
            return res.json({
                status: 1,
                product: aiProduct,
                source: 'ai'
            });
        }

        // Product truly not found anywhere
        return res.status(404).json({
            status: 0,
            message: 'Product not found in any database',
            barcode
        });

    } catch (error) {
        console.error('Product lookup error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error during product lookup'
        });
    }
});

export default router;
