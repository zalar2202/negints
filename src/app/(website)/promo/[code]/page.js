import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Tag, Sparkles, ArrowRight, ShieldCheck, Zap, Calendar, Heart } from 'lucide-react';

export async function generateMetadata({ params }) {
    await connectDB();
    const { code } = await params;
    const promo = await Promotion.findOne({ discountCode: code.toUpperCase(), isActive: true });

    if (!promo) return { title: 'Promotion Not Found' };

    const discountText = promo.discountType === 'percentage' 
        ? `${promo.discountValue}% OFF` 
        : `$${promo.discountValue} OFF`;

    return {
        title: `${promo.title} - ${discountText}`,
        description: promo.description,
        openGraph: {
            title: `${promo.title} - ${discountText} | NeginTS`,
            description: promo.description,
            type: 'website',
            images: [
                {
                    url: '/assets/logo/negints-logo.png',
                    width: 512,
                    height: 512,
                    alt: 'NeginTS Promotion',
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${promo.title} - ${discountText} | NeginTS`,
            description: promo.description,
            images: ['/assets/logo/negints-logo.png'],
        }
    };
}

export default async function PromoPage({ params }) {
    await connectDB();
    const { code } = await params;
    const promo = await Promotion.findOne({ discountCode: code.toUpperCase(), isActive: true });

    if (!promo) notFound();

    const discountText = promo.discountType === 'percentage' 
        ? `${promo.discountValue}%` 
        : `$${promo.discountValue}`;

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            
            <div className="max-w-2xl w-full z-10">
                <main className="bg-[var(--color-background-elevated)] backdrop-blur-xl border border-[var(--color-border)] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
                        <div className="absolute top-4 right-4 opacity-20">
                            <Sparkles size={120} />
                        </div>
                        <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                            <Zap size={14} />
                            Exclusive Offer
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                            {promo.title}
                        </h1>
                        <p className="text-indigo-100/80 text-lg font-medium max-w-md">
                            Elevate your project with NeginTS&apos;s premium services.
                        </p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Tag size={16} />
                                        What&apos;s included
                                    </h2>
                                    <p className="text-[var(--color-text-primary)] text-lg leading-relaxed font-medium">
                                        {promo.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-[var(--color-hover)] border border-[var(--color-border)]">
                                        <Calendar className="w-5 h-5 text-indigo-500 mb-2" />
                                        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-tight">Expires</p>
                                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                                            {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Limited Time'}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-[var(--color-hover)] border border-[var(--color-border)]">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                                        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-tight">Verified</p>
                                        <p className="text-sm font-bold text-[var(--color-text-primary)]">Official Coupon</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-56 p-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Save Total</span>
                                <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                                    {discountText}
                                </div>
                                <div className="text-xs font-bold text-indigo-600/50 uppercase tracking-widest">Reduction</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link href={`/panel/cart?promo=${promo.discountCode}`} className="block">
                                <button className="w-full py-5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                    Claim This Promotion
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            
                            <p className="text-[10px] text-center text-[var(--color-text-tertiary)] uppercase tracking-widest font-bold">
                                No Credit Card required to start • 24/7 Support
                            </p>
                        </div>
                    </div>
                </main>
                
                <footer className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Powered by</span>
                        <img src="/assets/logo/negints-logo.png" className="h-8 w-auto rounded-lg" alt="NeginTS Logo" />
                    </div>
                    <div className="flex gap-4">
                        <Link href="/panel/shop" className="text-xs font-bold text-[var(--color-text-tertiary)] hover:text-indigo-600 transition-colors uppercase tracking-widest">Explore Shop</Link>
                        <span className="text-[var(--color-border)] inline-block">•</span>
                        <Link href="/" className="text-xs font-bold text-[var(--color-text-tertiary)] hover:text-indigo-600 transition-colors uppercase tracking-widest">Main Website</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
