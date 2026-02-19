"use client";

import dynamic from "next/dynamic";

/**
 * LazyAIBot - A client-side wrapper to lazy load the AI Assistant
 * This prevents the bot from being included in the initial SSR payload
 * and defers its loading to improve page performance.
 */
const AIFloatingButton = dynamic(() => import("./AIFloatingButton"), {
    ssr: false,
});

export default function LazyAIBot() {
    return <AIFloatingButton />;
}
