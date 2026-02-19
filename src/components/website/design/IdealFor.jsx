"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const audiences = [
    {
        icon: "🚀",
        title: "New Businesses",
        description: "Launching online and need a professional foundation",
    },
    {
        icon: "🔄",
        title: "Brand Refresh",
        description: "Established brands needing a modern digital makeover",
    },
    {
        icon: "🛒",
        title: "E-commerce",
        description: "Companies moving to online sales and storefronts",
    },
    {
        icon: "💼",
        title: "Professionals",
        description: "Individuals wanting strategic, modern web presence",
    },
];

/**
 * IdealFor - Target audience identification section
 */
export default function IdealFor() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="ideal-for" className="section ideal-for-section">
            <h2 className="section-title">Who This Is For</h2>
            <p className="section-subtitle">
                Our design services are perfect for those who value quality and results
            </p>
            <div ref={ref} className={`ideal-for-grid ${isVisible ? "visible" : ""}`}>
                {audiences.map((audience, index) => (
                    <div
                        key={index}
                        className="ideal-for-card negints-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <span className="ideal-for-icon">{audience.icon}</span>
                        <h3 className="ideal-for-title">{audience.title}</h3>
                        <p className="ideal-for-description">{audience.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
