"use client";

import { useTheme } from "@/contexts/ThemeContext";

/**
 * WebsiteThemeToggle - 3-mode theme toggle (System/Light/Dark) using CSS classes and text symbols
 */
export default function WebsiteThemeToggle() {
    const { theme, setTheme, resolvedTheme, mounted } = useTheme();

    if (!mounted) {
        return (
            <button className="theme-toggle" aria-label="Toggle theme" disabled>
                <span className="theme-toggle-icon">◐</span>
            </button>
        );
    }

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme("light");
        } else if (theme === "light") {
            setTheme("dark");
        } else {
            setTheme("system");
        }
    };

    const getIcon = () => {
        if (theme === "system") {
            return "◐";
        }
        return resolvedTheme === "dark" ? "☀" : "☾";
    };

    const getLabel = () => {
        if (theme === "system") {
            return `System (${resolvedTheme})`;
        }
        return theme === "dark" ? "Dark mode" : "Light mode";
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Current: ${getLabel()}. Click to change.`}
            title={getLabel()}
        >
            <span className="theme-toggle-icon">{getIcon()}</span>
        </button>
    );
}
