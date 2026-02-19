"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const differentiators = [
    {
        icon: "🔓",
        title: "Zero Vendor Lock-in",
        description: "We build on standard, portable technologies. You own all cloud accounts and code.",
    },
    {
        icon: "🛡️",
        title: "Security Native",
        description: "We don't just 'add' security later. It's baked into the infrastructure code from line one.",
    },
    {
        icon: "🚀",
        title: "Performance Obsessed",
        description: "We tune servers for Time-To-First-Byte (TTFB) and core web vitals to ensure instant loading.",
    },
];

export default function DeployWhyLoga() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="section why-different-section">
            <h2 className="section-title">Why Trust Us With Your Launch?</h2>
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
