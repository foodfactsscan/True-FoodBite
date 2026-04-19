import mongoose from 'mongoose';

const FlaggedSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, default: '' },
    severity: { type: String, default: 'moderate', enum: ['low', 'moderate', 'high', 'critical'] },
    reason: { type: String, default: '' },
    source: { type: String, default: 'Admin' },
    affectedProducts: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Flagged', FlaggedSchema);
