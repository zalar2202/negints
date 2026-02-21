import ContactHero from "@/components/website/contact/ContactHero";
import ContactInfo from "@/components/website/contact/ContactInfo";
import ContactForm from "@/components/website/contact/ContactForm";
import ContactMap from "@/components/website/contact/ContactMap";

export const metadata = {
    title: "تماس با ما | نگین تجهیز سپهر (NeginTS)",
    description:
        "با نگین تجهیز سپهر تماس بگیرید. مشاوره رایگان تجهیزات پزشکی، کیت‌های تخصصی و خدمات مهندسی پزشکی. تلفن: ۰۲۱-۶۵۰۲۳۹۸۰",
    alternates: {
        canonical: "/contact-us",
    },
    openGraph: {
        title: "تماس با ما | نگین تجهیز سپهر",
        description:
            "راه‌های ارتباط با نگین تجهیز سپهر - مشاوره رایگان تجهیزات پزشکی و مهندسی پزشکی.",
        url: "/contact-us",
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
        card: "summary",
        title: "تماس با ما | نگین تجهیز سپهر",
        description:
            "با ما در تماس باشید - تلفن: ۰۲۱-۶۵۰۲۳۹۸۰",
        images: ["/assets/logo/negints-logo.png"],
    },
};

export default function ContactUsPage() {
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "نگین تجهیز سپهر",
        alternateName: "NeginTS",
        url: "https://negints.com",
        logo: "https://negints.com/assets/logo/negints-logo.png",
        image: "https://negints.com/assets/logo/negints-logo.png",
        telephone: ["+982165023980", "+989901267108", "+989214043919", "+989127073557"],
        email: "info@negints.com",
        address: {
            "@type": "PostalAddress",
            streetAddress: "خیابان آزادی، نبش جمالزاده جنوبی، پلاک ۷۲، برج آفتاب، طبقه ۱۴، واحد ۱۱",
            addressLocality: "تهران",
            addressCountry: "IR",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: "35.6998",
            longitude: "51.3884",
        },
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
                "Saturday",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
            ],
            opens: "09:00",
            closes: "17:00",
        },
        priceRange: "$$",
        sameAs: [],
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "خانه",
                item: "https://negints.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "تماس با ما",
                item: "https://negints.com/contact-us",
            },
        ],
    };

    const contactPointSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "نگین تجهیز سپهر",
        url: "https://negints.com",
        contactPoint: [
            {
                "@type": "ContactPoint",
                telephone: "+982165023980",
                contactType: "customer service",
                areaServed: "IR",
                availableLanguage: ["Persian", "English"],
            },
            {
                "@type": "ContactPoint",
                telephone: "+989901267108",
                contactType: "sales",
                areaServed: "IR",
                availableLanguage: ["Persian", "English"],
            },
        ],
    };

    return (
        <div className="page contact-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(contactPointSchema),
                }}
            />
            <ContactHero />
            <ContactInfo />
            <ContactMap />
            <ContactForm />
        </div>
    );
}
