"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Calendar, ShieldCheck, Zap } from "lucide-react";

/**
 * SmartCTA - A button that intelligently redirects based on auth status
 * @param {string} label - Button text
 * @param {string} guestHref - Href for non-logged in users (defaults to login)
 * @param {string} userHref - Href for logged in users (defaults to ticket creation)
 * @param {string} variant - 'primary' or 'secondary'
 * @param {any} icon - Optional icon name from lucide
 */
export default function SmartCTA({ 
    label, 
    guestHref = "/login", 
    userHref = "/panel/tickets/new", 
    className = "",
    icon = null,
    ...props
}) {
    const { user } = useAuth();
    
    // Default icons based on common labels if none provided
    const getIcon = () => {
        if (icon) return icon;
        const lowLabel = label.toLowerCase();
        
        // English keywords
        if (lowLabel.includes("talk") || lowLabel.includes("connect") || lowLabel.includes("contact")) 
            return <MessageSquare className="w-4 h-4 ml-2" />;
        if (lowLabel.includes("audit") || lowLabel.includes("review")) 
            return <ShieldCheck className="w-4 h-4 ml-2" />;
        if (lowLabel.includes("schedule") || lowLabel.includes("book")) 
            return <Calendar className="w-4 h-4 ml-2" />;
        if (lowLabel.includes("start") || lowLabel.includes("launch")) 
            return <Zap className="w-4 h-4 ml-2" />;

        // Persian keywords
        if (lowLabel.includes("گفتگو") || lowLabel.includes("تماس") || lowLabel.includes("ارتباط") || lowLabel.includes("مشاوره")) 
            return <MessageSquare className="w-4 h-4 ml-2" />;
        if (lowLabel.includes("بررسی") || lowLabel.includes("ارزیابی") || lowLabel.includes("حسابرسی")) 
            return <ShieldCheck className="w-4 h-4 ml-2" />;
        if (lowLabel.includes("رزرو") || lowLabel.includes("زمان") || lowLabel.includes("جلسه")) 
            return <Calendar className="w-4 h-4 ml-2" />;
        if (lowLabel.includes("شروع") || lowLabel.includes("آغاز") || lowLabel.includes("راه‌اندازی")) 
            return <Zap className="w-4 h-4 ml-2" />;
            
        return null;
    };

    const finalHref = user ? userHref : guestHref;

    return (
        <Link href={finalHref} className={className} {...props}>
            {getIcon()}
            {label}
        </Link>
    );
}
