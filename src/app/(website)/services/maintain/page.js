import MaintainHero from "@/components/website/maintain/MaintainHero";
import MaintainTargetClients from "@/components/website/maintain/MaintainTargetClients";
import MaintainServices from "@/components/website/maintain/MaintainServices";
import MaintainProcess from "@/components/website/maintain/MaintainProcess";
import MaintainDeliverables from "@/components/website/maintain/MaintainDeliverables";
import MaintainPricing from "@/components/website/maintain/MaintainPricing";
import MaintainWhyNegin from "@/components/website/maintain/MaintainWhyNegin";
import MaintainBundleBanner from "@/components/website/maintain/MaintainBundleBanner";
import MaintainFAQ from "@/components/website/maintain/MaintainFAQ";
import GlobalCTA from "@/components/website/shared/GlobalCTA";

export const metadata = {
    title: "Maintenance & Support Services | NeginTS",
    description:
        "Proactive website maintenance, security patching, and 24/7 uptime monitoring. Keep your digital business running smoothly with NeginTS support plans.",
    alternates: {
        canonical: "/services/maintain",
    },
    openGraph: {
        title: "Proactive Website Maintenance Services | NeginTS",
        description: "Keep your digital business running smoothly with our proactive maintenance and support plans.",
        url: "/services/maintain",
        type: "website",
    },
};

export default function MaintainServicePage() {
    
    // Maintain FAQ Data (Duplicated for SEO Schema)
    const faqItems = [
        {
            question: "What happens if my site is hacked or goes down?",
            answer: "Our monitoring systems alert us immediately. For hacked sites, we perform a clean restoration from our most recent secure backup and harden the entry point. This is included in all our plans.",
        },
        {
            question: "Do you support sites that NeginTS didn't build?",
            answer: "Yes. We can manage and maintain sites built by other teams. We'll start with a security and compatibility audit to ensure your current setup can be supported efficiently.",
        },
        {
            question: "What constitutes a 'small fix' or 'dev time'?",
            answer: "Dev time can be used for CSS tweaks, changing text/images, adding a small feature, or investigating a specific bug. If a request exceeds your plan's hours, we'll provide a transparent quote before starting.",
        },
        {
            question: "How do I communicate with the support team?",
            answer: "Essential plan users use our email ticketing system. Professional and Enterprise users get access to a private Slack channel for real-time collaboration with our engineers.",
        },
    ];

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Website Maintenance & Support",
        "provider": {
            "@type": "Organization",
            "name": "NeginTS",
            "url": "https://negints.com",
            "logo": "https://negints.com/assets/logo/negints-logo.png"
        },
        "description":
            "Proactive website maintenance, security patching, and 24/7 uptime monitoring. Keep your digital business running smoothly with NeginTS support plans.",
        "serviceType": "Website Maintenance",
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
                "name": "Maintenance Services",
                "item": "https://negints.com/services/maintain"
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
        <div className="page maintain-page">
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
            <MaintainHero />
            <MaintainTargetClients />
            <MaintainServices />
            <MaintainProcess />
            <MaintainDeliverables />
            <MaintainPricing />
            <MaintainWhyNegin />
            <MaintainBundleBanner />
            <MaintainFAQ />
            <GlobalCTA
                title="Sleep Soundly. We've Got Your Back."
                description="Join the businesses that trust NeginTS to protect and grow their online presence. Choose a plan or schedule a free site audit today."
                primaryButtonLabel="Choose a Maintenance Plan"
                secondaryButtonLabel="Get a Free Site Audit"
            />
        </div>
    );
}
