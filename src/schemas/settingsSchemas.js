import * as Yup from 'yup';

// Phone number regex (international format)
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

/**
 * Profile Update Schema
 * For updating user profile information (name, phone, bio, avatar)
 */
export const profileUpdateSchema = Yup.object({
    name: Yup.string()
        .required('نام و نام خانوادگی الزامی است')
        .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
        .max(100, 'نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد')
        .trim(),
    phone: Yup.string()
        .matches(phoneRegex, 'فرمت شماره تماس نامعتبر است')
        .trim()
        .nullable(),
    bio: Yup.string()
        .max(500, 'بیوگرافی نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد')
        .trim()
        .nullable(),
    avatar: Yup.mixed().nullable(), // File validation handled by FileUploadField
    company: Yup.string().nullable().trim(),
    website: Yup.string()
        .matches(
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            'فرمت آدرس وب‌سایت نامعتبر است'
        )
        .nullable()
        .trim(),
    taxId: Yup.string().nullable().trim(),
    whatsapp: Yup.string().matches(phoneRegex, 'فرمت شماره واتس‌اپ نامعتبر است').nullable().trim(),
    preferredCommunication: Yup.string().oneOf(['email', 'whatsapp', 'phone', 'slack']).nullable(),
    address: Yup.object({
        street: Yup.string().nullable().trim(),
        city: Yup.string().nullable().trim(),
        state: Yup.string().nullable().trim(),
        zip: Yup.string().nullable().trim(),
        country: Yup.string().nullable().trim(),
    }).nullable(),
    technicalDetails: Yup.object({
        domainName: Yup.string().nullable().trim(),
        serverIP: Yup.string().nullable().trim(),
        serverUser: Yup.string().nullable().trim(),
        serverPassword: Yup.string().nullable(),
        serverPort: Yup.string().nullable().trim(),
    }).nullable(),
});

/**
 * Password Change Schema
 * For changing user password with strong validation
 */
export const passwordChangeSchema = Yup.object({
    currentPassword: Yup.string()
        .required('رمز عبور فعلی الزامی است'),
    newPassword: Yup.string()
        .required('رمز عبور جدید الزامی است')
        .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
        .matches(/[A-Z]/, 'باید شامل حداقل یک حرف بزرگ باشد')
        .matches(/[a-z]/, 'باید شامل حداقل یک حرف کوچک باشد')
        .matches(/[0-9]/, 'باید شامل حداقل یک عدد باشد')
        .matches(/[@$!%*?&#]/, 'باید شامل حداقل یک کاراکتر خاص (@$!%*?&#) باشد')
        .notOneOf(
            [Yup.ref('currentPassword')],
            'رمز عبور جدید باید با رمز عبور فعلی متفاوت باشد'
        ),
    confirmPassword: Yup.string()
        .required('لطفاً رمز عبور جدید را تایید کنید')
        .oneOf([Yup.ref('newPassword')], 'تکرار رمز عبور جدید مطابقت ندارد'),
});

/**
 * Preferences Update Schema
 * For updating user preferences (notifications, theme, privacy)
 */
export const preferencesSchema = Yup.object({
    emailNotifications: Yup.boolean(),
    pushNotifications: Yup.boolean(),
    notificationFrequency: Yup.string()
        .oneOf(['immediate', 'daily', 'weekly'], 'بازه زمانی نامعتبر است'),
    theme: Yup.string()
        .oneOf(['light', 'dark', 'system'], 'تم انتخاب شده نامعتبر است'),
    language: Yup.string(),
    dateFormat: Yup.string(),
    profileVisibility: Yup.string()
        .oneOf(['public', 'private'], 'تنظیمات نمایش نامعتبر است'),
});

/**
 * Account Deactivation Schema
 * For deactivating account with password verification
 */
export const accountDeactivationSchema = Yup.object({
    password: Yup.string()
        .required('برای غیرفعال‌سازی حساب، رمز عبور الزامی است'),
    reason: Yup.string()
        .max(500, 'دلیل نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد')
        .trim()
        .nullable(),
});

/**
 * Account Deletion Schema
 * For permanently deleting account with strong confirmation
 */
export const accountDeletionSchema = Yup.object({
    password: Yup.string()
        .required('برای حذف حساب، رمز عبور الزامی است'),
    confirmation: Yup.string()
        .required('لطفاً برای تایید عبارت DELETE را تایپ کنید')
        .oneOf(['DELETE'], 'برای تایید حذف حساب باید دقیقاً عبارت DELETE را تایپ کنید'),
});

/**
 * Data Export Schema
 * For exporting user data
 */
export const dataExportSchema = Yup.object({
    format: Yup.string()
        .required('Export format is required')
        .oneOf(['json', 'csv'], 'Invalid export format'),
});

