"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const services = [
    {
        icon: "🖥️",
        title: "Frontend Development",
        description: "Fast, responsive, interactive UIs built with React, Next.js, and modern CSS",
    },
    {
        icon: "⚙️",
        title: "Backend & APIs",
        description: "Robust server-side logic, database management, and secure API architecture",
    },
    {
        icon: "📱",
        title: "Custom Web Applications",
        description: "SaaS platforms, dashboards, and portals tailored to your specific workflows",
    },
    {
        icon: "🛍️",
        title: "E-commerce & CMS",
        description: "Headless solutions or custom builds that scale with your sales",
    },
    {
        icon: "⚡",
        title: "Performance Optimization",
        description: "Speed auditing, code refactoring, and Core Web Vitals improvement",
    },
    {
        icon: "🧪",
        title: "Testing & QA",
        description:
            "Comprehensive automated and manual testing to ensure reliability, security, and performance",
    },
];

/**
 * TechCapabilities - Detailed breakdown of development services
 */
export default function TechCapabilities() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="what-we-do" className="section service-breakdown-section">
            <h2 className="section-title">What We Do</h2>
            <p className="section-subtitle">
                Comprehensive technical services covering the full software lifecycle
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
