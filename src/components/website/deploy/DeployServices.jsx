"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const services = [
    {
        icon: "☁️",
        title: "Cloud Infrastructure",
        description: "Architecting secure environments on AWS, Google Cloud, or Azure tailored to your needs.",
    },
    {
        icon: "🔄",
        title: "CI/CD Automation",
        description: "Automated pipelines that test, build, and deploy your code instantly on every push.",
    },
    {
        icon: "🐳",
        title: "Containerization",
        description: "Docker and Kubernetes setup for consistent, portable, and scalable application environments.",
    },
    {
        icon: "🔒",
        title: "Security & SSL",
        description: "Hardened firewalls, DDoS protection, automatic SSL, and security compliance (GDPR/SOC2).",
    },
    {
        icon: "⚡",
        title: "Performance Tuning",
        description: "CDN integration, advanced caching, and database optimization for lightning-fast load times.",
    },
    {
        icon: "📊",
        title: "Monitoring & Alerts",
        description: "24/7 real-time monitoring with instant alerts for uptime, errors, and performance bottlenecks.",
    },
];

export default function DeployServices() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="what-we-do" className="section service-breakdown-section">
            <h2 className="section-title">Deployment Capabilities</h2>
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
