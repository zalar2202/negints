"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import SmartCTA from "@/components/website/shared/SmartCTA";

/**
 * BundleBanner - Cross-sell banner for Design + Develop
 */
export default function BundleBanner() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="bundle" className="section bundle-section">
            <div ref={ref} className={`bundle-banner ${isVisible ? "visible" : ""}`}>
                <div className="bundle-content">
                    <div className="bundle-icon">🔗</div>
                    <div className="bundle-text">
                        <h3 className="bundle-title">Need development too?</h3>
                        <p className="bundle-description">
                            We don't just design — we build. Get an end-to-end solution that takes
                            your project from concept to launch.
                        </p>
                    </div>
                    <SmartCTA 
                        label="Explore Full-Stack Packages" 
                        className="negints-btn bundle-cta" 
                        userHref="/services/develop"
                    />
                </div>
            </div>
        </section>
    );
}
