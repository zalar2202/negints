"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const services = [
    {
        icon: "🛡️",
        title: "Security Patching",
        description: "Regular updates for platforms, plugins, and libraries to protect against hackers and vulnerabilities.",
    },
    {
        icon: "📡",
        title: "Uptime Monitoring",
        description: "24/7 monitoring of your site. If anything goes wrong, our team is notified instantly to resolve it.",
    },
    {
        icon: "💾",
        title: "Cloud Backups",
        description: "Daily off-site backups with verified restoration tests, so you never have to worry about data loss.",
    },
    {
        icon: "⚡",
        title: "Performance Checks",
        description: "Monthly optimization of databases, images, and server settings to keep your load times lightning fast.",
    },
    {
        icon: "🐞",
        title: "Priority Bug Fixes",
        description: "Exclusive access to our developers for any technical issues that arise, with guaranteed response times.",
    },
    {
        icon: "📝",
        title: "Content & Edits",
        description: "Need a new blog post, image change, or text update? Our team handles your site's content requests.",
    },
];

export default function MaintainServices() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="what-we-do" className="section service-breakdown-section">
            <h2 className="section-title">Proactive Care Services</h2>
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
