"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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
 * FAQAccordion - FAQ section with expandable items
 */
export default function FAQAccordion({ items }) {
    const [openIndex, setOpenIndex] = useState(null);
    const { ref, isVisible } = useScrollAnimation();

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="section faq-section">
            <h2 className="section-title">سوالات متداول</h2>
            <p className="section-subtitle">پاسخ به برخی از پرسش‌های رایج شما درباره خدمات و محصولات ما</p>
            <div ref={ref} className={`faq-list ${isVisible ? "visible" : ""}`}>

                {items.map((item, index) => (
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
