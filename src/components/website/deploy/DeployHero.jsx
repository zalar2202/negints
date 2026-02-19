"use client";

import Link from "next/link";
import DeployParticleBackground from "./DeployParticleBackground";

/**
 * DeployHero - Hero section for Deploy service page
 */
export default function DeployHero() {
    const handleContactClick = (e) => {
        e.preventDefault();
        const element = document.getElementById("contact");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="design-hero deploy-hero" id="deploy-hero">
            <DeployParticleBackground />
            <div className="design-hero-content animate-fade-in">
                <div className="design-hero-badge animate-fade-in-up delay-100">
                    <span>✦ Deployment Services</span>
                </div>
                <h1 className="design-hero-title animate-fade-in-up delay-200">
                    Deploy With <span className="highlight">Confidence</span>. Scale Without Limits.
                </h1>
                <p className="design-hero-subtitle animate-fade-in-up delay-300">
                    Enterprise-Grade Infrastructure & Automation
                </p>
                <p className="design-hero-description animate-fade-in-up delay-400">
                    We launch your applications on robust, secure, and auto-scaling cloud
                    infrastructure. Say goodbye to downtime and hello to seamless growth.
                </p>
                <div className="design-hero-cta animate-fade-in-up delay-500">
                    <Link href="#contact" className="negints-btn" onClick={handleContactClick}>
                        Launch Your Project
                    </Link>
                    <a href="#tech-stack" className="negints-alt-btn">
                        View Infrastructure
                    </a>
                </div>
            </div>
        </section>
    );
}
