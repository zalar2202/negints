"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUsers } from "@/features/users/usersSlice";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Skeleton } from "@/components/common/Skeleton";
import {
    Users,
    Building2,
    Receipt,
    Package,
    CreditCard,
    Tag,
    TrendingUp,
    Activity,
    Ticket,
    MessageSquare,
    Bell,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

/**
 * Dashboard Home Page
 * Displays overview statistics and quick actions
 */
export default function DashboardPage() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const { list: users, loading } = useAppSelector((state) => state.users);

    const [counts, setCounts] = useState({
        packages: 0,
        promotions: 0,
        clients: 0,
        payments: 0,
        tickets: 0,
        revenue: { total: 0, paid: 0, pending: 0 }
    });

    useEffect(() => {
        if (!user) return;

        const isAdmin = ["admin", "manager"].includes(user.role);

        if (isAdmin) {
            dispatch(fetchUsers({ page: 1, limit: 100 }));
        }

        const fetchStats = async () => {
            try {
                const res = await axios.get("/api/stats/dashboard");
                const statsData = res.data.data;

                if (isAdmin) {
                    setCounts({
                        packages: statsData.packages || 0,
                        promotions: statsData.promotions || 0,
                        clients: statsData.clients || 0,
                        payments: statsData.payments || 0,
                        tickets: statsData.tickets || 0,
                        revenue: statsData.revenue || { total: 0, paid: 0, pending: 0 }
                    });
                } else {
                    setCounts({
                        ...counts,
                        tickets: statsData.tickets || 0,
                    });
                }
            } catch (e) {
                console.error("Stats fetch error", e);
            }
        };

        fetchStats();
    }, [dispatch, user]);

    // Calculate user statistics
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === "active").length;
    const adminUsers = users.filter((user) => user.role === "admin").length;
    const managerUsers = users.filter((user) => user.role === "manager").length;

    // Stats data
    const stats = [
        {
            title: "کل کاربران",
            value: loading ? "..." : totalUsers,
            change: `${activeUsers} فعال`,
            icon: Users,
            color: "blue",
            gradient: "from-blue-500 to-cyan-500",
            link: "/panel/users",
            hide: !["admin", "manager"].includes(user?.role),
        },
        {
            title: "مشتریان",
            value: counts.clients,
            change: "مدیریت حساب‌ها",
            icon: Building2,
            color: "green",
            gradient: "from-green-500 to-emerald-500",
            link: "/panel/clients",
            hide: !["admin", "manager"].includes(user?.role),
        },
        {
            title: "کل درآمد (تومان)",
            value: formatCurrency(counts.revenue.total, 'IRT'),
            change: `${formatCurrency(counts.revenue.paid, 'IRT')} پرداخت شده`,
            icon: CreditCard,
            color: "purple",
            gradient: "from-purple-500 to-pink-500",
            link: "/panel/payments",
            hide: !["admin", "manager"].includes(user?.role),
        },

        {
            title: "تیکت‌های باز",
            value: counts.tickets || 0,
            change: "درخواست‌های فعال",
            icon: Ticket,
            color: "indigo",
            gradient: "from-indigo-500 to-purple-500",
            link: "/panel/tickets",
        },
        {
            title: "محصولات",
            value: counts.packages,
            change: "مدیریت کاتالوگ",
            icon: Package,
            color: "orange",
            gradient: "from-orange-500 to-red-500",
            link: "/panel/packages",
            hide: !["admin", "manager"].includes(user?.role),
        },
    ];

    // Quick actions
    const quickActions = [

        {
            title: "تیکت‌های پشتیبانی",
            description: "نیاز به کمک دارید؟ با ما در ارتباط باشید",
            icon: MessageSquare,
            link: "/panel/tickets",
            badge: `${counts.tickets} باز`,
            variant: "primary",
        },
        {
            title: "مدیریت کاربران",
            description: "مشاهده و مدیریت تمامی کاربران سیستم",
            icon: Users,
            link: "/panel/users",
            badge: `${totalUsers} کاربر`,
            variant: "primary",
            hide: !["admin", "manager"].includes(user?.role),
        },
        {
            title: "فروشگاه محصولات",
            description: "مرور محصولات و خدمات موجود",
            icon: Package,
            link: "/panel/shop",
            badge: "مشاهده",
            variant: "secondary",
        },
        {
            title: "امور مالی",
            description: "پیگیری سوابق پرداخت و تراکنش‌ها",
            icon: CreditCard,
            link: "/panel/payments",
            badge: "تاریخچه",
            variant: "secondary",
            hide: !["admin", "manager"].includes(user?.role),
        },
        {
            title: "ارسال اعلان",
            description: "ارسال اعلان عمومی به کاربران",
            icon: Bell,
            link: "/panel/notifications/send",
            badge: "ارسال",
            variant: "secondary",
            hide: !["admin", "manager"].includes(user?.role),
        },
    ];

    // Recent activity (based on user data for now)
    const recentUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <ContentWrapper>
            {/* Page Header */}
            <div className="mb-8 text-right" style={{ direction: 'rtl' }}>
                <h1
                    className="text-3xl font-black font-heading"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {["admin", "manager"].includes(user?.role) ? "پنل مدیریت" : "داشبورد من"}
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    {["admin", "manager"].includes(user?.role)
                        ? "خوش آمدید! خلاصه‌ای از وضعیت سیستم را در زیر مشاهده می‌کنید."
                        : `خوش آمدید، ${user?.name}! خلاصه‌ای از خدمات شما در زیر قابل مشاهده است.`}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-right" style={{ direction: 'rtl' }}>
                {stats
                    .filter((s) => !s.hide)
                    .map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={index} href={stat.link}>
                                <Card hoverable className="group cursor-pointer h-full">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                                {stat.title}
                                            </p>
                                            {loading && index === 0 ? (
                                                <Skeleton
                                                    variant="text"
                                                    className="h-8 w-20 mb-2"
                                                />
                                            ) : (
                                                <h3 className="text-3xl font-black text-[var(--color-text-primary)] mb-2">
                                                    {stat.value}
                                                </h3>
                                            )}
                                            <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 font-bold">
                                                {index === 0 ? (
                                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                                ) : (
                                                    <Activity className="w-3 h-3" />
                                                )}
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
            </div>

            {/* Revenue Summary Widget (Admin Only) */}
            {["admin", "manager"].includes(user?.role) && (
                <div className="mb-8 text-right" style={{ direction: 'rtl' }}>
                    <Card className="bg-gradient-to-br from-indigo-900/10 to-purple-900/5 border-indigo-100/50">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-[var(--color-text-primary)]">خلاصه وضعیت مالی</h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">مجموع درآمد حاصل از تمامی فاکتورها (به تومان)</p>
                            </div>
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">کل درآمد فاکتور شده</p>
                                    <h3 className="text-2xl font-black text-indigo-600">{formatCurrency(counts.revenue.total, 'IRT')}</h3>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-indigo-600 w-full" />
                                </div>
                                <p className="text-[10px] text-gray-400">مجموع ارزش تمامی فاکتورهای صادر شده</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">درآمد وصول شده</p>
                                    <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(counts.revenue.paid, 'IRT')}</h3>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-emerald-500" 
                                        style={{ width: `${(counts.revenue.paid / (counts.revenue.total || 1) * 100).toFixed(0)}%` }} 
                                     />
                                </div>
                                <p className="text-[10px] text-gray-400">{((counts.revenue.paid / (counts.revenue.total || 1)) * 100).toFixed(1)}٪ از کل مبلغ وصول شده است</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">در انتظار پرداخت</p>
                                    <h3 className="text-2xl font-black text-amber-600">{formatCurrency(counts.revenue.pending, 'IRT')}</h3>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-amber-500" 
                                        style={{ width: `${(counts.revenue.pending / (counts.revenue.total || 1) * 100).toFixed(0)}%` }} 
                                     />
                                </div>
                                <p className="text-[10px] text-gray-400">{((counts.revenue.pending / (counts.revenue.total || 1)) * 100).toFixed(1)}٪ در جریان پرداخت است</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" style={{ direction: 'rtl' }}>
                {/* Quick Actions */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-black text-[var(--color-text-primary)] mb-4">
                            دسترسی سریع
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quickActions
                                .filter((a) => !a.hide)
                                .map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link key={index} href={action.link}>
                                            <div className="p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors cursor-pointer group">
                                                <Icon className="w-8 h-8 text-[var(--color-primary)] mb-3 group-hover:scale-110 transition-transform" />
                                                <h3 className="font-black text-[var(--color-text-primary)] mb-1">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                                    {action.description}
                                                </p>
                                                <Badge variant={action.variant} size="sm">
                                                    {action.badge}
                                                </Badge>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                {["admin", "manager"].includes(user?.role) && (
                    <div>
                        <Card>
                            <h2 className="text-xl font-black text-[var(--color-text-primary)] mb-4">
                                کاربران اخیر
                            </h2>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} variant="text" className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : recentUsers.length === 0 ? (
                                <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
                                    کاربری یافت نشد
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentUsers.map((user) => (
                                        <Link
                                            key={user._id || user.id}
                                            href={`/panel/users/${user._id || user.id}`}
                                        >
                                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-hover)] transition-colors cursor-pointer">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[var(--color-text-primary)] text-sm truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        user.status === "active"
                                                            ? "success"
                                                            : user.status === "inactive"
                                                              ? "warning"
                                                              : "danger"
                                                    }
                                                    size="sm"
                                                >
                                                    {user.status === "active" ? "فعال" : user.status === "inactive" ? "غیرفعال" : user.status}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {!loading && recentUsers.length > 0 && (
                                <Link href="/panel/users">
                                    <div className="mt-4 text-center text-sm font-bold text-[var(--color-primary)] hover:underline cursor-pointer">
                                        مشاهده همه کاربران ←
                                    </div>
                                </Link>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {/* System Status */}
            {["admin", "manager"].includes(user?.role) && (
                <div className="mt-6 text-right" style={{ direction: 'rtl' }}>
                    <Card>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-center sm:text-right">
                                <h2 className="text-lg font-black text-[var(--color-text-primary)] mb-1">
                                    وضعیت سیستم
                                </h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    تمامی سرویس‌ها فعال هستند
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="text-center">
                                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 font-bold">
                                         پایگاه داده
                                    </p>
                                    <Badge variant="success" size="sm" dot>
                                        متصل
                                    </Badge>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 font-bold">
                                        احراز هویت
                                    </p>
                                    <Badge variant="success" size="sm" dot>
                                        فعال
                                    </Badge>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-[var(--color-text-secondary)] mb-1 font-bold">
                                        سرویس API
                                    </p>
                                    <Badge variant="success" size="sm" dot>
                                        سالم
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </ContentWrapper>
    );
}

