"use client";

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import {
    User,
    Settings as SettingsIcon,
    Shield,
    Download,
    AlertTriangle,
    Trash2,
    Lock,
    Mail,
    Terminal,
    Wand2,
    Globe,
    Server,
    Key,
    Cpu,
    CreditCard,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs } from "@/components/common/Tabs";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { TextareaField } from "@/components/forms/TextareaField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { Loader } from "@/components/common/Loader";
import { Modal } from "@/components/common/Modal";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Avatar } from "@/components/common/Avatar";
import {
    profileUpdateSchema,
    passwordChangeSchema,
    preferencesSchema,
    accountDeactivationSchema,
    accountDeletionSchema,
} from "@/schemas/settingsSchemas";
import {
    updateProfile,
    changePassword,
    updatePreferences,
    exportData,
    deactivateAccount,
    deleteAccount,
    downloadFile,
} from "@/services/settings.service";

/**
 * Settings Page
 * Comprehensive settings page with Profile, Preferences, and Account management
 */
export default function SettingsPage() {
    const { user, updateUser, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // If auth is still loading, show loader
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size="lg" />
            </div>
        );
    }

    // If no user, show error (shouldn't happen with RouteGuard)
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="p-6">
                    <p className="text-[var(--color-error)]">Not authenticated. Please log in.</p>
                </Card>
            </div>
        );
    }

    // Profile Tab Content
    const ProfileTab = () => (
        <Card className="p-6 text-right" style={{ direction: 'rtl' }}>
            <div className="flex items-center gap-4 mb-6">
                <Avatar src={user.avatar} alt={user.name} size="2xl" />
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {user.name}
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">{user.email}</p>
                    <p className="text-sm text-[var(--color-text-tertiary)] capitalize">
                        {user.role === 'admin' ? 'مدیر سیستم' : user.role === 'manager' ? 'مدیر بخش' : 'کاربر'}
                    </p>
                </div>
            </div>

            <Formik
                initialValues={{
                    name: user.name || "",
                    phone: user.phone || "",
                    bio: user.bio || "",
                    avatar: null,
                    company: user.company || "",
                    website: user.website || "",
                    taxId: user.taxId || "",
                    whatsapp: user.whatsapp || "",
                    preferredCommunication: user.preferredCommunication || "email",
                    address: {
                        street: user.address?.street || "",
                        city: user.address?.city || "",
                        state: user.address?.state || "",
                        zip: user.address?.zip || "",
                        country: user.address?.country || "",
                    },
                    technicalDetails: {
                        domainName: user.technicalDetails?.domainName || "",
                        serverIP: user.technicalDetails?.serverIP || "",
                        serverUser: user.technicalDetails?.serverUser || "",
                        serverPassword: user.technicalDetails?.serverPassword || "",
                        serverPort: user.technicalDetails?.serverPort || "22",
                    }
                }}
                validationSchema={profileUpdateSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const response = await updateProfile(values);

                        if (response.success) {
                            updateUser(response.user);
                            toast.success("پروفایل با موفقیت بروزرسانی شد");
                        } else {
                            toast.error(response.message || "خطا در بروزرسانی پروفایل");
                        }
                    } catch (error) {
                        console.error("Profile update error:", error);
                        toast.error(error.response?.data?.message || "خطا در بروزرسانی پروفایل");
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, setFieldValue, values }) => (
                    <Form className="space-y-4">
                        <InputField
                            label="نام و نام خانوادگی"
                            name="name"
                            placeholder="نام خود را وارد کنید"
                            required
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <InputField
                                label="ایمیل (نام کاربری)"
                                name="email"
                                value={user.email}
                                disabled
                                helperText="ایمیل برای ورود استفاده می‌شود و قابل تغییر نیست"
                            />
                        </div>

                        <InputField
                            label="شماره تماس"
                            name="phone"
                            type="tel"
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        />

                        <TextareaField
                            label="درباره شما (بیوگرافی)"
                            name="bio"
                            placeholder="کمی در مورد خودتان یا کسب‌وکارتان بنویسید..."
                            rows={4}
                            helperText="حداکثر ۵۰۰ کاراکتر"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="شرکت / سازمان"
                                name="company"
                                placeholder="نام شرکت"
                            />
                            <InputField
                                label="کد ملی / شناسه مالیاتی"
                                name="taxId"
                                placeholder="۱۲۳۴۵۶۷۸۹۰"
                            />
                            <InputField
                                label="وب‌سایت"
                                name="website"
                                placeholder="https://example.com"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">روش ارتباطی ترجیحی</label>
                                <select 
                                    className="w-full p-2.5 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] focus:ring-2 focus:ring-indigo-500 text-right"
                                    value={values.preferredCommunication}
                                    onChange={(e) => setFieldValue("preferredCommunication", e.target.value)}
                                >
                                    <option value="email">ایمیل</option>
                                    <option value="whatsapp">واتس‌اپ</option>
                                    <option value="phone">تماس تلفنی</option>
                                </select>
                            </div>
                            <InputField
                                label="شماره واتس‌اپ"
                                name="whatsapp"
                                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            />
                        </div>

                        <div className="pt-6 mt-6 border-t border-[var(--color-border)]">
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">آدرس پستی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <InputField
                                        label="خیابان / کوچه / پلاک"
                                        name="address.street"
                                        placeholder="نشانی کامل"
                                    />
                                </div>
                                <InputField
                                    label="شهر"
                                    name="address.city"
                                    placeholder="تهران"
                                />
                                <InputField
                                    label="استان"
                                    name="address.state"
                                    placeholder="تهران"
                                />
                                <InputField
                                    label="کد پستی"
                                    name="address.zip"
                                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                                />
                                <InputField
                                    label="کشور"
                                    name="address.country"
                                    placeholder="ایران"
                                />
                            </div>
                        </div>

                        <FileUploadField
                            label="تصویر پروفایل"
                            name="avatar"
                            accept={{
                                "image/png": [".png"],
                                "image/jpeg": [".jpg", ".jpeg"],
                                "image/webp": [".webp"],
                                "image/svg+xml": [".svg"],
                            }}
                            helperText="PNG, JPG, WEBP حداکثر ۵ مگابایت"
                            onChange={(file) => setFieldValue("avatar", file)}
                        />

                        {/* Technical Details Section */}
                        <div className="pt-6 mt-6 border-t border-[var(--color-border)]">
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5" />
                                اطلاعات فنی و سرور (مخصوص سرویس‌های مدیریت شده)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="نام دامنه"
                                    name="technicalDetails.domainName"
                                    placeholder="example.com"
                                    icon={<Globe className="w-4 h-4" />}
                                />
                                <InputField
                                    label="آدرس IP سرور"
                                    name="technicalDetails.serverIP"
                                    placeholder="1.2.3.4"
                                    icon={<Server className="w-4 h-4" />}
                                />
                                <InputField
                                    label="نام کاربری سرور"
                                    name="technicalDetails.serverUser"
                                    placeholder="root"
                                    icon={<User className="w-4 h-4" />}
                                />
                                <InputField
                                    label="رمز عبور سرور"
                                    name="technicalDetails.serverPassword"
                                    type="password"
                                    placeholder="********"
                                    icon={<Key className="w-4 h-4" />}
                                />
                                <InputField
                                    label="پورت SSH/FTP"
                                    name="technicalDetails.serverPort"
                                    placeholder="22"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsPasswordModalOpen(true)}
                                icon={<Lock className="w-4 h-4" />}
                            >
                                تغییر رمز عبور
                            </Button>

                            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                                ذخیره تغییرات
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Card>
    );

    // Preferences Tab Content
    const PreferencesTab = () => {
        const [preferences, setPreferences] = useState(user.preferences || {});
        const [saving, setSaving] = useState(false);

        const handlePreferenceChange = async (key, value) => {
            const newPreferences = { ...preferences, [key]: value };
            setPreferences(newPreferences);

            setSaving(true);
            try {
                const response = await updatePreferences({ [key]: value });
                if (response.success) {
                    updateUser({ ...user, preferences: response.preferences });
                    toast.success("تنظیمات ذخیره شد");
                } else {
                    toast.error("خطا در ذخیره تنظیمات");
                    // Revert on failure
                    setPreferences(preferences);
                }
            } catch (error) {
                console.error("Preference update error:", error);
                toast.error("خطا در ذخیره تنظیمات");
                setPreferences(preferences);
            } finally {
                setSaving(false);
            }
        };

        return (
            <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
                {/* Notification Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        تنظیمات اطلاع‌رسانی
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-text-primary)]">
                                    اعلان‌های ایمیلی
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    دریافت اطلاعیه‌ها از طریق ایمیل
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.emailNotifications ?? true}
                                    onChange={(e) =>
                                        handlePreferenceChange(
                                            "emailNotifications",
                                            e.target.checked
                                        )
                                    }
                                    disabled={saving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-text-primary)]">
                                    اعلان‌های مرورگر (Push)
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    دریافت اعلان‌ها در مرورگر
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.pushNotifications ?? true}
                                    onChange={(e) =>
                                        handlePreferenceChange(
                                            "pushNotifications",
                                            e.target.checked
                                        )
                                    }
                                    disabled={saving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                بازه زمانی ارسال اعلان‌ها
                            </label>
                            <select
                                value={preferences.notificationFrequency || "immediate"}
                                onChange={(e) =>
                                    handlePreferenceChange("notificationFrequency", e.target.value)
                                }
                                disabled={saving}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-right"
                            >
                                <option value="immediate">فوری</option>
                                <option value="daily">خلاصه روزانه</option>
                                <option value="weekly">خلاصه هفتگی</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Display Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        تنظیمات ظاهری
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                قالب نمایش (Theme)
                            </label>
                            <select
                                value={preferences.theme || "system"}
                                onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                                disabled={saving}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-right"
                            >
                                <option value="light">روشن</option>
                                <option value="dark">تاریک</option>
                                <option value="system">هماهنگ با سیستم</option>
                            </select>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                می‌توانید از دکمه تغییر تم در بالای صفحه نیز استفاده کنید
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                فرمت نمایش تاریخ
                            </label>
                            <select
                                value={preferences.dateFormat || "MM/DD/YYYY"}
                                onChange={(e) =>
                                    handlePreferenceChange("dateFormat", e.target.value)
                                }
                                disabled={saving}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-right"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Privacy Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        تنظیمات حریم خصوصی
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            نمایش پروفایل
                        </label>
                        <select
                            value={preferences.profileVisibility || "public"}
                            onChange={(e) =>
                                handlePreferenceChange("profileVisibility", e.target.value)
                            }
                            disabled={saving}
                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-right"
                        >
                            <option value="public">عمومی (برای همه)</option>
                            <option value="private">خصوصی (فقط مدیریت)</option>
                        </select>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            کنترل کنید که چه کسانی می‌توانند اطلاعات پروفایل شما را مشاهده کنند
                        </p>
                    </div>
                </Card>
            </div>
        );
    };

    // Account Tab Content
    const AccountTab = () => {
        const handleExportData = async (format) => {
            setExportLoading(true);
            try {
                const blob = await exportData(format);
                const filename = `user-data-${Date.now()}.${format}`;
                downloadFile(blob, filename);
                toast.success(`داده‌ها با موفقیت با فرمت ${format.toUpperCase()} صادر شدند`);
            } catch (error) {
                console.error("Export error:", error);
                toast.error("خطا در خروجی گرفتن از داده‌ها");
            } finally {
                setExportLoading(false);
            }
        };

        return (
            <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
                {/* Account Status */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        اطلاعات حساب کاربری
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-secondary)]">
                                وضعیت حساب:
                            </span>
                            <span
                                className={`font-medium capitalize ${
                                    user.status === "active" ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-secondary)]">
                                تاریخ عضویت:
                            </span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                                {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-secondary)]">آخرین ورود:</span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fa-IR') : "ثبت نشده"}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Data Export */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        دریافت خروجی داده‌ها
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                        یک نسخه از داده‌های خود را برای سوابق شخصی دانلود کنید (مطابق با قوانین حریم خصوصی و GDPR)
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => handleExportData("json")}
                            loading={exportLoading}
                            disabled={exportLoading}
                            icon={<Download className="w-4 h-4" />}
                        >
                            خروجی JSON
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleExportData("csv")}
                            loading={exportLoading}
                            disabled={exportLoading}
                            icon={<Download className="w-4 h-4" />}
                        >
                            خروجی CSV
                        </Button>
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 border-2 border-red-200 dark:border-red-900">
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        منطقه ممنوعه
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
                                غیرفعال‌سازی حساب
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                حساب خود را به صورت موقت غیرفعال کنید. این حساب توسط مدیر سیستم قابل فعال‌سازی مجدد است.
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() => setIsDeactivateModalOpen(true)}
                            >
                                غیرفعال‌سازی موقت
                            </Button>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <h4 className="font-medium text-red-600 mb-2">
                                حذف همیشگی حساب کاربری
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                حساب کاربری و تمام داده‌های شما را برای همیشه حذف کنید. این عملیات غیرقابل بازگشت است.
                            </p>
                            <Button
                                variant="danger"
                                onClick={() => setIsDeleteModalOpen(true)}
                                icon={<Trash2 className="w-4 h-4" />}
                            >
                                حذف دائمی حساب
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    // Payments Tab Content - Zarinpal Settings
    const PaymentsTab = () => {
        const [config, setConfig] = useState({
            isEnabled: false,
            isSandbox: true,
            merchantId: "",
            description: ""
        });
        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);

        useEffect(() => {
            fetchSettings();
        }, []);

        const fetchSettings = async () => {
            try {
                const { data } = await axios.get("/api/settings/payment/zarinpal");
                if (data.success) {
                    setConfig(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch payment settings", error);
                // Don't show toast on load failure to avoid annoyance if endpoint doesn't exist yet
            } finally {
                setLoading(false);
            }
        };

        const handleSave = async (values) => {
            setSaving(true);
            try {
                const { data } = await axios.put("/api/settings/payment/zarinpal", values);
                if (data.success) {
                    setConfig(data.data);
                    toast.success("تنظیمات درگاه پرداخت ذخیره شد");
                }
            } catch (error) {
                console.error("Failed to save settings", error);
                toast.error("خطا در ذخیره تنظیمات");
            } finally {
                setSaving(false);
            }
        };

        if (loading) return <div className="p-8 text-center"><Loader /></div>;

        return (
            <Card className="p-6 text-right" style={{ direction: 'rtl' }}>
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">تنظیمات درگاه پرداخت زرین‌پال</h2>
                        <p className="text-sm text-[var(--color-text-secondary)]">مدیریت اتصال به درگاه پرداخت آنلاین</p>
                    </div>
                </div>

                <Formik
                    initialValues={config}
                    enableReinitialize
                    onSubmit={handleSave}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form className="space-y-6">
                            {/* Enable/Disable Toggle */}
                            <div className="flex items-center justify-between p-4 bg-[var(--color-background-elevated)] rounded-lg border border-[var(--color-border)]">
                                <div>
                                    <h3 className="font-semibold text-[var(--color-text-primary)]">فعال‌سازی درگاه</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">نمایش گزینه پرداخت آنلاین در فاکتورها</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={values.isEnabled}
                                        onChange={(e) => setFieldValue('isEnabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            {/* Sandbox Toggle */}
                            <div className="flex items-center justify-between p-4 bg-[var(--color-background-elevated)] rounded-lg border border-[var(--color-border)]">
                                <div>
                                    <h3 className="font-semibold text-[var(--color-text-primary)]">محیط آزمایشی (Sandbox)</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">استفاده از سرور تست زرین‌پال برای عیب‌یابی</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={values.isSandbox}
                                        onChange={(e) => setFieldValue('isSandbox', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <InputField
                                label="کد پذیرنده (Merchant ID)"
                                name="merchantId"
                                placeholder="مثلاً: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                dir="ltr"
                                className="font-mono text-left"
                                helperText="کد ۳۶ رقمی دریافتی از پنل زرین‌پال"
                            />

                            <InputField
                                label="توضیحات پیش‌فرض پرداخت"
                                name="description"
                                placeholder="مثلاً: پرداخت آنلاین فاکتور"
                                helperText="توضیحاتی که در درگاه بانک به مشتری نمایش داده می‌شود"
                            />

                             <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                                <Button
                                    type="submit"
                                    loading={saving}
                                    variant="primary"
                                    icon={<Download className="w-4 h-4 rotate-180" />} // Save icon
                                >
                                    ذخیره تنظیمات
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        );
    };

    // Tab configuration
    const isAdmin = ['admin', 'manager'].includes(user.role);

    const tabs = [
        {
            id: "profile",
            label: "پروفایل",
            icon: <User className="w-4 h-4" />,
            content: <ProfileTab />,
        },
        {
            id: "preferences",
            label: "تنظیمات برگزیده",
            icon: <SettingsIcon className="w-4 h-4" />,
            content: <PreferencesTab />,
        },
        // Only show payment gateway settings for admins
        ...(user.role === 'admin' ? [{
            id: "payments",
            label: "درگاه پرداخت",
            icon: <CreditCard className="w-4 h-4" />,
            content: <PaymentsTab />,
        }] : []),
        {
            id: "account",
            label: "مدیریت حساب",
            icon: <Shield className="w-4 h-4" />,
            content: <AccountTab />,
        },
    ];


    return (
        <ContentWrapper>
            <div className="max-w-4xl mx-auto text-right" style={{ direction: 'rtl' }}>
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                        تنظیمات سیستم
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-2 font-medium">
                        مدیریت حساب کاربری، تنظیمات برگزیده و امنیت
                    </p>
                </div>

                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="line"
                    size="md"
                />


                {/* Password Change Modal */}
                <PasswordChangeModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />

                {/* Deactivate Account Modal */}
                <DeactivateAccountModal
                    isOpen={isDeactivateModalOpen}
                    onClose={() => setIsDeactivateModalOpen(false)}
                />

                {/* Delete Account Modal */}
                <DeleteAccountModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            </div>
        </ContentWrapper>
    );
}

// Password Change Modal Component
function PasswordChangeModal({ isOpen, onClose }) {
    const generatePassword = (setFieldValue) => {
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";
        const special = "@$!%*?&#";
        const allChars = uppercase + lowercase + digits + special;

        const pickRandom = (chars) => chars.charAt(Math.floor(Math.random() * chars.length));

        const passwordChars = [
            pickRandom(uppercase),
            pickRandom(lowercase),
            pickRandom(digits),
            pickRandom(special),
        ];

        for (let i = passwordChars.length; i < 12; i++) {
            passwordChars.push(pickRandom(allChars));
        }

        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
        }

        const password = passwordChars.join("");
        setFieldValue("newPassword", password);
        setFieldValue("confirmPassword", password);
        toast.info("رمز عبور امن تولید شد!");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تغییر رمز عبور" size="md">
            <Formik
                initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }}
                validationSchema={passwordChangeSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    try {
                        const response = await changePassword({
                            currentPassword: values.currentPassword,
                            newPassword: values.newPassword,
                        });

                        if (response.success) {
                            toast.success("رمز عبور با موفقیت تغییر کرد");
                            resetForm();
                            onClose();
                        } else {
                            toast.error(response.message || "خطا در تغییر رمز عبور");
                        }
                    } catch (error) {
                        console.error("Password change error:", error);
                        toast.error(error.response?.data?.message || "خطا در تغییر رمز عبور");
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        <InputField
                            label="رمز عبور فعلی"
                            name="currentPassword"
                            type="password"
                            required
                        />

                        <InputField
                            label="رمز عبور جدید"
                            name="newPassword"
                            type="password"
                            required
                            action={
                                <button
                                    type="button"
                                    onClick={() => generatePassword(setFieldValue)}
                                    className="text-xs font-bold flex items-center gap-1 hover:underline transition-all"
                                    style={{ color: "var(--color-primary)" }}
                                >
                                    <Wand2 size={12} />
                                    تولید رمز عبور
                                </button>
                            }
                            helperText="حداقل ۸ کاراکتر، شامل حروف بزرگ، کوچک، عدد و کاراکتر خاص"
                        />

                        <InputField
                            label="تایید رمز عبور جدید"
                            name="confirmPassword"
                            type="password"
                            required
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                انصراف
                            </Button>
                            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                                تغییر رمز عبور
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

// Deactivate Account Modal Component
function DeactivateAccountModal({ isOpen, onClose }) {
    const { logout } = useAuth();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="غیرفعال‌سازی حساب کاربری" size="md">
            <Formik
                initialValues={{
                    password: "",
                    reason: "",
                }}
                validationSchema={accountDeactivationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const response = await deactivateAccount(values);

                        if (response.success) {
                            toast.success("حساب کاربری با موفقیت غیرفعال شد");
                            onClose();
                            // Logout user after deactivation
                            setTimeout(() => logout(), 1500);
                        } else {
                            toast.error(response.message || "خطا در غیرفعال‌سازی حساب");
                        }
                    } catch (error) {
                        console.error("Deactivation error:", error);
                        toast.error(
                            error.response?.data?.message || "خطا در غیرفعال‌سازی حساب"
                        );
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <p className="text-sm text-[var(--color-text-primary)]">
                                <strong>چه اتفاقی می‌افتد:</strong>
                            </p>
                            <ul className="text-sm text-[var(--color-text-secondary)] list-disc list-inside mt-2 space-y-1">
                                <li>حساب شما به صورت موقت معلق می‌شود</li>
                                <li>امکان ورود به پنل را نخواهید داشت</li>
                                <li>مدیر سیستم می‌تواند حساب شما را دوباره فعال کند</li>
                                <li>داده‌های شما محفوظ می‌ماند</li>
                            </ul>
                        </div>

                        <InputField
                            label="رمز عبور"
                            name="password"
                            type="password"
                            required
                            helperText="برای تایید هویت، رمز عبور خود را وارد کنید"
                        />

                        <TextareaField
                            label="علت (اختیاری)"
                            name="reason"
                            placeholder="علت غیرفعال‌سازی را بنویسید..."
                            rows={3}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                انصراف
                            </Button>
                            <Button
                                type="submit"
                                variant="danger"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                غیرفعال‌سازی حساب
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

// Delete Account Modal Component
function DeleteAccountModal({ isOpen, onClose }) {
    const { logout } = useAuth();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="حذف دائمی حساب کاربری" size="md">
            <Formik
                initialValues={{
                    password: "",
                    confirmation: "",
                }}
                validationSchema={accountDeletionSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const response = await deleteAccount(values);

                        if (response.success) {
                            toast.success("حساب کاربری برای همیشه حذف شد");
                            onClose();
                            // Logout user after deletion
                            setTimeout(() => logout(), 1500);
                        } else {
                            toast.error(response.message || "خطا در حذف حساب");
                        }
                    } catch (error) {
                        console.error("Deletion error:", error);
                        toast.error(error.response?.data?.message || "خطا در حذف حساب");
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-3 mb-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-600 mb-2">
                                        این عملیات به هیچ عنوان قابل بازگشت نیست!
                                    </p>
                                    <p className="text-sm text-[var(--color-text-primary)] mb-2">
                                        <strong>مواردی که حذف خواهند شد:</strong>
                                    </p>
                                    <ul className="text-sm text-[var(--color-text-secondary)] list-disc list-inside space-y-1">
                                        <li>پروفایل و تمام اطلاعات شخصی شما</li>
                                        <li>فایل‌های آپلود شده و تصویر پروفایل</li>
                                        <li>تمام تنظیمات و اولویت‌های شما</li>
                                        <li>تاریخچه فعالیت‌های حساب شما</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <InputField
                            label="رمز عبور"
                            name="password"
                            type="password"
                            required
                            helperText="برای تایید هویت، رمز عبور خود را وارد کنید"
                        />

                        <InputField
                            label="عبارت DELETE را برای تایید تایپ کنید"
                            name="confirmation"
                            placeholder="DELETE"
                            required
                            helperText="عبارت DELETE را با حروف بزرگ وارد کنید"
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                انصراف
                            </Button>
                            <Button
                                type="submit"
                                variant="danger"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                icon={<Trash2 className="w-4 h-4" />}
                            >
                                حذف دائمی
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
