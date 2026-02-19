"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Link from "next/link";

export default function DeployBundleBanner() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="bundle-section">
            <div ref={ref} className={`bundle-banner ${isVisible ? "visible" : ""}`}>
                <div className="bundle-content">
                    <span className="bundle-icon">🔧</span>
                    <div className="bundle-text">
                        <h3 className="bundle-title">Need Updates & Support?</h3>
                        <p className="bundle-description">
                            Deployment is just the beginning. Our Maintain packages keep your
                            app secure, updated, and bug-free 24/7.
                        </p>
                    </div>
                    <Link href="/services/maintain" className="btn bundle-cta">
                        See Maintenance Plans →
                    </Link>
                </div>
            </div>
        </section>
    );
}
