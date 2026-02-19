import DeployHero from "@/components/website/deploy/DeployHero";
import DeployTargetClients from "@/components/website/deploy/DeployTargetClients";
import DeployServices from "@/components/website/deploy/DeployServices";
import DeployProcess from "@/components/website/deploy/DeployProcess";
import DeployDeliverables from "@/components/website/deploy/DeployDeliverables";
import DeployPricing from "@/components/website/deploy/DeployPricing";
import DeployTechStack from "@/components/website/deploy/DeployTechStack";
import DeployWhyNegin from "@/components/website/deploy/DeployWhyNegin";
import DeployBundleBanner from "@/components/website/deploy/DeployBundleBanner";
import DeployFAQ from "@/components/website/deploy/DeployFAQ";
import GlobalCTA from "@/components/website/shared/GlobalCTA";

export const metadata = {
    title: "Deployment Services | NeginTS",
    description:
        "Launch your web application with confidence. Enterprise-grade cloud infrastructure, CI/CD automation, and zero-downtime deployments.",
    alternates: {
        canonical: "/services/deploy",
    },
    openGraph: {
        title: "Seamless Web Deployment Services | NeginTS",
        description: "Launch with confidence using our enterprise-grade cloud infrastructure and automation services.",
        url: "/services/deploy",
        type: "website",
    },
};

export default function DeployServicePage() {
    
    // Deploy FAQ Data (Duplicated for SEO Schema)
    const faqItems = [
        {
            question: "Do I own the AWS/Cloud account?",
            answer: "Yes, absolutely. We create the accounts in your name (or your company's name) and hand over full administrative access. You pay the cloud providers directly, ensuring you have total control and ownership of your infrastructure.",
        },
        {
            question: "Can you migrate my existing app from Heroku/Shared Hosting?",
            answer: "Yes. We specialize in migrating legacy or PaaS-hosted applications to robust cloud environments like AWS or DigitalOcean, often resulting in better performance and lower monthly costs.",
        },
        {
            question: "What happens if the server goes down?",
            answer: "For our 'Enterprise' setups, we build self-healing clusters that auto-restart failed services. We also set up monitoring alerts. If you need ongoing 24/7 response teams, check out our 'Maintain' service packages.",
        },
        {
            question: "How long does it take to deploy?",
            answer: "Simple setups (Next.js/Vercel) can be done in 1-2 days. Complex custom cloud architectures with Kubernetes and CI/CD pipelines typically take 1-2 weeks to architect, build, and test thoroughly.",
        },
    ];

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Seamless Web Deployment",
        "provider": {
            "@type": "Organization",
            "name": "NeginTS",
            "url": "https://negints.com",
            "logo": "https://negints.com/assets/logo/negints-logo.png"
        },
        "description":
            "Launch your web application with confidence. Enterprise-grade cloud infrastructure, CI/CD automation, and zero-downtime deployments.",
        "serviceType": "Cloud Deployment",
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
                "name": "Deployment Services",
                "item": "https://negints.com/services/deploy"
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
        <div className="page deploy-page">
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
            <DeployHero />
            <DeployTargetClients />
            <DeployServices />
            <DeployProcess />
            <DeployDeliverables />
            <DeployTechStack />
            <DeployPricing />
            <DeployWhyNegin />
            <DeployBundleBanner />
            <DeployFAQ />
            <GlobalCTA
                title="Ready for Liftoff?"
                description="Don't let infrastructure headaches hold you back. Let's build a scalable foundation that grows with your business."
                primaryButtonLabel="Book Infrastructure Audit"
                secondaryButtonLabel="Email Requirements"
            />
        </div>
    );
}
