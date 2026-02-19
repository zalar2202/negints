"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const differentiators = [
    {
        icon: "🎯",
        title: "Strategy-First Approach",
        description:
            "We start with business goals, not just aesthetics. Every design decision has purpose.",
    },
    {
        icon: "📈",
        title: "Business Outcome Focus",
        description: "Design decisions driven by growth and conversion — not vanity metrics.",
    },
    {
        icon: "🔗",
        title: "UX + UI Integrated",
        description: "Usability and beauty work together. Function informs form, always.",
    },
    {
        icon: "🛠️",
        title: "CMS Guidance",
        description: "We consult on platforms — WordPress, custom, headless — based on your needs.",
    },
    {
        icon: "🤝",
        title: "Collaborative Process",
        description:
            "You're involved at every step, not just the final reveal. Your input matters.",
    },
    {
        icon: "💰",
        title: "Transparent Pricing",
        description:
            "Clear quotes upfront with no hidden fees. You know exactly what you're paying for.",
    },
];

/**
 * WhyDifferent - Competitive positioning section
 */
export default function WhyDifferent() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="why-different" className="section why-different-section">
            <h2 className="section-title">Why Our Design Is Different</h2>
            <p className="section-subtitle">What sets us apart from typical design agencies</p>
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
