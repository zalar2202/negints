"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package as PackageIcon, ArrowLeft, Flame, Clock, Eye } from "lucide-react";
import axios from "axios";

function formatCurrency(amount) {
    const formatted = new Intl.NumberFormat("fa-IR").format(amount || 0);
    return `${formatted} تومان`;
}

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("newest");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/packages?limit=8");
            setProducts(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const displayProducts = activeTab === "newest"
        ? [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)
        : [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);

    if (loading) {
        return (
            <section className="py-20 px-4" style={{ direction: "rtl" }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse rounded-2xl bg-[var(--color-background-elevated)] h-72" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-[var(--color-background-elevated)]/50 to-transparent" style={{ direction: "rtl" }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-black text-[var(--color-text-primary)]">
                            محصولات ویژه
                        </h2>
                        <p className="text-[var(--color-text-secondary)] mt-2">
                            جدیدترین و پرفروش‌ترین تجهیزات پزشکی
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tabs */}
                        <div className="flex bg-[var(--color-background-elevated)] rounded-xl p-1 border border-[var(--color-border)]">
                            <button
                                onClick={() => setActiveTab("newest")}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "newest"
                                        ? "bg-[var(--color-primary)] text-white shadow-md"
                                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                    }`}
                            >
                                <Clock size={14} />
                                جدیدترین
                            </button>
                            <button
                                onClick={() => setActiveTab("popular")}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "popular"
                                        ? "bg-[var(--color-primary)] text-white shadow-md"
                                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                    }`}
                            >
                                <Flame size={14} />
                                پرفروش‌ترین
                            </button>
                        </div>

                        <Link
                            href="/products"
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--color-primary)] border border-[var(--color-primary)]/30 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all"
                        >
                            مشاهده همه
                            <ArrowLeft size={16} />
                        </Link>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    {displayProducts.map((product, idx) => (
                        <Link
                            key={product._id}
                            href={`/products/${product.slug || product._id}`}
                            className="group rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all hover:shadow-xl bg-[var(--color-background)] relative"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Image */}
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                                {product.images?.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <PackageIcon size={36} className="text-gray-300" />
                                    </div>
                                )}

                                {/* Badge */}
                                {idx < 2 && activeTab === "popular" && (
                                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Flame size={10} /> پرفروش
                                    </div>
                                )}
                                {idx < 2 && activeTab === "newest" && (
                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        جدید
                                    </div>
                                )}

                                {product.stock <= 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-[10px] font-bold py-1.5 text-center">
                                        ناموجود
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-primary)] font-black text-sm">
                                        {product.price > 0 ? formatCurrency(product.price) : "تماس بگیرید"}
                                    </span>
                                    {product.views > 0 && (
                                        <span className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                                            <Eye size={10} /> {product.views}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 transition-all"
                    >
                        مشاهده همه محصولات
                        <ArrowLeft size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
