"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * TimelineItem - Individual timeline step
 */
function TimelineItem({ number, subtitle, title, description, inverted = false, delay = 0 }) {
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
                </div>
            </div>
        </li>
    );
}

/**
 * ProcessTimeline - Visual timeline showing the work process
 */
export default function ProcessTimeline({ steps }) {
    return (
        <section id="process" className="section process-section">
            <h2 className="section-title">مسیر همکاری با ما</h2>
            <p className="section-subtitle">یک فرآیند شفاف و مهندسی شده از نیازسنجی تا خدمات پس از فروش</p>
            <div className="process-wrapper">

                <ul className="timeline">
                    {steps.map((step, index) => (
                        <TimelineItem
                            key={index}
                            number={index + 1}
                            subtitle={step.subtitle}
                            title={step.title}
                            description={step.description}
                            inverted={index % 2 === 1}
                            delay={index * 150}
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
}
