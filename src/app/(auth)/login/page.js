"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { InputField } from "@/components/forms/InputField";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, loginInitialValues } from "@/schemas/auth.schema";
import { LogIn, Shield, AlertCircle, ArrowRight, Rocket, LayoutDashboard, Database } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Captcha } from "@/components/forms/Captcha";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);
    const [captchaError, setCaptchaError] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get("error");
        if (errorParam) {
            setError(errorParam);
            toast.error(errorParam);
        }
    }, []);

    const handleSubmit = async (values, { setSubmitting }) => {
        setError("");
        setCaptchaError("");

        if (!isCaptchaSolved) {
            setCaptchaError("لطفاً تست امنیتی را به درستی انجام دهید.");
            setSubmitting(false);
            return;
        }

        try {
            const result = await login(values.email, values.password);

            if (result.success) {
                toast.success("خوش آمدید! ورود با موفقیت انجام شد.");

                const redirectPath = sessionStorage.getItem("redirect_after_login");

                if (redirectPath) {
                    sessionStorage.removeItem("redirect_after_login");
                    router.push(redirectPath);
                } else {
                    router.push("/panel/dashboard");
                }
            } else {
                setError(result.message || "ورود ناموفق بود. لطفاً دوباره تلاش کنید.");
                toast.error(result.message || "ورود ناموفق");
            }
        } catch (err) {
            setError("یک خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.");
            toast.error("خطای غیرمنتظره");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
                {/* Left Side - Branding (Desktop Only) */}
                <div className="hidden md:block pt-12">
                    <div className="text-right">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 overflow-hidden shadow-xl p-2 bg-[var(--color-background-elevated)] border border-[var(--color-border)] animate-fade-in"
                        >
                            <Image
                                src="/assets/logo/negints-logo.png"
                                alt="NeginTS"
                                width={64}
                                height={64}
                                className="w-16 h-16 object-contain"
                            />
                        </div>

                        <h1
                            className="text-4xl lg:text-5xl font-black mb-6 leading-tight animate-fade-in-up"
                            style={{ color: "var(--color-primary)" }}
                        >
                            پنل مدیریت نگین تجهیز سپهر
                        </h1>

                        <p
                            className="text-xl mb-10 leading-relaxed font-medium animate-fade-in-up delay-100"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            دسترسی امن به سامانه مدیریت محصولات و خدمات مهندسی پزشکی. 
                            وارد حساب کاربری خود شوید تا فعالیت‌هایتان را مدیریت کنید.
                        </p>

                        <div className="space-y-8 animate-fade-in-up delay-200">
                            {[
                                { 
                                    icon: <Shield className="text-[var(--color-primary)]" size={28} />, 
                                    title: "امنیت بالا", 
                                    desc: "محافظت کامل از داده‌ها با پروتکل‌های نوین و رمزنگاری پیشرفته" 
                                },
                                { 
                                    icon: <Rocket className="text-[var(--color-primary)]" size={28} />, 
                                    title: "سرعت و کارایی", 
                                    desc: "تجربه کاربری روان و بهینه شده برای مدیریت سریع فرآیندها" 
                                },
                                {
                                    icon: <Database className="text-[var(--color-primary)]" size={28} />,
                                    title: "مدیریت یکپارچه و دقیق",
                                    desc: "نظارت هوشمند بر تمامی فرآیندهای تامین و توزیع تجهیزات",
                                },
                            ].map((feature, index) => (
                                <div key={index} className="flex items-start gap-5 group">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-background-elevated)] flex-shrink-0 flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-primary)] group-hover:shadow-md transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <div className="pt-1">
                                        <p
                                            className="font-bold text-xl mb-1"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {feature.title}
                                        </p>
                                        <p
                                            className="text-base"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <Card className="w-full relative overflow-hidden">
                    <div className="p-8">
                        {/* Homepage Button */}
                        <Link
                            href="/"
                            className="absolute top-6 left-8 flex items-center gap-1 text-sm font-bold transition-colors hover:opacity-80"
                            style={{ color: "var(--color-primary)" }}
                        >
                            بازگشت به سایت
                            <ArrowRight size={18} />
                        </Link>

                        {/* Mobile Logo */}
                        <div className="md:hidden text-center mb-8 pt-4">
                            <div
                                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden shadow-lg mx-auto p-2"
                                style={{ backgroundColor: "var(--color-background-elevated)" }}
                            >
                                <Image
                                    src="/assets/logo/negints-logo.png"
                                    alt="NeginTS"
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <h2
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-primary)" }}
                            >
                                مدیریت نگین تجهیز سپهر
                            </h2>
                        </div>

                        <h2
                            className="text-2xl font-bold mb-2 hidden md:block"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            خوش آمدید
                        </h2>

                        <p
                            className="mb-8 hidden md:block font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            وارد حساب کاربری خود شوید
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div
                                className="mb-8 p-4 rounded-xl flex items-start gap-3"
                                style={{
                                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                                    borderRight: "4px solid var(--color-error)",
                                }}
                            >
                                <AlertCircle
                                    size={20}
                                    style={{ color: "var(--color-error)" }}
                                    className="flex-shrink-0 mt-0.5"
                                />
                                <p className="text-sm font-bold" style={{ color: "var(--color-error)" }}>
                                    {error}
                                </p>
                            </div>
                        )}

                        <Formik
                            initialValues={loginInitialValues}
                            validationSchema={loginSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form className="space-y-5">
                                    <InputField
                                        name="email"
                                        type="email"
                                        label="نشانی ایمیل"
                                        placeholder="user@negints.com"
                                        autoComplete="email"
                                    />

                                    <InputField
                                        name="password"
                                        type="password"
                                        label="رمز عبور"
                                        placeholder="رمز عبور خود را وارد کنید"
                                        autoComplete="current-password"
                                    />

                                    <div className="py-2">
                                        <Captcha
                                            error={captchaError}
                                            onVerify={(solved) => {
                                                setIsCaptchaSolved(solved);
                                                if (solved) setCaptchaError("");
                                            }}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                        fullWidth
                                        size="lg"
                                        className="negints-btn"
                                    >
                                        {!isSubmitting && <LogIn className="ml-2" size={20} />}
                                        {isSubmitting ? "در حال ورود..." : "ورود به سیستم"}
                                    </Button>
                                </Form>
                            )}
                        </Formik>

                        {/* Divider */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="h-px flex-1 bg-[var(--color-border)]"></div>
                            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                                یا
                            </span>
                            <div className="h-px flex-1 bg-[var(--color-border)]"></div>
                        </div>

                        {/* Google Login Button */}
                        <Button
                            variant="secondary"
                            fullWidth
                            size="lg"
                            className="bg-white border-2 border-gray-100 hover:border-[var(--color-primary)] hover:bg-gray-50 flex items-center justify-center gap-3 py-4 transition-all"
                            onClick={() => (window.location.href = "/api/auth/google")}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M23.5 12.235c0-.822-.066-1.644-.206-2.441H12v4.628h6.456a5.57 5.57 0 0 1-2.407 3.65v3.016h3.882c2.269-2.087 3.569-5.161 3.569-8.853z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 24c3.24 0 5.957-1.071 7.942-2.912l-3.882-3.016c-1.077.729-2.464 1.156-4.06 1.156-3.114 0-5.751-2.099-6.696-4.918H1.423v3.111C3.401 21.365 7.426 24 12 24z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.304 14.31a7.197 7.197 0 0 1 0-4.619V6.58H1.423a12.003 12.003 0 0 0 0 10.84l3.881-3.11z"
                                    fill="#FBBC04"
                                />
                                <path
                                    d="M12 4.75c1.763 0 3.344.604 4.588 1.789l3.447-3.447C17.952 1.189 15.234 0 12 0 7.426 0 3.401 2.635 1.423 6.58L5.304 9.69C6.249 6.871 8.886 4.75 12 4.75z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-gray-700 font-bold">ورود با حساب گوگل</span>
                        </Button>

                        <div className="mt-8 text-center">
                            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                هنوز ثبت‌نام نکرده‌اید؟{" "}
                                <Link
                                    href="/signup"
                                    className="font-bold hover:underline"
                                    style={{ color: "var(--color-primary)" }}
                                >
                                    ساخت حساب کاربری
                                </Link>
                            </p>
                        </div>

                        {/* Security Note */}
                        <div className="mt-8 text-center pt-6 border-t border-gray-50">
                            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                                🔒 سامانه مجهز به سیستم امنیتی هماهنگ با مرورگر است
                                <br />
                                محافظت در برابر حملات XSS و CSRF به صورت خودکار فعال می‌باشد
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

