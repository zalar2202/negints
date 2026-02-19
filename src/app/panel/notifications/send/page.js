"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Badge } from "@/components/common/Badge";
import { Send, Users, User, Shield, AlertCircle } from "lucide-react";
import { Formik, Form } from "formik";
import { sendNotificationSchema } from "@/schemas/notificationSchemas";
import { sendNotification } from "@/services/notification.service";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

/**
 * Send Notification Page (Admin/Manager Only)
 *
 * Allows admins and managers to send custom notifications to:
 * - All users
 * - Specific role (admin/manager/user)
 * - Single user
 * - Multiple users
 */
export default function SendNotificationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Check authorization
    useEffect(() => {
        if (user && !["admin", "manager"].includes(user.role)) {
            toast.error("دسترسی رد شد: نقش مدیر یا مدیر کل الزامی است");
            router.push("/panel/notifications");
        }
    }, [user, router]);

    // Fetch users for selection (Single User / Multiple Users dropdowns)
    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await axios.get("/api/users?limit=1000");
                setUsers(response.data.data || []);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("خطا در بارگذاری کاربران");
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, []);

    // Handle form submit
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await sendNotification(values);

            const translateRole = (role) => {
                const mapping = {
                    admin: "مدیران کل",
                    manager: "مدیران",
                    user: "کاربران عادی",
                };
                return mapping[role] || role;
            };

            toast.success("اعلان با موفقیت ارسال شد!", {
                description: `ارسال شده به: ${
                    values.recipientType === "all"
                        ? "همه کاربران"
                        : values.recipientType === "role"
                          ? `همه ${translateRole(values.recipients)}`
                          : values.recipientType === "multiple"
                            ? `${values.recipients.length} کاربر`
                            : "۱ کاربر"
                }`,
            });

            resetForm();
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error(error.response?.data?.error || "خطا در ارسال اعلان");
        } finally {
            setSubmitting(false);
        }
    };

    // Pre-defined templates
    const templates = [
        {
            name: "خوش‌آمدگویی",
            title: "به پنل نگین تجهیز سپهر خوش آمدید!",
            message: "حساب کاربری شما با موفقیت ایجاد شد. گشت و گذار در پلتفرم را شروع کنید!",
            type: "success",
        },
        {
            name: "بروزرسانی",
            title: "بروزرسانی برنامه‌ریزی شده",
            message:
                "بروزرسانی سیستم برای امشب ساعت ۲۳ برنامه‌ریزی شده است. زمان حدودی توقف: ۳۰ دقیقه.",
            type: "warning",
        },
        {
            name: "ویژگی جدید",
            title: "ویژگی‌های جدید در دسترس است!",
            message:
                "ما ویژگی‌های جدید و جذاب انتخاب شده را به پلتفرم اضافه کرده‌ایم. آن‌ها را در پیشخوان خود بررسی کنید!",
            type: "info",
        },
        {
            name: "هشدار مهم",
            title: "مهم: نیاز به اقدام",
            message: "لطفاً تنظیمات حساب خود را بررسی کرده و اطلاعات پروفایل خود را بروزرسانی کنید.",
            type: "error",
        },
    ];

    if (!user || !["admin", "manager"].includes(user.role)) {
        return null;
    }

    return (
        <ContentWrapper>
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    ارسال اعلان عمومی
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    ارسال اعلان سفارشی به کاربران سیستم
                </p>
            </div>

            {/* Alert */}
            <Card
                className="border-l-4 shadow-sm"
                style={{
                    backgroundColor: "var(--color-info-surface)",
                    borderColor: "var(--color-info)",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                }}
            >
                <div className="flex gap-3">
                    <AlertCircle
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--color-info)" }}
                    />
                    <div>
                        <h3
                            className="font-semibold mb-1"
                            style={{ color: "var(--color-info-foreground)" }}
                        >
                            سیستم ارسال اعلان مدیریت
                        </h3>
                        <p className="text-sm" style={{ color: "var(--color-info-foreground)" }}>
                            اعلان‌ها در پایگاه داده ذخیره شده و از طریق سرویس هوشمند به تمام گیرندگان انتخاب شده ارسال می‌شوند.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Main Form */}
            <Card
                style={{
                    marginBottom: "1rem",
                }}
            >
                <Formik
                    initialValues={{
                        recipientType: "all",
                        recipients: "",
                        title: "",
                        message: "",
                        type: "info",
                        actionUrl: "",
                        actionLabel: "",
                        email: false,
                    }}
                    validationSchema={sendNotificationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form className="space-y-6">
                            {/* Quick Templates */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    قالب‌های آماده (اختیاری)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {templates.map((template) => (
                                        <button
                                            key={template.name}
                                            type="button"
                                            onClick={() => {
                                                setFieldValue("title", template.title);
                                                setFieldValue("message", template.message);
                                                setFieldValue("type", template.type);
                                            }}
                                            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            style={{
                                                borderColor: "var(--color-border)",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recipient Type */}
                            <SelectField name="recipientType" label="ارسال به">
                                <option value="all">همه کاربران</option>
                                <option value="role">نقش خاص</option>
                                <option value="single">کاربر تکی</option>
                                <option value="multiple">چندین کاربر (به زودی)</option>
                            </SelectField>

                            {/* Role Selection */}
                            {values.recipientType === "role" && (
                                <SelectField name="recipients" label="انتخاب نقش">
                                    <option value="">یک نقش را انتخاب کنید...</option>
                                    <option value="admin">مدیران کل</option>
                                    <option value="manager">مدیران</option>
                                    <option value="user">کاربران عادی</option>
                                </SelectField>
                            )}

                            {/* Single User Selection */}
                            {values.recipientType === "single" && (
                                <SelectField
                                    name="recipients"
                                    label="انتخاب کاربر"
                                    disabled={loadingUsers}
                                >
                                    <option value="">یک کاربر را انتخاب کنید...</option>
                                    {users.map((u) => (
                                        <option key={u._id} value={u._id}>
                                            {u.name} ({u.email}) - {u.role === 'admin' ? 'مدیر کل' : u.role === 'manager' ? 'مدیر' : 'کاربر'}
                                        </option>
                                    ))}
                                </SelectField>
                            )}

                            {/* Notification Content */}
                            <InputField
                                name="title"
                                label="عنوان اعلان"
                                placeholder="عنوان اعلان را وارد کنید"
                                maxLength={100}
                            />

                            <TextareaField
                                name="message"
                                label="پیام اعلان"
                                placeholder="متن پیام اعلان را وارد کنید"
                                rows={4}
                                maxLength={500}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectField name="type" label="نوع اعلان">
                                    <option value="info">اطلاعیه</option>
                                    <option value="success">موفقیت</option>
                                    <option value="warning">هشدار</option>
                                    <option value="error">خطا</option>
                                    <option value="admin">مدیریتی</option>
                                    <option value="system">سیستمی</option>
                                </SelectField>

                                {/* Email Checkbox */}
                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg w-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                                        <input
                                            type="checkbox"
                                            checked={values.email}
                                            onChange={(e) => setFieldValue('email', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="font-medium block" style={{ color: 'var(--color-text-primary)' }}>ارسال از طریق ایمیل</span>
                                            <span className="text-xs block" style={{ color: 'var(--color-text-secondary)' }}>ارسال یک کپی به صندوق ورودی ایمیل کاربر</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Optional Action */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    name="actionUrl"
                                    label="لینک کلیک (اختیاری)"
                                    placeholder="/panel/dashboard"
                                    helperText="آدرسی که با کلیک روی اعلان باز می‌شود"
                                />

                                <InputField
                                    name="actionLabel"
                                    label="متن دکمه (اختیاری)"
                                    placeholder="مشاهده جزئیات"
                                    helperText="متن دکمه اقدام در انتهای اعلان"
                                />
                            </div>

                            {/* Preview */}
                            {values.title && values.message && (
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        پیش‌نمایش
                                    </label>
                                    <div
                                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4
                                                        className="font-semibold"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {values.title}
                                                    </h4>
                                                    <Badge
                                                        variant={
                                                            values.type === "success"
                                                                ? "success"
                                                                : values.type === "error"
                                                                  ? "danger"
                                                                  : values.type === "warning"
                                                                    ? "warning"
                                                                    : "primary"
                                                        }
                                                    >
                                                        {values.type === "info" ? "اطلاعیه" : values.type === "success" ? "موفقیت" : values.type === "warning" ? "هشدار" : values.type === "error" ? "خطا" : "سیستمی"}
                                                    </Badge>
                                                </div>
                                                <div
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: values.message }}
                                                />
                                                {values.actionLabel && (
                                                    <div
                                                        className="mt-2 text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-primary)",
                                                        }}
                                                    >
                                                        {values.actionLabel} ←
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div
                                className="flex gap-3 pt-4 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Button
                                    type="submit"
                                    loading={isSubmitting}
                                    icon={<Send className="w-4 h-4" />}
                                >
                                    ارسال اعلان
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push("/panel/notifications")}
                                >
                                    انصراف
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                کل کاربران
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {users.length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                نقش شما
                            </p>
                            <p
                                className="text-xl font-bold capitalize"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {user?.role === 'admin' ? 'مدیر کل' : user?.role === 'manager' ? 'مدیر' : 'کاربر'}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                نحوه ارسال
                            </p>
                            <p
                                className="text-xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Push + DB
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </ContentWrapper>
    );
}
