import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";
import ProductCategory from "@/models/ProductCategory";
import ProductsListClient from "./ProductsListClient";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "محصولات و تجهیزات پزشکی | نگین تجهیز سپهر",
    description: "مشاهده و خرید انواع تجهیزات پزشکی، لوازم آزمایشگاهی و تجهیزات بیمارستانی از نگین تجهیز سپهر",
    openGraph: {
        title: "محصولات | نگین تجهیز سپهر",
        description: "مشاهده و خرید تجهیزات پزشکی از نگین تجهیز سپهر",
        type: "website",
    },
};

export default async function ProductsPage() {
    await connectDB();

    const products = await Package.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();

    const categories = await ProductCategory.find({ isActive: true })
        .sort({ order: 1 })
        .lean();

    const serialized = JSON.parse(JSON.stringify({
        products: products.map(p => ({ ...p, _id: p._id.toString() })),
        categories: categories.map(c => ({ ...c, _id: c._id.toString() })),
    }));

    return (
        <ProductsListClient
            products={serialized.products}
            categories={serialized.categories}
        />
    );
}
