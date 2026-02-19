"use client";

import Link from "next/link";
import DevelopParticleBackground from "./DevelopParticleBackground";

/**
 * DevelopHero - Hero section for Develop service page
 */
export default function DevelopHero() {
    const handleContactClick = (e) => {
        e.preventDefault();
        const element = document.getElementById("contact");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="design-hero develop-hero" id="develop-hero">
            <DevelopParticleBackground />
            <div className="design-hero-content animate-fade-in">
                <div className="design-hero-badge animate-fade-in-up delay-100">
                    <span>✦ Development Services</span>
                </div>
                <h1 className="design-hero-title animate-fade-in-up delay-200">
                    Build <span className="highlight">High-Performance</span> Web Applications
                </h1>
                <p className="design-hero-subtitle animate-fade-in-up delay-300">
                    Scalable, Secure, and Future-Proof
                </p>
                <p className="design-hero-description animate-fade-in-up delay-400">
                    We transform ideas into powerful digital products. From complex web apps to
                    custom platforms, we write clean code that drives your business forward.
                </p>
                <div className="design-hero-cta animate-fade-in-up delay-500">
                    <Link href="#contact" className="negints-btn" onClick={handleContactClick}>
                        Discuss Your Project
                    </Link>
                    <a href="#tech-stack" className="negints-alt-btn">
                        View Tech Stack
                    </a>
                </div>
            </div>
        </section>
    );
}
