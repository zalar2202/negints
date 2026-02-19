"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { RichEditor } from "@/components/forms/RichEditor";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Mail, Send, Users, Sparkles, Tag, Gift, Eye } from "lucide-react";
import Image from "next/image";
import * as Yup from "yup";

// Schema for email campaign
const emailCampaignSchema = Yup.object().shape({
    recipientType: Yup.string().required("نوع دریافت‌کننده الزامی است"),
    recipients: Yup.mixed().when("recipientType", {
        is: (val) => val === "role" || val === "single",
        then: () => Yup.string().required("تکمیل این فیلد الزامی است"),
        otherwise: () => Yup.mixed().notRequired(),
    }),
    subject: Yup.string().required("موضوع ایمیل الزامی است").max(150, "موضوع بسیار طولانی است"),
    preheader: Yup.string().max(100, "متن پیش‌سربرگ بسیار طولانی است"),
    headline: Yup.string().required("عنوان اصلی الزامی است"),
    content: Yup.string().required("محتوای ایمیل الزامی است"),
    ctaText: Yup.string(),
    ctaUrl: Yup.string().url("لطفاً یک آدرس معتبر وارد کنید"),
    templateType: Yup.string().required("نوع قالب الزامی است"),
});

/**
 * Marketing Email Page
 * Send formatted HTML emails for promotions, offers, and announcements.
 */
