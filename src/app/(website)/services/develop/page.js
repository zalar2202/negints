import DevelopHero from "@/components/website/develop/DevelopHero";
import TargetClients from "@/components/website/develop/TargetClients";
import TechCapabilities from "@/components/website/develop/TechCapabilities";
import DevProcess from "@/components/website/develop/DevProcess";
import DevDeliverables from "@/components/website/develop/DevDeliverables";
import DevPricing from "@/components/website/develop/DevPricing";
import DevUseCases from "@/components/website/develop/DevUseCases";
import CodeQuality from "@/components/website/develop/CodeQuality";
import TechStack from "@/components/website/develop/TechStack";
import DevBundleBanner from "@/components/website/develop/DevBundleBanner";
import DevFAQ from "@/components/website/develop/DevFAQ";
import GlobalCTA from "@/components/website/shared/GlobalCTA";

export const metadata = {
    title: "Development Services | NeginTS",
    description:
        "Build high-performance web applications with robust, scalable, and secure code. We transform ideas into powerful digital products.",
    alternates: {
        canonical: "/services/develop",
    },
    openGraph: {
        title: "Expert Web Development Services | NeginTS",
        description: "Transform your ideas into powerful digital products with our scalable and secure development services.",
        url: "/services/develop",
        type: "website",
    },
};

export default function DevelopServicePage() {
    
    // Develop FAQ Data (Duplicated for SEO Schema)
    const faqItems = [
        {
            question: "Do I own the code?",
            answer: "100%. Once paid for, the repository and IP are yours. We don't lock you in.",
        },
        {
            question: "What tech stack do you use?",
            answer: "We primarily use the modern JavaScript stack (React, Next.js, Node.js) because it offers the best balance of performance, scalability, and community support.",
        },
        {
            question: "Do you provide hosting?",
            answer: "We set up hosting for you on your preferred accounts (e.g., Vercel, AWS), so you have full control. We don't resell hosting, so you pay the provider directly.",
        },
        {
            question: "What about maintenance?",
            answer: "We offer maintenance packages to keep libraries updated, monitor security, and fix any bugs that appear post-launch.",
        },
        {
            question: "Can you take over an existing project?",
            answer: "Yes, but we'll need to do a code audit first to assess the quality of the current codebase and see if it's viable to build upon or needs refactoring.",
        },
        {
            question: "Is the site mobile-friendly?",
            answer: "Absolutely. All our development is responsive by default, ensuring it looks perfect on phones, tablets, and desktops.",
        },
    ];

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Expert Web Development",
        "provider": {
            "@type": "Organization",
            "name": "NeginTS",
            "url": "https://negints.com",
            "logo": "https://negints.com/assets/logo/negints-logo.png"
        },
        "description":
            "Build high-performance web applications with robust, scalable, and secure code. We transform ideas into powerful digital products.",
        "serviceType": "Web Development",
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
                "name": "Development Services",
                "item": "https://negints.com/services/develop"
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
        <div className="page develop-page">
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
            <DevelopHero />
            <TargetClients />
            <TechCapabilities />
            <DevProcess />
            <DevDeliverables />
            <DevPricing />
            <DevUseCases />
            <CodeQuality />
            <TechStack />
            <DevBundleBanner />
            <DevFAQ />
            <GlobalCTA
                title="Ready to Build Your Solution?"
                description="Whether it's a new MVP or a complex platform, let's discuss the technical roadmap to make it real."
                primaryButtonLabel="Book Technical Consult"
                secondaryButtonLabel="Email Requirements"
            />
        </div>
    );
}
