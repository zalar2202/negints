"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ShieldCheck, Truck, Headphones } from "lucide-react";

/**
 * ValueCard - Individual value proposition card
 */
function ValueCard({ icon, title, description, delay = 0 }) {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <div
            ref={ref}
            className={`value-card negints-card ${isVisible ? "visible" : ""}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="value-icon">{icon}</div>
            <h3 className="value-title">{title}</h3>
            <p className="value-description">{description}</p>
        </div>
    );
}

/**
 * WhyNegin - Value proposition section
 */
export default function WhyNegin() {
    const values = [
        {
            icon: <ShieldCheck size={40} strokeWidth={1.5} />,
            title: "تضمین کیفیت و اصالت",
            description:
                "تمامی محصولات ما دارای تاییدیه‌های بین‌المللی و استانداردهای وزارت بهداشت و درمان می‌باشند.",
        },
        {
            icon: <Truck size={40} strokeWidth={1.5} />,
            title: "تامین و ارسال سریع",
            description:
                "بهره‌مندی از شبکه توزیع گسترده جهت ارسال سریع تجهیزات به تمام نقاط کشور در کوتاه‌ترین زمان.",
        },
        {
            icon: <Headphones size={40} strokeWidth={1.5} />,
            title: "پشتیبانی ۲۴ ساعته",
            description:
                "تیم فنی و مهندسی ما در تمامی ساعات شبانه‌روز آماده پاسخگویی و ارائه خدمات پشتیبانی به شماست.",
        },
    ];

    return (
        <section id="why-us" className="section why-section">
            <h2 className="section-title">چرا نگین تجهیز سپهر؟</h2>

            <p className="section-subtitle">
                کیفیت، نوآوری و تعهد؛ همراه شما در مسیر سلامت و مهندسی پزشکی
            </p>
            <div className="values-grid">
                {values.map((value, index) => (
                    <ValueCard
                        key={index}
                        icon={value.icon}
                        title={value.title}
                        description={value.description}
                        delay={index * 150}
                    />
                ))}
            </div>
        </section>
    );
}

