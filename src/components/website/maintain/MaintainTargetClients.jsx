"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const audiences = [
    {
        icon: "🛒",
        title: "E-commerce Stores",
        description: "Where every minute of downtime means lost revenue and customer trust.",
    },
    {
        icon: "💻",
        title: "SaaS Platforms",
        description: "Requiring constant availability, bug fixes, and security updates for subscribers.",
    },
    {
        icon: "🏢",
        title: "Corporate Sites",
        description: "Needing regular content updates, security patches, and daily backups.",
    },
    {
        icon: "🏗️",
        title: "Legacy Apps",
        description: "Older systems that need expert care to remain secure and functional in a modern web.",
    },
];

export default function MaintainTargetClients() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="ideal-for" className="section ideal-for-section">
            <h2 className="section-title">Who Needs This?</h2>
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
