"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const differentiators = [
    {
        icon: "🛡️",
        title: "Security First",
        description:
            "We follow industry best practices to protect your data and users from the start.",
    },
    {
        icon: "⚡",
        title: "Performance Obsessed",
        description: "Fast load times and optimized bundles. We treat performance as a feature.",
    },
    {
        icon: "🧩",
        title: "Modular & Maintainable",
        description: "Clean code architecture that other developers can actually read and extend.",
    },
    {
        icon: "🔍",
        title: "SEO Optimized Structure",
        description: "Technical SEO baked in (SSR, semantic HTML) to help you rank better.",
    },
    {
        icon: "☁️",
        title: "Cloud Native",
        description: "Built for modern infrastructure (Serverless, Edge) for global scalability.",
    },
    {
        icon: "🔮",
        title: "Future-Proof Stack",
        description:
            "We use actively maintained technologies with strong community support for longevity.",
    },
];

/**
 * CodeQuality - Competitive positioning section for Develop page
 */
export default function CodeQuality() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="why-different" className="section why-different-section">
            <h2 className="section-title">Why Our Code Is Different</h2>
            <p className="section-subtitle">Quality engineering that stands the test of time</p>
            <div ref={ref} className={`why-different-grid ${isVisible ? "visible" : ""}`}>
                {differentiators.map((item, index) => (
                    <div
                        key={index}
                        className="differentiator-card negints-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <span className="differentiator-icon">{item.icon}</span>
                        <h3 className="differentiator-title">{item.title}</h3>
                        <p className="differentiator-description">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
