"use client";

import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { useAppDispatch } from "@/lib/hooks";
import { createUser } from "@/features/users/usersSlice";
import { userSchema, userInitialValues } from "@/schemas/user.schema";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { ArrowLeft, Globe, Server, Key, Cpu, User as UserIcon } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

export default function CreateUserPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            await dispatch(createUser(values)).unwrap();
            toast.success("User created successfully");
            router.push("/panel/users");
        } catch (error) {
            toast.error(error.message || "Failed to create user");

            // Handle validation errors
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="mb-6 flex flex-col items-end" dir="rtl">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={18} className="rotate-180" />}
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    بازگشت
                </Button>
                <div className="text-right w-full">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        ایجاد کاربر جدید
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        افزودن کاربر جدید به سیستم
                    </p>
                </div>
            </div>

            {/* Form */}
            <Card className="text-right" dir="rtl">
                <Formik
                    initialValues={userInitialValues}
                    validationSchema={userSchema}
                    onSubmit={handleSubmit}
                    context={{ isEdit: false }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            {/* Form Fields - 2 Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-right">
                                {/* Name */}
                                <InputField
                                    name="name"
                                    label="نام و نام خانوادگی"
                                    placeholder="نام کامل را وارد کنید"
                                    required
                                    className="text-right"
                                />

                                {/* Email */}
                                <InputField
                                    name="email"
                                    label="آدرس ایمیل"
                                    type="email"
                                    placeholder="آدرس ایمیل را وارد کنید"
                                    required
                                    className="text-right"
                                    dir="ltr"
                                />

                                {/* Password */}
                                <InputField
                                    name="password"
                                    label="رمز عبور"
                                    type="password"
                                    placeholder="رمز عبور را وارد کنید"
                                    required
                                    helperText="حداقل ۶ کاراکتر"
                                    className="text-right"
                                    dir="ltr"
                                />

                                {/* Phone */}
                                <InputField
                                    name="phone"
                                    label="شماره تماس"
                                    type="tel"
                                    placeholder="شماره تماس را وارد کنید (اختیاری)"
                                    className="text-right"
                                    dir="ltr"
                                />

                                {/* Role */}
                                <SelectField name="role" label="نقش کاربری" required className="text-right">
                                    <option value="user">کاربر</option>
                                    <option value="manager">مدیر بخش</option>
                                    <option value="admin">مدیر سیستم (Admin)</option>
                                </SelectField>

                                {/* Status */}
                                <SelectField name="status" label="وضعیت" required className="text-right">
                                    <option value="active">فعال</option>
                                    <option value="inactive">غیرفعال</option>
                                    <option value="suspended">مسدود شده</option>
                                </SelectField>
                            </div>

                            {/* Professional Details Section */}
                            <div className="pt-6 mt-6 border-t text-right" style={{ borderColor: 'var(--color-border)' }}>
                                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">اطلاعات حرفه‌ای</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <InputField name="company" label="شرکت / سازمان" placeholder="نام شرکت" className="text-right" />
                                    <InputField name="taxId" label="شناسه مالیاتی / کد اقتصادی" placeholder="VAT-123456" className="text-right" />
                                    <InputField name="website" label="وب‌سایت" placeholder="www.example.com" dir="ltr" className="text-right" />
                                    <InputField name="whatsapp" label="شماره واتس‌اپ" placeholder="+98 912 000 0000" dir="ltr" className="text-right" />
                                    <SelectField name="preferredCommunication" label="روش ارتباطی ترجیحی" className="text-right">
                                        <option value="email">ایمیل</option>
                                        <option value="whatsapp">واتس‌اپ</option>
                                        <option value="phone">تماس تلفنی</option>
                                        <option value="slack">اسلک</option>
                                    </SelectField>
                                </div>
                            </div>

                            {/* Billing Address Section */}
                            <div className="pt-6 mt-6 border-t text-right" style={{ borderColor: 'var(--color-border)' }}>
                                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">آدرس صورتحساب</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="md:col-span-2">
                                        <InputField name="address.street" label="آدرس خیابان" placeholder="خیابان، کوچه، پلاک" className="text-right" />
                                    </div>
                                    <InputField name="address.city" label="شهر" placeholder="تهران" className="text-right" />
                                    <InputField name="address.state" label="استان" placeholder="تهران" className="text-right" />
                                    <InputField name="address.zip" label="کد پستی" placeholder="۱۲۳۴۵۶۷۸۹۰" dir="ltr" className="text-right" />
                                    <InputField name="address.country" label="کشور" placeholder="ایران" className="text-right" />
                                </div>
                            </div>

                            {/* Avatar - Full Width */}
                            <div className="mb-6">
                                <FileUploadField
                                    name="avatar"
                                    label="تصویر پروفایل (اختیاری)"
                                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                    maxSize={5 * 1024 * 1024}
                                    helperText="یک تصویر پروفایل آپلود کنید (PNG, JPG, WEBP - حداکثر ۵ مگابایت)"
                                    showPreview={true}
                                />
                            </div>

                            {/* Technical Details Section */}
                            <div className="pt-6 mt-6 border-t text-right" style={{ borderColor: 'var(--color-border)' }}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                    <Cpu className="w-5 h-5 text-[var(--color-primary)]" />
                                    اطلاعات فنی (مخصوص سرویس‌های مدیریت شده)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <InputField
                                        name="technicalDetails.domainName"
                                        label="نام دامنه"
                                        placeholder="example.com"
                                        icon={<Globe className="w-4 h-4" />}
                                        dir="ltr"
                                        className="text-right"
                                    />
                                    <InputField
                                        name="technicalDetails.serverIP"
                                        label="آدرس IP سرور"
                                        placeholder="1.2.3.4"
                                        icon={<Server className="w-4 h-4" />}
                                        dir="ltr"
                                        className="text-right"
                                    />
                                    <InputField
                                        name="technicalDetails.serverUser"
                                        label="نام کاربری سرور"
                                        placeholder="root"
                                        icon={<UserIcon className="w-4 h-4" />}
                                        dir="ltr"
                                        className="text-right"
                                    />
                                    <InputField
                                        name="technicalDetails.serverPassword"
                                        label="رمز عبور سرور"
                                        type="password"
                                        placeholder="********"
                                        icon={<Key className="w-4 h-4" />}
                                        dir="ltr"
                                        className="text-right"
                                    />
                                    <InputField
                                        name="technicalDetails.serverPort"
                                        label="پورت SSH/FTP"
                                        placeholder="22"
                                        dir="ltr"
                                        className="text-right"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                className="flex gap-3 pt-4 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                >
                                    ایجاد کاربر
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    انصراف
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </ContentWrapper>
    );
}
