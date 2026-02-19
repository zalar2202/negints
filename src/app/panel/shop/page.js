"use client";

import { useEffect, useState, useMemo } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Package as PackageIcon, ShoppingCart, Info, CheckCircle2, Store } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";

const FALLBACK_CATEGORIES = [
    { id: 'medical', label: 'پزشکی' },
    { id: 'health', label: 'سلامت' },
];

export default function ShopPage() {
    const router = useRouter();
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const { refreshCart } = useCart();

    const fetchPackages = async () => {
        try {
            const res = await axios.get("/api/packages?all=true");
            setPackages(res.data.data.filter(p => p.isActive));
        } catch (error) {
            toast.error("خطا در دریافت لیست محصولات");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("/api/categories");
            setCategories(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchPackages(), fetchCategories()]);
            setLoading(false);
        };
        load();
    }, []);

    const addToCart = async (pkg) => {
        setAddingToCart(pkg._id);
        try {
            // Updated add to cart to handle simplified billing
            await axios.post("/api/cart", {
                packageId: pkg._id,
                quantity: 1,
                billingCycle: "one-time"
            });
            toast.success(`${pkg.name} به سبد خرید اضافه شد!`, {
                action: {
                    label: "مشاهده سبد خرید",
                    onClick: () => router.push("/panel/cart")
                }
            });
            refreshCart();
        } catch (error) {
            toast.error("خطا در افزودن به سبد خرید");
        } finally {
            setAddingToCart(null);
        }
    };

    const filteredPackages = useMemo(() => {
        if (activeCategory === 'all') return packages;
        
        return packages.filter(p => 
            p.categoryId === activeCategory || 
            p.categoryId?._id === activeCategory ||
            p.displayCategory === activeCategory ||
            p.category === activeCategory
        );
    }, [packages, activeCategory]);

    return (
        <ContentWrapper>
            <div className="mb-10 text-right" style={{ direction: 'rtl' }}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm">
                                <Store className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black text-[var(--color-text-primary)]">کاتالوگ محصولات و تجهیزات</h1>
                        </div>
                        <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg font-medium">
                            تجهیزات پزشکی تخصصی و محصولات با کیفیت نسا لایه را در این بخش مشاهده کنید.
                        </p>
                    </div>
                </div>

                {/* Simplified "Mix it up" Category Filter */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-[var(--color-background-elevated)] border border-[var(--color-border)] rounded-2xl w-fit mb-8 shadow-sm">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeCategory === 'all'
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-indigo-600"
                        }`}
                    >
                        همه محصولات
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                                activeCategory === cat._id
                                    ? "bg-indigo-600 text-white shadow-md active:scale-95 translate-y-[-1px]"
                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-indigo-600"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                    {/* Only show legacy categories if we have products matching them and not matching current categories */}
                    {packages.some(p => p.displayCategory && !p.categoryId && !categories.some(c => c._id === p.categoryId)) && (
                         FALLBACK_CATEGORIES.filter(fc => packages.some(p => p.displayCategory === fc.id)).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                                    activeCategory === cat.id
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-indigo-600 font-normal italic"
                                }`}
                            >
                                {cat.label} (قدیمی)
                            </button>
                         ))
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                    {filteredPackages.map((pkg) => (
                        <Card key={pkg._id} className="relative flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-[var(--color-border)] group hover:border-indigo-500/50 hover:translate-y-[-4px]">
                            {/* Product Image area */}
                            <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
                                {pkg.images?.length > 0 ? (
                                    <img 
                                        src={pkg.images[0]} 
                                        alt={pkg.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                ) : (
                                    <PackageIcon size={48} className="text-gray-300 opacity-50" />
                                )}
                                
                                {pkg.badge && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <div className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                            {pkg.badge}
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-3 right-3">
                                    <Badge size="sm" className="font-bold px-2 py-0.5" variant="primary">
                                        {pkg.categoryId?.name || pkg.displayCategory || "سرویس"}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)] leading-tight group-hover:text-indigo-600 transition-colors">
                                        {pkg.name}
                                    </h3>
                                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono opacity-50">{pkg.sku || ""}</span>
                                </div>

                                <div className="mb-4">
                                     <span className="text-xl font-black text-indigo-600 tracking-tight">
                                        {formatCurrency(pkg.price || pkg.startingPrice || 0, 'IRT')}
                                    </span>
                                    <div className={`text-[10px] mt-1 font-bold ${pkg.stock > 0 ? "text-emerald-500" : "text-red-500"}`}>
                                        {pkg.stock > 0 ? `موجودی: ${pkg.stock} عدد` : "ناموجود"}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 flex-grow">
                                    {(pkg.features || []).slice(0, 3).map((feature, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs text-[var(--color-text-secondary)] line-clamp-1 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
                                    <Button 
                                        fullWidth 
                                        onClick={() => addToCart(pkg)}
                                        loading={addingToCart === pkg._id}
                                        disabled={pkg.stock <= 0}
                                        icon={<ShoppingCart className="ml-2 w-4 h-4" />}
                                        className="h-10 text-xs font-black shadow-lg shadow-indigo-500/10"
                                    >
                                        {pkg.stock > 0 ? "افزودن به سبد خرید" : "ناموجود"}
                                    </Button>
                                    <button className="w-full mt-2 py-2 text-[10px] font-black text-[var(--color-text-tertiary)] hover:text-indigo-600 transition-all flex items-center justify-center gap-1 opacity-70 hover:opacity-100">
                                        <Info className="w-3 h-3 ml-1" />
                                        درخواست شخصی‌سازی
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </ContentWrapper>
    );
}
