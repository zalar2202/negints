import { Loader } from "@/components/common/Loader";
import Image from "next/image";

/**
 * Root loading UI - shown during initial navigation
 * Covers the entire viewport with a centered spinner
 */
export default function RootLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
            <div className="flex flex-col items-center">
                <div
                    className="w-20 h-20 rounded-2xl mb-6 overflow-hidden shadow-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-primary)" }}
                >
                    <Image
                        src="/assets/logo/negints-logo.png"
                        alt="NeginTS"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain"
                    />
                </div>
                <Loader size="lg" />
                <p className="mt-4 text-[var(--color-text-secondary)] font-medium">
                    Loading NeginTS...
                </p>
            </div>
        </div>
    );
}
