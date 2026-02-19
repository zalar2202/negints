import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define Minimal Schemas
const MediaSchema = new mongoose.Schema({
    url: String,
    filename: String,
    folder: String
});

const BlogPostSchema = new mongoose.Schema({
    featuredImage: {
        url: String
    },
    content: String
});

const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);

async function migrateUrls() {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env.local');
        process.exit(1);
    }

    try {
        console.log(`🔄 Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Migrate Media collection
        const mediaItems = await Media.find({ 
            $or: [
                { url: { $regex: /^\/public/ } },
                { url: { $regex: /^\/assets\/storage/ } }
            ]
        });
        
        console.log(`🔍 Found ${mediaItems.length} media items with old URL patterns`);

        for (const item of mediaItems) {
            const oldUrl = item.url;
            const category = item.folder || 'general';
            item.url = `/api/files?category=${category}&filename=${item.filename}`;
            await item.save();
            console.log(`✅ Migrated Media: ${oldUrl} -> ${item.url}`);
        }

        // 2. Migrate BlogPosts featured images
        const posts = await BlogPost.find({ 
            $or: [
                { 'featuredImage.url': { $regex: /^\/public/ } },
                { 'featuredImage.url': { $regex: /^\/assets\/storage/ } }
            ]
        });
        
        console.log(`🔍 Found ${posts.length} blog posts with old featured image patterns`);

        for (const post of posts) {
            if (post.featuredImage && post.featuredImage.url) {
                const oldUrl = post.featuredImage.url;
                // Try to extract filename
                const parts = oldUrl.split('/');
                const filename = parts[parts.length - 1];
                const category = 'blog'; // Assuming blog for blog posts
                
                post.featuredImage.url = `/api/files?category=${category}&filename=${filename}`;
                await post.save();
                console.log(`✅ Migrated BlogPost Image: ${oldUrl} -> ${post.featuredImage.url}`);
            }
        }

        console.log('🚀 Migration complete!');
    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrateUrls();
