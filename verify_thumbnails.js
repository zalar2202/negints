import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

import dbConnect from './src/lib/mongodb.js';
import BlogPost from './src/models/BlogPost.js';

async function checkThumbnails() {
    try {
        await dbConnect();
        
        const slugs = [
            'openclaw-guide-2026',
            'ai-infrastructure-boom-2026-strategy',
            '2026-digital-transformation',
            'personaplex-explained-real-time-conversational-ai-in-2026'
        ];

        for (const slug of slugs) {
            const post = await BlogPost.findOne({ slug });
            if (post) {
                console.log(`\n--- Post: ${slug} ---`);
                console.log(`Title: ${post.title}`);
                console.log(`Featured Image URL: ${post.featuredImage?.url || 'MISSING'}`);
                console.log(`SEO OG Image: ${post.seo?.ogImage || 'MISSING'}`);
            } else {
                console.log(`\n--- Post: ${slug} NOT FOUND ---`);
            }
        }
    } catch (error) {
        console.error("Script Error:", error);
    } finally {
        process.exit(0);
    }
}

checkThumbnails();
