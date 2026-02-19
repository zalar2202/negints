"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqItems = [
    {
        question: "Do I own the code?",
        answer: "100%. Once paid for, the repository and IP are yours. We don't lock you in.",
    },
    {
        question: "What tech stack do you use?",
        answer: "We primarily use the modern JavaScript stack (React, Next.js, Node.js) because it offers the best balance of performance, scalability, and community support.",
    },
    {
        question: "Do you provide hosting?",
        answer: "We set up hosting for you on your preferred accounts (e.g., Vercel, AWS), so you have full control. We don't resell hosting, so you pay the provider directly.",
    },
    {
        question: "What about maintenance?",
        answer: "We offer maintenance packages to keep libraries updated, monitor security, and fix any bugs that appear post-launch.",
    },
    {
        question: "Can you take over an existing project?",
        answer: "Yes, but we'll need to do a code audit first to assess the quality of the current codebase and see if it's viable to build upon or needs refactoring.",
    },
    {
        question: "Is the site mobile-friendly?",
        answer: "Absolutely. All our development is responsive by default, ensuring it looks perfect on phones, tablets, and desktops.",
    },
];

/**
 * FAQItem - Individual FAQ item with expand/collapse functionality
 */
function FAQItem({ question, answer, isOpen, onToggle, delay = 0 }) {
    return (
        <div
            className={`faq-item negints-card ${isOpen ? "open" : ""}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <button className="faq-header" onClick={onToggle} aria-expanded={isOpen}>
                <span className="faq-question">{question}</span>
                <span className="faq-icon">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="faq-content">
                <p className="faq-answer">{answer}</p>
            </div>
        </div>
    );
}

/**
 * DevFAQ - Development-specific FAQ section
 */
export default function DevFAQ() {
    const [openIndex, setOpenIndex] = useState(null);
    const { ref, isVisible } = useScrollAnimation();

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="dev-faq" className="section faq-section">
            <h2 className="section-title">Technical Questions answered</h2>
            <div ref={ref} className={`faq-list ${isVisible ? "visible" : ""}`}>
                {faqItems.map((item, index) => (
                    <FAQItem
                        key={index}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openIndex === index}
                        onToggle={() => handleToggle(index)}
                        delay={index * 100}
                    />
                ))}
            </div>
        </section>
    );
}
