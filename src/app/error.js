"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

/**
 * Root error boundary - catches all unhandled errors
 * Provides user-friendly error message with recovery options
 */
export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log error to console in development
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html dir="rtl">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
                    <Card className="max-w-md w-full text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-xl mb-2 overflow-hidden shadow-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--color-primary)" }}
                            >
                                <Image
                                    src="/assets/logo/negints-logo.png"
                                    alt="NeginTS"
                                    width={48}
                                    height={48}
                                    className="w-10 h-10 object-contain"
                                />
                            </div>
                            {/* Error Icon */}
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>

                            {/* Error Message */}
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                                    مشکلی پیش آمده است
                                </h1>
                                <p className="text-[var(--color-text-secondary)] mb-1">
                                    با عرض پوزش، خطایی غیرمنتظره رخ داده است. این مشکل ثبت شده و ما در حال بررسی آن هستیم.
                                </p>
                                {process.env.NODE_ENV === "development" && error.message && (
                                    <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/10 p-3 rounded" dir="ltr">
                                        {error.message}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="secondary"
                                    onClick={() => (window.location.href = "/")}
                                    className="flex-1"
                                >
                                    <Home className="w-4 h-4 ml-2" />
                                    بازگشت به خانه
                                </Button>
                                <Button variant="primary" onClick={reset} className="flex-1">
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    تلاش مجدد
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </body>
        </html>
    );
}
