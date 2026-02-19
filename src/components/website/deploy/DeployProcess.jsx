"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const processSteps = [
    {
        subtitle: "Phase 1: Assessment",
        title: "Audit & Plan",
        description: "We analyze your current code and requirements to design the perfect cloud architecture.",
        timing: "Day 1-2",
    },
    {
        subtitle: "Phase 2: Architecture",
        title: "Cloud Setup",
        description: "Provisioning servers, databases, and networks using Infrastructure as Code (IaC).",
        timing: "Day 3-5",
    },
    {
        subtitle: "Phase 3: Automation",
        title: "CI/CD Pipelines",
        description: "Building automated workflows for testing and deployment to ensure reliability.",
        timing: "Day 6-8",
    },
    {
        subtitle: "Phase 4: Go Live",
        title: "Zero-Downtime Launch",
        description: "Migrating data and switching DNS to the new environment with no service interruption.",
        timing: "Day 9",
    },
    {
        subtitle: "Phase 5: Reliability",
        title: "Monitor & Optimize",
        description: "Setting up dashboards, alerts, and auto-scaling rules for peace of mind.",
        timing: "Ongoing",
    },
];

function TimelineItem({ number, subtitle, title, description, timing, inverted = false, delay = 0, isVisible }) {
    return (
        <li
            className={`timeline-item ${inverted ? "timeline-item-inverted" : ""} ${isVisible ? "visible" : ""
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="timeline-circle">
                <span>{number.toString().padStart(2, "0")}</span>
            </div>
            <div className="timeline-panel">
                <div className="negints-card">
                    <div className="timeline-subtitle">{subtitle}</div>
                    <div className="timeline-title">{title}</div>
                    <p className="timeline-description">{description}</p>
                    {timing && <div className="timeline-timing">⏱ {timing}</div>}
                </div>
            </div>
        </li>
    );
}

export default function DeployProcess() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="deploy-process" className="section process-section">
            <h2 className="section-title">The Launch Protocol</h2>
            <div className="process-wrapper">
                <ul ref={ref} className="timeline">
                    {processSteps.map((step, index) => (
                        <TimelineItem
                            key={index}
                            number={index + 1}
                            subtitle={step.subtitle}
                            title={step.title}
                            description={step.description}
                            timing={step.timing}
                            inverted={index % 2 === 1}
                            delay={index * 150}
                            isVisible={isVisible}
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
}
