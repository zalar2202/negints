"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * MedicalBrands - Display medical brands and standards
 */
export default function MedicalBrands() {
    const { ref, isVisible } = useScrollAnimation();

    const brands = [
        { name: "3M", icon: "🛡️" },
        { name: "ISO 13485", icon: "📋" },
        { name: "FDA", icon: "✅" },
        { name: "CE", icon: "🇪🇺" },
        { name: "وزارت بهداشت", icon: "🏥" },
        { name: "هلال احمر", icon: "🚑" },
    ];

    return (
        <section id="brands" className="section tech-section">
            <h2 className="section-title">برندها و استانداردها</h2>
            <p className="section-subtitle">تضمین کیفیت با برترین نمادهای بین‌المللی و ملی</p>
            <div ref={ref} className={`tech-grid ${isVisible ? "visible" : ""}`}>
                {brands.map((brand, index) => (
                    <div
                        key={brand.name}
                        className="tech-item"
                        style={{ transitionDelay: `${index * 50}ms` }}
                    >
                        <span className="tech-icon">{brand.icon}</span>
                        <span className="tech-name">{brand.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

