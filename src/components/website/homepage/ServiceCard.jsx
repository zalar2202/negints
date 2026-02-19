"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Link from "next/link";

/**
 * ServiceCard - Individual service card with icon and description
 */
export default function ServiceCard({ icon, title, description, href, delay = 0 }) {
    const { ref, isVisible } = useScrollAnimation();

    const CardContent = (
        <>
            <div className="service-icon">{icon}</div>
            <h3 className="service-title">{title}</h3>
            <p className="service-description">{description}</p>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                ref={ref}
                className={`service-card negints-card service-card-link ${isVisible ? "visible" : ""}`}
                style={{ transitionDelay: `${delay}ms`, textDecoration: 'none' }}
            >
                {CardContent}
            </Link>
        );
    }

    return (
        <div
            ref={ref}
            className={`service-card negints-card ${isVisible ? "visible" : ""}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {CardContent}
        </div>
    );
}

