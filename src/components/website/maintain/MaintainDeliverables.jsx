"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const deliverables = [
    {
        icon: "📊",
        title: "Monthly Health Reports",
        description:
            "Clear PDF summaries of your site's uptime, security scans, and work performed.",
    },
    {
        icon: "📜",
        title: "Uptime Guarantee",
        description: "SLA-backed availability ensuring your business is always open for customers.",
    },
    {
        icon: "💬",
        title: "Priority Technical Support",
        description: "Direct access to our engineering team for questions or urgent assistance.",
    },
    {
        icon: "🛡️",
        title: "Trust Badge",
        description:
            "A 'Secured by NeginTS' seal to display on your site, building trust with your visitors.",
    },
];

export default function MaintainDeliverables() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="deliverables" className="section deliverables-section">
            <h2 className="section-title">What You Get Monthly</h2>
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
