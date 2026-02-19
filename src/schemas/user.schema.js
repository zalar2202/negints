import * as Yup from 'yup';

/**
 * User Form Validation Schema
 */
export const userSchema = Yup.object().shape({
    name: Yup.string()
        .required('نام و نام خانوادگی الزامی است')
        .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
        .max(100, 'نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد')
        .trim(),

    email: Yup.string()
        .email('لطفاً یک آدرس ایمیل معتبر وارد کنید')
        .required('ایمیل الزامی است')
        .trim()
        .lowercase(),

    password: Yup.string()
        .when('$isEdit', {
            is: false,
            then: (schema) => schema
                .required('رمز عبور الزامی است')
                .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
            otherwise: (schema) => schema
                .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
                .notRequired(),
        }),

    role: Yup.string()
        .required('انتخاب نقش الزامی است')
        .oneOf(['admin', 'manager', 'user'], 'نقش انتخاب شده نامعتبر است'),

    status: Yup.string()
        .required('انتخاب وضعیت الزامی است')
        .oneOf(['active', 'inactive', 'suspended'], 'وضعیت انتخاب شده نامعتبر است'),

    phone: Yup.string()
        .nullable()
        .trim(),
    company: Yup.string().nullable().trim(),
    website: Yup.string().nullable().trim(),
    taxId: Yup.string().nullable().trim(),
    whatsapp: Yup.string().nullable().trim(),
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
 * Initial values for create user form
 */
export const userInitialValues = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    phone: '',
    company: '',
    website: '',
    taxId: '',
    whatsapp: '',
    preferredCommunication: 'email',
    address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    },
    technicalDetails: {
        domainName: '',
        serverIP: '',
        serverUser: '',
        serverPassword: '',
        serverPort: '22',
    }
};

/**
 * Get initial values for edit user form
 */
export const getUserEditInitialValues = (user) => ({
    name: user?.name || '',
    email: user?.email || '',
    password: '', // Leave empty for edit
    role: user?.role || 'user',
    status: user?.status || 'active',
    phone: user?.phone || '',
    company: user?.company || '',
    website: user?.website || '',
    taxId: user?.taxId || '',
    whatsapp: user?.whatsapp || '',
    preferredCommunication: user?.preferredCommunication || 'email',
    address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zip: user?.address?.zip || '',
        country: user?.address?.country || '',
    },
    technicalDetails: {
        domainName: user?.technicalDetails?.domainName || '',
        serverIP: user?.technicalDetails?.serverIP || '',
        serverUser: user?.technicalDetails?.serverUser || '',
        serverPassword: user?.technicalDetails?.serverPassword || '',
        serverPort: user?.technicalDetails?.serverPort || '22',
    }
});

