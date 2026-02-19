"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * AboutSection - "Who We Are" section for NeginTS
 */
export default function AboutSection() {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="about" className="section about-section">
            <div ref={ref} className={`about-content ${isVisible ? "visible" : ""}`}>
                <h2 className="section-title">درباره نگین تجهیز سپهر</h2>
                <div className="about-text">
                    <p>
                        نگین تجهیز سپهر فعالیت خود را با هدف ارتقای سطح کیفی تجهیزات پزشکی و ارائه راهکارهای نوین تخصصی آغاز نموده است. 
                        ما با تمرکز بر تامین تجهیزات با استانداردهای جهانی، در کنار تیم‌های درمانی هستیم تا آینده‌ای ایمن‌تر بسازیم.
                    </p>

                    <p>
                        رویکرد ما مبتنی بر تخصص مهندسی پزشکی، درک عمیق از نیازهای درمانی و تعهد به پشتیبانی مداوم است. 
                        ما فراتر از تامین کالا، با ارائه مشاوره و خدمات پس از فروش، شریک مطمئن مراکز درمانی در سراسر کشور هستیم.
                    </p>
                </div>
            </div>
        </section>
    );
}

