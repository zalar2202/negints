import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define Minimal Schemas for fixing URLs
const MediaSchema = new mongoose.Schema({
    url: String,
    path: String
});

const BlogPostSchema = new mongoose.Schema({
    featuredImage: {
        url: String
    }
});

const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);

async function fixUrls() {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env.local');
        process.exit(1);
    }

    try {
        console.log(`🔄 Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Fix Media collection
        const mediaItems = await Media.find({ url: { $regex: /^\/public/ } });
        console.log(`🔍 Found ${mediaItems.length} media items with /public prefix`);

        for (const item of mediaItems) {
            item.url = item.url.replace('/public', '');
            if (item.path) {
                item.path = item.path.replace('/public', '');
            }
            await item.save();
        }
        console.log(`✅ Fixed ${mediaItems.length} media items`);

        // 2. Fix BlogPosts collection
        const posts = await BlogPost.find({ 'featuredImage.url': { $regex: /^\/public/ } });
        console.log(`🔍 Found ${posts.length} blog posts with /public featured image prefix`);

        for (const post of posts) {
            if (post.featuredImage && post.featuredImage.url) {
                post.featuredImage.url = post.featuredImage.url.replace('/public', '');
            }
            await post.save();
        }
        console.log(`✅ Fixed ${posts.length} blog posts`);

        console.log('🚀 All URLs have been fixed!');
    } catch (error) {
        console.error('❌ Error fixing URLs:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

fixUrls();
