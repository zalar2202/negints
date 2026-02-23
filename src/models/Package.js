import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Package name is required'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            required: [true, 'Slug is required'],
            lowercase: true,
            trim: true,
        },
        displayCategory: { // Renamed from category to distinguish, kept for display if needed
            type: String, 
            default: 'General',
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductCategory',
            required: false, // Make optional initially to avoid breaking existing data
        },
        images: [
            {
                type: String,
                trim: true,
            },
        ],
        stock: {
            type: Number,
            default: 0,
        },
        sku: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        weight: {
            type: Number, // in grams
            default: 0,
        },
        dimensions: {
            length: { type: Number, default: 0 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
        },
        material: {
            type: String,
            trim: true,
        },
        specifications: [
            {
                key: String,
                value: String,
            }
        ],
        startingPrice: {
            type: String,
            default: "0",
        },
        price: {
            type: Number,
            default: 0,
        },
        priceRange: {
            type: String,
            trim: true,
        },
        features: [
            {
                type: String,
                trim: true,
            },
        ],
        sizes: [
            {
                type: String,
                trim: true,
            },
        ],
        videoUrl: {
            type: String,
            trim: true,
        },
        deliveryTime: {
            type: String,
            trim: true,
        },
        revisions: {
            type: String,
            trim: true,
        },
        badge: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            default: 'Package',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },

    },
    {
        timestamps: true,
    }
);

// Convert empty SKU to null so the sparse unique index works correctly.
// MongoDB sparse indexes only skip documents where the field is null/undefined,
// not empty strings – so two products with sku: "" would collide.
PackageSchema.pre('save', function (next) {
    if (this.sku !== undefined && this.sku !== null && this.sku.trim() === '') {
        this.sku = null;
    }
    next();
});

PackageSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update && update.sku !== undefined && update.sku !== null && String(update.sku).trim() === '') {
        update.sku = null;
    }
    next();
});

const Package = mongoose.models.Package || mongoose.model('Package', PackageSchema);

export default Package;
