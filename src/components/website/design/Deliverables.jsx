"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const deliverables = [
    {
        icon: "📁",
        title: "UI Design Files",
        description: "Fully designed UI in Figma or Adobe XD — organized, labeled, ready to use",
    },
    {
        icon: "🖱️",
        title: "Clickable Prototype",
        description: "Interactive prototype to experience the flow before development (optional)",
    },
    {
        icon: "📚",
        title: "Design Guidelines",
        description: "Brand asset library with colors, typography, spacing, and component rules",
    },
    {
        icon: "📐",
        title: "Development Specs",
        description: "Ready-for-development specifications and exportable assets",
    },
];

/**
 * Deliverables - What clients receive section
 */
export default function Deliverables() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="deliverables" className="section deliverables-section">
            <h2 className="section-title">What You Get</h2>
            <p className="section-subtitle">Tangible deliverables — real work with real outputs</p>
            <div ref={ref} className={`deliverables-grid ${isVisible ? "visible" : ""}`}>
                {deliverables.map((item, index) => (
                    <div
                        key={index}
                        className="deliverable-card negints-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <span className="deliverable-icon">{item.icon}</span>
                        <h3 className="deliverable-title">{item.title}</h3>
                        <p className="deliverable-description">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
