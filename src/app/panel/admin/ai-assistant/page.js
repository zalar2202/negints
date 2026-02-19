"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import axios from "axios";
import { Bot, Save, Globe, Eye, MessageSquare, Sparkles } from "lucide-react";

const aiSchema = Yup.object().shape({
    webhookUrl: Yup.string().url("باید یک آدرس معتبر باشد").required("آدرس وب‌هوک الزامی است"),
    title: Yup.string().required("عنوان الزامی است"),
    welcomeMessage: Yup.string().required("پیام خوش‌آمد خطی الزامی است"),
    primaryColor: Yup.string().required("رنگ اصلی الزامی است"),
});

export default function AIAssistantAdmin() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get("/api/admin/ai-assistant");
                if (data.success && data.data) {
                    setSettings(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch AI settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const { data } = await axios.post("/api/admin/ai-assistant", values);
            if (data.success) {
                toast.success("تنظیمات دستیار هوشمند با موفقیت بروز شد");
                setSettings(data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "خطا در بروزرسانی تنظیمات");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ContentWrapper>
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    <Card className="h-96"></Card>
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            <div className="max-w-4xl mx-auto" dir="rtl">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--color-text-primary)" }}>
                            <Bot className="w-8 h-8 text-indigo-600" />
                            دستیار هوشمند و پشتیبانی زنده
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-1 font-medium">
                            اتصال به اتوماسیون n8n و شخصی‌سازی ابزارک چت.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" icon={<Globe className="w-4 h-4 ml-2" />} onClick={() => window.open('/', '_blank')}>
                            مشاهده وب‌سایت
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                            <Formik
                                initialValues={settings || {
                                    webhookUrl: "",
                                    title: "دستیار هوشمند نگین",
                                    welcomeMessage: "سلام! چطور می‌توانم کمکتان کنم؟",
                                    primaryColor: "#32127a",
                                    isActive: true,
                                    position: "bottom-right",
                                    buttonIcon: "bot"
                                }}
                                validationSchema={aiSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {({ isSubmitting, values, setFieldValue }) => (
                                    <Form className="space-y-6 text-right">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">تنظیمات اتصال</h3>
                                            <InputField 
                                                name="webhookUrl" 
                                                label="آدرس وب‌هوک n8n" 
                                                placeholder="https://n8n.yourdomain.com/webhook/..." 
                                                helperText="آدرسی که پیام‌های چت به آن ارسال می‌شوند."
                                                className="text-left direction-ltr"
                                                dir="ltr"
                                            />
                                            
                                            <div className="flex items-center gap-4 py-2">
                                                <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={values.isActive}
                                                        onChange={(e) => setFieldValue('isActive', e.target.checked)}
                                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 ml-2"
                                                    />
                                                    <span className="text-sm font-medium">فعال‌سازی دستیار هوشمند در وب‌سایت</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">ظاهر و رفتار</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputField name="title" label="نام دستیار" placeholder="پشتیبانی نگین" className="text-right" />
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">رنگ اصلی</label>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="color" 
                                                            value={values.primaryColor}
                                                            onChange={(e) => setFieldValue('primaryColor', e.target.value)}
                                                            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                                        />
                                                        <input 
                                                            type="text"
                                                            value={values.primaryColor}
                                                            onChange={(e) => setFieldValue('primaryColor', e.target.value)}
                                                            className="flex-1 px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700 text-left direction-ltr"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <InputField name="welcomeMessage" label="پیام خوش‌آمدگویی اولیه" placeholder="هر سوالی دارید بپرسید!" className="text-right" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SelectField name="position" label="موقعیت ابزارک">
                                                    <option value="bottom-right">پایین راست (پیش‌فرض)</option>
                                                    <option value="bottom-left">پایین چپ</option>
                                                </SelectField>
                                                <SelectField name="buttonIcon" label="آیکون دکمه">
                                                    <option value="bot">ربات (Bot)</option>
                                                    <option value="message">حباب پیام</option>
                                                    <option value="spark">جرقه (Sparkles)</option>
                                                </SelectField>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-[var(--color-border)] flex justify-end">
                                            <Button type="submit" loading={isSubmitting} icon={<Save className="w-4 h-4 ml-2" />}>
                                                ذخیره تنظیمات
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-indigo-500" />
                                پیش‌نمایش زنده
                            </h3>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-6 border-4 border-gray-200 dark:border-gray-800 relative aspect-[9/16] shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-white dark:bg-gray-950">
                                    {/* Mock Header */}
                                    <div className="h-14 bg-indigo-900 border-b border-white/10 flex items-center px-4" dir="rtl">
                                        <div className="w-8 h-2 bg-white/20 rounded"></div>
                                        <div className="flex-1"></div>
                                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                                    </div>
                                    
                                    {/* Mock Content */}
                                    <div className="p-4 space-y-4" dir="rtl">
                                        <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                        <div className="w-1/2 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                        <div className="grid grid-cols-2 gap-2 mt-8">
                                            <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"></div>
                                            <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"></div>
                                        </div>
                                    </div>

                                    {/* Mock Floating Widget */}
                                    <div className={`absolute bottom-6 ${'right-6'} transition-all`}>
                                        <div className="mb-3 bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30 max-w-[200px] animate-fade-in-up text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1 font-sans">پشتیبانی هوشمند</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300">"سلام! چطور میتونم کمکتون کنم؟"</p>
                                        </div>
                                        <div 
                                            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                                            style={{ background: 'linear-gradient(135deg, #32127a 0%, #7c3aed 100%)' }}
                                        >
                                            <Bot className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-4 italic">نمایش برای تجسم کلی است</p>
                        </div>
                    </div>
                </div>
            </div>
        </ContentWrapper>
    );
}
