import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";
import ProductCategory from "@/models/ProductCategory";
import ProductPageClient from "./ProductPageClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    await connectDB();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).trim();
    
    // Search by slug OR _id
    let query = { 
        $or: [
            { slug: decodedSlug },
            { slug: decodedSlug.toLowerCase() },
            { _id: /^[0-9a-fA-F]{24}$/.test(decodedSlug) ? decodedSlug : undefined }
        ].filter(q => Object.values(q)[0] !== undefined)
    };

    const product = await Package.findOne(query).lean();

    if (!product) {
        return { title: "محصول یافت نشد" };
    }

    return {
        title: `${product.name} | نگین تجهیز سپهر`,
        description: product.description || `خرید ${product.name} از نگین تجهیز سپهر - ارائه‌دهنده تجهیزات پزشکی`,
        openGraph: {
            title: product.name,
            description: product.description || `خرید ${product.name}`,
            type: "website",
            images: product.images?.length > 0
                ? [{ url: product.images[0], width: 800, height: 600, alt: product.name }]
                : [{ url: "/assets/logo/negints-logo.png", width: 512, height: 512, alt: "NeginTS" }],
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description || `خرید ${product.name}`,
            images: product.images?.length > 0 ? [product.images[0]] : ["/assets/logo/negints-logo.png"],
        },
    };
}

export default async function ProductPage({ params }) {
    await connectDB();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).trim();
    
    // Search by slug OR _id
    let query = { 
        $or: [
            { slug: decodedSlug },
            { slug: decodedSlug.toLowerCase() },
            { _id: /^[0-9a-fA-F]{24}$/.test(decodedSlug) ? decodedSlug : undefined }
        ].filter(q => Object.values(q)[0] !== undefined)
    };

    const product = await Package.findOne(query).lean();

    if (!product) {
        notFound();
    }

    // Increment views
    await Package.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

    // Get category
    let category = null;
    if (product.categoryId) {
        category = await ProductCategory.findById(product.categoryId).lean();
    }

    // Get related products (same category, exclude current)
    let relatedProducts = [];
    if (product.categoryId) {
        relatedProducts = await Package.find({
            categoryId: product.categoryId,
            _id: { $ne: product._id },
            isActive: true,
        })
            .limit(4)
            .lean();
    }

    // Serialize MongoDB objects
    const serialized = JSON.parse(JSON.stringify({
        product: { ...product, _id: product._id.toString() },
        category: category ? { ...category, _id: category._id.toString() } : null,
        relatedProducts: relatedProducts.map(p => ({ ...p, _id: p._id.toString() })),
    }));

    // Product structured data for Torob & Google
    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || "",
        "image": product.images || [],
        "sku": product.sku || "",
        "brand": {
            "@type": "Brand",
            "name": "نگین تجهیز سپهر"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://negints.com/products/${product.slug}`,
            "priceCurrency": "IRR",
            "price": (product.price || 0) * 10, // Toman to Rial
            "availability": product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "نگین تجهیز سپهر"
            }
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "خانه", "item": "https://negints.com" },
            { "@type": "ListItem", "position": 2, "name": "محصولات", "item": "https://negints.com/products" },
            ...(category ? [{ "@type": "ListItem", "position": 3, "name": category.name, "item": `https://negints.com/products?category=${category.slug}` }] : []),
            { "@type": "ListItem", "position": category ? 4 : 3, "name": product.name },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ProductPageClient
                product={serialized.product}
                category={serialized.category}
                relatedProducts={serialized.relatedProducts}
            />
        </>
    );
}
