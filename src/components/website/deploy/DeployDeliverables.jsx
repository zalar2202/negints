"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const deliverables = [
    {
        icon: "🌐",
        title: "Production Environment",
        description:
            "A fully live, secure, and optimized application accessible to your users globally.",
    },
    {
        icon: "📜",
        title: "Infrastructure & Docs",
        description:
            "IaC scripts, deployment runbooks, and documentation to manage and recreate your setup.",
    },
    {
        icon: "🔑",
        title: "Admin Access Keys",
        description:
            "Full ownership of all cloud accounts, API keys, and SSL certificates transferred to you.",
    },
    {
        icon: "🛡️",
        title: "Security Hardening",
        description:
            "Configured firewalls, headers, and access policies to protect against common threats.",
    },
];

export default function DeployDeliverables() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="deliverables" className="section deliverables-section">
            <h2 className="section-title">What You Receive</h2>
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
