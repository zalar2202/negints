"use client";

import { useState } from "react";

const faqData = [
    {
        question: "Do I own the AWS/Cloud account?",
        answer: "Yes, absolutely. We create the accounts in your name (or your company's name) and hand over full administrative access. You pay the cloud providers directly, ensuring you have total control and ownership of your infrastructure.",
    },
    {
        question: "Can you migrate my existing app from Heroku/Shared Hosting?",
        answer: "Yes. We specialize in migrating legacy or PaaS-hosted applications to robust cloud environments like AWS or DigitalOcean, often resulting in better performance and lower monthly costs.",
    },
    {
        question: "What happens if the server goes down?",
        answer: "For our 'Enterprise' setups, we build self-healing clusters that auto-restart failed services. We also set up monitoring alerts. If you need ongoing 24/7 response teams, check out our 'Maintain' service packages.",
    },
    {
        question: "How long does it take to deploy?",
        answer: "Simple setups (Next.js/Vercel) can be done in 1-2 days. Complex custom cloud architectures with Kubernetes and CI/CD pipelines typically take 1-2 weeks to architect, build, and test thoroughly.",
    },
];

export default function DeployFAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section id="faq" className="section faq-section">
            <h2 className="section-title">Deployment FAQs</h2>
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
