"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const processSteps = [
    {
        subtitle: "Step 1: Onboarding",
        title: "Site Audit",
        description: "We perform a thorough security and performance audit to identify immediate risks.",
        timing: "Day 1",
    },
    {
        subtitle: "Step 2: Securing",
        title: "Lockdown",
        description: "Implementing firewalls, updating outdated packages, and setting up off-site backups.",
        timing: "Day 2",
    },
    {
        subtitle: "Step 3: Watching",
        title: "24/7 Support",
        description: "Continuous monitoring for uptime, errors, and security threats goes live.",
        timing: "Real-time",
    },
    {
        subtitle: "Step 4: Updating",
        title: "Regular Polishing",
        description: "Monthly updates and performance tuning to keep everything optimized and secure.",
        timing: "Continuous",
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

export default function MaintainProcess() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="maintain-process" className="section process-section">
            <h2 className="section-title">The Support Cycle</h2>
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
