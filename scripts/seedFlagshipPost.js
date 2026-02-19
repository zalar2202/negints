import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define Blog Post, Category, and User Schemas for seeding
const CategorySchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    description: String,
    color: String
});

const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
    name: String
});

const BlogPostSchema = new mongoose.Schema({
    title: String,
    slug: { type: String, unique: true },
    content: String,
    excerpt: String,
    featuredImage: {
        url: String,
        alt: String
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    tags: [String],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readingTime: Number,
    publishedAt: Date,
    seo: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String]
    }
});

const BlogCategory = mongoose.models.BlogCategory || mongoose.model('BlogCategory', CategorySchema);
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedFlagshipPost() {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env.local');
        process.exit(1);
    }

    try {
        console.log(`🔄 Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find Admin User
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('❌ No admin user found. Please create an admin user first.');
            process.exit(1);
        }
        console.log(`👤 Found Admin User: ${adminUser.name} (${adminUser._id})`);

        // 2. Ensure "Insights" category exists
        let category = await BlogCategory.findOne({ slug: 'insights' });
        if (!category) {
            category = await BlogCategory.create({
                name: 'Business Insights',
                slug: 'insights',
                description: 'Digital transformation strategies and technology trends for modern businesses.',
                color: '#7c3aed'
            });
            console.log('✅ Created Business Insights category');
        }

        const title = "The 2026 Digital Transformation Roadmap: Building a Resilient Business with NeginTS";
        const slug = "2026-digital-transformation-roadmap";

        // 3. Delete existing post with the same slug to allow re-seeding
        await BlogPost.deleteOne({ slug });

        // 4. Content (Same as before, high quality)
        const content = `
<h2>The Shift in Digital Infrastructure: Navigating the 2026 Landscape</h2>
<p>As we navigate through 2026, the definition of "business as usual" has undergone a radical transformation. No longer is digital presence a secondary consideration; it is the very heart of how value is created, delivered, and sustained. At NeginTS, we have observed a critical shift—moving from isolated IT fixes to integrated digital ecosystems. In this comprehensive guide, we will explore the roadmap for businesses looking to thrive in this new era.</p>

<p>Digital transformation is not simply about adopting new technologies; it is about a fundamental change in how a business operates and delivers value to its customers. It is a cultural, organizational, and operational shift that requires a clear vision and a robust strategy. In 2026, this means leveraging the latest advancements in AI, cloud computing, and high-speed networking to create a seamless and efficient business environment.</p>

<h3>The Pillars of Modern Business Success</h3>
<p>Success in today's market rests on three critical pillars: robust infrastructure, custom-built software, and a compelling visual identity. Each of these components must work in harmony to drive growth and efficiency.</p>

<h4>1. Custom Software Development: Beyond the Off-the-Shelf Limit</h4>
<p>Many businesses start with generic software solutions. However, as an organization scales, these "out-of-the-box" tools often become bottlenecks. Custom software development allows businesses to build tools precisely around their unique workflows. Whether it's a sophisticated ERP system or a customer-facing mobile app, custom solutions provide a competitive edge that generic products cannot match.</p>

<p>At NeginTS, our approach to software development is deeply collaborative. We don't just write code; we solve business problems. By understanding your specific challenges, we can create software that automates repetitive tasks, provides real-time insights, and enhances the overall user experience for both your employees and your customers.</p>

<h4>2. Advanced Networking: The Invisible Engine</h4>
<p>Your software is only as good as the network it runs on. With the rise of hybrid work and real-time data processing, networking has become more complex and more vital than ever. A resilient network must be secure, high-speed, and scalable. Investing in modern networking solutions—such as software-defined networking (SDN) and robust cybersecurity protocols—is essential for protecting your data and ensuring continuous uptime.</p>

<p>A well-designed network is the backbone of your digital infrastructure. It ensures that your data flows smoothly between your various systems and that your employees can access the resources they need, when they need them. Without a reliable network, even the most advanced software will fail to deliver its full potential.</p>

<h4>3. Design and Brand Identity: Speaking Without Words</h4>
<p>In a world of infinite choices, your brand's visual identity is often the first and most lasting impression you make. Modern design is not just about looking good; it's about communicating your values and building trust. From your logo to the user interface of your platform, every design choice should be intentional and consistent.</p>

<p>Good design is intuitive and functional. It guides the user through your digital space and makes it easy for them to engage with your products or services. By investing in professional graphic design and user experience (UX) design, you can create a brand that resonates with your target audience and sets you apart from the competition.</p>

<h3>The Trap of Fragmentation: Why Unified IT Matters</h3>
<p>One of the biggest mistakes businesses make is "fragmented IT"—hiring one company for their website, another for their network, and a third for their software maintenance. This leads to communication gaps, integration nightmares, and higher costs. A unified approach, like the one offered by NeginTS, ensures that every piece of your digital puzzle fits perfectly together.</p>

<p>When your IT systems are fragmented, it's difficult to get a clear picture of your overall business performance. Data is siloed in different platforms, and it can be challenging to share information between different departments. By consolidating your IT services with a single provider, you can create a more cohesive and efficient business environment.</p>

<h3>Scaling with Confidence: The NeginTS Methodology</h3>
<p>NeginTS was founded on the principle that technology should empower, not hinder. Our methodology is designed to help businesses scale with confidence, regardless of their size or industry.</p>

<p>We begin by conducting a thorough assessment of your existing digital infrastructure. We identify your strengths, weaknesses, and opportunities for improvement. Based on this assessment, we develop a customized digital transformation roadmap that outlines the steps you need to take to achieve your business goals.</p>

<p>Our team of experts then works closely with you to implement the recommended solutions. We provide ongoing support and maintenance to ensure that your systems are always running at peak performance. By partnering with NeginTS, you can focus on growing your business while we take care of the technology.</p>

<h3>Looking Ahead: IT in 2027 and Beyond</h3>
<p>The pace of technological change is only accelerating. To remain competitive, businesses must stay ahead of the curve and embrace new trends as they emerge. This includes everything from the continued growth of AI and machine learning to the increasing importance of edge computing and the Internet of Things (IoT).</p>

<p>At NeginTS, we are committed to staying at the forefront of these developments. We continuously invest in research and development to ensure that we are providing our clients with the most advanced and effective solutions. By working with us, you can be sure that your business is always prepared for the future.</p>

<h3>Deep Dive: The Hardware-Software Symbiosis</h3>
<p>In the realm of high-performance business operations, the relationship between hardware and software is much like that of a car's engine and its fuel. You can have the best engine in the world, but if the fuel is poor, you won't get far. Conversely, high-octane fuel in a broken engine is a waste. This is why NeginTS emphasizes a holistic view of IT maintenance.</p>
<p>Many firms neglect the physical layer of their infrastructure. Dust-filled server rooms, outdated cabling, and failing cooling systems are often the silent killers of digital productivity. Our maintenance protocols go beyond software updates; we ensure the physical environment hosting your data is optimized for longevity and performance. This integrated care reduces the "unpredictable downtime" that plagues so many growing enterprises.</p>

<h3>The Role of AI in Your 2026 Strategy</h3>
<p>We cannot discuss the future without mentioning Artificial Intelligence. By 2026, AI is no longer a luxury; it's a utility. However, the real value of AI isn't in generic chatbots. It's in the data. NeginTS helps businesses harness their own proprietary data using specialized machine learning models to predict market trends, optimize supply chains, and personalize marketing at scale.</p>

<p>Conclusion: Your journey starts here. Digital transformation is a journey, not a destination. It requires ongoing commitment and a willingness to adapt to changing market conditions. If you're ready to take the next step, contact NeginTS today. Together, we can build a brighter future for your business.</p>
        `;

        // 5. Create the post
        const post = await BlogPost.create({
            title,
            slug,
            content,
            excerpt: "Discover the essential pillars of digital transformation in 2026 and how a unified IT strategy can propel your business to new heights of efficiency and growth.",
            featuredImage: {
                url: "/assets/storage/blog/flagship-hero.webp", 
                alt: "NeginTS Digital Transformation 2026"
            },
            category: category._id,
            status: 'published',
            tags: ['digital transformation', 'business growth', 'IT strategy', 'NeginTS', 'future of tech'],
            author: adminUser._id,
            readingTime: 12,
            publishedAt: new Date(),
            seo: {
                metaTitle: "Digital Transformation Guide 2026 | NeginTS",
                metaDescription: "Learn how to scale your business in 2026 with NeginTS's comprehensive roadmap for digital transformation, including software, networking, and design.",
                metaKeywords: ['digital transformation', 'business scaling', 'unified IT', 'NeginTS services']
            }
        });

        console.log(`🚀 Flagship post created successfully: ${post.title}`);
    } catch (error) {
        console.error('❌ Error seeding flagship post:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

seedFlagshipPost();
