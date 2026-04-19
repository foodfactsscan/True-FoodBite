import mongoose from 'mongoose';

const HistoryItemSchema = new mongoose.Schema({
    barcode: { type: String, required: true },
    productName: { type: String, default: 'Unknown Product' },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    grade: { type: String, default: '?' },
    scannedAt: { type: Date, default: Date.now }
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    gender: { type: String, default: '' },
    age: { type: Number, default: null },
    heightCm: { type: Number, default: null },
    weightKg: { type: Number, default: null },
    goal: { type: String, default: '' },
    chronicDiseases: { type: [String], default: [] },
    temporaryIssues: { type: [String], default: [] },
    customHealthIssues: { type: [String], default: [] },
    customGoals: { type: [String], default: [] },
    history: {
        type: [HistoryItemSchema],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.length <= 50;
            },
            message: 'History cannot exceed 50 items'
        }
    },
    favorites: {
        type: [{
            barcode: { type: String, required: true },
            productName: { type: String, default: 'Unknown Product' },
            brand: { type: String, default: '' },
            image: { type: String, default: '' },
            timestamp: { type: Date, default: Date.now }
        }],
        default: []
    },
    notes: {
        type: [{
            barcode: { type: String, required: true },
            text: { type: String, required: true },
            updatedAt: { type: Date, default: Date.now }
        }],
        default: []
    },
    intake: {
        type: [{
            barcode: { type: String, required: true },
            name: { type: String, default: 'Unknown' },
            grams: { type: Number, default: 0 },
            timestamp: { type: Date, default: Date.now },
            nutrients: {
                calories: { type: Number, default: 0 },
                sugar: { type: Number, default: 0 },
                salt: { type: Number, default: 0 },
                fat: { type: Number, default: 0 },
                protein: { type: Number, default: 0 }
            }
        }],
        default: []
    }
}, {
    timestamps: true
});

export default mongoose.model('Profile', ProfileSchema);
