import mongoose from 'mongoose';

const ProductCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        slug: {
            type: String,
            unique: true,
            required: [true, 'Slug is required'],
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        image: {
            type: String, // URL to category image
        },
        icon: {
            type: String, // Lucide icon name
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        productCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ProductCategorySchema.index({ slug: 1 });
ProductCategorySchema.index({ isActive: 1 });

// Helper to update product count (can be called from Package model hooks ideally)
ProductCategorySchema.statics.updateProductCount = async function (categoryId) {
    const Package = mongoose.model('Package');
    const count = await Package.countDocuments({ categoryId: categoryId, isActive: true });
    await this.findByIdAndUpdate(categoryId, { productCount: count });
};

const ProductCategory = mongoose.models.ProductCategory || mongoose.model('ProductCategory', ProductCategorySchema);

export default ProductCategory;
