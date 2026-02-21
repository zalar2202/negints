"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Phone, Mail, MapPin, Clock, Smartphone } from "lucide-react";

/**
 * ContactInfo - Detailed contact information cards
 */
export default function ContactInfo() {
    const { ref, isVisible } = useScrollAnimation();

    const phoneNumbers = [
        { label: "دفتر مرکزی", number: "۰۲۱-۶۵۰۲۳۹۸۰", raw: "+982165023980" },
        { label: "فروش و مشاوره", number: "۰۹۹۰-۱۲۶۷۱۰۸", raw: "+989901267108" },
        { label: "پشتیبانی", number: "۰۹۲۱-۴۰۴۳۹۱۹", raw: "+989214043919" },
        { label: "امور مشتریان", number: "۰۹۱۲-۷۰۷۳۵۵۷", raw: "+989127073557" },
    ];

    return (
        <section className="section contact-info-section">
            <h2 className="section-title">راه‌های ارتباطی</h2>
            <p className="section-subtitle">
                از هر طریقی که مایلید با ما در ارتباط باشید
            </p>

            <div
                ref={ref}
                className={`contact-info-grid ${isVisible ? "visible" : ""}`}
            >
                {/* Phone Numbers Card */}
                <div className="contact-info-card contact-info-card-phones">
                    <div className="contact-info-card-icon">
                        <Phone size={28} />
                    </div>
                    <h3 className="contact-info-card-title">تلفن تماس</h3>
                    <div className="contact-phone-list">
                        {phoneNumbers.map((phone, i) => (
                            <a
                                key={i}
                                href={`tel:${phone.raw}`}
                                className="contact-phone-item"
                            >
                                <Smartphone size={16} />
                                <div className="contact-phone-details">
                                    <span className="contact-phone-label">
                                        {phone.label}
                                    </span>
                                    <span className="contact-phone-number" dir="ltr">
                                        {phone.number}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Email Card */}
                <div className="contact-info-card">
                    <div className="contact-info-card-icon">
                        <Mail size={28} />
                    </div>
                    <h3 className="contact-info-card-title">ایمیل</h3>
                    <p className="contact-info-card-text">
                        برای ارسال درخواست، استعلام قیمت و مکاتبات رسمی
                    </p>
                    <a
                        href="mailto:info@negints.com"
                        className="contact-info-link"
                    >
                        info@negints.com
                    </a>
                </div>

                {/* Address Card */}
                <div className="contact-info-card">
                    <div className="contact-info-card-icon">
                        <MapPin size={28} />
                    </div>
                    <h3 className="contact-info-card-title">آدرس دفتر مرکزی</h3>
                    <p className="contact-info-card-text">
                        خیابان آزادی، نبش جمالزاده جنوبی، پلاک ۷۲، برج آفتاب، طبقه ۱۴، واحد ۱۱
                    </p>
                </div>

                {/* Working Hours Card */}
                <div className="contact-info-card">
                    <div className="contact-info-card-icon">
                        <Clock size={28} />
                    </div>
                    <h3 className="contact-info-card-title">ساعت کاری</h3>
                    <div className="contact-hours-list">
                        <div className="contact-hours-row">
                            <span>شنبه تا چهارشنبه</span>
                            <span dir="ltr">۹:۰۰ - ۱۷:۰۰</span>
                        </div>
                        <div className="contact-hours-row">
                            <span>پنجشنبه</span>
                            <span dir="ltr">۹:۰۰ - ۱۳:۰۰</span>
                        </div>
                        <div className="contact-hours-row contact-hours-closed">
                            <span>جمعه</span>
                            <span>تعطیل</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
