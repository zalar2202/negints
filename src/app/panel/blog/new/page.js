"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { SEOPreview } from "@/components/forms/SEOPreview";
import { Modal } from "@/components/common/Modal";
import { MediaPicker } from "@/components/common/MediaPicker";
import {
    Save,
    Send,
    Eye,
    ArrowLeft,
    Image as ImageIcon,
    Tag,
    Folder,
    Calendar,
    Star,
    Pin,
    X,
    Upload,
    Trash2,
} from "lucide-react";

export default function NewBlogPostPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Post data
    const [postData, setPostData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        category: "",
        tags: [],
        featuredImage: {
            url: "",
            alt: "",
            caption: "",
        },
        seo: {
            metaTitle: "",
            metaDescription: "",
            metaKeywords: [],
            ogImage: "",
            noIndex: false,
            noFollow: false,
        },
        isFeatured: false,
        isPinned: false,
        allowComments: true,
        scheduledFor: null,
    });

    const [tagInput, setTagInput] = useState("");
    const [isSlugEdited, setIsSlugEdited] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get("/api/blog/categories");
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isSlugEdited && postData.title) {
            const slug = postData.title
                .toLowerCase()
                // Support Unicode (Persian) in slug generation
                .replace(/[^\p{L}\p{N}\s-]/gu, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setPostData((prev) => ({ ...prev, slug }));
        }
    }, [postData.title, isSlugEdited]);

    // Update field
    const updateField = (field, value) => {
        setPostData((prev) => ({ ...prev, [field]: value }));
    };

    // Update SEO field
    const updateSEOField = (field, value) => {
        setPostData((prev) => ({
            ...prev,
            seo: { ...prev.seo, [field]: value },
        }));
    };

    // Handle tag input
    const handleAddTag = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const tag = tagInput.trim().toLowerCase();
            if (tag && !postData.tags.includes(tag)) {
                setPostData((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tag],
                }));
                // Also add to SEO keywords
                if (!postData.seo.metaKeywords.includes(tag)) {
                    updateSEOField("metaKeywords", [...postData.seo.metaKeywords, tag]);
                }
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setPostData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tagToRemove),
        }));
    };

    // Image upload handler for rich text editor
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "blog");

        try {
            const { data } = await axios.post("/api/media", formData);
            if (data.success) {
                return data.data.url;
            }
            throw new Error(data.error);
        } catch (err) {
            toast.error("Failed to upload image");
            throw err;
        }
    };

    // Handle media selection
    const handleMediaSelect = (media) => {
        setPostData((prev) => ({
            ...prev,
            featuredImage: {
                ...prev.featuredImage,
                url: media.url,
            },
            seo: {
                ...prev.seo,
                ogImage: media.url,
            },
        }));
        toast.success("Featured image selected");
    };

    // Save as draft
    const handleSaveDraft = async () => {
        if (!postData.title || !postData.content) {
            toast.error("Title and content are required");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...postData,
                status: "draft",
            };

            const { data } = await axios.post("/api/blog/posts", payload);
            if (data.success) {
                toast.success("Draft saved successfully");
                router.push(`/panel/blog/${data.data._id}/edit`);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save draft");
        } finally {
            setIsSaving(false);
        }
    };

    // Publish post
    const handlePublish = async () => {
        if (!postData.title || !postData.content) {
            toast.error("Title and content are required");
            return;
        }

        setIsPublishing(true);
        try {
            const payload = {
                ...postData,
                status: "published",
            };

            const { data } = await axios.post("/api/blog/posts", payload);
            if (data.success) {
                toast.success("Post published successfully!");
                router.push("/panel/blog");
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to publish");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row-reverse md:items-center md:justify-between mb-6" style={{ direction: 'rtl' }}>
                <div className="flex items-center gap-4 flex-row-reverse">
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
                            نوشتن مطلب جدید
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleSaveDraft}
                        loading={isSaving}
                        icon={<Save size={18} />}
                    >
                        ذخیره پیش‌نویس
                    </Button>
                    <Button
                        onClick={handlePublish}
                        loading={isPublishing}
                        icon={<Send size={18} />}
                    >
                        انتشار مطلب
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ direction: 'rtl' }}>
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <Card className="text-right">
                        <input
                            type="text"
                            value={postData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="عنوان مطلب"
                            className="w-full text-2xl font-bold border-none outline-none bg-transparent text-right"
                            style={{ color: "var(--color-text-primary)" }}
                        />
                        <div className="flex items-center justify-end gap-2 mt-2" style={{ direction: 'ltr' }}>
                            <input
                                type="text"
                                value={postData.slug}
                                onChange={(e) => {
                                    setIsSlugEdited(true);
                                    updateField("slug", e.target.value);
                                }}
                                placeholder="post-slug"
                                className="flex-1 text-sm border-none outline-none bg-transparent text-right"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                /blog/
                            </span>
                        </div>
                    </Card>

                    {/* Content Editor */}
                    <Card title="محتوای مطلب" className="overflow-visible text-right">
                        <RichTextEditor
                            value={postData.content}
                            onChange={(value) => updateField("content", value)}
                            placeholder="محتوای مطلب خود را اینجا بنویسید..."
                            onImageUpload={handleImageUpload}
                            minHeight={500}
                        />
                    </Card>

                    {/* Excerpt */}
                    <Card title="خلاصه مطلب (گزیده)" className="text-right">
                        <textarea
                            value={postData.excerpt}
                            onChange={(e) => updateField("excerpt", e.target.value)}
                            placeholder="یک خلاصه کوتاه از مطلب (برای نمایش در لیست وبلاگ)"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none text-right"
                            style={{ color: "var(--color-text-primary)" }}
                            maxLength={500}
                        />
                        <p
                            className="text-xs mt-1 text-left"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {postData.excerpt.length.toLocaleString('fa-IR')}/۵۰۰ کاراکتر
                        </p>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Featured Image */}
                    <Card title="تصویر شاخص" className="text-right">
                        {postData.featuredImage.url ? (
                            <div className="relative">
                                <img
                                    src={postData.featuredImage.url}
                                    alt={postData.featuredImage.alt || "Featured"}
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPostData((prev) => ({
                                            ...prev,
                                            featuredImage: { url: "", alt: "", caption: "" },
                                        }))
                                    }
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <input
                                    type="text"
                                    value={postData.featuredImage.alt}
                                    onChange={(e) =>
                                        setPostData((prev) => ({
                                            ...prev,
                                            featuredImage: {
                                                ...prev.featuredImage,
                                                alt: e.target.value,
                                            },
                                        }))
                                    }
                                    placeholder="متن جایگزین (ALT) برای سئو"
                                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                                />
                            </div>
                        ) : (
                            <div 
                                onClick={() => setShowMediaPicker(true)}
                                className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                            >
                                <Upload
                                    size={32}
                                    className="text-[var(--color-text-secondary)]"
                                />
                                <span className="text-sm text-[var(--color-text-secondary)] mt-2">
                                    انتخاب از کتابخانه رسانه
                                </span>
                            </div>
                        )}
                    </Card>

                    <MediaPicker 
                        isOpen={showMediaPicker}
                        onClose={() => setShowMediaPicker(false)}
                        onSelect={handleMediaSelect}
                        allowedType="image"
                        title="انتخاب تصویر شاخص"
                    />

                    {/* Category */}
                    <Card title="دسته‌بندی" className="text-right">
                        <select
                            value={postData.category}
                            onChange={(e) => updateField("category", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <option value="">انتخاب دسته‌بندی...</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="link"
                            className="mt-2 text-sm"
                            onClick={() => router.push("/panel/blog/categories")}
                        >
                            مدیریت دسته‌بندی‌ها
                        </Button>
                    </Card>

                    {/* Tags */}
                    <Card title="برچسب‌ها" className="text-right">
                        <div className="flex flex-wrap gap-2 mb-2 justify-end">
                            {postData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-[var(--color-primary)] text-white"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:bg-white/20 rounded-full p-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="افزودن برچسب (اینتر بزنید)"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                            style={{ color: "var(--color-text-primary)" }}
                        />
                    </Card>

                    {/* Post Settings */}
                    <Card title="تنظیمات انتشار" className="text-right">
                        <div className="space-y-3">
                            <label className="flex items-center justify-end gap-3 cursor-pointer">
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    مطلب ویژه
                                </span>
                                <Star size={16} className="text-yellow-500" />
                                <input
                                    type="checkbox"
                                    checked={postData.isFeatured}
                                    onChange={(e) =>
                                        updateField("isFeatured", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                            </label>

                            <label className="flex items-center justify-end gap-3 cursor-pointer">
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    سنجاق کردن (بالای لیست)
                                </span>
                                <Pin size={16} className="text-blue-500" />
                                <input
                                    type="checkbox"
                                    checked={postData.isPinned}
                                    onChange={(e) => updateField("isPinned", e.target.checked)}
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                            </label>

                            <label className="flex items-center justify-end gap-3 cursor-pointer">
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    امکان ثبت دیدگاه
                                </span>
                                <input
                                    type="checkbox"
                                    checked={postData.allowComments}
                                    onChange={(e) =>
                                        updateField("allowComments", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                            </label>
                        </div>
                    </Card>

                    {/* SEO Section */}
                    <Card title="تنظیمات سئو" className="text-right">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    عنوان متا (Meta Title)
                                </label>
                                <input
                                    type="text"
                                    value={postData.seo.metaTitle}
                                    onChange={(e) =>
                                        updateSEOField("metaTitle", e.target.value)
                                    }
                                    placeholder={postData.title || "عنوان سئو"}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                                    maxLength={70}
                                />
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {(postData.seo.metaTitle || postData.title).length.toLocaleString('fa-IR')}/۶۰
                                    کاراکتر پیشنهادی
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    توضیحات متا (Meta Description)
                                </label>
                                <textarea
                                    value={postData.seo.metaDescription}
                                    onChange={(e) =>
                                        updateSEOField("metaDescription", e.target.value)
                                    }
                                    placeholder="توضیحات کوتاه برای نتایج جستجو..."
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none text-right"
                                    maxLength={160}
                                />
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {postData.seo.metaDescription.length.toLocaleString('fa-IR')}/۱۶۰ کاراکتر پیشنهادی
                                </p>
                            </div>

                            <div className="flex gap-4 justify-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        عدم فالو (No Follow)
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={postData.seo.noFollow}
                                        onChange={(e) =>
                                            updateSEOField("noFollow", e.target.checked)
                                        }
                                        className="w-4 h-4 rounded"
                                    />
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        عدم ایندکس (No Index)
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={postData.seo.noIndex}
                                        onChange={(e) =>
                                            updateSEOField("noIndex", e.target.checked)
                                        }
                                        className="w-4 h-4 rounded"
                                    />
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* SEO Preview */}
                    <SEOPreview
                        title={postData.title}
                        slug={postData.slug}
                        metaTitle={postData.seo.metaTitle}
                        metaDescription={postData.seo.metaDescription}
                        ogImage={postData.seo.ogImage || postData.featuredImage.url}
                        keywords={postData.tags}
                        noIndex={postData.seo.noIndex}
                        noFollow={postData.seo.noFollow}
                    />
                </div>
            </div>
        </ContentWrapper>
    );
}
