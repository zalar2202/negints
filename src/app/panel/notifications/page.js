"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    deleteAllReadNotifications,
    setFilters,
    selectNotifications,
    selectUnreadCount,
    selectNotificationsLoading,
    selectNotificationsPagination,
    selectNotificationsFilters,
} from "@/features/notifications/notificationsSlice";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { formatDistanceToNow, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

/**
 * Notifications Page
 *
 * Full notification management interface with:
 * - Tabs: All / Unread / Read
 * - Filter by type
 * - Pagination
 * - Mark as read / Mark all as read
 * - Delete notification / Delete all read
 */
export default function NotificationsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const notifications = useAppSelector(selectNotifications);
    const unreadCount = useAppSelector(selectUnreadCount);
    const loading = useAppSelector(selectNotificationsLoading);
    const pagination = useAppSelector(selectNotificationsPagination);
    const filters = useAppSelector(selectNotificationsFilters);

    const [activeTab, setActiveTab] = useState("all"); // all, unread, read
    const [selectedType, setSelectedType] = useState("all");

    // Fetch notifications on mount and when filters/pagination change
    useEffect(() => {
        const readFilter = activeTab === "all" ? null : activeTab === "unread" ? false : true;
        const typeFilter = selectedType === "all" ? null : selectedType;

        dispatch(
            fetchNotifications({
                page: pagination.page,
                limit: 20,
                read: readFilter,
                type: typeFilter,
            })
        );

        dispatch(fetchUnreadCount());
    }, [activeTab, selectedType, pagination.page, dispatch]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        dispatch(setFilters({ read: tab === "all" ? null : tab === "unread" ? false : true }));
    };

    // Handle type filter change
    const handleTypeChange = (type) => {
        setSelectedType(type);
        dispatch(setFilters({ type: type === "all" ? null : type }));
    };

    // Handle mark as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
            dispatch(fetchUnreadCount());
            toast.success("به‌عنوان خوانده شده علامت‌گذاری شد");
        } catch (error) {
            toast.error("خطا در علامت‌گذاری اعلان");
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead()).unwrap();
            dispatch(fetchUnreadCount());
            toast.success("تمامی اعلان‌ها به‌عنوان خوانده شده علامت‌گذاری شدند");
        } catch (error) {
            toast.error("خطا در به‌روزرسانی وضعیت اعلان‌ها");
        }
    };

    // Handle delete notification
    const handleDelete = async (notificationId) => {
        if (!confirm("آیا از حذف این اعلان اطمینان دارید؟")) return;

        try {
            await dispatch(deleteNotificationById(notificationId)).unwrap();
            dispatch(fetchUnreadCount());
            toast.success("اعلان حذف شد");
        } catch (error) {
            toast.error("خطا در حذف اعلان");
        }
    };

    // Handle delete all read
    const handleDeleteAllRead = async () => {
        if (!confirm("آیا از حذف تمامی اعلان‌های خوانده شده اطمینان دارید؟")) return;

        try {
            await dispatch(deleteAllReadNotifications()).unwrap();
            toast.success("تمامی اعلان‌های خوانده شده حذف شدند");
        } catch (error) {
            toast.error("خطا در حذف اعلان‌ها");
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        // Pagination state is managed by Redux, just fetch with new page
        dispatch(
            fetchNotifications({
                page: newPage,
                limit: 20,
                read: activeTab === "all" ? null : activeTab === "unread" ? false : true,
                type: selectedType === "all" ? null : selectedType,
            })
        );
    };

    // Get badge variant for notification type
    const getTypeVariant = (type) => {
        const variants = {
            success: "success",
            error: "danger",
            warning: "warning",
            info: "primary",
            system: "secondary",
            admin: "secondary",
        };
        return variants[type] || "primary";
    };

    const getTypeLabel = (type) => {
        const labels = {
            success: "موفق",
            error: "خطا",
            warning: "هشدار",
            info: "اطلاع",
            system: "سیستمی",
            admin: "مدیریت",
        };
        return labels[type] || type;
    };

    return (
        <ContentWrapper>
            <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-2xl font-black"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            اعلان‌ها
                        </h1>
                        <p
                            className="text-sm mt-1 font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            در جریان آخرین اعلان‌ها و اطلاع‌رسانی‌ها باشید
                            {unreadCount > 0 && ` • ${unreadCount.toLocaleString('fa-IR')} خوانده نشده`}
                        </p>
                    </div>

                    {/* Actions */}
                    {notifications.length > 0 && (
                        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">
                            {unreadCount > 0 && (
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    variant="secondary"
                                    size="sm"
                                    className="w-full sm:w-auto font-bold"
                                    icon={<CheckCheck className="ml-2 w-4 h-4" />}
                                >
                                    همه را خواندم
                                </Button>
                            )}
                            {activeTab === "read" && notifications.length > 0 && (
                                <Button
                                    onClick={handleDeleteAllRead}
                                    variant="danger"
                                    size="sm"
                                    className="w-full sm:w-auto font-bold"
                                    icon={<Trash2 className="ml-2 w-4 h-4" />}
                                >
                                    حذف تمام خوانده شده‌ها
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs & Filters */}
                <Card>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Tabs */}
                        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
                            {[
                                { key: "all", label: "همه", count: pagination.total },
                                { key: "unread", label: "خوانده نشده", count: unreadCount },
                                {
                                    key: "read",
                                    label: "خوانده شده",
                                    count: pagination.total - unreadCount,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
                                        activeTab === tab.key
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                    style={{
                                        color:
                                            activeTab === tab.key
                                                ? "var(--color-primary)"
                                                : "var(--color-text-secondary)",
                                    }}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span
                                            className="inline-flex min-w-[1.5rem] items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full shadow-sm"
                                            style={{
                                                backgroundColor: "var(--color-primary)",
                                                color: "var(--color-text-inverse)",
                                            }}
                                        >
                                            {tab.count.toLocaleString('fa-IR')}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            <Filter
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <select
                                value={selectedType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="px-3 py-1.5 text-sm border rounded-lg font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-background)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <option value="all">همه دسته‌ها</option>
                                <option value="success">موفق</option>
                                <option value="info">اطلاعات</option>
                                <option value="warning">هشدار</option>
                                <option value="error">خطا</option>
                                <option value="system">سیستمی</option>
                                <option value="admin">مدیریت</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Notifications List */}
                {loading && notifications.length === 0 ? (
                    <Card>
                        <Skeleton type="list" count={5} />
                    </Card>
                ) : notifications.length === 0 ? (
                    <EmptyState
                        icon={Bell}
                        title="اعلانی وجود ندارد"
                        description={
                            activeTab === "unread"
                                ? "همه اعلان‌ها را خوانده‌اید! موردی برای نمایش نیست."
                                : activeTab === "read"
                                  ? "هنوز هیچ اعلانی را مطالعه نکرده‌اید."
                                  : "هنوز هیچ اعلانی دریافت نکرده‌اید."
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Card
                                key={notification._id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start text-right">
                                    {/* Read indicator */}
                                    <div className="flex-shrink-0 pt-1">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                !notification.read
                                                    ? "bg-blue-500"
                                                    : "bg-gray-300 dark:bg-gray-600"
                                            }`}
                                        ></div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3
                                                        className={`text-lg font-bold ${
                                                            !notification.read ? "font-black" : ""
                                                        }`}
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {notification.title}
                                                    </h3>
                                                    <Badge
                                                        variant={getTypeVariant(notification.type)}
                                                        className="font-bold text-[10px]"
                                                    >
                                                        {getTypeLabel(notification.type)}
                                                    </Badge>
                                                </div>
                                                <div
                                                    className="text-sm font-medium leading-relaxed"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                    dangerouslySetInnerHTML={{ __html: notification.message }}
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">
                                                {!notification.read && (
                                                    <Button
                                                        onClick={() =>
                                                            handleMarkAsRead(notification._id)
                                                        }
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full sm:w-auto font-bold"
                                                        icon={<Check className="ml-2 w-4 h-4" />}
                                                    >
                                                        خواندم
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => handleDelete(notification._id)}
                                                    variant="danger"
                                                    size="sm"
                                                    className="w-full sm:w-auto font-bold"
                                                    icon={<Trash2 className="ml-2 w-4 h-4" />}
                                                >
                                                    حذف
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div
                                            className="flex flex-wrap items-center gap-4 text-xs font-bold"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            <span>
                                                {formatDistanceToNow(notification.createdAt)} قبل
                                            </span>
                                            <span className="opacity-30">•</span>
                                            <span>
                                                {new Date(notification.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                            {notification.sender && (
                                                <>
                                                    <span className="opacity-30">•</span>
                                                    <span>ارسال شده توسط: {notification.sender.name}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Action button */}
                                        {notification.actionUrl && notification.actionLabel && (
                                            <div className="mt-4">
                                                <Button
                                                    onClick={async () => {
                                                        if (!notification.read) {
                                                            await handleMarkAsRead(
                                                                notification._id
                                                            );
                                                        }
                                                        router.push(notification.actionUrl);
                                                    }}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full sm:w-auto font-bold"
                                                >
                                                    {notification.actionLabel}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.pages > 1 && (
                    <div className="flex justify-center pt-8">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.pages}
                            onPageChange={handlePageChange}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                        />
                    </div>
                )}
            </div>
        </ContentWrapper>
    );
}
