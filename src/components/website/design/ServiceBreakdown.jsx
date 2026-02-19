"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const services = [
    {
        icon: "🎯",
        title: "Strategy & Discovery",
        description: "Understand your business goals, target audience, and competitive landscape",
    },
    {
        icon: "📐",
        title: "Site Planning",
        description: "Decide on the best CMS and structure — WordPress, custom, or hybrid",
    },
    {
        icon: "🔲",
        title: "Wireframes & Prototypes",
        description: "Preview UX before visual design — layout and flow made clear",
    },
    {
        icon: "🎨",
        title: "Visual UI Design",
        description: "Polished interfaces aligned with your brand identity and values",
    },
    {
        icon: "🤝",
        title: "Collaborative Feedback",
        description: "Iterative refinement with your input at every stage",
    },
    {
        icon: "📋",
        title: "Design Handoff",
        description:
            "Detailed documentation and assets prepared for a seamless development process",
    },
];

/**
 * ServiceBreakdown - Detailed breakdown of design services
 */
export default function ServiceBreakdown() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="what-we-do" className="section service-breakdown-section">
            <h2 className="section-title">What We Do</h2>
            <p className="section-subtitle">
                A comprehensive design service that covers every aspect of your digital presence
            </p>
            <div ref={ref} className={`service-breakdown-grid ${isVisible ? "visible" : ""}`}>
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="service-breakdown-card negints-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <div className="service-breakdown-header">
                            <span className="service-breakdown-icon">{service.icon}</span>
                            <h3 className="service-breakdown-title">{service.title}</h3>
                        </div>
                        <p className="service-breakdown-description">{service.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
