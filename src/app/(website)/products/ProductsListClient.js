"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search, Package as PackageIcon, Filter, 
    ChevronRight, SlidersHorizontal, CheckCircle2, Info
} from "lucide-react";

function formatCurrency(amount) {
    const formatted = new Intl.NumberFormat("fa-IR").format(amount || 0);
    return `${formatted} تومان`;
}

export default function ProductsListClient({ products, categories }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get("category") || "";
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const handleCategoryChange = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug) {
            params.set("category", slug);
        } else {
            params.delete("category");
        }
        router.push(`/products?${params.toString()}`, { scroll: false });
    };

    const filtered = useMemo(() => {
        let result = [...products];

        // Filter by category
        if (selectedCategory) {
            const cat = categories.find(c => c.slug === selectedCategory || c._id === selectedCategory);
            if (cat) {
                result = result.filter(p => {
                    const pid = p.categoryId?._id || p.categoryId;
                    return (
                        pid?.toString() === cat._id?.toString() ||
                        p.displayCategory === cat.slug ||
                        p.category === cat.slug ||
                        p.displayCategory === cat.name
                    );
                });
            } else {
                result = result.filter(p => 
                    p.displayCategory === selectedCategory || 
                    p.category === selectedCategory ||
                    p.categoryId === selectedCategory
                );
            }
        }

        // Filter by search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sortBy) {
            case "price-asc":
                result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
                break;
            case "price-desc":
                result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
                break;
            case "popular":
                result.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        return result;
    }, [products, categories, selectedCategory, search, sortBy]);

    return (
        <div className="min-h-screen bg-[var(--color-background)]" style={{ direction: "rtl" }}>
            {/* Ultra-Compact Sticky Header */}
            <div className="sticky top-0 z-30 bg-[var(--color-background-elevated)]/80 backdrop-blur-md border-b border-[var(--color-border)] py-3 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[var(--color-primary)] text-white rounded-lg">
                            <PackageIcon size={18} />
                        </div>
                        <div>
                            <h1 className="text-sm lg:text-base font-black text-[var(--color-text-primary)] leading-none">
                                محصولات <span className="text-[var(--color-primary)]">نگین تجهیز</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">{filtered.length} مورد یافت شد</span>
                            </div>
                        </div>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest text-[var(--color-text-tertiary)] bg-[var(--color-background)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">خانه</Link>
                        <ChevronRight size={8} className="rotate-180 opacity-50" />
                        <span className="text-[var(--color-primary)]">تجهیزات</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Professional High-Density Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="lg:sticky lg:top-20 space-y-6">
                            {/* Search */}
                            <div className="relative group">
                                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                                <input
                                    type="text"
                                    placeholder="جستجو در محصولات..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-10 pr-10 pl-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] text-[11px] font-bold focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all"
                                />
                            </div>

                            {/* Categories */}
                            <div>
                                <h3 className="text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest px-2 mb-3 flex items-center gap-2">
                                    <Filter size={12} />
                                    دسته‌بندی‌ها
                                </h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleCategoryChange("")}
                                        className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${!selectedCategory
                                                ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                                                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-elevated)]"
                                            }`}
                                    >
                                        همه محصولات
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat._id}
                                            onClick={() => handleCategoryChange(cat.slug || cat._id)}
                                            className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                (selectedCategory === cat._id || selectedCategory === cat.slug)
                                                    ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-elevated)]"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h3 className="text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest px-2 mb-3 flex items-center gap-2">
                                    <SlidersHorizontal size={12} />
                                    مرتب‌سازی
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {["newest", "popular", "price-asc", "price-desc"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSortBy(s)}
                                            className={`text-right px-4 py-2 rounded-lg text-[10px] font-black tracking-tight transition-all border ${
                                                sortBy === s
                                                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30"
                                                    : "text-[var(--color-text-tertiary)] border-transparent hover:border-[var(--color-border)]"
                                            }`}
                                        >
                                            {s === "newest" ? "جدیدترین‌ها" : s === "popular" ? "پربازدیدترین" : s === "price-asc" ? "ارزان‌ترین" : "گران‌ترین"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Badge */}
                             <div className="p-4 bg-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/10">
                                <div className="flex items-center gap-2 text-[var(--color-primary)] mb-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">تضمین کیفیت و اصالت</span>
                                </div>
                                <p className="text-[9px] text-[var(--color-text-secondary)] font-medium leading-relaxed opacity-70">
                                    تمامی تجهیزات ارائه شده دارای استاندارد تولید و تاییدیه کیفی نگین تجهیز سپهر می‌باشند.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Ultra-Dense Products Grid */}
                    <div className="flex-1">
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filtered.map(product => (
                                    <Link
                                        key={product._id}
                                        href={`/products/${product.slug || product._id}`}
                                        className="group flex flex-col h-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-primary)] hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300"
                                    >
                                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                                            {product.images?.length > 0 ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <PackageIcon size={32} className="text-gray-300 opacity-50" />
                                                </div>
                                            )}
                                            
                                            {/* Labels on Image */}
                                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                                {product.badge && (
                                                    <span className="bg-[var(--color-primary)] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                                        {product.badge}
                                                    </span>
                                                )}
                                                {product.stock <= 0 && (
                                                    <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                                        ناموجود
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="absolute bottom-2 right-2">
                                                <span className="bg-[var(--color-background-elevated)]/90 backdrop-blur-sm text-[8px] font-bold px-2 py-0.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                                    {product.categoryId?.name || product.displayCategory || "تجهیزات"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <h3 className="font-black text-[var(--color-text-primary)] text-sm line-clamp-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono opacity-50 mb-3">{product.sku || "NTS-MOD"}</span>

                                            {/* Description - Fixed Height for Alignment */}
                                            <div className="min-h-[32px] mb-4">
                                                {product.description ? (
                                                    <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-2 font-medium leading-relaxed opacity-70">
                                                        {product.description}
                                                    </p>
                                                ) : (
                                                    <div className="h-full border-r-2 border-gray-100 dark:border-gray-800 ml-2" /> // Minimal placeholder
                                                )}
                                            </div>

                                            {/* Specifications - Grid Aligned */}
                                            <div className="space-y-1 min-h-[60px] flex-grow">
                                                {(product.specifications || []).slice(0, 3).length > 0 ? (
                                                    (product.specifications || []).slice(0, 3).map((spec, i) => (
                                                        <div key={i} className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800/20 pb-1 last:border-0">
                                                            <span className="text-[9px] text-[var(--color-text-tertiary)] font-bold">{spec.key}</span>
                                                            <span className="text-[9px] text-[var(--color-text-primary)] font-black line-clamp-1">{spec.value}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="mt-2 space-y-2 opacity-10">
                                                        <div className="h-1 w-full bg-gray-400 rounded-full" />
                                                        <div className="h-1 w-2/3 bg-gray-400 rounded-full" />
                                                        <div className="h-1 w-1/2 bg-gray-400 rounded-full" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-tighter mb-0.5">قیمت واحد</span>
                                                    <div className="text-[var(--color-primary)] font-black text-sm">
                                                        {product.price > 0 ? formatCurrency(product.price) : "تماس بگیرید"}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-[var(--color-primary)]/5 text-[var(--color-primary)] px-2 py-1.5 rounded-xl text-[10px] font-black group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
                                                    <span>جزئیات</span>
                                                    <Info size={12} strokeWidth={2.5} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[var(--color-background-elevated)] rounded-3xl border border-dashed border-[var(--color-border)]">
                                <PackageIcon size={40} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-30" />
                                <h3 className="text-lg font-black text-[var(--color-text-primary)]">محصولی در این بخش طراحی نشده است</h3>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-bold opacity-60">فیلترها را برای مشاهده محصولات دیگر تغییر دهید.</p>
                                <button 
                                    onClick={() => handleCategoryChange("")}
                                    className="mt-6 text-[var(--color-primary)] text-xs font-black underline"
                                >
                                    بازگشت به همه محصولات ←
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
