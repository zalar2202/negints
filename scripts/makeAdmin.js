import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define User Schema (Simplified for script)
const UserSchema = new mongoose.Schema({
    email: String,
    role: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function makeAdmin() {
    const email = 'admin@negints.com';
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env.local');
        process.exit(1);
    }

    try {
        console.log(`🔄 Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email });
        
        if (!user) {
            console.error(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`🚀 User ${email} is now an admin!`);
    } catch (error) {
        console.error('❌ Error updating user role:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

makeAdmin();
