"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const audiences = [
    {
        icon: "🚀",
        title: "Startup Founders",
        description: "Launch fast with zero infrastructure headaches.",
    },
    {
        icon: "📈",
        title: "Growing SaaS",
        description: "Auto-scale instantly to handle sudden traffic spikes.",
    },
    {
        icon: "🏢",
        title: "Enterprises",
        description: "Bank-grade security, compliance, and 99.99% uptime.",
    },
    {
        icon: "🤝",
        title: "Agencies",
        description: "Reliable, managed hosting for your client projects.",
    },
];

export default function DeployTargetClients() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="ideal-for" className="section ideal-for-section">
            <h2 className="section-title">Who This Is For</h2>
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
