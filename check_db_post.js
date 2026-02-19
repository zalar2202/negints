import dbConnect from './src/lib/mongodb.js';
import BlogPost from './src/models/BlogPost.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPost() {
    await dbConnect();
    const slug = 'personaplex explained real time conversational ai in 2026';
    const postBySpaceSlug = await BlogPost.findOne({ slug });
    
    const hyphenatedSlug = 'personaplex-explained-real-time-conversational-ai-in-2026';
    const postByHyphenatedSlug = await BlogPost.findOne({ slug: hyphenatedSlug });

    console.log('Post by space slug:', postBySpaceSlug ? 'FOUND' : 'NOT FOUND');
    if (postBySpaceSlug) {
        console.log('Space Slug SEO:', JSON.stringify(postBySpaceSlug.seo));
    }

    console.log('Post by hyphenated slug:', postByHyphenatedSlug ? 'FOUND' : 'NOT FOUND');
    if (postByHyphenatedSlug) {
        console.log('Hyphenated Slug SEO:', JSON.stringify(postByHyphenatedSlug.seo));
    }
    
    process.exit(0);
}

checkPost();
