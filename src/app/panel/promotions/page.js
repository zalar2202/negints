"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { Formik, Form } from "formik";
import { Plus, Edit, Trash2, Tag, Calendar, Save, Percent, Share2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
    { value: 'design', label: 'طراحی' },
    { value: 'development', label: 'توسعه' },
    { value: 'deployment', label: 'استقرار' },
    { value: 'maintenance', label: 'نگهداری' },
    { value: 'bundle', label: 'بسته ها' },
    { value: 'hosting', label: 'هاستینگ' },
    { value: 'seo', label: 'سئو' },
    { value: 'marketing', label: 'بازاریابی' },
];

const PromotionSchema = Yup.object().shape({
    title: Yup.string().required("عنوان الزامی است"),
    description: Yup.string().required("توضیحات الزامی است"),
    discountCode: Yup.string().required("کد تخفیف الزامی است"),
    discountType: Yup.string().oneOf(['percentage', 'fixed']).required("نوع تخفیف الزامی است"),
    discountValue: Yup.number().min(0, "باید مثبت باشد").required("مقدار الزامی است"),
    minPurchase: Yup.number().min(0, "باید مثبت باشد"),
    usageLimit: Yup.number().nullable().min(0, "باید مثبت باشد"),
    isActive: Yup.boolean(),
    applicableCategories: Yup.array().of(Yup.string()),
});

