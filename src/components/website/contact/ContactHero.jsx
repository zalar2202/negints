"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Phone, Mail, MapPin } from "lucide-react";

/**
 * ContactHero - Hero section for Contact Us page
 */
export default function ContactHero() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="contact-hero" id="contact-hero">
            <div className="contact-hero-bg" />
            <div
                ref={ref}
                className={`contact-hero-content ${isVisible ? "visible" : ""}`}
            >
                <div className="contact-hero-badge">
                    <Phone size={16} />
                    <span>ارتباط با ما</span>
                </div>
                <h1 className="contact-hero-title">تماس با ما</h1>
                <p className="contact-hero-description">
                    ما آماده‌ایم تا بهترین راهکارهای تجهیزات پزشکی را برای مرکز
                    درمانی یا داروخانه شما فراهم کنیم. با ما در تماس باشید.
                </p>
                <div className="contact-hero-quick">
                    <a href="tel:+982165023980" className="contact-hero-quick-item">
                        <Phone size={18} />
                        <span>۰۲۱-۶۵۰۲۳۹۸۰</span>
                    </a>
                    <a href="mailto:info@negints.com" className="contact-hero-quick-item">
                        <Mail size={18} />
                        <span>info@negints.com</span>
                    </a>
                    <div className="contact-hero-quick-item">
                        <MapPin size={18} />
                        <span>تهران، خیابان آزادی</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
