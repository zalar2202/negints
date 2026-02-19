"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const stacks = [
    {
        category: "Frontend",
        tools: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
    },
    {
        category: "Backend",
        tools: ["Node.js", "Express", "Supabase", "Firebase"],
    },
    {
        category: "Database",
        tools: ["PostgreSQL", "MongoDB"],
    },
    {
        category: "Deployment",
        tools: ["Vercel", "Coolify", "Docker"],
    },
];

/**
 * TechStack - Technologies used section
 */
export default function TechStack() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="tech-stack" className="section tech-stack-section">
            <h2 className="section-title">Our Toolbelt</h2>
            <p className="section-subtitle">
                Modern technologies for building scalable applications
            </p>
            <div ref={ref} className={`tech-stack-grid ${isVisible ? "visible" : ""}`}>
                {stacks.map((stack, index) => (
                    <div
                        key={index}
                        className="tech-stack-card negints-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <h3 className="tech-stack-category">{stack.category}</h3>
                        <ul className="tech-stack-list">
                            {stack.tools.map((tool, idx) => (
                                <li key={idx} className="tech-stack-item">
                                    {tool}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
