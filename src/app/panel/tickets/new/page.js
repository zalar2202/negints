"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import axios from "axios";
import { Ticket, ArrowRight } from "lucide-react";

const ticketSchema = Yup.object().shape({
    subject: Yup.string().required("موضوع الزامی است").max(200, "حداکثر ۲۰۰ کاراکتر"),
    description: Yup.string().required("توضیحات الزامی است"),
    category: Yup.string(),
    priority: Yup.string(),
});

export default function NewTicketPage() {
    const { user } = useAuth();
    const router = useRouter();

    const handleCreateTicket = async (values, { setSubmitting }) => {
        try {
            const { data } = await axios.post("/api/tickets", values);
            if (data.success) {
                toast.success("تیکت با موفقیت ایجاد شد");
                router.push("/panel/tickets");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "خطا در ایجاد تیکت");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ContentWrapper>
            <div className="max-w-3xl mx-auto" dir="rtl">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Ticket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            ایجاد تیکت جدید
                        </h1>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-2 font-medium">
                            سوال یا مشکل خود را مطرح کنید، ما در اسرع وقت پاسخ خواهیم داد.
                        </p>
                    </div>
                    <Button 
                        variant="secondary" 
                        icon={<ArrowRight className="w-4 h-4 ml-2" />} 
                        onClick={() => router.back()}
                        className="w-full md:w-auto font-bold"
                    >
                        بازگشت
                    </Button>
                </div>

                <Card className="p-6">
                    <Formik
                        initialValues={{ subject: "", description: "", category: "general", priority: "medium" }}
                        validationSchema={ticketSchema}
                        onSubmit={handleCreateTicket}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4">
                                <InputField name="subject" label="موضوع" placeholder="خلاصه کوتاهی از درخواست..." className="text-right" />
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField name="category" label="دسته‌بندی">
                                        <option value="general">سوال عمومی</option>
                                        <option value="technical">پشتیبانی فنی</option>
                                        <option value="billing">امور مالی و صورتحساب</option>
                                        <option value="account">حساب کاربری</option>
                                        <option value="feature_request">پیشنهاد قابلیت جدید</option>
                                        <option value="bug_report">گزارش باگ</option>
                                        <option value="audit">درخواست حسابرسی سایت</option>
                                        <option value="consultation">مشاوره فنی</option>
                                    </SelectField>
                                    <SelectField name="priority" label="اولویت">
                                        <option value="low">کم</option>
                                        <option value="medium">متوسط</option>
                                        <option value="high">زیاد</option>
                                        <option value="urgent">فوری</option>
                                    </SelectField>
                                </div>
                                <TextareaField 
                                    name="description" 
                                    label="پیام" 
                                    rows={8} 
                                    placeholder="لطفاً جزئیات کامل را بنویسید..." 
                                    className="text-right"
                                />
                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                    <Button type="button" variant="secondary" onClick={() => router.back()}>انصراف</Button>
                                    <Button type="submit" loading={isSubmitting}>ارسال تیکت</Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>
            </div>
        </ContentWrapper>
    );
}
