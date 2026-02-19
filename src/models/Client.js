import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Client/Company name is required'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        linkedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'prospective'],
            default: 'active',
        },
        company: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        taxId: {
            type: String,
            trim: true,
        },
        whatsapp: {
            type: String,
            trim: true,
        },
        preferredCommunication: {
            type: String,
            enum: ['email', 'whatsapp', 'phone', 'slack'],
            default: 'email',
        },
        address: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            zip: { type: String, default: '' },
            country: { type: String, default: '' },
        },
        notes: {
            type: String,
            trim: true,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'CAD', 'TRY', 'AED', 'IRT'],
            default: 'IRT',
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

export default Client;
