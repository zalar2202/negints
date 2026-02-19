import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Script from "next/script";
import "@/styles/tailwind.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/lib/StoreProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "sonner";

// Website fonts
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

// Re-thinking: Inter is fine as Google font or generic. 
// But Vazirmatn should be local.

const vazir = localFont({
    src: [
        {
            path: "../../public/assets/fonts/Vazirmatn-Thin.ttf",
            weight: "100",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-ExtraLight.ttf",
            weight: "200",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-Light.ttf",
            weight: "300",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-Medium.ttf",
            weight: "500",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-SemiBold.ttf",
            weight: "600",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-Bold.ttf",
            weight: "700",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-ExtraBold.ttf",
            weight: "800",
            style: "normal",
        },
        {
            path: "../../public/assets/fonts/Vazirmatn-Black.ttf",
            weight: "900",
            style: "normal",
        },
    ],
    variable: "--font-vazir",
    display: "swap",
});


// Script to prevent flash of wrong theme
const themeScript = `
(function() {
    try {
        var theme = localStorage.getItem('theme');
        var resolved = theme;
        if (!theme || theme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', resolved);
    } catch (e) {}
})();
`;

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://negints.ir"),
    title: {
        default: "نگین تجهیز سپهر | تجهیزات تخصصی پزشکی و مهندسی پزشکی",
        template: "%s | نگین تجهیز سپهر",
    },
    description: "نگین تجهیز سپهر - ارائه دهنده راهکارهای نوین در تجهیزات پزشکی و مهندسی پزشکی",
    icons: {
        icon: [
            { url: "/assets/favicon/favicon.ico" },
            { url: "/assets/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/assets/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        apple: [{ url: "/assets/favicon/apple-touch-icon.png" }],
        other: [
            {
                rel: "android-chrome-512x512",
                url: "/assets/favicon/android-chrome-512x512.png",
            },
        ],
    },
    manifest: "/assets/favicon/site.webmanifest",
    openGraph: {
        type: "website",
        locale: "fa_IR",
        url: "https://negints.ir",
        siteName: "نگین تجهیز سپهر",
        title: "نگین تجهیز سپهر | تجهیزات تخصصی پزشکی و مهندسی پزشکی",
        description: "ارائه دهنده راهکارهای نوین در تجهیزات پزشکی و مهندسی پزشکی",
        images: [
            {
                url: "/assets/logo/negints-logo.png",
                width: 512,
                height: 512,
                alt: "نگین تجهیز سپهر",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "نگین تجهیز سپهر | تجهیزات تخصصی پزشکی",
        description: "ارائه دهنده راهکارهای نوین در تجهیزات پزشکی و مهندسی پزشکی",
        images: ["/assets/logo/negints-logo.png"],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body
                className={`${inter.variable} ${vazir.variable} font-vazir antialiased`}
                suppressHydrationWarning
            >
                <Script
                    strategy="lazyOnload"
                    src="https://www.googletagmanager.com/gtag/js?id=G-EJ6FKV74BQ"
                />
                <Script
                    id="google-analytics"
                    strategy="lazyOnload"
                >
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-EJ6FKV74BQ');
                    `}
                </Script>
                <ThemeProvider>
                    <AuthProvider>
                        <StoreProvider>
                            <CartProvider>
                                <NotificationProvider>{children}</NotificationProvider>
                            </CartProvider>
                            <Toaster position="top-right" richColors />
                        </StoreProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