export default function PromotionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || !["admin", "manager"].includes(user.role))) {
            router.push("/panel/dashboard");
        }
    }, [user, authLoading, router]);

    const fetchPromotions = async () => {
        try {
            const res = await axios.get("/api/promotions?all=true");
            setPromotions(res.data.data);
        } catch (error) {
            toast.error("خطا در دریافت لیست تخفیف‌ها");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleShare = async (promo) => {
        const discountText = promo.discountType === 'percentage' ? promo.discountValue + '%' : formatCurrency(promo.discountValue, 'IRT');
        const shareData = {
            title: `فروش ویژه نگین تجهیز: ${discountText} تخفیف!`,
            text: `🔥 پیشنهاد ویژه: از کد ${promo.discountCode} استفاده کنید و ${discountText} تخفیف بگیرید! 🚀 همین حالا بررسی کنید:`,
            url: window.location.origin + '/promo/' + promo.discountCode // Adjust URL if needed
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('اشتراک گذاری ناموفق', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                toast.success("جزئیات تخفیف کپی شد!");
            } catch (err) {
                toast.error("کپی ناموفق بود");
            }
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = {
                ...values,
                usageLimit: values.usageLimit === "" ? null : values.usageLimit
            };
            if (editingPromotion) {
                await axios.put(`/api/promotions/${editingPromotion._id}`, payload);
                toast.success("تخفیف بروزرسانی شد");
            } else {
                await axios.post("/api/promotions", payload);
                toast.success("تخفیف ایجاد شد");
            }
            fetchPromotions();
            setIsModalOpen(false);
            setEditingPromotion(null);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "عملیات ناموفق بود");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("آیا مطمئن هستید؟")) return;
        try {
            await axios.delete(`/api/promotions/${id}`);
            toast.success("تخفیف حذف شد");
            fetchPromotions();
        } catch (error) {
            toast.error("حذف ناموفق بود");
        }
    };

    if (authLoading || !user || !["admin", "manager"].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <ContentWrapper>
            <div className="flex justify-between items-center mb-8" dir="rtl">
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">مدیریت تخفیف‌ها</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 font-medium">مدیریت کدهای تخفیف و پیشنهادات ویژه</p>
                </div>
                <Button onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }} icon={<Plus size={18} className="ml-2" />}>
                    افزودن تخفیف جدید
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6" dir="rtl">
                {promotions.map((promo) => (
                    <Card key={promo._id} className="border-r-4 border-r-indigo-600 border-l-0">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant={promo.isActive ? "success" : "secondary"}>
                                    {promo.isActive ? "فعال" : "غیرفعال"}
                                </Badge>
                                <div className="flex gap-2 items-center">
                                    <button 
                                        onClick={() => handleShare(promo)}
                                        className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 transition-colors"
                                        title="اشتراک گذاری"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                    {promo.discountCode && (
                                        <Badge variant="primary" className="font-mono text-lg px-3 direction-ltr">
                                            {promo.discountCode}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-1 text-right">{promo.title}</h3>
                            <div className="flex flex-wrap gap-1 mb-3 justify-start">
                                {promo.applicableCategories?.length > 0 ? (
                                    promo.applicableCategories.map(cat => (
                                        <span key={cat} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                                            {CATEGORIES.find(c => c.value === cat)?.label || cat}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded text-emerald-600">
                                        همه دسته‌بندی‌ها
                                    </span>
                                )}
                            </div>
                            <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed line-clamp-2 text-right">
                                {promo.description}
                            </p>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-[var(--color-text-tertiary)] mb-6 text-right">
                                <div className="flex items-center gap-1.5">
                                    <Percent size={14} className="text-indigo-600 ml-1.5" />
                                    <span className="font-semibold text-[var(--color-text-primary)]">
                                        {promo.discountType === 'percentage' ? `${promo.discountValue}٪ تخفیف` : `${formatCurrency(promo.discountValue, 'IRT')} تخفیف`} 
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="ml-1.5" />
                                    <span>تا {promo.endDate ? new Date(promo.endDate).toLocaleDateString('fa-IR') : 'نامحدود'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Tag size={12} className="ml-1.5" />
                                    <span>حداقل خرید: {promo.minPurchase ? formatCurrency(promo.minPurchase, 'IRT') : 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Save size={12} className="ml-1.5" />
                                    <span>استفاده شده: {promo.usedCount} / {promo.usageLimit || '∞'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-[var(--color-border)] justify-end">
                                <Button variant="secondary" size="sm" onClick={() => { setEditingPromotion(promo); setIsModalOpen(true); }} icon={<Edit size={16} className="ml-1" />}>
                                    ویرایش
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(promo._id)} icon={<Trash2 size={16} className="ml-1" />}>
                                    حذف
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPromotion ? "ویرایش تخفیف" : "ایجاد تخفیف جدید"}
                size="lg"
            >
                <Formik
                    initialValues={editingPromotion ? {
                        ...editingPromotion,
                        startDate: editingPromotion.startDate ? new Date(editingPromotion.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        endDate: editingPromotion.endDate ? new Date(editingPromotion.endDate).toISOString().split('T')[0] : "",
                        applicableCategories: editingPromotion.applicableCategories || [],
                    } : {
                        title: "",
                        description: "",
                        discountCode: "",
                        discountType: "fixed",
                        discountValue: "",
                        minPurchase: "",
                        usageLimit: "",
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: "",
                        isActive: true,
                        applicableCategories: [],
                    }}
                    validationSchema={PromotionSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="space-y-4 py-4 px-1 text-right" dir="rtl">
                            <InputField name="title" label="عنوان طرح" placeholder="مثلاً: جشنواره نوروزی" required className="text-right" />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">توضیحات</label>
                                <textarea
                                    className="w-full p-2.5 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] min-h-[80px] text-right"
                                    value={values.description}
                                    onChange={(e) => setFieldValue("description", e.target.value)}
                                    placeholder="جزئیات طرح تخفیف را وارد کنید..."
                                />
                            </div>

                            <InputField name="discountCode" label="کد تخفیف" placeholder="NOROOZ1405" required className="text-left font-mono" dir="ltr" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">نوع تخفیف</label>
                                    <select
                                        className="w-full p-2.5 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)]"
                                        value={values.discountType}
                                        onChange={(e) => setFieldValue("discountType", e.target.value)}
                                    >
                                        <option value="fixed">مبلغ ثابت (تومان)</option>
                                        <option value="percentage">درصدی (%)</option>
                                    </select>
                                </div>
                                <InputField name="discountValue" label="مقدار تخفیف" type="number" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="minPurchase" label="حداقل خرید (تومان)" type="number" />
                                <InputField name="usageLimit" label="محدودیت تعداد (خالی برای بینهایت)" type="number" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="startDate" label="تاریخ شروع" type="date" className="text-right" />
                                <InputField name="endDate" label="تاریخ پایان" type="date" className="text-right" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">دسته‌بندی‌های مشمول (خالی برای همه)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border p-3 rounded-lg border-[var(--color-border)] bg-[var(--color-background-elevated)]">
                                    {CATEGORIES.map(cat => (
                                        <label key={cat.value} className="flex items-center gap-2 text-xs cursor-pointer hover:text-indigo-600 transition-colors">
                                            <input 
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ml-2"
                                                checked={values.applicableCategories.includes(cat.value)}
                                                onChange={(e) => {
                                                    const cur = values.applicableCategories;
                                                    if (e.target.checked) {
                                                        setFieldValue("applicableCategories", [...cur, cat.value]);
                                                    } else {
                                                        setFieldValue("applicableCategories", cur.filter(c => c !== cat.value));
                                                    }
                                                }}
                                            />
                                            {cat.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="isActivePromo" 
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ml-2"
                                    checked={values.isActive}
                                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                />
                                <label htmlFor="isActivePromo" className="text-sm font-medium cursor-pointer">فعال (نمایش برای کاربران)</label>
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t border-[var(--color-border)] mt-6">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>انصراف</Button>
                                <Button type="submit" loading={isSubmitting} icon={<Save size={18} className="ml-2" />}>
                                    {editingPromotion ? "بروزرسانی تخفیف" : "ایجاد تخفیف"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </ContentWrapper>
    );
}
