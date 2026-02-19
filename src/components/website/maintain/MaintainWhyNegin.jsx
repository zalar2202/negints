"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const differentiators = [
    {
        icon: "🎯",
        title: "Proactive vs Reactive",
        description: "We don't wait for your site to break. We patch and monitor daily to prevent issues before they happen.",
    },
    {
        icon: "🔄",
        title: "Rollover Hours",
        description: "On our Professional plan, unused development support hours roll over to the next month.",
    },
    {
        icon: "🔓",
        title: "No Long-term Lock-in",
        description: "Our maintenance plans are month-to-month. We earn your business through reliability, not contracts.",
    },
];

export default function MaintainWhyLoga() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="section why-different-section">
            <h2 className="section-title">Why Trust Us With Your Care?</h2>
            <div ref={ref} className={`why-different-grid ${isVisible ? "visible" : ""}`}>
                {differentiators.map((item, index) => (
                    <div
                        key={index}
                        className="differentiator-card negints-card"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <span className="differentiator-icon">{item.icon}</span>
                        <h3 className="differentiator-title">{item.title}</h3>
                        <p className="differentiator-description">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
