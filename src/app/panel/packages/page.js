"use client";

import { useEffect, useState, useRef } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { Formik, Form } from "formik";
import {
    Plus, Edit, Trash2, Package as PackageIcon, Save, X,
    Upload, Image as ImageIcon, Eye, EyeOff, Search, Filter,
    FolderPlus, Tag, BarChart3, ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

// Slug generation helper
function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\u200C]+/g, '-')        // Replace spaces & ZWNJ with -
        .replace(/[^\w\u0600-\u06FF-]+/g, '') // Remove non-word chars except Persian & hyphens
        .replace(/--+/g, '-')                 // Replace multiple - with single -
        .replace(/^-+/, '')                   // Trim - from start
        .replace(/-+$/, '');                  // Trim - from end
}

const ProductSchema = Yup.object().shape({
    name: Yup.string().required("نام محصول الزامی است"),
    slug: Yup.string().required("اسلاگ الزامی است"),
    categoryId: Yup.string().required("دسته‌بندی الزامی است"),
    price: Yup.number().min(0, "قیمت نمی‌تواند منفی باشد").required("قیمت الزامی است"),
    stock: Yup.number().min(0, "موجودی نمی‌تواند منفی باشد").default(0),
    sku: Yup.string(),
    weight: Yup.number().min(0, "وزن نمی‌تواند منفی باشد"),
    material: Yup.string(),
    dimensions: Yup.object().shape({
        length: Yup.number().min(0),
        width: Yup.number().min(0),
        height: Yup.number().min(0),
    }),
    isActive: Yup.boolean(),
});

