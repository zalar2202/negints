"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const useCases = [
    {
        icon: "⚡",
        type: "Single Page App (SPA)",
        label: "React / Next.js",
        description: "Fast, app-like experience running entirely in the browser",
    },
    {
        icon: "📊",
        type: "Dashboard & Portal",
        label: "Data-Rich & Secure",
        description: "Admin panels and client portals to manage your business data",
    },
    {
        icon: "🛍️",
        type: "Custom E-commerce",
        label: "Scalable Sales",
        description: "Unique checkout flows and complex product logic",
    },
    {
        icon: "🔌",
        type: "API Integration",
        label: "Automated Workflows",
        description: "Connect your CRM, Email, and site for seamless data flow",
    },
    {
        icon: "📱",
        type: "Progressive Web App",
        label: "Mobile-First",
        description: "Installable web apps that work offline and look like native apps",
    },
    {
        icon: "💬",
        type: "Real-Time Application",
        label: "Live & Interactive",
        description: "Chat systems, notifications, and live updates with WebSocket technology",
    },
];

/**
 * DevUseCases - Examples and solution types section
 */
export default function DevUseCases() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="use-cases" className="section use-cases-section">
            <h2 className="section-title">Types of Solutions We Build</h2>
            <p className="section-subtitle">
                From MVPs to enterprise platforms — we have the technical chops
            </p>
            <div ref={ref} className={`use-cases-grid ${isVisible ? "visible" : ""}`}>
                {useCases.map((useCase, index) => (
                    <div
                        key={index}
                        className="use-case-card negints-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <div className="use-case-icon">{useCase.icon}</div>
                        <div className="use-case-content">
                            <h3 className="use-case-type">{useCase.type}</h3>
                            <span className="use-case-label">{useCase.label}</span>
                            <p className="use-case-description">{useCase.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <p className="use-cases-note">
                ✨ Building our portfolio — real case studies coming soon!
            </p>
        </section>
    );
}