export default function MarketingEmailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (user && !["admin", "manager"].includes(user.role)) {
            toast.error("دسترسی غیرمجاز");
            router.push("/panel");
        }
    }, [user, router]);

    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await axios.get("/api/users?limit=1000");
                setUsers(response.data.data || []);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, []);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = {
                ...values,
                email: true, // Force email
                type: "marketing", // Special type for formatting
                message: values.content, // Map content to message
                title: values.subject, // Map subject to title
                actionLabel: values.ctaText,
                actionUrl: values.ctaUrl,
            };

            await axios.post("/api/notifications", payload);

            toast.success("کمپین بازاریابی با موفقیت ارسال شد!", {
                description: "ایمیل‌ها در صف ارسال قرار گرفتند.",
            });
            resetForm();
        } catch (error) {
            console.error("Marketing send error:", error);
            toast.error(error.response?.data?.error || "خطا در ارسال کمپین");
        } finally {
            setSubmitting(false);
        }
    };

    const templates = [
        {
            id: "offer",
            name: "پیشنهاد ویژه",
            icon: <Tag className="w-4 h-4" />,
            desc: "اعلام تخفیف یا فروش ویژه",
        },
        {
            id: "newsletter",
            name: "خبرنامه",
            icon: <Mail className="w-4 h-4" />,
            desc: "اخبار عمومی و به‌روزرسانی‌ها",
        },
        {
            id: "product",
            name: "معرفی محصول",
            icon: <Sparkles className="w-4 h-4" />,
            desc: "ویژگی یا محصول جدید",
        },
        {
            id: "gift",
            name: "هدیه / مناسبتی",
            icon: <Gift className="w-4 h-4" />,
            desc: "تبریک‌های مناسبتی و هدایا",
        },
    ];

    return (
        <ContentWrapper>
            <div className="mb-8 text-right" style={{ direction: 'rtl' }}>
                <h1
                    className="text-2xl font-bold flex items-center justify-end gap-2"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    بازاریابی ایمیلی
                    <Mail className="w-6 h-6 text-purple-600" />
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    ارسال ایمیل‌های تبلیغاتی زیبا و برندینگ شده به مشتریان شما.
                </p>
            </div>

            <Formik
                initialValues={{
                    recipientType: "all",
                    recipients: "",
                    subject: "",
                    preheader: "",
                    headline: "!خبرهای بزرگ در راه است",
                    content: "",
                    ctaText: "بیشتر بدانید",
                    ctaUrl: "https://negints.com",
                    templateType: "offer",
                }}
                validationSchema={emailCampaignSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form style={{ direction: 'rtl' }}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Editor Column */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <div className="space-y-6">
                                        {/* Audience Section */}
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-right">
                                            <h3 className="font-semibold mb-4 flex items-center justify-end gap-2 text-sm text-gray-500 uppercase tracking-wider">
                                                تحلیل مخاطبان
                                                <Users className="w-4 h-4" />
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SelectField name="recipientType" label="ارسال به">
                                                    <option value="all">همه مشترکین</option>
                                                    <option value="role">نقش کاربری خاص</option>
                                                    <option value="single">
                                                        کاربر تست (تکی)
                                                    </option>
                                                </SelectField>

                                                {values.recipientType === "role" && (
                                                    <SelectField name="recipients" label="نقش">
                                                        <option value="">انتخاب کنید...</option>
                                                        <option value="user">کاربران عادی</option>
                                                        <option value="manager">مدیران</option>
                                                    </SelectField>
                                                )}

                                                {values.recipientType === "single" && (
                                                    <SelectField name="recipients" label="کاربر">
                                                        <option value="">انتخاب کنید...</option>
                                                        {users.map((u) => (
                                                              <option key={u._id} value={u._id}>
                                                                {u.name} ({u.email})
                                                            </option>
                                                        ))}
                                                    </SelectField>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="text-right">
                                            <h3 className="font-semibold mb-4 text-sm text-gray-500 uppercase tracking-wider">
                                                محتوای کمپین
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputField
                                                        name="subject"
                                                        label="موضوع ایمیل"
                                                        placeholder="مثلاً: ۵۰٪ تخفیف برای پکیج‌های ویژه!"
                                                    />
                                                    <InputField
                                                        name="preheader"
                                                        label="متن پیش‌سربرگ (اختیاری)"
                                                        placeholder="خلاصه کوتاهی که در اینباکس دیده می‌شود..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                    {templates.map((t) => (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setFieldValue("templateType", t.id)
                                                            }
                                                            className={`p-3 rounded-lg border text-right transition-all ${
                                                                values.templateType === t.id
                                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500"
                                                                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`mb-2 flex justify-end ${values.templateType === t.id ? "text-purple-600" : "text-gray-400"}`}
                                                            >
                                                                {t.icon}
                                                            </div>
                                                            <div className="font-medium text-xs dark:text-gray-200">
                                                                {t.name}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                <InputField
                                                    name="headline"
                                                    label="عنوان اصلی"
                                                    placeholder="مثلاً: جشنواره تابستانی شروع شد"
                                                />

                                                <RichEditor
                                                    label="متن محتوا"
                                                    value={values.content}
                                                    onChange={(content) =>
                                                        setFieldValue("content", content)
                                                    }
                                                    error={undefined}
                                                    touched={undefined}
                                                    height="400px"
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                                    <InputField
                                                        name="ctaText"
                                                        label="متن دکمه"
                                                    />
                                                    <InputField name="ctaUrl" label="آدرس دکمه (URL)" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => router.push("/panel")}
                                            >
                                                انصراف
                                            </Button>
                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                icon={<Send className="w-4 h-4 ml-2" />}
                                            >
                                                ارسال کمپین
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Preview Column */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-6">
                                    <div className="flex items-center justify-between mb-4 flex-row-reverse">
                                        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            پیش‌نمایش زنده
                                            <Eye className="w-4 h-4" />
                                        </h3>
                                        <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                            به‌روزرسانی خودکار
                                        </div>
                                    </div>

                                    {/* Live Preview Component with values passed */}
                                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
                                        <PreviewCard values={values} />
                                    </div>

                                    <p className="text-xs text-center mt-3 text-gray-400">
                                        این یک پیش‌نمایش تقریبی است. نمایش نهایی ایمیل به مرورگر و سرویس گیرنده کاربر بستگی دارد.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </ContentWrapper>
    );
}

// Preview Component that processes the live values
function PreviewCard({ values }) {
    return (
        <div className="flex flex-col h-[600px]" style={{ direction: 'rtl' }}>
            {/* Fake Browser Toolbar */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex flex-row-reverse items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 mr-4 bg-white dark:bg-black/20 rounded-md py-1 px-3 text-xs text-gray-400 truncate text-right">
                    موضوع:{" "}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {values.subject || "بدون موضوع"}
                    </span>
                </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-black font-sans">
                {/* Preheader Hint */}
                {values.preheader && (
                    <div className="text-center text-xs text-gray-400 mb-2 pb-2 border-b border-dashed border-gray-200">
                        {values.preheader}
                    </div>
                )}

                <div className="max-w-sm mx-auto bg-white rounded-lg shadow-sm border overflow-hidden">
                    {/* Header Accent */}
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                    <div className="p-6 text-center">
                        {/* Logo */}
                        <div className="font-bold text-xl text-gray-900 mb-2 flex justify-center items-center gap-2">
                            NeginTS
                            <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/assets/logo/negints-logo.png"
                                    alt="NeginTS"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-4"></div>

                        {/* Template Badge */}
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-purple-100 text-purple-600">
                                {values.templateType}
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
                            {values.headline || "عنوان شما اینجا قرار می‌گیرد"}
                        </h1>

                        {/* Body Content */}
                        <div className="text-gray-600 mb-6 text-sm leading-relaxed whitespace-pre-wrap">
                            {values.content || "محتوای ایمیل در این قسمت نمایش داده می‌شود..."}
                        </div>

                        {/* CTA Button */}
                        {values.ctaText && (
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium text-sm transition-colors shadow-sm"
                            >
                                {values.ctaText}
                            </a>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
                        <p>© ۲۰۲۶ NeginTS</p>
                        <p className="mt-1">نگین تجهیز سپهر - تامین تجهیزات پزشکی</p>
                        <div className="mt-2 flex justify-center gap-2 text-indigo-500">
                            <span>لغو اشتراک</span> • <span>نمایش در مرورگر</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
