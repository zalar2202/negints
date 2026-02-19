"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Link from "next/link";

export default function MaintainBundleBanner() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="bundle-section">
            <div ref={ref} className={`bundle-banner ${isVisible ? "visible" : ""}`}>
                <div className="bundle-content">
                    <span className="bundle-icon">🚀</span>
                    <div className="bundle-text">
                        <h3 className="bundle-title">Ready for Your Next Big Build?</h3>
                        <p className="bundle-description">
                            Our design and development teams are ready to bring your next MVP
                            or feature update to life with the same expert care.
                        </p>
                    </div>
                    <Link href="/services/develop" className="btn bundle-cta">
                        Start New Project →
                    </Link>
                </div>
            </div>
        </section>
    );
}
