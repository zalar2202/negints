import {
    LayoutDashboard,
    Users,
    Blocks,
    UserPlus,
    Database,
    Network,
    Bell,
    Send,
    Settings,
    Tag,
    Mail,
    Building2,
    FileText,
    CreditCard,
    Ticket,
    Activity,
    ShoppingCart,
    Store,
    Bot,
    Calculator,
    PenSquare,
    Image as ImageIcon,
    MessageSquare,
} from "lucide-react";

export const navigation = [
    {
        name: "داشبورد",
        href: "/panel/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "فروشگاه محصولات",
        href: "/panel/shop",
        icon: Store,
    },
    {
        name: "سبد خرید من",
        href: "/panel/cart",
        icon: ShoppingCart,
    },

    {
        name: "امور مالی",
        href: "/panel/accounting",
        icon: CreditCard,
        roles: ["user"],
    },
    {
        name: "فاکتورها",
        href: "/panel/invoices",
        icon: FileText,
        roles: ["user"],
    },
    {
        name: "تیکت‌های پشتیبانی",
        href: "/panel/tickets",
        icon: Ticket,
    },
    {
        name: "اعلان‌ها",
        href: "/panel/notifications",
        icon: Bell,
    },
    {
        name: "تنظیمات",
        href: "/panel/settings",
        icon: Settings,
    },
];

// Admin-only navigation items
export const adminNavigation = [
    {
        name: "مدیریت کاربران",
        href: "/panel/users",
        icon: Users,
        roles: ["admin", "manager"],
    },
    {
        name: "حسابداری",
        href: "/panel/admin/accounting",
        icon: Calculator,
        roles: ["admin", "manager"],
    },
    {
        name: "مشتریان",
        href: "/panel/clients",
        icon: Building2,
        roles: ["admin", "manager"],
    },
    {
        name: "فاکتورها (مدیریت)",
        href: "/panel/invoices",
        icon: FileText,
        roles: ["admin", "manager"],
    },
    {
        name: "تراکنش‌های مالی",
        href: "/panel/payments",
        icon: CreditCard,
        roles: ["admin", "manager"],
    },
    {
        name: "مدیریت محصولات",
        href: "/panel/packages",
        icon: Blocks,
        roles: ["admin", "manager"],
    },

    {
        name: "جشنواره‌ها و تخفیف‌ها",
        href: "/panel/promotions",
        icon: Tag,
        roles: ["admin", "manager"],
    },

    {
        name: "ارسال اعلان عمومی",
        href: "/panel/notifications/send",
        icon: Send,
        roles: ["admin", "manager"],
    },
    {
        name: "بازاریابی ایمیلی",
        href: "/panel/marketing/email",
        icon: Mail,
        roles: ["admin", "manager"],
    },
    {
        name: "دستیار هوشمند",
        href: "/panel/admin/ai-assistant",
        icon: Bot,
        roles: ["admin", "manager"],
    },
    {
        name: "مدیریت وبلاگ",
        href: "/panel/blog",
        icon: PenSquare,
        roles: ["admin", "manager"],
    },
    {
        name: "دیدگاه‌ها",
        href: "/panel/blog/comments",
        icon: MessageSquare,
        roles: ["admin", "manager"],
    },
    {
        name: "کتابخانه رسانه",
        href: "/panel/media",
        icon: ImageIcon,
        roles: ["admin", "manager"],
    },
];

// Development/Testing pages (optional, can be hidden in production)
export const devNavigation = [
    {
        name: "دموی کامپوننت‌ها",
        href: "/panel/components-demo",
        icon: Blocks,
    },
    {
        name: "ثبت ادمین جدید",
        href: "/panel/register-admin",
        icon: UserPlus,
    },
    {
        name: "تست اتصال پایگاه داده",
        href: "/panel/test-connection",
        icon: Database,
    },
    {
        name: "تست اکسیرس",
        href: "/panel/test-axios",
        icon: Network,
    },
    {
        name: "تست پوش فایربیس",
        href: "/panel/firebase-test",
        icon: Bell,
    },
    {
        name: "تست اعلان بک‌ارند",
        href: "/panel/backend-notification-test",
        icon: Send,
    },
    {
        name: "عیب‌یابی احراز هویت",
        href: "/panel/debug-auth",
        icon: Database,
    },
];
