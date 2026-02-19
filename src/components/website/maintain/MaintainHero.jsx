"use client";

import Link from "next/link";
import MaintainParticleBackground from "./MaintainParticleBackground";

/**
 * MaintainHero - Hero section for Maintain service page
 */
export default function MaintainHero() {
    const handleContactClick = (e) => {
        e.preventDefault();
        const element = document.getElementById("contact");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="design-hero maintain-hero" id="maintain-hero">
            <MaintainParticleBackground />
            <div className="design-hero-content animate-fade-in">
                <div className="design-hero-badge animate-fade-in-up delay-100">
                    <span>✦ Maintenance & Support</span>
                </div>
                <h1 className="design-hero-title animate-fade-in-up delay-200">
                    We Keep Your Digital <span className="highlight">Business Running</span>{" "}
                    Smoothly
                </h1>
                <p className="design-hero-subtitle animate-fade-in-up delay-300">
                    Proactive Care, 24/7 Security, and Peace of Mind
                </p>
                <p className="design-hero-description animate-fade-in-up delay-400">
                    Your website needs regular care to stay fast, secure, and functional. Our
                    maintenance plans handle the technical heavy lifting so you can focus on growth.
                </p>
                <div className="design-hero-cta animate-fade-in-up delay-500">
                    <a href="#pricing" className="negints-btn">
                        View Maintenance Plans →
                    </a>
                    <Link href="#contact" className="negints-alt-btn" onClick={handleContactClick}>
                        Schedule an Audit
                    </Link>
                </div>
            </div>
        </section>
    );
}
