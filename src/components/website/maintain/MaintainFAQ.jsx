"use client";

import { useState } from "react";

const faqData = [
    {
        question: "What happens if my site is hacked or goes down?",
        answer: "Our monitoring systems alert us immediately. For hacked sites, we perform a clean restoration from our most recent secure backup and harden the entry point. This is included in all our plans.",
    },
    {
        question: "Do you support sites that NeginTS didn't build?",
        answer: "Yes. We can manage and maintain sites built by other teams. We'll start with a security and compatibility audit to ensure your current setup can be supported efficiently.",
    },
    {
        question: "What constitutes a 'small fix' or 'dev time'?",
        answer: "Dev time can be used for CSS tweaks, changing text/images, adding a small feature, or investigating a specific bug. If a request exceeds your plan's hours, we'll provide a transparent quote before starting.",
    },
    {
        question: "How do I communicate with the support team?",
        answer: "Essential plan users use our email ticketing system. Professional and Enterprise users get access to a private Slack channel for real-time collaboration with our engineers.",
    },
];

export default function MaintainFAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section id="faq" className="section faq-section">
            <h2 className="section-title">Maintenance Questions</h2>
            <div className="faq-list visible">
                {faqData.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item negints-card ${openIndex === index ? "open" : ""}`}
                    >
                        <button className="faq-header" onClick={() => toggleFAQ(index)}>
                            <span className="faq-question">{faq.question}</span>
                            <span className="faq-icon">{openIndex === index ? "−" : "+"}</span>
                        </button>
                        <div className="faq-content">
                            <p className="faq-answer">{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
