"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const deliverables = [
    {
        icon: "💻",
        title: "Full Source Code",
        description: "Complete Git repository ownership. You own 100% of the code — no lock-in.",
    },
    {
        icon: "🌐",
        title: "Live Application",
        description: "Fully deployed and optimized application on your preferred cloud provider.",
    },
    {
        icon: "🔒",
        title: "DevOps & Security",
        description:
            "Secure configs, CI/CD pipelines, and automated workflows for safe, seamless updates.",
    },
    {
        icon: "📘",
        title: "Technical Docs",
        description: "README instructions, API documentation, and architecture diagrams.",
    },
];

/**
 * DevDeliverables - What clients receive section for Develop page
 */
export default function DevDeliverables() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="deliverables" className="section deliverables-section">
            <h2 className="section-title">What You Get</h2>
            <p className="section-subtitle">
                Tangible assets — complete ownership and professional setup
            </p>
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
