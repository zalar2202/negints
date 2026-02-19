import DesignHero from "@/components/website/design/DesignHero";
import IdealFor from "@/components/website/design/IdealFor";
import ServiceBreakdown from "@/components/website/design/ServiceBreakdown";
import DesignProcess from "@/components/website/design/DesignProcess";
import Deliverables from "@/components/website/design/Deliverables";
import PricingGuidance from "@/components/website/design/PricingGuidance";
import UseCases from "@/components/website/design/UseCases";
import WhyDifferent from "@/components/website/design/WhyDifferent";
import BundleBanner from "@/components/website/design/BundleBanner";
import DesignFAQ from "@/components/website/design/DesignFAQ";
import GlobalCTA from "@/components/website/shared/GlobalCTA";

export const metadata = {
    title: "Design Services | NeginTS",
    description:
        "Strategic web design that elevates your brand, communicates your message, and converts visitors into customers. Beautiful, strategic, built for growth.",
    alternates: {
        canonical: "/services/design",
    },
    openGraph: {
        title: "Strategic Web Design Services | NeginTS",
        description: "Elevate your brand with beautiful, strategic web design built for growth and conversion.",
        url: "/services/design",
        type: "website",
    },
};

export default function DesignServicePage() {
    
    // Design FAQ Data (Duplicated for SEO Schema)
    const faqItems = [
        {
            question: "How long does design take?",
            answer: "Typically 2-4 weeks depending on scope. Simple sites can be faster; complex projects may take 4-6 weeks. We'll provide a detailed timeline during planning.",
        },
        {
            question: "What CMS do you recommend?",
            answer: "It depends on your needs. WordPress is great for content-driven sites, while custom solutions work better for unique functionality. We'll consult with you and recommend the best fit.",
        },
        {
            question: "Can I change requirements mid-project?",
            answer: "Yes, within reason. We include 2 rounds of revisions in our process. Major scope changes may affect timeline and pricing — we'll always discuss this transparently.",
        },
        {
            question: "Do you only design, or also develop?",
            answer: "We do both! Design is one of our four pillars (Design, Develop, Deploy, Maintain). You can hire us for design-only, or get the full end-to-end experience.",
        },
        {
            question: "What if I already have a brand guide?",
            answer: "Perfect! We'll work within your existing brand guidelines to ensure consistency. If you don't have one, we can help establish visual direction as part of the design process.",
        },
        {
            question: "Do you offer design-only packages?",
            answer: "Absolutely. If you have your own development team or prefer to build it yourself, we can deliver design files and specs ready for handoff.",
        },
    ];

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Strategic Web Design",
        "provider": {
            "@type": "Organization",
            "name": "NeginTS",
            "url": "https://negints.com",
            "logo": "https://negints.com/assets/logo/negints-logo.png"
        },
        "description":
            "Strategic web design that elevates your brand, communicates your message, and converts visitors into customers. Beautiful, strategic, built for growth.",
        "serviceType": "Web Design",
        "areaServed": "Global",
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://negints.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Design Services",
                "item": "https://negints.com/services/design"
            }
        ]
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
        <div className="page design-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <DesignHero />
            <IdealFor />
            <ServiceBreakdown />
            <DesignProcess />
            <Deliverables />
            <PricingGuidance />
            <UseCases />
            <WhyDifferent />
            <BundleBanner />
            <DesignFAQ />
            <GlobalCTA
                title="Ready to Design Your Site?"
                description="Let's talk about your goals and map out your digital presence. No commitment — just a conversation about what's possible."
                primaryButtonLabel="Book a Discovery Call"
                secondaryButtonLabel="Send Project Details"
            />
        </div>
    );
}
