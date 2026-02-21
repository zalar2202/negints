"use client";

import ParticleBackground from "./ParticleBackground";
import Link from "next/link";

/**
 * Hero - Landing page hero section with innovative medical theme
 */
export default function Hero() {
    const handleContactClick = (e) => {
        e.preventDefault();
        const element = document.getElementById("contact");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="hero" id="hero">
            <div className="hero-overlay"></div>
            <ParticleBackground />
            <div className="hero-content">
                <h1 className="hero-title animate-fade-in text-shadow-lg">نگین تجهیز سپهر</h1>

                <div className="hero-tagline">
                    <Link
                        href="/products?category=kits"
                        className="animate-fade-in-up hover-link"
                    >
                        کیت‌های تخصصی
                    </Link>
                    <span className="hero-dot">·</span>
                    <Link
                        href="/products?category=instruments"
                        className="animate-fade-in-up delay-100 hover-link"
                    >
                        تجهیزات پزشکی
                    </Link>
                    <span className="hero-dot">·</span>
                    <Link
                        href="/products?category=healthcare"
                        className="animate-fade-in-up delay-200 hover-link"
                    >
                        سلامت خانواده
                    </Link>
                    <span className="hero-dot">·</span>
                    <Link
                        href="/products?category=pharmacy"
                        className="animate-fade-in-up delay-300 hover-link"
                    >
                        محصولات دارویی
                    </Link>
                </div>
                <p className="hero-description animate-fade-in-up delay-400">
                    ارائه دهنده پیشرو در تجهیزات نوین پزشکی و مهندسی تخصصی. ما با تکیه بر دانش روز، 
                    ایمنی و سلامت شما را تضمین می‌کنیم.
                </p>
                <div className="hero-cta animate-fade-in-up delay-500">
                    <Link href="#contact" className="negints-btn" onClick={handleContactClick}>
                        تماس با ما
                    </Link>
                    <Link href="/products" className="negints-alt-btn">
                        مشاهده محصولات
                    </Link>
                </div>
            </div>
        </section>
    );
}

