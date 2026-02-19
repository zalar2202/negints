"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const processSteps = [
    {
        subtitle: "Define the path",
        title: "Technical Discovery",
        description:
            "Define requirements, select the tech stack, and map out the system architecture before writing code.",
        timing: "1-3 days",
    },
    {
        subtitle: "Blueprint",
        title: "Database & API Design",
        description:
            "Structure data schemes and server logic. We ensure the foundation is solid to prevent technical debt.",
        timing: "3-5 days",
    },
    {
        subtitle: "Build it out",
        title: "Frontend Implementation",
        description:
            "Construct the visible interface and connect it to data. We focus on responsiveness and user interaction.",
        timing: "1-2 weeks",
    },
    {
        subtitle: "Quality Control",
        title: "Testing & QA",
        description:
            "Rigorous bug hunting, cross-device testing, and performance checks to ensure reliability.",
        timing: "3-5 days",
    },
    {
        subtitle: "Go Live",
        title: "Deployment & Launch",
        description:
            "Secure setup on cloud hosting (Vercel, AWS). We handle the DNS, SSL, and prod environment.",
        timing: "1-2 days",
    },
];

/**
 * TimelineItem - Individual timeline step for develop process
 */
function TimelineItem({
    number,
    subtitle,
    title,
    description,
    timing,
    inverted = false,
    delay = 0,
}) {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <li
            ref={ref}
            className={`timeline-item ${inverted ? "timeline-item-inverted" : ""} ${isVisible ? "visible" : ""}`}
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

/**
 * DevProcess - Visual timeline showing the development process
 */
export default function DevProcess() {
    return (
        <section id="dev-process" className="section process-section">
            <h2 className="section-title">Our Engineering Process</h2>
            <p className="section-subtitle">
                A structured SDLC for building robust software solutions
            </p>
            <div className="process-wrapper">
                <ul className="timeline">
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
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
}
