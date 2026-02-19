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

/**
 * PricingGuidance - Investment overview section
 */
export default function PricingGuidance() {
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
                billingCycle: "one-time"
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
                const res = await axios.get("/api/packages?category=design");
                if (res.data.success) {
                    setPackages(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch design packages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const pricingFactors = [
        "Number of pages/screens",
        "Custom illustrations or graphics",
        "Complexity of interactions",
        "Timeline requirements",
    ];

    return (
        <section id="pricing" className="section pricing-section">
            <h2 className="section-title">💰 Investment Overview</h2>
            <p className="section-subtitle">Transparent pricing to help you plan your project</p>
            <div ref={ref} className={`pricing-content ${isVisible ? "visible" : ""}`}>
                <div className="pricing-table-wrapper">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    ) : (
                        <table className="pricing-table">
                            <thead>
                                <tr>
                                    <th>Project Type</th>
                                    <th>Starting From</th>
                                    <th>Typical Range</th>
                                    {user && <th className="text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {packages.length > 0 ? (
                                    packages.map((tier, index) => (
                                        <tr key={tier._id} style={{ transitionDelay: `${index * 100}ms` }}>
                                            <td className="pricing-type">{tier.name}</td>
                                            <td className="pricing-starting">{tier.startingPrice}</td>
                                            <td className="pricing-range">{tier.priceRange || "Custom Quote"}</td>
                                            {user && (
                                                <td className="text-right">
                                                    <button 
                                                        onClick={() => handleAddToCart(tier)}
                                                        disabled={adding === tier._id}
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            fontSize: '12px',
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: 'white',
                                                            borderRadius: '6px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        {adding === tier._id ? '...' : <><ShoppingCart size={14} /> Buy</>}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={user ? 4 : 3} className="text-center py-4">No packages available. Contact us for a quote!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="pricing-factors">
                    <h3 className="pricing-factors-title">What affects pricing?</h3>
                    <ul className="pricing-factors-list">
                        {pricingFactors.map((factor, index) => (
                            <li key={index}>✓ {factor}</li>
                        ))}
                    </ul>
                </div>

                <div className="pricing-note">
                    <p>
                        💡 Every project is unique. We provide a transparent quote after
                        understanding your needs — no hidden fees, no surprises.
                    </p>
                </div>

                <div className="pricing-cta">
                    <SmartCTA 
                        label="Get a Custom Quote" 
                        className="negints-btn" 
                    />
                </div>
            </div>
        </section>
    );
}
