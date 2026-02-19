"use client";

import ServiceCard from "./ServiceCard";
import { BriefcaseMedical, Stethoscope, HeartPulse, Pill } from "lucide-react";

/**
 * Services - Services section with 4 pillars for NeginTS
 */
export default function Services() {
    const services = [
        {
            icon: <BriefcaseMedical size={32} strokeWidth={1.5} />,
            title: "کیت‌های تخصصی",
            href: "/products?category=kits",
            description:
                "ارائه انواع کیت‌های کمک‌های اولیه، کیت‌های خودرویی و بقا با استانداردهای نوین هلال احمر و سازمان‌های امدادی.",
        },
        {
            icon: <Stethoscope size={32} strokeWidth={1.5} />,
            title: "تجهیزات پزشکی",
            href: "/products?category=instruments",
            description:
                "تامین دستگاه‌های تخصصی قلبی و عروق، نورولوژی و ابزارهای جراحی از معتبرترین برندهای جهان.",
        },
        {
            icon: <HeartPulse size={32} strokeWidth={1.5} />,
            title: "سلامت خانواده",
            href: "/products?category=healthcare",
            description:
                "دستگاه‌های تصفیه هوا، ماسک‌های تنفسی 3M و سنسورهای هوشمند سلامت برای مراقبت در منزل.",
        },
        {
            icon: <Pill size={32} strokeWidth={1.5} />,
            title: "محصولات دارویی",
            href: "/products?category=pharmacy",
            description:
                "تامین مکمل‌های غذایی نوآورانه و محصولات دارویی با تکیه بر دانش فنی و تخصص داروسازی.",
        },
    ];

    return (
        <section id="services" className="section services-section">
            <h2 className="section-title">برخی از خدمات ما</h2>
            <p className="section-subtitle">
                مجموعه‌ای کامل از راهکارهای سلامت و تجهیزات مهندسی پزشکی
            </p>
            <div className="services-grid">
                {services.map((service, index) => (
                    <ServiceCard
                        key={index}
                        icon={service.icon}
                        title={service.title}
                        description={service.description}
                        href={service.href}
                        delay={index * 100}
                    />
                ))}
            </div>
        </section>
    );
}