export default function ProductsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!authLoading && (!user || !["admin", "manager"].includes(user.role))) {
            router.push("/panel/dashboard");
        }
    }, [user, authLoading, router]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/packages?all=true");
            setProducts(res.data.data);
        } catch (error) {
            toast.error("خطا در دریافت لیست محصولات");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("/api/categories");
            setCategories(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Image upload handler
    const handleImageUpload = async (files, currentImages, setFieldValue) => {
        if (!files || files.length === 0) return;
        setUploadingImages(true);

        const newImages = [...(currentImages || [])];

        for (const file of files) {
            if (newImages.length >= 10) {
                toast.error("حداکثر ۱۰ تصویر مجاز است");
                break;
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", "products");

            try {
                const res = await axios.post("/api/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                if (res.data.success) {
                    newImages.push(res.data.data.url);
                }
            } catch (error) {
                toast.error(`خطا در آپلود ${file.name}`);
            }
        }

        setFieldValue("images", newImages);
        setUploadingImages(false);
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // Find category name for displayCategory
            const cat = categories.find(c => c._id === values.categoryId);

            const payload = {
                ...values,
                slug: (values.slug || "").trim().toLowerCase().replace(/\s+/g, '-'),
                displayCategory: cat?.name || values.displayCategory || "General",
                features: typeof values.features === "string"
                    ? values.features.split("\n").filter(f => f.trim())
                    : values.features,
            };

            if (editingProduct) {
                await axios.put(`/api/packages/${editingProduct._id}`, payload);
                toast.success("محصول بروزرسانی شد");
            } else {
                await axios.post("/api/packages", payload);
                toast.success("محصول جدید ایجاد شد");
            }
            fetchProducts();
            setIsModalOpen(false);
            setEditingProduct(null);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "عملیات با خطا مواجه شد");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("آیا از حذف این محصول اطمینان دارید؟")) return;
        try {
            await axios.delete(`/api/packages/${id}`);
            toast.success("محصول حذف شد");
            fetchProducts();
        } catch (error) {
            toast.error("خطا در حذف محصول");
        }
    };

    // Category CRUD
    const handleCategorySubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = {
                ...values,
                slug: (values.slug || generateSlug(values.name)).trim().toLowerCase().replace(/\s+/g, '-')
            };
            if (editingCategory) {
                await axios.put(`/api/categories/${editingCategory._id}`, payload);
                toast.success("دسته‌بندی بروزرسانی شد");
            } else {
                await axios.post("/api/categories", payload);
                toast.success("دسته‌بندی جدید ایجاد شد");
            }
            fetchCategories();
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "خطا در ذخیره دسته‌بندی");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) return;
        try {
            await axios.delete(`/api/categories/${id}`);
            toast.success("دسته‌بندی حذف شد");
            fetchCategories();
        } catch (error) {
            toast.error("خطا در حذف دسته‌بندی");
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (pkg) => {
        setEditingProduct(pkg);
        setIsModalOpen(true);
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = !searchQuery ||
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !filterCategory ||
            p.categoryId?._id === filterCategory ||
            p.categoryId === filterCategory ||
            p.displayCategory === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (authLoading || !user || !["admin", "manager"].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-right" style={{ direction: "rtl" }}>
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)]">مدیریت محصولات</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 font-medium">
                        مدیریت کاتالوگ محصولات، دسته‌بندی‌ها و موجودی انبار
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button variant="secondary" onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} icon={<FolderPlus size={18} />}>
                        مدیریت دسته‌بندی‌ها
                    </Button>
                    <Button onClick={openCreateModal} icon={<Plus size={18} />}>
                        افزودن محصول جدید
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" style={{ direction: "rtl" }}>
                <Card className="p-4 text-right">
                    <div className="text-sm text-[var(--color-text-secondary)]">کل محصولات</div>
                    <div className="text-2xl font-black text-[var(--color-text-primary)]">{products.length}</div>
                </Card>
                <Card className="p-4 text-right">
                    <div className="text-sm text-[var(--color-text-secondary)]">محصولات فعال</div>
                    <div className="text-2xl font-black text-emerald-500">{products.filter(p => p.isActive).length}</div>
                </Card>
                <Card className="p-4 text-right">
                    <div className="text-sm text-[var(--color-text-secondary)]">دسته‌بندی‌ها</div>
                    <div className="text-2xl font-black text-blue-500">{categories.length}</div>
                </Card>
                <Card className="p-4 text-right">
                    <div className="text-sm text-[var(--color-text-secondary)]">ناموجود</div>
                    <div className="text-2xl font-black text-red-500">{products.filter(p => p.stock <= 0).length}</div>
                </Card>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6" style={{ direction: "rtl" }}>
                <div className="relative flex-1">
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="جستجوی نام یا کد کالا..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] text-sm"
                >
                    <option value="">همه دسته‌بندی‌ها</option>
                    {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Card key={i} className="h-64 animate-pulse bg-[var(--color-background-elevated)]" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ direction: "rtl" }}>
                    {filteredProducts.map((product) => {
                        const cat = categories.find(c => c._id === product.categoryId);
                        return (
                            <Card key={product._id} className="relative overflow-hidden group hover:border-[var(--color-primary)] transition-all flex flex-col h-full">
                                {/* Product Image */}
                                <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
                                    {product.images?.length > 0 ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <PackageIcon size={40} className="text-gray-300" />
                                    )}
                                    {/* Badge overlay */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Badge variant={product.isActive ? "success" : "secondary"} className="text-[10px]">
                                            {product.isActive ? "فعال" : "غیرفعال"}
                                        </Badge>
                                    </div>
                                    {product.images?.length > 1 && (
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                            <ImageIcon size={10} /> {product.images.length}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col text-right">
                                    <div className="flex justify-between items-start mb-2">
                                        {cat && (
                                            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                                {cat.name}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{product.sku || "—"}</span>
                                    </div>

                                    <h3 className="text-lg font-black mb-1 text-[var(--color-text-primary)] leading-tight">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">{product.description}</p>
                                    )}

                                    <div className="mt-auto">
                                        <span className="text-xl font-black text-[var(--color-primary)]">{formatCurrency(product.price || 0, "IRT")}</span>
                                        <div className={`text-xs mt-1 font-bold ${product.stock > 0 ? "text-emerald-500" : "text-red-500"}`}>
                                            {product.stock > 0 ? `موجودی: ${product.stock} عدد` : "ناموجود"}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex gap-2">
                                        <Button variant="secondary" size="sm" fullWidth onClick={() => openEditModal(product)} icon={<Edit size={14} />}>
                                            ویرایش
                                        </Button>
                                        <Button variant="danger" size="sm" fullWidth onClick={() => handleDelete(product._id)} icon={<Trash2 size={14} />}>
                                            حذف
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                            <PackageIcon size={48} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-20" />
                            <h3 className="text-xl font-medium text-[var(--color-text-primary)]">محصولی یافت نشد</h3>
                            <p className="text-[var(--color-text-secondary)] mb-8">
                                {searchQuery || filterCategory ? "نتیجه‌ای برای فیلتر شما یافت نشد." : "هنوز هیچ محصولی در سیستم ثبت نشده است."}
                            </p>
                            <Button onClick={openCreateModal} icon={<Plus size={18} />}>
                                ثبت اولین محصول
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ========== Product Create/Edit Modal ========== */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? "ویرایش محصول" : "ایجاد محصول جدید"}
                size="lg"
            >
                <Formik
                    initialValues={editingProduct ? {
                        ...editingProduct,
                        categoryId: editingProduct.categoryId?._id || editingProduct.categoryId || "",
                        slug: editingProduct.slug || "",
                        features: Array.isArray(editingProduct.features) ? editingProduct.features.join("\n") : (editingProduct.features || ""),
                    } : {
                        name: "",
                        slug: "",
                        categoryId: "",
                        displayCategory: "",
                        price: 0,
                        stock: 0,
                        sku: "",
                        description: "",
                        features: "",
                        images: [],
                        isActive: true,
                        order: 0,
                        weight: 0,
                        material: "",
                        dimensions: {
                            length: 0,
                            width: 0,
                            height: 0,
                        },
                    }}
                    validationSchema={ProductSchema}
                    onSubmit={(values, actions) => {
                        handleSubmit(values, actions);
                    }}
                    enableReinitialize
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form className="space-y-5 py-4 text-right" style={{ direction: "rtl" }}>
                            {/* Row 1: Name + Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputField
                                        name="name"
                                        label="نام محصول"
                                        placeholder="مثلاً: دستگاه فشارسنج دیجیتال"
                                        required
                                        onChange={(e) => {
                                            setFieldValue("name", e.target.value);
                                            if (!editingProduct) {
                                                setFieldValue("slug", generateSlug(e.target.value));
                                            }
                                        }}
                                    />
                                </div>
                                <InputField
                                    name="slug"
                                    label="اسلاگ (URL)"
                                    placeholder="product-name"
                                    dir="ltr"
                                    className="font-mono text-left"
                                    required
                                />
                            </div>

                            {/* Row 2: Category + SKU */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-[var(--color-text-primary)] mb-1">دسته‌بندی *</label>
                                    <select
                                        value={values.categoryId}
                                        onChange={(e) => setFieldValue("categoryId", e.target.value)}
                                        className="w-full p-3 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                    >
                                        <option value="">انتخاب دسته‌بندی...</option>
                                        {categories.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.categoryId && touched.categoryId && (
                                        <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
                                    )}
                                </div>
                                <InputField name="sku" label="کد کالا (SKU)" placeholder="NTS-101" />
                            </div>

                            {/* Row 3: Price + Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField name="price" label="قیمت (تومان)" type="number" required />
                                <InputField name="stock" label="موجودی انبار" type="number" />
                            </div>

                            {/* Row 4: Weight + Material */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField name="weight" label="وزن (گرم)" type="number" />
                                <InputField name="material" label="جنس / متریال" placeholder="مثلاً: استیل، پلاستیک ABS" />
                            </div>

                            {/* Row 5: Dimensions */}
                            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-[var(--color-border)]">
                                <label className="block text-sm font-black text-[var(--color-text-primary)] mb-3">ابعاد محصول (سانتی‌متر)</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <InputField name="dimensions.length" label="طول" type="number" />
                                    <InputField name="dimensions.width" label="عرض" type="number" />
                                    <InputField name="dimensions.height" label="ارتفاع" type="number" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-sm font-black text-[var(--color-text-primary)]">توضیحات محصول</label>
                                <textarea
                                    className="w-full p-3 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-h-[100px]"
                                    value={values.description}
                                    onChange={(e) => setFieldValue("description", e.target.value)}
                                    placeholder="شرح کامل محصول و کاربردهای آن..."
                                />
                            </div>

                            {/* Features */}
                            <div className="space-y-1">
                                <label className="text-sm font-black text-[var(--color-text-primary)]">ویژگی‌های کلیدی (هر خط یک ویژگی)</label>
                                <textarea
                                    className="w-full p-3 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-h-[80px]"
                                    value={values.features}
                                    onChange={(e) => setFieldValue("features", e.target.value)}
                                    placeholder={"ویژگی ۱\nویژگی ۲"}
                                />
                            </div>

                            {/* ========== Image Upload Section ========== */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-black text-[var(--color-text-primary)]">تصاویر محصول</label>
                                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold">
                                        {values.images?.length || 0} از ۱۰ تصویر
                                    </span>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {(Array.isArray(values.images) ? values.images : []).map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[var(--color-border)] hover:border-indigo-500/50 transition-all">
                                            <img src={img} alt={`تصویر ${idx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFieldValue("images", values.images.filter((_, i) => i !== idx))}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-90 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {idx === 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[8px] font-bold py-1 text-center">
                                                    تصویر اصلی
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    {(values.images?.length || 0) < 10 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImages}
                                            className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-indigo-500 flex flex-col items-center justify-center gap-2 text-[var(--color-text-tertiary)] hover:text-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {uploadingImages ? (
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                            ) : (
                                                <>
                                                    <Upload size={20} />
                                                    <span className="text-[10px] font-bold">آپلود تصویر</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e.target.files, values.images, setFieldValue)}
                                />

                                {/* URL input fallback */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="newImageUrl"
                                        placeholder="یا لینک تصویر را وارد کنید..."
                                        className="w-full pr-4 pl-12 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background-elevated)]/30 text-xs focus:border-indigo-500 transition-all outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const url = e.target.value;
                                                if (url && url.trim()) {
                                                    setFieldValue("images", [...(values.images || []), url.trim()]);
                                                    e.target.value = "";
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById("newImageUrl");
                                            if (input.value && input.value.trim()) {
                                                setFieldValue("images", [...(values.images || []), input.value.trim()]);
                                                input.value = "";
                                            }
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3 p-3 bg-[var(--color-background-elevated)] rounded-lg border border-[var(--color-border)]">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-5 h-5 accent-[var(--color-primary)]"
                                    checked={values.isActive}
                                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                />
                                <label htmlFor="isActive" className="text-sm font-black text-[var(--color-text-primary)] cursor-pointer">
                                    نمایش این محصول در سایت
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-start pt-6 border-t border-[var(--color-border)]">
                                <Button type="submit" loading={isSubmitting} icon={<Save size={18} />}>
                                    {editingProduct ? "ذخیره تغییرات" : "ایجاد محصول"}
                                </Button>
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>انصراف</Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>

            {/* ========== Category Management Modal ========== */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="مدیریت دسته‌بندی‌ها"
                size="lg"
            >
                <div className="text-right space-y-6 py-4" style={{ direction: "rtl" }}>
                    {/* Existing Categories List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-[var(--color-text-primary)]">دسته‌بندی‌های موجود</h3>
                        {categories.length === 0 ? (
                            <p className="text-sm text-[var(--color-text-secondary)] text-center py-6">هنوز دسته‌بندی‌ای ایجاد نشده است.</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {categories.map(cat => (
                                    <div key={cat._id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-background-elevated)] border border-[var(--color-border)]">
                                        <div>
                                            <span className="font-bold text-[var(--color-text-primary)]">{cat.name}</span>
                                            <span className="text-xs text-[var(--color-text-tertiary)] mr-2 font-mono">/{cat.slug}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingCategory(cat)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat._id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add/Edit Category Form */}
                    <div className="border-t border-[var(--color-border)] pt-4">
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] mb-3">
                            {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
                        </h3>
                        <Formik
                            initialValues={editingCategory ? {
                                name: editingCategory.name,
                                slug: editingCategory.slug,
                                description: editingCategory.description || "",
                                isActive: editingCategory.isActive,
                            } : {
                                name: "",
                                slug: "",
                                description: "",
                                isActive: true,
                            }}
                            enableReinitialize
                            validationSchema={Yup.object().shape({
                                name: Yup.string().required("نام دسته‌بندی الزامی است"),
                                slug: Yup.string().required("اسلاگ الزامی است"),
                            })}
                            onSubmit={handleCategorySubmit}
                        >
                            {({ isSubmitting, values, setFieldValue }) => (
                                <Form className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <InputField
                                            name="name"
                                            label="نام دسته‌بندی"
                                            placeholder="مثلاً: تجهیزات پزشکی"
                                            required
                                            onChange={(e) => {
                                                setFieldValue("name", e.target.value);
                                                if (!editingCategory) {
                                                    setFieldValue("slug", generateSlug(e.target.value));
                                                }
                                            }}
                                        />
                                        <InputField
                                            name="slug"
                                            label="اسلاگ"
                                            placeholder="medical-equipment"
                                            dir="ltr"
                                            className="font-mono text-left"
                                            required
                                        />
                                    </div>
                                    <InputField name="description" label="توضیحات" placeholder="توضیح مختصر دسته‌بندی..." />
                                    <div className="flex gap-3">
                                        <Button type="submit" loading={isSubmitting} size="sm" icon={<Save size={14} />}>
                                            {editingCategory ? "بروزرسانی" : "افزودن"}
                                        </Button>
                                        {editingCategory && (
                                            <Button variant="secondary" size="sm" onClick={() => setEditingCategory(null)}>
                                                انصراف
                                            </Button>
                                        )}
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </Modal>
        </ContentWrapper>
    );
}
