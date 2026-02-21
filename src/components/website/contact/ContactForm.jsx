"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * ContactForm - Contact form for visitors to send inquiries
 */
export default function ContactForm() {
    const { ref, isVisible } = useScrollAnimation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState("idle"); // idle | sending | success | error

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("sending");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <section className="section contact-form-section" id="contact">
            <h2 className="section-title">پیام خود را ارسال کنید</h2>
            <p className="section-subtitle">
                فرم زیر را تکمیل کنید تا کارشناسان ما در اسرع وقت با شما
                تماس بگیرند
            </p>

            <div
                ref={ref}
                className={`contact-form-wrapper ${isVisible ? "visible" : ""}`}
            >
                {status === "success" ? (
                    <div className="contact-form-success">
                        <CheckCircle size={48} />
                        <h3>پیام شما با موفقیت ارسال شد</h3>
                        <p>
                            از تماس شما سپاسگزاریم. کارشناسان ما در اسرع وقت با شما
                            تماس خواهند گرفت.
                        </p>
                        <button
                            className="negints-alt-btn"
                            onClick={() => setStatus("idle")}
                        >
                            ارسال پیام جدید
                        </button>
                    </div>
                ) : (
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="contact-form-row">
                            <div className="contact-form-group">
                                <label htmlFor="contact-name">نام و نام خانوادگی *</label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="نام کامل خود را وارد کنید"
                                    required
                                />
                            </div>
                            <div className="contact-form-group">
                                <label htmlFor="contact-email">ایمیل *</label>
                                <input
                                    id="contact-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="contact-form-row">
                            <div className="contact-form-group">
                                <label htmlFor="contact-phone">شماره تماس</label>
                                <input
                                    id="contact-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="۰۹۱۲-۰۰۰-۰۰۰۰"
                                    dir="ltr"
                                />
                            </div>
                            <div className="contact-form-group">
                                <label htmlFor="contact-subject">موضوع *</label>
                                <select
                                    id="contact-subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">انتخاب موضوع...</option>
                                    <option value="consultation">مشاوره تجهیزات پزشکی</option>
                                    <option value="quote">استعلام قیمت</option>
                                    <option value="order">ثبت سفارش</option>
                                    <option value="support">پشتیبانی فنی</option>
                                    <option value="calibration">خدمات کالیبراسیون</option>
                                    <option value="partnership">همکاری تجاری</option>
                                    <option value="other">سایر موارد</option>
                                </select>
                            </div>
                        </div>

                        <div className="contact-form-group full-width">
                            <label htmlFor="contact-message">پیام *</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="پیام خود را بنویسید..."
                                rows={6}
                                required
                            />
                        </div>

                        {status === "error" && (
                            <div className="contact-form-error">
                                <AlertCircle size={18} />
                                <span>
                                    خطایی در ارسال پیام رخ داد. لطفاً دوباره تلاش کنید یا
                                    مستقیماً تماس بگیرید.
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="negints-btn contact-form-submit"
                            disabled={status === "sending"}
                        >
                            {status === "sending" ? (
                                <>
                                    <Loader2 size={18} className="contact-spinner" />
                                    در حال ارسال...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    ارسال پیام
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
