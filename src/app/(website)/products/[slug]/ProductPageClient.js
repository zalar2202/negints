"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import CommentSection from "@/components/website/CommentSection";
import {
    ChevronRight, ShoppingCart, Share2, Heart, Check, CheckCircle2,
    Package as PackageIcon, Eye, ArrowLeft, Star, Truck, Shield, Play, Info
} from "lucide-react";

function formatCurrency(amount) {
    const formatted = new Intl.NumberFormat("fa-IR").format(amount || 0);
    return `${formatted} تومان`;
}

function getEmbedUrl(url) {
    if (!url || typeof url !== 'string') return url;
    try {
        // Handle Aparat watch URLs (e.g., https://www.aparat.com/v/12345)
        if (url.includes('aparat.com/v/')) {
            const match = url.match(/\/v\/([a-zA-Z0-9]+)/);
            if (match && match[1]) {
                return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
            }
        }
    } catch (e) {}
    return url;
}

export default function ProductPageClient({ product, category, relatedProducts }) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { refreshCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [copied, setCopied] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const initialImages = product.images?.length > 0 ? product.images.map(url => ({ type: 'image', url })) : [];
    if (product.videoUrl) {
        initialImages.push({ type: 'video', url: product.videoUrl });
    }
    const galleryItems = initialImages;
    const features = product.features || [];

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: product.name, url });
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error("برای خرید ابتدا باید وارد حساب کاربری خود شوید");
            router.push(`/login?redirect=/products/${product.slug || product._id}`);
            return;
        }

        if (product.sizes?.length > 0 && !selectedSize) {
            toast.error("لطفاً سایز مورد نظر خود را انتخاب کنید");
            return;
        }

        setIsAdding(true);
        try {
            const { data } = await axios.post('/api/cart', { 
                packageId: product._id,
                quantity: 1,
                size: selectedSize || undefined
            });

            if (data.success) {
                refreshCart();
                toast.success("به سبد خرید اضافه شد");
                router.push('/panel/cart');
            }
        } catch (error) {
            console.error("Cart error:", error);
            toast.error(error.response?.data?.error || "خطا در افزودن به سبد خرید");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]" style={{ direction: "rtl" }}>
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <nav className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">خانه</Link>
                    <ChevronRight size={14} className="rotate-180" />
                    <Link href="/products" className="hover:text-[var(--color-primary)] transition-colors">محصولات</Link>
                    {category && (
                        <>
                            <ChevronRight size={14} className="rotate-180" />
                            <Link href={`/products?category=${category.slug || category._id}`} className="hover:text-[var(--color-primary)] transition-colors">
                                {category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight size={14} className="rotate-180" />
                    <span className="text-[var(--color-text-primary)] font-medium">{product.name}</span>
                </nav>
            </div>

            {/* Main Product Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image/Video */}
                        <div className={`rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-[var(--color-border)] ${galleryItems.length > 0 && galleryItems[selectedImage].type === 'video' ? 'aspect-[4/3] sm:aspect-video' : 'aspect-square'}`}>
                            {galleryItems.length > 0 ? (
                                galleryItems[selectedImage].type === 'image' ? (
                                    <img
                                        src={galleryItems[selectedImage].url}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4 bg-white dark:bg-gray-800"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black">
                                        {galleryItems[selectedImage].url.trim().startsWith('<') ? (
                                            <div 
                                                dangerouslySetInnerHTML={{ __html: galleryItems[selectedImage].url }} 
                                                className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-none"
                                            />
                                        ) : galleryItems[selectedImage].url.match(/\.(mp4|webm|ogg)$/i) ? (
                                            <video src={galleryItems[selectedImage].url} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <iframe src={getEmbedUrl(galleryItems[selectedImage].url)} className="w-full h-full" allowFullScreen frameBorder="0" />
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <PackageIcon size={80} className="text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {galleryItems.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {galleryItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${selectedImage === idx
                                                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
                                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                            }`}
                                    >
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-black flex items-center justify-center text-white/50">
                                                <Play size={24} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Category Badge */}
                        {category && (
                            <Link
                                href={`/products?category=${category.slug || category._id}`}
                                className="inline-block text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                                {category.name}
                            </Link>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-black text-[var(--color-text-primary)] leading-tight">
                            {product.name}
                        </h1>

                        {/* SKU */}
                        {product.sku && (
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                                کد کالا: <span className="font-mono" dir="ltr">{product.sku}</span>
                            </p>
                        )}

                        {/* Price & Stock info */}
                        <div className="bg-[var(--color-primary)]/[0.03] rounded-3xl p-6 border border-[var(--color-primary)]/10 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                             
                             <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black text-[var(--color-primary)] tracking-tighter">
                                    {product.price > 0 ? formatCurrency(product.price) : "تماس بگیرید"}
                                </span>
                                {product.price > 0 && <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">تومان</span>}
                             </div>

                            <div className={`flex items-center gap-2 text-[11px] font-black ${product.stock > 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {product.stock > 0 ? (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        موجود در انبار ({product.stock} عدد)
                                    </>
                                ) : (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        ناموجود در انبار
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Size Picker */}
                        {product.sizes?.length > 0 && (
                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)]">
                                        انتخاب سایز
                                    </h3>
                                    {(category?.name === "جوراب واریس" || category?.slug === "جوراب-واریس" || (typeof category === 'string' && category.includes("واریس"))) && (
                                        <a href="/stockings-size.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1 transition-colors">
                                            <Info size={14} />
                                            راهنمای انتخاب سایز
                                        </a>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {product.sizes.map((sizeObj, idx) => {
                                        const sName = typeof sizeObj === 'string' ? sizeObj : sizeObj.size;
                                        const sStock = typeof sizeObj === 'string' ? product.stock : sizeObj.stock;
                                        const isOutOfStock = sStock <= 0;
                                        return (
                                        <button
                                            key={idx}
                                            disabled={isOutOfStock}
                                            onClick={() => setSelectedSize(sName)}
                                            className={`min-w-[48px] px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all relative ${
                                                selectedSize === sName 
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                                    : isOutOfStock
                                                        ? "border-[var(--color-border)] text-[var(--color-text-tertiary)] bg-gray-100 dark:bg-gray-800/40 opacity-50 cursor-not-allowed"
                                                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50 bg-[var(--color-background-elevated)]"
                                            }`}
                                        >
                                            {sName}
                                            {selectedSize === sName && sStock < 5 && sStock > 0 && (
                                                <span className="absolute -top-2.5 -right-2 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 font-bold rounded-lg shadow-sm border border-white dark:border-gray-900 z-10">
                                                    تنها {sStock} عدد
                                                </span>
                                            )}
                                        </button>
                                    )})}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding || (product.sizes?.length > 0 && selectedSize ? (() => {
                                    const sObj = product.sizes.find(s => (typeof s === 'string' ? s : s.size) === selectedSize);
                                    return (sObj && typeof sObj !== 'string' ? sObj.stock : product.stock) <= 0;
                                })() : product.stock <= 0)}
                                className="flex-[2] inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-primary)]/20"
                            >
                                {isAdding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShoppingCart size={20} />}
                                {(product.sizes?.length > 0 && selectedSize ? (() => {
                                    const sObj = product.sizes.find(s => (typeof s === 'string' ? s : s.size) === selectedSize);
                                    return (sObj && typeof sObj !== 'string' ? sObj.stock : product.stock) > 0;
                                })() : product.stock > 0) ? "افزودن به سبد و خرید آنلاین" : "ناموجود"}
                            </button>
                            

                            <button
                                onClick={handleShare}
                                className="p-3.5 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-background-elevated)] transition-colors"
                            >
                                {copied ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 pt-4">
                            <div className="text-center p-3 rounded-xl bg-[var(--color-background-elevated)] border border-[var(--color-border)]">
                                <Truck size={20} className="mx-auto mb-1 text-[var(--color-primary)]" />
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">ارسال سریع</span>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-[var(--color-background-elevated)] border border-[var(--color-border)]">
                                <Shield size={20} className="mx-auto mb-1 text-[var(--color-primary)]" />
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">گارانتی اصالت</span>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-[var(--color-background-elevated)] border border-[var(--color-border)]">
                                <Star size={20} className="mx-auto mb-1 text-[var(--color-primary)]" />
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">خدمات پس از فروش</span>
                            </div>
                        </div>

                        {/* Physical Specifications */}
                        {(product.weight > 0 || product.material || (product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0))) && (
                            <div className="pt-8 border-t border-[var(--color-border)]">
                                <h2 className="text-sm font-black text-[var(--color-text-primary)] mb-5 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    مشخصات فیزیکی
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {product.weight > 0 && (
                                        <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-transparent">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">وزن</span>
                                            <span className="text-[12px] font-black text-[var(--color-text-primary)]">{product.weight} گرم</span>
                                        </div>
                                    )}
                                    {product.material && (
                                        <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-transparent">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">جنس / متریال</span>
                                            <span className="text-[12px] font-black text-[var(--color-text-primary)]">{product.material}</span>
                                        </div>
                                    )}
                                    {product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                                        <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-transparent">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">ابعاد (سانتی‌متر)</span>
                                            <span className="text-[12px] font-black text-[var(--color-text-primary)]" dir="ltr">
                                                {product.dimensions.length || 0} × {product.dimensions.width || 0} × {product.dimensions.height || 0}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Specifications - High Density Table */}
                        {product.specifications?.length > 0 && (
                            <div className="pt-8 border-t border-[var(--color-border)]">
                                <h2 className="text-sm font-black text-[var(--color-text-primary)] mb-5 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                    مشخصات فنی دستگاه
                                </h2>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {product.specifications.map((spec, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background-elevated)]/50 border border-transparent hover:border-[var(--color-border)] transition-all">
                                            <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">{spec.key}</span>
                                            <span className="text-[11px] font-black text-[var(--color-text-primary)]">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {product.description && (
                            <div className="pt-8 border-t border-[var(--color-border)]">
                                <h2 className="text-sm font-black text-[var(--color-text-primary)] mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                    توضیحات و کاربرد
                                </h2>
                                <p className="text-[12px] text-[var(--color-text-secondary)] leading-[1.8] whitespace-pre-line font-medium opacity-80">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Features */}
                        {features.length > 0 && (
                            <div className="pt-8 border-t border-[var(--color-border)]">
                                <h2 className="text-sm font-black text-[var(--color-text-primary)] mb-5 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                    امکانات و مزایا
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-[11px] text-[var(--color-text-secondary)] font-bold">
                                            <CheckCircle2 size={12} className="text-emerald-500 mt-1 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-8">محصولات مرتبط</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((rp) => (
                                <Link
                                    key={rp._id}
                                    href={`/products/${rp.slug || rp._id}`}
                                    className="group rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all hover:shadow-lg"
                                >
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        {rp.images?.length > 0 ? (
                                            <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <PackageIcon size={32} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1 line-clamp-2">{rp.name}</h3>
                                        <p className="text-[var(--color-primary)] font-black text-sm">
                                            {rp.price > 0 ? formatCurrency(rp.price) : "تماس بگیرید"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                {/* Comment Section */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <CommentSection 
                        entityId={product._id}
                        apiPath={`/api/packages/${product._id}/comments`}
                        allowComments={true} 
                    />
                </div>
            </div>
        </div>
    );
}
