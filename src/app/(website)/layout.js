import "@/styles/website.css";
import WebsiteHeader from "@/components/website/layout/WebsiteHeader";
import WebsiteFooter from "@/components/website/layout/WebsiteFooter";
import LazyAIBot from "@/components/website/shared/LazyAIBot";

export default function WebsiteLayout({ children }) {
    return (
        <div className="website-layout">
            <WebsiteHeader />
            <main className="main-content">{children}</main>
            <WebsiteFooter />
            <LazyAIBot />
        </div>
    );
}
