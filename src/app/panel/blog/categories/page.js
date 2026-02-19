"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Skeleton } from "@/components/common/Skeleton";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import {
    Folder,
    Plus,
    Edit2,
    Trash2,
    ArrowLeft,
    GripVertical,
    FileText,
    Eye,
    EyeOff,
} from "lucide-react";

export default function BlogCategoriesPage() {
    const router = useRouter();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#6366f1",
        icon: "",
        parent: "",
        order: 0,
        isActive: true,
        seo: {
            metaTitle: "",
            metaDescription: "",
        },
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const { data } = await axios.get("/api/blog/categories?includeInactive=true");
            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            toast.error("خطا در بارگذاری دسته‌بندی‌ها");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            color: "#6366f1",
            icon: "",
            parent: "",
            order: 0,
            isActive: true,
            seo: {
                metaTitle: "",
                metaDescription: "",
            },
        });
        setEditingCategory(null);
    };

    // Open create modal
    const handleCreate = () => {
        resetForm();
        setShowModal(true);
    };

    // Open edit modal
    const handleEdit = (category) => {
        setFormData({
            name: category.name || "",
            description: category.description || "",
            color: category.color || "#6366f1",
            icon: category.icon || "",
            parent: category.parent || "",
            order: category.order || 0,
            isActive: category.isActive !== false,
            seo: {
                metaTitle: category.seo?.metaTitle || "",
                metaDescription: category.seo?.metaDescription || "",
            },
        });
        setEditingCategory(category);
        setShowModal(true);
    };

    // Save category
    const handleSave = async () => {
        if (!formData.name) {
            toast.error("نام دسته‌بندی الزامی است");
            return;
        }

        setIsSaving(true);
        try {
            if (editingCategory) {
                const { data } = await axios.put(
                    `/api/blog/categories/${editingCategory._id}`,
                    formData
                );
                if (data.success) {
                    toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
                }
            } else {
                const { data } = await axios.post("/api/blog/categories", formData);
                if (data.success) {
                    toast.success("دسته‌بندی با موفقیت ایجاد شد");
                }
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || "خطا در ذخیره دسته‌بندی");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete confirmation
    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/blog/categories/${categoryToDelete._id}`);
            toast.success("دسته‌بندی با موفقیت حذف شد");
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || "خطا در حذف دسته‌بندی");
        } finally {
            setIsDeleting(false);
        }
    };

    // Color presets
    const colorPresets = [
        "#6366f1", // Indigo
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#ef4444", // Red
        "#f97316", // Orange
        "#eab308", // Yellow
        "#22c55e", // Green
        "#06b6d4", // Cyan
        "#3b82f6", // Blue
        "#64748b", // Slate
    ];

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row-reverse md:items-center md:justify-between mb-6" style={{ direction: 'rtl' }}>
                <div className="flex flex-row-reverse items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/panel/blog")}
                        icon={<ArrowLeft size={18} className="rotate-180" />}
                    >
                        بازگشت
                    </Button>
                    <div className="text-right">
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            دسته‌بندی‌های وبلاگ
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                            سازماندهی مطالب وبلاگ با استفاده از دسته‌بندی‌ها
                        </p>
                    </div>
                </div>
                <Button onClick={handleCreate} icon={<Plus size={18} />}>
                    دسته‌بندی جدید
                </Button>
            </div>

            {/* Categories List */}
            <Card style={{ direction: 'rtl' }}>
                {loading ? (
                    <Skeleton type="table" rows={5} />
                ) : categories.length === 0 ? (
                    <div className="text-center py-12">
                        <Folder
                            size={48}
                            style={{ color: "var(--color-text-secondary)", margin: "0 auto" }}
                        />
                        <p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>
                            هنوز هیچ دسته‌بندی ایجاد نشده است
                        </p>
                        <Button
                            className="mt-4"
                            onClick={handleCreate}
                            icon={<Plus size={18} />}
                        >
                            ایجاد اولین دسته‌بندی
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="flex flex-row-reverse items-center justify-between p-4 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-background-secondary)] transition-colors"
                            >
                                <div className="flex flex-row-reverse items-center gap-4">
                                    <GripVertical
                                        size={20}
                                        className="text-[var(--color-text-tertiary)] cursor-grab"
                                    />
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <div className="text-right">
                                        <div className="flex flex-row-reverse items-center justify-end gap-2">
                                            <span
                                                className="font-medium"
                                                style={{ color: "var(--color-text-primary)" }}
                                            >
                                                {category.name}
                                            </span>
                                            {!category.isActive && (
                                                <Badge variant="warning" size="sm">
                                                    مخفی
                                                </Badge>
                                            )}
                                        </div>
                                        <div
                                            className="text-sm flex flex-row-reverse items-center justify-end gap-3"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            <span className="direction-ltr">/{category.slug}</span>
                                            <span className="flex flex-row-reverse items-center gap-1">
                                                <FileText size={12} />
                                                {(category.postCount || 0).toLocaleString('fa-IR')} مطلب
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 hover:bg-[var(--color-background-tertiary)] rounded-lg transition-colors"
                                        title="ویرایش"
                                    >
                                        <Edit2
                                            size={16}
                                            className="text-[var(--color-text-secondary)]"
                                        />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(category)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={editingCategory ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
                size="lg"
            >
                <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            نام <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="نام دسته‌بندی"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">توضیحات</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="توضیح کوتاهی درباره این دسته‌بندی"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none text-right"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium mb-2">رنگ</label>
                        <div className="flex flex-row-reverse items-center justify-end gap-3">
                            <div className="flex flex-row-reverse gap-2">
                                {colorPresets.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({ ...prev, color }))
                                        }
                                        className={`w-7 h-7 rounded-full transition-transform ${
                                            formData.color === color
                                                ? "ring-2 ring-offset-2 ring-[var(--color-primary)] scale-110"
                                                : "hover:scale-110"
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                                }
                                className="w-10 h-10 rounded cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Parent Category */}
                    {categories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                دسته‌بندی مادر
                            </label>
                            <select
                                value={formData.parent}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, parent: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                            >
                                <option value="">بدون انتخاب (سطح اصلی)</option>
                                {categories
                                    .filter((c) => c._id !== editingCategory?._id)
                                    .map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* Active Status */}
                    <div>
                        <label className="flex flex-row-reverse items-center justify-end gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        isActive: e.target.checked,
                                    }))
                                }
                                className="w-4 h-4 rounded"
                            />
                            {formData.isActive ? (
                                <Eye size={16} className="text-green-500" />
                            ) : (
                                <EyeOff size={16} className="text-[var(--color-text-secondary)]" />
                            )}
                            <span style={{ color: "var(--color-text-primary)" }}>
                                {formData.isActive ? "نمایش در سایت" : "مخفی از دید عموم"}
                            </span>
                        </label>
                    </div>

                    {/* SEO Section */}
                    <div className="pt-4 border-t border-[var(--color-border)] text-right">
                        <h4 className="font-medium mb-3">تنظیمات سئو (SEO)</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    عنوان متا
                                </label>
                                <input
                                    type="text"
                                    value={formData.seo.metaTitle}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            seo: { ...prev.seo, metaTitle: e.target.value },
                                        }))
                                    }
                                    placeholder={formData.name || "عنوان دسته‌بندی برای موتورهای جستجو"}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                                    maxLength={60}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    توضیحات متا
                                </label>
                                <textarea
                                    value={formData.seo.metaDescription}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            seo: { ...prev.seo, metaDescription: e.target.value },
                                        }))
                                    }
                                    placeholder="توضیحاتی که کاربران در نتایج گوگل از این دسته‌بندی می‌بینند"
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none text-right"
                                    maxLength={160}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row-reverse justify-end gap-3 pt-4">
                        <Button onClick={handleSave} loading={isSaving}>
                            {editingCategory ? "به‌روزرسانی" : "ایجاد"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                        >
                            انصراف
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="حذف دسته‌بندی"
            >
                <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                    <p style={{ color: "var(--color-text-primary)" }}>
                        آیا از حذف دسته‌بندی &quot;<strong>{categoryToDelete?.name}</strong>
                        &quot; اطمینان دارید؟ مطالب این دسته‌بندی به حالت بدون دسته‌بندی تغییر می‌یابند.
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
