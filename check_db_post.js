import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import BlogPost from './src/models/BlogPost.js';
import dbConnect from './src/lib/mongodb.js';

dotenv.config({ path: '.env.local' });

async function checkPost() {
    try {
        await dbConnect();
        const posts = await BlogPost.find({}).select('title slug').limit(20);
        console.log('Existing Posts:');
        posts.forEach(p => {
            console.log(`- Title: ${p.title}`);
            console.log(`  Slug:  ${p.slug}`);
        });
        
        // Specifically check for the one in the user's URL
        const targetSlug = "چگونه-دستگاه-تصفیه-هوا-سلامت-خانواده-را-تضمین-میکند";
        const post = await BlogPost.findOne({ slug: targetSlug });
        console.log('\nSearch for target slug:', targetSlug);
        if (post) {
            console.log('✅ Found Post:', post.title);
        } else {
            console.log('❌ Post NOT FOUND by exact slug');
            
            // Try searching with regex or just title
            const closeMatch = await BlogPost.findOne({ title: new RegExp('چگونه دستگاه تصفیه هوا', 'i') });
            if (closeMatch) {
                console.log('💡 Found similar post by title:', closeMatch.title);
                console.log('   Actual Slug in DB:', closeMatch.slug);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkPost();
