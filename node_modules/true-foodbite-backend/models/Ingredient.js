import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, default: '' },
    category: { type: String, default: 'general' },
    riskLevel: { type: String, default: 'safe' },
    description: { type: String, default: '' },
    alternateNames: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('Ingredient', IngredientSchema);
