"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { FileQuestion, Home, ArrowRight } from "lucide-react";

/**
 * Custom 404 Not Found page
 * Shown when user navigates to a route that doesn't exist
 */
export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4" dir="rtl">
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
                    {/* 404 Icon */}
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileQuestion className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* 404 Message */}
                    <div>
                        <h1 className="text-6xl font-bold text-[var(--color-primary)] mb-2">۴۰۴</h1>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                            صفحه مورد نظر یافت نشد
                        </h2>
                        <p className="text-[var(--color-text-secondary)]">
                            صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
                        </p>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                        <Link href="/" className="flex-1">
                            <Button variant="primary" className="w-full">
                                <Home className="w-4 h-4 ml-2" />
                                بازگشت به خانه
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            onClick={() => window.history.back()}
                            className="flex-1"
                        >
                            <ArrowRight className="w-4 h-4 ml-2" />
                            بازگشت
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
