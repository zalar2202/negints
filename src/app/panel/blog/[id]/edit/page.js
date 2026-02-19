"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { SEOPreview } from "@/components/forms/SEOPreview";
import { Skeleton } from "@/components/common/Skeleton";
import { Badge } from "@/components/common/Badge";
import { MediaPicker } from "@/components/common/MediaPicker";
import {
    Save,
    Send,
    Eye,
    ArrowLeft,
    Upload,
    Trash2,
    Star,
    Pin,
    X,
    ExternalLink,
    Archive,
} from "lucide-react";

export default function EditBlogPostPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    // Post data
    const [postData, setPostData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        category: "",
        tags: [],
        status: "draft",
        featuredImage: {
            url: "",
            alt: "",
            caption: "",
        },
        seo: {
            metaTitle: "",
            metaDescription: "",
            metaKeywords: [],
            focusKeyword: "",
            schema: "",
            ogImage: "",
            noIndex: false,
            noFollow: false,
        },
        isFeatured: false,
        isPinned: false,
        allowComments: true,
        showAuthor: true,
        publishedAt: null,
        viewCount: 0,
        readingTime: 1,
    });

    const [tagInput, setTagInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await axios.get(`/api/blog/posts/${id}`);
                if (data.success) {
                    const post = data.data;
                    setPostData({
                        title: post.title || "",
                        slug: post.slug || "",
                        content: post.content || "",
                        excerpt: post.excerpt || "",
                        category: post.category?._id || post.category || "",
                        tags: post.tags || [],
                        status: post.status || "draft",
                        featuredImage: post.featuredImage || { url: "", alt: "", caption: "" },
                        seo: {
                            metaTitle: post.seo?.metaTitle || "",
                            metaDescription: post.seo?.metaDescription || "",
                            metaKeywords: post.seo?.metaKeywords || [],
                            focusKeyword: post.seo?.focusKeyword || "",
                            schema: post.seo?.schema || "",
                            ogImage: post.seo?.ogImage || "",
                            noIndex: post.seo?.noIndex || false,
                            noFollow: post.seo?.noFollow || false,
                        },
                        isFeatured: post.isFeatured || false,
                        isPinned: post.isPinned || false,
                        allowComments: post.allowComments !== false,
                        showAuthor: post.showAuthor !== false,
                        publishedAt: post.publishedAt,
                        viewCount: post.viewCount || 0,
                        readingTime: post.readingTime || 1,
                    });
                }
            } catch (err) {
                toast.error("خطا در بارگذاری مطلب");
                router.push("/panel/blog");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, router]);

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

    // Handle keyword input
    const handleAddKeyword = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const keyword = keywordInput.trim();
            if (keyword && !postData.seo.metaKeywords.includes(keyword)) {
                updateSEOField("metaKeywords", [...postData.seo.metaKeywords, keyword]);
            }
            setKeywordInput("");
        }
    };

    const removeKeyword = (keywordToRemove) => {
        updateSEOField(
            "metaKeywords",
            postData.seo.metaKeywords.filter((k) => k !== keywordToRemove)
        );
    };

    // Image upload handler
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

    // Save changes
    const handleSave = async (newStatus = null) => {
        if (!postData.title || !postData.content) {
            toast.error("عنوان و محتوا الزامی هستند");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...postData,
                status: newStatus || postData.status,
            };

            const { data } = await axios.put(`/api/blog/posts/${id}`, payload);
            if (data.success) {
                toast.success("تغییرات با موفقیت ذخیره شد");
                if (newStatus) {
                    setPostData((prev) => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "خطا در ذخیره مطلب");
        } finally {
            setIsSaving(false);
        }
    };

    // Publish post
    const handlePublish = async () => {
        setIsPublishing(true);
        await handleSave("published");
        setIsPublishing(false);
    };

    // Unpublish post
    const handleUnpublish = async () => {
        await handleSave("draft");
    };

    // Archive post
    const handleArchive = async () => {
        await handleSave("archived");
    };

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

    if (loading) {
        return (
            <ContentWrapper>
                <Skeleton type="card" />
                <div className="mt-6">
                    <Skeleton type="form" />
                </div>
            </ContentWrapper>
        );
    }

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
                        <div className="flex flex-row-reverse items-center justify-end gap-3">
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                ویرایش مطلب
                            </h1>
                            <Badge variant={getStatusVariant(postData.status)}>
                                {postData.status === 'published' ? 'منتشر شده' : 
                                 postData.status === 'draft' ? 'پیش‌نویس' :
                                 postData.status === 'scheduled' ? 'زمان‌بندی شده' :
                                 postData.status === 'archived' ? 'بایگانی شده' : postData.status}
                            </Badge>
                        </div>
                        <div className="flex flex-row-reverse items-center justify-end gap-4 text-sm text-[var(--color-text-secondary)] mt-1">
                            <span>{postData.viewCount.toLocaleString('fa-IR')} بازدید</span>
                            <span>{postData.readingTime.toLocaleString('fa-IR')} دقیقه زمان مطالعه</span>
                            {postData.publishedAt && (
                                <span className="direction-ltr">
                                    زمان انتشار: {new Date(postData.publishedAt).toLocaleDateString('fa-IR')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {postData.status === "published" && (
                        <Button
                            variant="secondary"
                            onClick={() => window.open(`/blog/${postData.slug}`, "_blank")}
                            icon={<ExternalLink size={18} />}
                        >
                            مشاهده مطلب
                        </Button>
                    )}
                    {postData.status !== "archived" && (
                        <Button
                            variant="secondary"
                            onClick={handleArchive}
                            icon={<Archive size={18} />}
                        >
                            بایگانی
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => handleSave()}
                        loading={isSaving && !isPublishing}
                        icon={<Save size={18} />}
                    >
                        ذخیره
                    </Button>
                    {postData.status !== "published" ? (
                        <Button
                            onClick={handlePublish}
                            loading={isPublishing}
                            icon={<Send size={18} />}
                        >
                            انتشار
                        </Button>
                    ) : (
                        <Button
                            variant="warning"
                            onClick={handleUnpublish}
                            loading={isSaving}
                        >
                            خروج از انتشار
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <Card style={{ direction: 'rtl' }}>
                        <input
                            type="text"
                            value={postData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="عنوان مطلب"
                            className="w-full text-2xl font-bold border-none outline-none bg-transparent text-right"
                            style={{ color: "var(--color-text-primary)" }}
                        />
                        <div className="flex flex-row-reverse items-center gap-2 mt-2">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                /blog/
                            </span>
                            <input
                                type="text"
                                value={postData.slug}
                                onChange={(e) => updateField("slug", e.target.value)}
                                placeholder="name-sluga-post"
                                className="flex-1 text-sm border-none outline-none bg-transparent direction-ltr text-right"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                        </div>
                    </Card>

                    {/* Content Editor */}
                    <Card title="محتوای مطلب" className="overflow-visible text-right" style={{ direction: 'rtl' }}>
                        <RichTextEditor
                            value={postData.content}
                            onChange={(value) => updateField("content", value)}
                            placeholder="محتوای وبلاگ را اینجا بنویسید..."
                            onImageUpload={handleImageUpload}
                            minHeight={500}
                        />
                    </Card>

                    {/* Excerpt */}
                    <Card title="خلاصه مطلب" style={{ direction: 'rtl' }}>
                        <textarea
                            value={postData.excerpt}
                            onChange={(e) => updateField("excerpt", e.target.value)}
                            placeholder="خلاصه‌ای کوتاه از مطلب (برای نمایش در لیست مطالب)"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none text-right"
                            style={{ color: "var(--color-text-primary)" }}
                            maxLength={500}
                        />
                        <p
                            className="text-xs mt-1 text-right font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {postData.excerpt.length.toLocaleString('fa-IR')}/۵۰۰ کاراکتر
                        </p>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6" style={{ direction: 'rtl' }}>
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
                                    className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
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
                                    placeholder="متن جایگزین برای سئو"
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
                    </Card>

                    {/* Tags */}
                    <Card title="برچسب‌ها" className="text-right">
                        <div className="flex flex-wrap flex-row-reverse gap-2 mb-2">
                            {postData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex flex-row-reverse items-center gap-1 px-2 py-1 text-sm rounded-full bg-[var(--color-primary)] text-white"
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
                            <label className="flex flex-row-reverse items-center justify-end gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.isFeatured}
                                    onChange={(e) =>
                                        updateField("isFeatured", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <Star size={16} className="text-yellow-500" />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    مطلب ویژه
                                </span>
                            </label>

                            <label className="flex flex-row-reverse items-center justify-end gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.isPinned}
                                    onChange={(e) => updateField("isPinned", e.target.checked)}
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <Pin size={16} className="text-blue-500" />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    سنجاق به بالا
                                </span>
                            </label>

                            <label className="flex flex-row-reverse items-center justify-end gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.allowComments}
                                    onChange={(e) =>
                                        updateField("allowComments", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    امکان ثبت دیدگاه
                                </span>
                            </label>

                            <label className="flex flex-row-reverse items-center justify-end gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.showAuthor}
                                    onChange={(e) =>
                                        updateField("showAuthor", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    نمایش نام نویسنده
                                </span>
                            </label>
                        </div>
                    </Card>

                    {/* SEO Section */}
                    <Card title="تنظیمات سئو" className="text-right">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    عنوان متا
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
                                    {(postData.seo.metaTitle || postData.title).length.toLocaleString('fa-IR')}/۶۰ کاراکتر (پیشنهادی)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    توضیحات متا
                                </label>
                                <textarea
                                    value={postData.seo.metaDescription}
                                    onChange={(e) =>
                                        updateSEOField("metaDescription", e.target.value)
                                    }
                                    placeholder="توضیح کوتاهی برای موتورهای جستجو..."
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none text-right"
                                    maxLength={160}
                                />
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {postData.seo.metaDescription.length.toLocaleString('fa-IR')}/۱۶۰ کاراکتر (پیشنهادی)
                                </p>
                            </div>

                            <div className="flex flex-row-reverse justify-end gap-4">
                                <label className="flex flex-row-reverse items-center justify-end gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={postData.seo.noIndex}
                                        onChange={(e) =>
                                            updateSEOField("noIndex", e.target.checked)
                                        }
                                        className="w-4 h-4 rounded"
                                    />
                                    <span
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        No Index
                                    </span>
                                </label>
                                <label className="flex flex-row-reverse items-center justify-end gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={postData.seo.noFollow}
                                        onChange={(e) =>
                                            updateSEOField("noFollow", e.target.checked)
                                        }
                                        className="w-4 h-4 rounded"
                                    />
                                    <span
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        No Follow
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    کلمه کلیدی اصلی
                                </label>
                                <input
                                    type="text"
                                    value={postData.seo.focusKeyword}
                                    onChange={(e) =>
                                        updateSEOField("focusKeyword", e.target.value)
                                    }
                                    placeholder="مثلاً: آموزش برنامه نویسی"
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    کلمات کلیدی فرعی
                                </label>
                                <div className="flex flex-wrap flex-row-reverse justify-end gap-2 mb-2">
                                    {postData.seo.metaKeywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex flex-row-reverse items-center gap-1 px-2 py-1 text-sm rounded-full bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                                        >
                                            {keyword}
                                            <button
                                                type="button"
                                                onClick={() => removeKeyword(keyword)}
                                                className="hover:text-red-500 rounded-full p-0.5"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={handleAddKeyword}
                                    placeholder="افزودن کلمه کلیدی (اینتر بزنید)"
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-right">
                                    اسکیما (Schema JSON-LD)
                                </label>
                                <textarea
                                    value={postData.seo.schema}
                                    onChange={(e) =>
                                        updateSEOField("schema", e.target.value)
                                    }
                                    placeholder='{ "@context": "https://schema.org", ... }'
                                    rows={5}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] font-mono text-sm direction-ltr"
                                />
                                <p className="text-xs mt-1 text-[var(--color-text-secondary)] text-right">
                                    کد اسکیما یا FAQ خود را اینجا وارد کنید.
                                </p>
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
                        keywords={postData.seo.metaKeywords}
                        content={postData.content}
                        noIndex={postData.seo.noIndex}
                        noFollow={postData.seo.noFollow}
                    />
                </div>
            </div>
        </ContentWrapper>
    );
}
