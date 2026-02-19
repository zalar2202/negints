"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const processSteps = [
    {
        subtitle: "Let's connect",
        title: "Discovery Call",
        description:
            "Understand your needs, stakeholders, and business goals. We learn about your vision and what success looks like for you.",
        timing: "30-60 min call",
    },
    {
        subtitle: "Map it out",
        title: "Site Strategy & Scope",
        description:
            "Recommend the best platform (WordPress, custom) and create a functional plan with clear deliverables and timeline.",
        timing: "2-3 days",
    },
    {
        subtitle: "Structure first",
        title: "Wireframes & UX",
        description:
            "UX planning so layout and flow are crystal clear. You'll see the skeleton before we add the skin.",
        timing: "3-5 days",
    },
    {
        subtitle: "Bring it to life",
        title: "Visual UI & Branding",
        description:
            "Create polished UI mockups with a revision cycle. Your brand identity comes alive on screen.",
        timing: "5-10 days",
    },
    {
        subtitle: "Ready to build",
        title: "Final Approval & Handoff",
        description:
            "Final assets packaged and ready for development. Clean files, clear specs, smooth transition.",
        timing: "1-2 days",
    },
];

/**
 * TimelineItem - Individual timeline step for design process
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
 * DesignProcess - Visual timeline showing the design process
 */
export default function DesignProcess() {
    return (
        <section id="design-process" className="section process-section">
            <h2 className="section-title">Our Design Process</h2>
            <p className="section-subtitle">
                A clear, step-by-step journey from concept to handoff
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
