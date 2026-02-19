import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Promotion title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Promotion description is required'],
            trim: true,
        },
        discountCode: {
            type: String,
            required: [true, 'Discount code is required'],
            unique: true,
            trim: true,
            uppercase: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'fixed',
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minPurchase: {
            type: Number,
            default: 0,
            min: 0,
        },
        usageLimit: {
            type: Number,
            default: null, // null means unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        applicableCategories: {
            type: [String],
            default: [], // Empty means applies to all
        },
    },
    {
        timestamps: true,
    }
);

const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);

export default Promotion;
