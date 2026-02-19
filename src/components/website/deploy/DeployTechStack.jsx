"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const stacks = [
    {
        category: "Cloud Providers",
        items: ["AWS", "Google Cloud", "Azure", "DigitalOcean", "Vercel", "Hetzner"],
    },
    {
        category: "Containerization & Orchestration",
        items: ["Docker", "Kubernetes (K8s)", "Docker Swarm", "Portainer"],
    },
    {
        category: "CI/CD & DevOps",
        items: ["GitHub Actions", "GitLab CI", "Jenkins", "Terraform", "Ansible", "Coolify"],
    },
    {
        category: "Monitoring & Security",
        items: ["Datadog", "New Relic", "Sentry", "Cloudflare", "Prometheus", "Grafana"],
    },
];

export default function DeployTechStack() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="tech-stack" className="section tech-stack-section">
            <h2 className="section-title">Our Infrastructure Stack</h2>
            <div ref={ref} className={`tech-stack-grid ${isVisible ? "visible" : ""}`}>
                {stacks.map((stack, index) => (
                    <div
                        key={index}
                        className="tech-stack-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <h3 className="tech-stack-category">{stack.category}</h3>
                        <ul className="tech-stack-list">
                            {stack.items.map((item, i) => (
                                <li key={i} className="tech-stack-item">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
