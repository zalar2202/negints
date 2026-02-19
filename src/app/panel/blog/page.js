"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableActions,
} from "@/components/tables";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Skeleton } from "@/components/common/Skeleton";
import { Pagination } from "@/components/common/Pagination";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import {
    FileText,
    Plus,
    Search,
    Eye,
    Calendar,
    Tag,
    Star,
    Pin,
    Clock,
} from "lucide-react";

export default function BlogPostsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch posts
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams();
            params.set("page", pagination.page.toString());
            params.set("limit", pagination.limit.toString());
            params.set("admin", "true");
            
            if (searchTerm) params.set("search", searchTerm);
            if (statusFilter !== "all") params.set("status", statusFilter);

            const { data } = await axios.get(`/api/blog/posts?${params.toString()}`);
            
            if (data.success) {
                setPosts(data.data);
                setPagination(data.pagination);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch posts");
            toast.error("Failed to fetch blog posts");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

    // Initialize from URL params
    useEffect(() => {
        const page = parseInt(searchParams.get("page")) || 1;
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";

        setPagination((prev) => ({ ...prev, page }));
        setSearchTerm(search);
        setStatusFilter(status);
    }, [searchParams]);

    // Fetch posts when filters change
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Update URL
    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location);
            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "all" && value !== "") {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });
            if (url.searchParams.get("page") === "1") {
                url.searchParams.delete("page");
            }
            router.push(url.pathname + url.search, { scroll: false });
        },
        [router]
    );

    // Search debounce
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            updateUrl({
                page: 1,
                search: searchTerm,
                status: statusFilter,
            });
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, updateUrl, statusFilter]);

    // Handle filter change
    const handleFilterChange = (value) => {
        setStatusFilter(value);
        updateUrl({
            page: 1,
            search: searchTerm,
            status: value,
        });
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
        updateUrl({
            page: newPage,
            search: searchTerm,
            status: statusFilter,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle delete
    const handleDeleteClick = (post) => {
        setPostToDelete(post);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/blog/posts/${postToDelete._id}`);
            toast.success("Post deleted successfully");
            setDeleteModalOpen(false);
            setPostToDelete(null);
            fetchPosts();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    // Status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case "published":
                return "success";
            case "draft":
                return "warning";
            case "scheduled":
                return "info";
            case "archived":
                return "default";
            default:
                return "default";
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row-reverse md:items-center md:justify-between mb-6" style={{ direction: 'rtl' }}>
                <div className="text-right">
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        مطالب وبلاگ
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        ایجاد و مدیریت محتوای وبلاگ
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/panel/blog/categories")}
                    >
                        دسته‌بندی‌ها
                    </Button>
                    <Button
                        onClick={() => router.push("/panel/blog/new")}
                        icon={<Plus size={18} />}
                    >
                        مطلب جدید
                    </Button>
                </div>
            </div>

            {/* Filters Card */}
            <Card className="mb-6" style={{ direction: 'rtl' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <input
                                type="text"
                                placeholder="جستجو در مطالب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 rounded-lg border text-right"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background)",
                                    color: "var(--color-text-primary)",
                                }}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border text-right"
                            style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                            }}
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            <option value="published">منتشر شده</option>
                            <option value="draft">پیش‌نویس</option>
                            <option value="scheduled">زمان‌بندی شده</option>
                            <option value="archived">بایگانی شده</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Posts Table */}
            <Card style={{ direction: 'rtl' }}>
                {loading ? (
                    <Skeleton type="table" rows={10} />
                ) : error ? (
                    <div className="text-center py-12">
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                        <Button variant="primary" className="mt-4" onClick={fetchPosts}>
                            تلاش مجدد
                        </Button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText
                            size={48}
                            style={{ color: "var(--color-text-secondary)", margin: "0 auto" }}
                        />
                        <p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>
                            مطلبی یافت نشد
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => router.push("/panel/blog/new")}
                            icon={<Plus size={18} />}
                        >
                            اولین مطلب خود را بنویسید
                        </Button>
                    </div>
                ) : (
                    <>
                        <Table className="text-right">
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell key="title" align="right">عنوان</TableHeaderCell>
                                    <TableHeaderCell key="status" align="right">وضعیت</TableHeaderCell>
                                    <TableHeaderCell key="category" align="right">دسته‌بندی</TableHeaderCell>
                                    <TableHeaderCell key="author" align="right">نویسنده</TableHeaderCell>
                                    <TableHeaderCell key="stats" align="right">آمار</TableHeaderCell>
                                    <TableHeaderCell key="date" align="right">تاریخ</TableHeaderCell>
                                    <TableHeaderCell key="actions" align="left">
                                        عملیات
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {posts.map((post) => (
                                    <TableRow key={post._id}>
                                        <TableCell>
                                            <div className="flex flex-row-reverse items-start gap-2">
                                                <div className="min-w-0 flex-1 text-right">
                                                    <div
                                                        className="font-medium truncate max-w-[250px]"
                                                        style={{ color: "var(--color-text-primary)" }}
                                                        title={post.title}
                                                    >
                                                        {post.title}
                                                    </div>
                                                    <div
                                                        className="text-xs mt-0.5 flex flex-row-reverse items-center justify-end gap-2"
                                                        style={{ color: "var(--color-text-secondary)" }}
                                                    >
                                                        <span className="truncate max-w-[180px] direction-ltr">
                                                            /{post.slug}
                                                        </span>
                                                        {post.isFeatured && (
                                                            <Star
                                                                size={12}
                                                                className="text-yellow-500 fill-yellow-500"
                                                            />
                                                        )}
                                                        {post.isPinned && (
                                                            <Pin size={12} className="text-blue-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(post.status)}>
                                                {post.status === 'published' ? 'منتشر شده' : 
                                                 post.status === 'draft' ? 'پیش‌نویس' :
                                                 post.status === 'scheduled' ? 'زمان‌بندی شده' :
                                                 post.status === 'archived' ? 'بایگانی شده' : post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {post.category ? (
                                                <span
                                                    className="text-sm px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: `${post.category.color}20`,
                                                        color: post.category.color,
                                                    }}
                                                >
                                                    {post.category.name}
                                                </span>
                                            ) : (
                                                <span style={{ color: "var(--color-text-secondary)" }}>
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ color: "var(--color-text-secondary)" }}>
                                                {post.author?.name || "نامشخص"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="flex flex-row-reverse items-center justify-end gap-3 text-xs"
                                                style={{ color: "var(--color-text-secondary)" }}
                                            >
                                                <span
                                                    className="flex flex-row-reverse items-center gap-1"
                                                    title="بازدیدها"
                                                >
                                                    <Eye size={12} />
                                                    {post.viewCount?.toLocaleString('fa-IR') || 0}
                                                </span>
                                                <span
                                                    className="flex flex-row-reverse items-center gap-1"
                                                    title="زمان مطالعه"
                                                >
                                                    <Clock size={12} />
                                                    {post.readingTime?.toLocaleString('fa-IR') || 1} دقیقه
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="flex flex-row-reverse items-center justify-end gap-1 text-sm"
                                                style={{ color: "var(--color-text-secondary)" }}
                                            >
                                                <Calendar size={12} />
                                                {formatDate(post.publishedAt || post.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell align="left">
                                            <TableActions
                                                onView={() => window.open(`/blog/${post.slug}`, "_blank")}
                                                onEdit={() =>
                                                    router.push(`/panel/blog/${post._id}/edit`)
                                                }
                                                onDelete={() => handleDeleteClick(post)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </Table>

                        {/* Pagination */}
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.pages}
                                onPageChange={handlePageChange}
                                totalItems={pagination.total}
                                itemsPerPage={pagination.limit}
                            />
                        </div>
                    </>
                )}
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="حذف مطلب"
            >
                <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                    <p style={{ color: "var(--color-text-primary)" }}>
                        آیا از حذف مطلب &quot;<strong>{postToDelete?.title}</strong>
                        &quot; اطمینان دارید؟ این عمل قابل بازگشت نیست.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            انصراف
                        </Button>
                        <Button variant="danger" onClick={confirmDelete} loading={isDeleting}>
                            حذف دائمی
                        </Button>
                    </div>
                </div>
            </Modal>
        </ContentWrapper>
    );
}
