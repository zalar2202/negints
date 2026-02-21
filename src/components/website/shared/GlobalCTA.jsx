"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import SmartCTA from "@/components/website/shared/SmartCTA";

/**
 * GlobalCTA - Consolidated call-to-action section for NeginTS
 */
export default function GlobalCTA({
    title = "آماده همکاری با ما هستید؟",
    description = "ما آماده‌ایم تا بهترین راهکارهای تجهیزات پزشکی را برای مرکز درمانی یا داروخانه شما فراهم کنیم. با ما در تماس باشید.",
    primaryButtonLabel = "تماس با کارشناسان ما",
    primaryButtonLink = "/contact-us",
    secondaryButtonLabel = null,
    secondaryButtonLink = null,
}) {
    const { ref, isVisible } = useScrollAnimation();

    const contactInfo = {
        email: "info@negints.com",
        phone: "۰۲۱-۶۵۰۲۳۹۸۰",
        phoneRaw: "+982165023980",
        address: "خیابان آزادی، نبش جمالزاده جنوبی، پلاک ۷۲، برج آفتاب، طبقه ۱۴، واحد ۱۱"
    };

    return (
        <section id="contact" className="section cta-section">
            <div ref={ref} className={`cta-content ${isVisible ? "visible" : ""}`}>
                <h2 className="cta-title">{title}</h2>
                <p className="cta-description">{description}</p>

                <div className="cta-buttons">
                    <SmartCTA 
                        label={primaryButtonLabel} 
                        guestHref={primaryButtonLink} 
                        userHref={primaryButtonLink} 
                        className="negints-btn large" 
                    />
                </div>

                {secondaryButtonLabel && (
                    <div className="cta-secondary">
                        <SmartCTA label={secondaryButtonLabel} className="negints-alt-btn" />
                    </div>
                )}

                <div className="cta-contact-info">
                    <div className="contact-item">
                        <span className="contact-label">ایمیل</span>
                        <a href={`mailto:${contactInfo.email}`} className="contact-value">
                            {contactInfo.email}
                        </a>
                    </div>
                    <div className="contact-item">
                        <span className="contact-label">تلفن تماس</span>
                        <a href={`tel:${contactInfo.phoneRaw}`} className="contact-value">
                            {contactInfo.phone}
                        </a>
                    </div>
                    <div className="contact-item">
                        <span className="contact-label">آدرس</span>
                        <span className="contact-value">
                            {contactInfo.address}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

