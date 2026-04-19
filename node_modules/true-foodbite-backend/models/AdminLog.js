import mongoose from 'mongoose';

const AdminLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model('AdminLog', AdminLogSchema);
