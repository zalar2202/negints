import Hero from "@/components/website/homepage/Hero";
import AboutSection from "@/components/website/homepage/AboutSection";
import Services from "@/components/website/homepage/Services";
import WhyNegin from "@/components/website/homepage/WhyNegin";
import FeaturedProducts from "@/components/website/homepage/FeaturedProducts";
import ProcessTimeline from "@/components/website/homepage/ProcessTimeline";
import MedicalBrands from "@/components/website/shared/MedicalBrands";
import FAQAccordion from "@/components/website/homepage/FAQAccordion";
import GlobalCTA from "@/components/website/shared/GlobalCTA";



export const metadata = {
    title: "نگین تجهیز سپهر (NeginTS) - راهکارهای نوین تجهیزات پزشکی",
    description: "نگین تجهیز سپهر پیشرو در ارائه تجهیزات پزشکی تخصصی، کیت‌های کمک‌های اولیه و خدمات مهندسی پزشکی در ایران.",
    openGraph: {
        title: "نگین تجهیز سپهر (NeginTS)",
        description: "تجهیزات تخصصی پزشکی و مهندسی پزشکی.",
        type: "website",
        images: [
            {
                url: "/assets/logo/negints-logo.png",
                width: 512,
                height: 512,
                alt: "NeginTS Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "نگین تجهیز سپهر (NeginTS)",
        description: "ارائه دهنده تجهیزات نوین پزشکی و مهندسی.",
        images: ["/assets/logo/negints-logo.png"],
    },
    alternates: {
        canonical: "/",
    },
};

export const dynamic = "force-dynamic";

const processSteps = [
    {
        subtitle: "ارتباط با ما",
        title: "مشاوره و نیازسنجی",
        description:
            "ما با بررسی دقیق نیازهای شما، بهترین راهکارهای تجهیزات پزشکی را پیشنهاد می‌دهیم. جلسات مشاوره ما کاملاً تخصصی و رایگان است.",
    },
    {
        subtitle: "برنامه‌ریزی",
        title: "انتخاب و مشخصات محصول",
        description:
            "بررسی فنی دقیق محصولات و تطبیق آن‌ها با استانداردهای بین‌المللی و نیازهای خاص مرکز درمانی شما.",
    },
    {
        subtitle: "تامین کالا",
        title: "تامین و مهندسی",
        description:
            "فرآیند تامین از برترین برندهای جهانی با تضمین اصالت و کیفیت، همراه با نظارت تیم مهندسی پزشکی.",
    },
    {
        subtitle: "اجرا و تحویل",
        title: "تحویل و نصب",
        description:
            "ارسال ایمن و نصب تخصصی تجهیزات در محل شما توسط تیم مجرب نگین تجهیز سپهر.",
    },
    {
        subtitle: "آموزش",
        title: "آموزش و راه‌اندازی",
        description:
            "برگزاری جلسات آموزشی برای پرسنل جهت استفاده بهینه و ایمن از دستگاه‌ها و تجهیزات.",
    },
    {
        subtitle: "همراه شما",
        title: "خدمات پس از فروش",
        description:
            "پشتیبانی فنی مداوم، تامین قطعات و سرویس‌های دوره‌ای جهت تضمین عملکرد بلندمدت تجهیزات.",
    },
];

const faqItems = [
    {
        question: "آیا محصولات نگین تجهیز سپهر دارای گارانتی هستند؟",
        answer: "بله، تمام تجهیزات ارائه شده توسط نگین تجهیز سپهر دارای گارانتی معتبر و خدمات پس از فروش ده‌ساله می‌باشند.",
    },
    {
        question: "نحوه ثبت سفارش عمده برای سازمان‌ها چگونه است؟",
        answer: "سازمان‌ها و مراکز درمانی می‌توانند از طریق تماس مستقیم با واحد فروش و یا بخش ارتباط با ما در وب‌سایت، درخواست استعلام قیمت و ثبت سفارش عمده نمایند.",
    },
    {
        question: "زمان تحویل تجهیزات معمولاً چقدر است؟",
        answer: "زمان تحویل بسته به نوع محصول و موجودی انبار متفاوت است. محصولات موجود در انبار ظرف ۴۸ تا ۷۲ ساعت تحویل می‌شوند.",
    },
    {
        question: "آیا امکان مشاوره حضوری برای تجهیز کلینیک وجود دارد؟",
        answer: "بله، تیم مهندسی پزشکی ما آماده بازدید حضوری از محل شما و ارائه طرح جامع تجهیز کلینیک و مرکز درمانی است.",
    },
    {
        question: "خدمات کالیبراسیون تجهیزات نیز ارائه می‌شود؟",
        answer: "بله، ما با همکاری آزمایشگاه‌های مرجع، خدمات کالیبراسیون و بررسی دوره‌ای صحت عملکرد دستگاه‌ها را ارائه می‌دهیم.",
    },
];

export default function HomePage() {
    
    // JSON-LD Schemas
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "نگین تجهیز سپهر",
        "url": "https://negints.com",

        "logo": "https://negints.com/assets/favicon/android-chrome-512x512.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "۰۲۱-۶۵۰۲۳۹۸۰",
            "contactType": "customer service",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "خیابان آزادی، نبش جمالزاده جنوبی، پلاک ۷۲، برج آفتاب، طبقه ۱۴، واحد ۱۱",
                "addressLocality": "تهران",
                "addressCountry": "IR"
            }
        }
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "NeginTS",
        "url": "https://negints.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://negints.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "خانه",
            "item": {
                "@type": "WebPage",
                "@id": "https://negints.com",
                "name": "نگین تجهیز سپهر"
            }
        }]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <div className="page home-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Hero />
            <AboutSection />
            <Services />
            <WhyNegin />
            <FeaturedProducts />
            <ProcessTimeline steps={processSteps} />

            <MedicalBrands />
            <FAQAccordion items={faqItems} />

            <GlobalCTA />
        </div>
    );
}

