"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import {
    ShoppingCart,
    Trash2,
    CreditCard,
    ArrowRight,
    Package as PackageIcon,
    ShieldCheck,
    Tag,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser && ['admin', 'manager'].includes(currentUser.role);
    
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState('IRT');
    const [exchangeRate, setExchangeRate] = useState(1);

    const [promoCode, setPromoCode] = useState("");
    const [applyingPromo, setApplyingPromo] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState(null);
    const searchParams = useSearchParams();
    const promoFromUrl = searchParams.get("promo");

    const fetchCart = async () => {
        try {
            const res = await axios.get("/api/cart");
            setCart(res.data.data);
            let currency = res.data.data?.currency || 'IRT';
            if (currency === 'USD') currency = 'IRT'; // Force migrate from old default
            setSelectedCurrency(currency);
            
            // Get rate for saved currency
            if (currency !== 'IRT') {
                updateExchangeRate(currency);
            } else {
                setExchangeRate(1);
            }

            if (res.data.data?.appliedPromotion) {
                handleApplyPromoOnMount(res.data.data);
            }
        } catch (error) {
            toast.error("خطا در دریافت سبد خرید");
        } finally {
            setLoading(false);
        }
    };

    const updateExchangeRate = async (currency) => {
        if (currency === 'IRT') {
            setExchangeRate(1);
            return;
        }
        
        // Base rate for 1 USD in Tomans (IRT)
        const USD_TO_IRT = 60000; 

        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
            const data = await response.json();
            const rateToUSD = data.rates[currency]; // 1 USD = X Currency
            
            if (rateToUSD) {
                // 1 Toman = (1 / 60000) USD = (rateToUSD / 60000) Currency
                setExchangeRate(rateToUSD / USD_TO_IRT);
            } else {
                setExchangeRate(1 / USD_TO_IRT);
            }
        } catch (error) {
            console.error("Failed to fetch rate", error);
            const fallbacks = { 
                'USD': 1 / 60000, 
                'EUR': 0.92 / 60000, 
                'CAD': 1.39 / 60000, 
                'TRY': 33.5 / 60000, 
                'AED': 3.67 / 60000, 
                'IRT': 1.0 
            };
            setExchangeRate(fallbacks[currency] || (1 / 60000));
        }
    };

    const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        setSelectedCurrency(newCurrency);
        updateExchangeRate(newCurrency);
        
        try {
            await axios.put('/api/cart', { currency: newCurrency });
            toast.success(`واحد پولی به ${newCurrency} تغییر یافت`);
        } catch (error) {
            toast.error('خطا در به‌روزرسانی واحد پولی');
        }
    };

    const calculateSubtotal = () => {
        if (!cart || !cart.items) return 0;
        const subtotalUSD = cart.items.reduce((acc, item) => {
            const price = Number(item.package?.price) || 0;
            const quantity = Number(item.quantity) || 1;
            return acc + (price * quantity);
        }, 0);
        
        return subtotalUSD * exchangeRate;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        let discount = 0;
        if (appliedPromo) {
             discount = appliedPromo.discountAmount * exchangeRate;
        }
        return Math.max(0, subtotal - discount);
    };

    const fetchClientsList = async () => {
        if (!isAdmin) return;
        try {
            const { data } = await axios.get("/api/clients");
            if (data.success) setClients(data.data || []);
        } catch (err) {
            console.error("Failed to fetch clients");
        }
    };

    useEffect(() => {
        fetchCart();
        fetchClientsList();
    }, [isAdmin]);

    // Handle initial promo from URL
    useEffect(() => {
        const applyPromoFromUrl = async () => {
             if (promoFromUrl && cart && cart.items.length > 0 && !appliedPromo && !applyingPromo) {
                const code = promoFromUrl.toUpperCase();
                setPromoCode(code);
                
                setApplyingPromo(true);
                try {
                    const subtotal = calculateSubtotal();
                    const res = await axios.post("/api/promotions/validate", {
                        code: code,
                        subtotal: subtotal,
                        items: cart.items
                    });

                    if (res.data.success) {
                        setAppliedPromo(res.data.data);
                        await axios.put("/api/cart", { promotionId: res.data.data.id });
                        toast.success("تخفیف لینک اعمال شد!");
                    }
                } catch (error) {
                    // Fail silently for auto-applied link promos to not annoy user
                    console.error("Link promo failed:", error.response?.data?.message);
                } finally {
                    setApplyingPromo(false);
                }
            }
        };

        applyPromoFromUrl();
    }, [promoFromUrl, cart, appliedPromo]);

    const handleApplyPromoOnMount = async (cartData) => {
        try {
            const itemsToSubtotal = cartData.items || [];
            const subtotal = itemsToSubtotal.reduce((acc, item) => {
                const price = Number(item.package?.price) || 0;
                const quantity = Number(item.quantity) || 1;
                return acc + (price * quantity);
            }, 0);

            const res = await axios.post("/api/promotions/validate", {
                code: cartData.appliedPromotion.discountCode,
                subtotal: subtotal,
                items: cartData.items
            });

            if (res.data.success) {
                setAppliedPromo(res.data.data);
                setPromoCode(cartData.appliedPromotion.discountCode);
            }
        } catch (error) {
            console.error("Failed to auto-apply promotion", error);
        }
    };

    const removeLineItem = async (itemId) => {
        try {
            await axios.delete("/api/cart", { data: { itemId } });
            toast.success("آیتم حذف شد");
            fetchCart();
        } catch (error) {
            toast.error("خطا در حذف آیتم");
        }
    };

    const handleCheckout = async () => {
        if (isAdmin && !selectedClientId) {
            toast.error("لطفاً یک مشتری را برای این سبد خرید انتخاب کنید");
            return;
        }
        setCheckoutLoading(true);
        try {
            const res = await axios.post("/api/cart/checkout", {
                clientId: isAdmin ? selectedClientId : undefined
            });
            if (res.data.success) {
                toast.success("فاکتور با موفقیت صادر شد!");
                router.push(`/panel/invoices?id=${res.data.invoiceId}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "خطا در فرآیند نهایی‌سازی");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleApplyPromotion = async (e) => {
        if (e) e.preventDefault();
        if (!promoCode) return;

        setApplyingPromo(true);
        try {
            const subtotal = calculateSubtotal();
            const res = await axios.post("/api/promotions/validate", {
                code: promoCode,
                subtotal: subtotal,
                items: cart.items
            });

            if (res.data.success) {
                setAppliedPromo(res.data.data);
                // Update cart in DB
                await axios.put("/api/cart", { promotionId: res.data.data.id });
                toast.success("تخفیف اعمال شد!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "کد تخفیف نامعتبر است");
            setAppliedPromo(null);
        } finally {
            setApplyingPromo(false);
        }
    };

    const removePromotion = async () => {
        try {
            await axios.put("/api/cart", { promotionId: null });
            setAppliedPromo(null);
            setPromoCode("");
            toast.success("تخفیف حذف شد");
        } catch (error) {
            toast.error("خطا در حذف تخفیف");
        }
    };



    if (loading) {
        return (
            <ContentWrapper>
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </ContentWrapper>
        );
    }

    const items = cart?.items || [];

    return (
        <ContentWrapper>
            <div className="flex items-center justify-end gap-3 mb-8" style={{ direction: 'rtl' }}>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                    سبد خرید من
                </h1>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <ShoppingCart className="w-6 h-6" />
                </div>
            </div>

            {items.length === 0 ? (
                <Card className="p-12 text-center" style={{ direction: 'rtl' }}>
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 text-[var(--color-text-primary)]">سبد خرید شما خالی است</h2>
                    <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto font-medium">
                        به نظر می‌رسد هنوز خدماتی را به سبد خرید خود اضافه نکرده‌اید. برای پیدا کردن پکیج مناسب کسب‌وکار خود، لیست پکیج‌های ما را بررسی کنید.
                    </p>
                    <Link href="/panel/shop">
                        <Button className="font-black px-8 py-3" icon={<ArrowRight className="w-4 h-4 ml-2 rotate-180" />}>مشاهده فروشگاه خدمات</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right" style={{ direction: 'rtl' }}>
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item._id} className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 border-[var(--color-border)] group">
                                <div className="p-6 flex flex-col sm:flex-row-reverse items-center gap-6">
                                    <div className="w-20 h-20 bg-indigo-600/10 dark:bg-indigo-600/5 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                                        <PackageIcon size={32} />
                                    </div>
                                    <div className="flex-1 text-center sm:text-right w-full">
                                        <div className="flex flex-col sm:flex-row-reverse sm:items-center justify-between gap-2 mb-2">
                                            <h3 className="text-xl font-black text-[var(--color-text-primary)] leading-tight">
                                                 {item.package?.name || "پکیج خدمات"}
                                             </h3>
                                         </div>
                                         <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1 mb-4 font-bold opacity-80">
                                             دسته‌بندی: {item.package?.categoryId?.name || item.package?.displayCategory || item.package?.category || "سرویس‌های دیجیتال"}
                                         </p>
                                         <div className="flex items-center justify-between flex-row-reverse mt-2">
                                             <div className="flex flex-col">
                                                 <span className="text-2xl font-black text-indigo-600 tracking-tight">
                                                     {item.package?.price 
                                                         ? formatCurrency(item.package.price * exchangeRate, selectedCurrency) 
                                                         : (item.package?.startingPrice 
                                                             ? formatCurrency(item.package.startingPrice * exchangeRate, selectedCurrency) 
                                                             : formatCurrency(0, selectedCurrency))}
                                                 </span>
                                             </div>
                                            <button
                                                onClick={() => removeLineItem(item._id)}
                                                className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all flex items-center gap-2 text-sm font-black active:scale-[0.95]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">حذف از سبد</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {/* Promotion Input */}
                        <Card className="p-6 border-dashed border-2 border-[var(--color-border)] bg-[var(--color-background-elevated)]/50">
                            <h4 className="text-sm font-black mb-4 flex items-center justify-end gap-2 text-[var(--color-text-primary)]">
                                کد تخفیف یا کارت هدیه دارید؟
                                <Tag className="w-4 h-4 text-indigo-600" />
                            </h4>
                            <form onSubmit={handleApplyPromotion} className="flex gap-2 flex-row-reverse">
                                <input
                                    type="text"
                                    placeholder="کد تخفیف را اینجا بنویسید..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border bg-[var(--color-background)] border-[var(--color-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none uppercase font-black text-center tracking-widest placeholder:text-[var(--color-text-tertiary)] placeholder:normal-case placeholder:font-medium text-sm transition-all"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedPromo}
                                />
                                {appliedPromo ? (
                                    <Button variant="danger" type="button" onClick={removePromotion} className="font-black px-6 rounded-xl shadow-lg shadow-red-500/10">
                                        حذف
                                    </Button>
                                ) : (
                                    <Button type="submit" loading={applyingPromo} className="font-black px-6 rounded-xl shadow-lg shadow-indigo-500/10">
                                        دریافت تخفیف
                                    </Button>
                                )}
                            </form>
                            {appliedPromo && (
                                <div className="mt-3 p-3 bg-emerald-500/10 rounded-lg flex items-center justify-between flex-row-reverse border border-emerald-500/20 animate-fade-in">
                                    <p className="text-[11px] text-emerald-600 font-black">
                                        کد تخفیف <span className="underline underline-offset-4 decoration-2">{appliedPromo.code}</span> با موفقیت فعال شد!
                                    </p>
                                    <div className="text-[11px] font-black text-emerald-700 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                                        {(appliedPromo.discountAmount * exchangeRate).toLocaleString('fa-IR')} {selectedCurrency} تخفیف
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8 border-[var(--color-border)] shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-600 to-indigo-400"></div>
                            <h3 className="text-xl font-black mb-6 text-[var(--color-text-primary)]">خلاصه صورت‌حساب</h3>
                            
                            {/* Currency Selector */}
                            <div className="mb-6 p-4 bg-indigo-50/80 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl">
                                <label className="text-[10px] font-black text-indigo-800/60 dark:text-indigo-400/60 mb-2 block uppercase tracking-widest">
                                    واحد پولی فاکتور نهایی
                                </label>
                                <select 
                                    className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-950 text-xs font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                    value={selectedCurrency}
                                    onChange={handleCurrencyChange}
                                    style={{ direction: 'rtl', textAlign: 'right' }}
                                >
                                    <option value="IRT">🇮🇷 IRT - تومان ایران</option>
                                    <option value="USD">🇺🇸 USD - دلار آمریکا ($)</option>
                                    <option value="AED">🇦🇪 AED - درهم امارات (د.إ)</option>
                                    <option value="EUR">🇪🇺 EUR - یورو (€)</option>
                                    <option value="CAD">🇨🇦 CAD - دلار کانادا (C$)</option>
                                    <option value="TRY">🇹🇷 TRY - لیر ترکیه (₺)</option>
                                </select>
                                <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 mt-2 font-bold leading-relaxed">
                                    فاکتور شما با واحد پولی انتخاب شده صادر خواهد شد.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between flex-row-reverse text-[var(--color-text-secondary)] text-sm">
                                    <span className="font-bold">مجموع پکیج‌ها</span>
                                    <span className="font-black text-[var(--color-text-primary)]">
                                        {formatCurrency(calculateSubtotal(), selectedCurrency)}
                                    </span>
                                </div>
                                {appliedPromo && (
                                    <div className="flex justify-between flex-row-reverse text-emerald-600 text-sm">
                                        <span className="font-bold">تخفیف ویژه ({appliedPromo.code})</span>
                                        <span className="font-black tracking-tight">
                                            -{formatCurrency(appliedPromo.discountAmount * exchangeRate, selectedCurrency)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between flex-row-reverse text-[var(--color-text-secondary)] text-sm">
                                    <span className="font-bold">مالیات بر ارزش افزوده</span>
                                    <span className="font-black text-[var(--color-text-primary)]">
                                        {formatCurrency(0, selectedCurrency)}
                                    </span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent my-4" />
                                <div className="flex justify-between flex-row-reverse text-2xl font-black">
                                    <span className="text-[var(--color-text-primary)]">مبلغ نهایی</span>
                                    <span className="text-indigo-600 tracking-tighter">
                                        {formatCurrency(calculateTotal(), selectedCurrency)}
                                    </span>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="mb-6 p-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-2xl shadow-inner-sm">
                                    <h4 className="text-[10px] font-black text-amber-800/70 dark:text-amber-400/70 mb-3 flex items-center justify-end gap-2 uppercase tracking-widest">
                                        تخصیص فاکتور به مشتری
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                                    </h4>
                                    <select 
                                        className="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-950 text-xs font-black focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        style={{ direction: 'rtl' }}
                                    >
                                        <option value="">-- انتخاب از لیست مشتریان --</option>
                                        {clients.map(c => (
                                            <option key={c._id} value={c._id}>{c.name} ({c.email || "بدون ایمیل"})</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-amber-700/60 dark:text-amber-500/60 mt-2 font-bold leading-relaxed">
                                        به عنوان مدیر، این فاکتور را برای مشتری انتخاب شده صادر خواهید کرد.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Button
                                    fullWidth
                                    className="py-4 font-black text-[1rem] shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all rounded-2xl"
                                    onClick={handleCheckout}
                                    loading={checkoutLoading}
                                    icon={<CreditCard className="w-5 h-5 ml-2" />}
                                >
                                    تایید و صدور نهایی فاکتور
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--color-text-tertiary)] py-2 font-black opacity-60">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>تراکنش امن / دارای ضمانت کیفیت نسا لایه</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed font-bold">
                                    <strong className="text-[var(--color-text-primary)]">راهنما:</strong> پس از تایید، فاکتور رسمی صادر و در پنل کاربری شما قرار می‌گیرد. می‌توانید با هر یک از روش‌های پرداخت موجود، نسبت به تسویه حساب اقدام نمایید.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </ContentWrapper>
    );
}
