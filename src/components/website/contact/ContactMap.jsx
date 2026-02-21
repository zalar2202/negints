"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * ContactMap - Google Maps embed for office location
 * Located at: خیابان آزادی، نبش جمالزاده جنوبی، برج آفتاب
 */
export default function ContactMap() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="section contact-map-section">
            <h2 className="section-title">موقعیت ما روی نقشه</h2>
            <p className="section-subtitle">
                برج آفتاب، خیابان آزادی، نبش جمالزاده جنوبی
            </p>
            <div
                ref={ref}
                className={`contact-map-wrapper ${isVisible ? "visible" : ""}`}
            >
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.8!2d51.3884!3d35.6998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQxJzU5LjMiTiA1McKwMjMnMTguMiJF!5e0!3m2!1sen!2sir!4v1"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="موقعیت نگین تجهیز سپهر روی نقشه"
                    className="contact-map-iframe"
                />
            </div>
        </section>
    );
}
