"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const audiences = [
    {
        icon: "🚀",
        title: "Startups MVP",
        description: "Launching new products with robust technical foundations",
    },
    {
        icon: "📈",
        title: "Growing Companies",
        description: "Needing custom internal tools and scalable systems",
    },
    {
        icon: "🛒",
        title: "E-commerce Brands",
        description: "Expanding with complex storefronts and integrations",
    },
    {
        icon: "🔗",
        title: "API & Automation",
        description: "Businesses needing deep integration and automated workflows",
    },
];

/**
 * TargetClients - Target audience identification section for Develop page
 */
export default function TargetClients() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="target-clients" className="section ideal-for-section">
            <h2 className="section-title">Who This Is For</h2>
            <p className="section-subtitle">
                Technical solutions for businesses that need more than just a website
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
