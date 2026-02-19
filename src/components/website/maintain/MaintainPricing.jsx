"use client";

import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import SmartCTA from "@/components/website/shared/SmartCTA";
import { useCart } from "@/contexts/CartContext";

export default function MaintainPricing() {
    const { ref, isVisible } = useScrollAnimation();
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const router = useRouter();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(null);

    const handleAddToCart = async (pkg) => {
        if (!user) {
            toast.error("Please login to purchase services");
            router.push("/login");
            return;
        }

        setAdding(pkg._id);
        try {
            await axios.post("/api/cart", {
                packageId: pkg._id,
                quantity: 1,
                billingCycle: "monthly" // Default for maintenance
            });
            toast.success(`${pkg.name} added to cart!`, {
                action: {
                    label: "View Cart",
                    onClick: () => router.push("/panel/cart")
                }
            });
            refreshCart();
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setAdding(null);
        }
    };

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axios.get("/api/packages?category=maintenance");
                if (res.data.success) {
                    setPackages(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch maintenance packages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    return (
        <section id="pricing" className="section pricing-section">
            <h2 className="section-title">Support Plans</h2>
            <div ref={ref} className={`pricing-content ${isVisible ? "visible" : ""}`}>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {packages.length > 0 ? (
                            packages.map((tier, index) => (
                                <div
                                    key={tier._id}
                                    className="negints-card"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transitionDelay: `${index * 100}ms`
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-primary)' }}>{tier.name}</h3>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '700', margin: '16px 0', color: 'var(--color-text-primary)' }}>
                                        {tier.startingPrice}<span style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--color-text-secondary)' }}>/{tier.priceRange || 'mo'}</span>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', flexGrow: 1 }}>
                                        {tier.features.map((feature, i) => (
                                            <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem' }}>
                                                ✓ {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    {user && (
                                        <button 
                                            onClick={() => handleAddToCart(tier)}
                                            disabled={adding === tier._id}
                                            className="negints-btn" 
                                            style={{ 
                                                marginTop: '24px', 
                                                textAlign: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            {adding === tier._id ? '...' : <><ShoppingCart size={18} /> Buy Now</>}
                                        </button>
                                    )}
                                    {!user && (
                                        <SmartCTA 
                                            label="Subscribe Now" 
                                            className="negints-btn" 
                                            style={{ marginTop: '24px', textAlign: 'center' }}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-[var(--color-text-secondary)]">
                                No support plans currently listed.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
