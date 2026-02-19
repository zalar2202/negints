"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import SmartCTA from "@/components/website/shared/SmartCTA";

/**
 * DevBundleBanner - Cross-sell banner for Design services
 */
export default function DevBundleBanner() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="bundle" className="section bundle-section">
            <div ref={ref} className={`bundle-banner ${isVisible ? "visible" : ""}`}>
                <div className="bundle-content">
                    <div className="bundle-icon">🎨</div>
                    <div className="bundle-text">
                        <h3 className="bundle-title">Need design too?</h3>
                        <p className="bundle-description">
                            A great build needs a great blueprint. Let us handle the UI/UX design to
                            ensure your app looks as good as it works.
                        </p>
                    </div>
                    <SmartCTA 
                        label="See Design Services" 
                        className="negints-btn bundle-cta" 
                        userHref="/services/design"
                    />
                </div>
            </div>
        </section>
    );
}
