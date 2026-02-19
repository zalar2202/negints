"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqItems = [
    {
        question: "How long does design take?",
        answer: "Typically 2-4 weeks depending on scope. Simple sites can be faster; complex projects may take 4-6 weeks. We'll provide a detailed timeline during planning.",
    },
    {
        question: "What CMS do you recommend?",
        answer: "It depends on your needs. WordPress is great for content-driven sites, while custom solutions work better for unique functionality. We'll consult with you and recommend the best fit.",
    },
    {
        question: "Can I change requirements mid-project?",
        answer: "Yes, within reason. We include 2 rounds of revisions in our process. Major scope changes may affect timeline and pricing — we'll always discuss this transparently.",
    },
    {
        question: "Do you only design, or also develop?",
        answer: "We do both! Design is one of our four pillars (Design, Develop, Deploy, Maintain). You can hire us for design-only, or get the full end-to-end experience.",
    },
    {
        question: "What if I already have a brand guide?",
        answer: "Perfect! We'll work within your existing brand guidelines to ensure consistency. If you don't have one, we can help establish visual direction as part of the design process.",
    },
    {
        question: "Do you offer design-only packages?",
        answer: "Absolutely. If you have your own development team or prefer to build it yourself, we can deliver design files and specs ready for handoff.",
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
 * DesignFAQ - Design-specific FAQ section
 */
export default function DesignFAQ() {
    const [openIndex, setOpenIndex] = useState(null);
    const { ref, isVisible } = useScrollAnimation();

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="design-faq" className="section faq-section">
            <h2 className="section-title">Design Questions? We've Got Answers</h2>
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
