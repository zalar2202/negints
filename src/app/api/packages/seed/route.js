import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { verifyToken } from "@/lib/jwt";
import { getAuthToken } from "@/lib/cookies";

export async function POST(request) {
    try {
        const token = await getAuthToken();
        const decoded = verifyToken(token);
        if (!["admin", "manager"].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        await connectDB();

        const seedPackages = [
            // --- WEB DESIGN & BRANDING ---
            {
                name: "Brand Identity Starter",
                category: "design",
                startingPrice: "$300",
                price: 300,
                priceRange: "$300 - $600",
                features: [
                    "Logo Design",
                    "Color Palette",
                    "Typography Selection",
                    "Brand Guidelines PDF",
                ],
                deliveryTime: "5 days",
                revisions: "2 Rounds",
                order: 1,
                badge: "Foundational",
            },
            {
                name: "UI/UX Strategy & Wireframing",
                category: "design",
                startingPrice: "$450",
                price: 450,
                priceRange: "$450 – $900",
                features: [
                    "User Research",
                    "Information Architecture",
                    "Interactive Wireframes",
                    "UX Audit Report",
                ],
                deliveryTime: "1 week",
                revisions: "2 Rounds",
                order: 2,
            },
            {
                name: "Premium Web Design (Figma)",
                category: "design",
                startingPrice: "$1,200",
                price: 1200,
                priceRange: "$1,200 – $2,800",
                features: [
                    "High-Fidelity Design",
                    "Custom Icons & Illustrations",
                    "Mobile-First Layouts",
                    "Source Figma Files",
                ],
                deliveryTime: "2 weeks",
                revisions: "3 Rounds",
                order: 3,
                badge: "Client Favorite",
            },
            {
                name: "E-commerce Interface Design",
                category: "design",
                startingPrice: "$2,000",
                price: 2000,
                priceRange: "$2,000 – $4,500",
                features: [
                    "Conversion-Optimized UX",
                    "Product Page Layouts",
                    "Checkout Flow Design",
                    "Cart Interaction UX",
                ],
                deliveryTime: "3 weeks",
                revisions: "3 Rounds",
                order: 4,
            },

            // --- WEB DEVELOPMENT ---
            {
                name: "Single Page / Landing Page",
                category: "development",
                startingPrice: "$950",
                price: 950,
                priceRange: "$950 – $1,800",
                features: [
                    "Next.js/React Build",
                    "A+ Performance Score",
                    "SEO Foundation",
                    "Analytics Integration",
                ],
                deliveryTime: "1 week",
                revisions: "2 Rounds",
                order: 5,
                badge: "Speedy Launch",
            },
            {
                name: "Business Website (CMS Integration)",
                category: "development",
                startingPrice: "$2,800",
                price: 2800,
                priceRange: "$2,800 – $5,500",
                features: [
                    "Headless CMS (Sanity/Strapi)",
                    "Dynamic Blog/News Section",
                    "Custom Multi-step Forms",
                    "Internal Search Engine",
                ],
                deliveryTime: "4 weeks",
                revisions: "3 Rounds",
                order: 6,
            },
            {
                name: "Custom Web App (MVP)",
                category: "development",
                startingPrice: "$6,500",
                price: 6500,
                priceRange: "$6,500 – $15,000+",
                features: [
                    "User Dashboard / Auth",
                    "Stripe API Integration",
                    "Real-time Notifications",
                    "Database Architecture",
                ],
                deliveryTime: "2-3 months",
                revisions: "Iterative",
                order: 7,
                badge: "Enterprise",
            },

            // --- WEB HOSTING & CLOUD ---
            {
                name: "Managed Cloud Hosting (Starter)",
                category: "hosting",
                startingPrice: "$25",
                price: 25,
                priceRange: "per month",
                features: [
                    "Shared Cloud Resources",
                    "Daily Auto-Backups",
                    "Free SSL Certificate",
                    "DDoS Protection",
                ],
                deliveryTime: "Instant",
                revisions: "N/A",
                order: 8,
            },
            {
                name: "Professional VPS Hosting",
                category: "hosting",
                startingPrice: "$75",
                price: 75,
                priceRange: "per month",
                features: [
                    "Dedicated CPU & RAM",
                    "Full Server Management",
                    "CDN Integration",
                    "Priority Support",
                ],
                deliveryTime: "24 Hours",
                revisions: "N/A",
                order: 9,
                badge: "Popular",
            },
            {
                name: "Dedicated Cluster / High Availability",
                category: "hosting",
                startingPrice: "$350",
                price: 350,
                priceRange: "per month",
                features: [
                    "Load Balancing",
                    "Multi-region Failover",
                    "99.99% Uptime SLA",
                    "24/7 Monitoring",
                ],
                deliveryTime: "3-5 Days",
                revisions: "N/A",
                order: 10,
            },

            // --- MAINTENANCE & SUPPORT ---
            {
                name: "Essential Security & Speed",
                category: "maintenance",
                startingPrice: "$120",
                price: 120,
                priceRange: "per month",
                features: [
                    "Malware Scanning",
                    "Database Optimization",
                    "Core/Plugin Updates",
                    "Minor CSS Fixes",
                ],
                deliveryTime: "Monthly",
                revisions: "N/A",
                order: 11,
            },
            {
                name: "Ultimate Growth Maintenance",
                category: "maintenance",
                startingPrice: "$450",
                price: 450,
                priceRange: "per month",
                features: [
                    "5 Dev Hours / Month",
                    "Uptime Monitoring",
                    "Monthly Traffic Reports",
                    "Conversion Optimization",
                ],
                deliveryTime: "Monthly",
                revisions: "N/A",
                order: 12,
                badge: "Partner Tier",
            },

            // --- SEO & PERFORMANCE ---
            {
                name: "One-time Speed Optimization",
                category: "seo",
                startingPrice: "$250",
                price: 250,
                priceRange: "Fix per site",
                features: [
                    "Image Compression",
                    "Code Minification",
                    "Lighthouse Score 90+",
                    "Cache Configuration",
                ],
                deliveryTime: "3 days",
                revisions: "1 Round",
                order: 13,
            },
            {
                name: "Monthly SEO Authority",
                category: "seo",
                startingPrice: "$800",
                price: 800,
                priceRange: "per month",
                features: [
                    "Keyword Strategy",
                    "GMB Management",
                    "High-Quality Backlinks",
                    "Technical SEO Audits",
                ],
                deliveryTime: "Ongoing",
                revisions: "Monthly Info",
                order: 14,
                badge: "Growth Focus",
            },

            // --- MARKETING & CONTENT ---
            {
                name: "Content Writing (4 Posts/mo)",
                category: "marketing",
                startingPrice: "$400",
                price: 400,
                priceRange: "per month",
                features: [
                    "SEO Content Research",
                    "1500+ Words per Post",
                    "Meta Description Prep",
                    "Royalty-free Images",
                ],
                deliveryTime: "Weekly",
                revisions: "2 Rounds",
                order: 15,
            },
            {
                name: "Social Media Automation",
                category: "marketing",
                startingPrice: "$1,500",
                price: 1500,
                priceRange: "per month",
                features: [
                    "Ad Campaign Management",
                    "Multi-platform Hub",
                    "Brand Voice Alignment",
                    "Performance Tracking",
                ],
                deliveryTime: "Monthly",
                revisions: "Iterative",
                order: 16,
            },
        ];

        // Seed Packages
        await Package.deleteMany({});
        await Package.insertMany(seedPackages);

        // Seed sample promotions
        const Promotion = (await import("@/models/Promotion")).default;
        await Promotion.deleteMany({});
        await Promotion.insertMany([
            {
                title: "Grand Launch Offer",
                description: "Get 20% off your first month of any maintenance or hosting plan.",
                discountCode: "NEGIN2026",
                discountAmount: "20% OFF",
                isActive: true,
                startDate: new Date(),
                endDate: new Date("2026-06-30"),
            },
            {
                title: "SEO + Content Bundle",
                description: "Book SEO Authority and Content Writing together to save $150/month.",
                isActive: true,
            },
        ]);

        return NextResponse.json({
            success: true,
            message: "All NeginTS products seeded and ready!",
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
