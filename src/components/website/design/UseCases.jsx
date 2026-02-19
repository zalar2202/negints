"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const useCases = [
    {
        icon: "🎨",
        type: "Personal Portfolio",
        label: "Clean & Personal",
        description: "Showcase your work and personality with a stunning online presence",
    },
    {
        icon: "🏢",
        type: "Business Brochure",
        label: "Corporate & Trustworthy",
        description: "Professional web presence that builds credibility and trust",
    },
    {
        icon: "🛒",
        type: "E-commerce Store",
        label: "Shop & Convert",
        description: "Online stores designed to attract customers and drive sales",
    },
    {
        icon: "📦",
        type: "Product Catalog",
        label: "Visual & Organized",
        description: "Display products beautifully with intuitive navigation",
    },
    {
        icon: "🚀",
        type: "SaaS Landing Page",
        label: "Modern & Persuasive",
        description: "Convert visitors into signups with compelling design",
    },
    {
        icon: "📊",
        type: "Web Application",
        label: "Functional & Intuitive",
        description: "Complex dashboards and tools designed for productivity and ease of use",
    },
];

/**
 * UseCases - Examples and project types section
 */
export default function UseCases() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="use-cases" className="section use-cases-section">
            <h2 className="section-title">Types of Projects We Design</h2>
            <p className="section-subtitle">
                From personal sites to enterprise platforms — we&apos;ve got you covered
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
