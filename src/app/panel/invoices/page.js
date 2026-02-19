"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form, Field, FieldArray } from "formik";
import { toast } from "sonner";
import {
    FileText,
    Plus,
    Search,
    Trash2,
    Edit,
    Download,
    MoreVertical,
    CheckCircle,
    Clock,
    XCircle,
    Send,
    Mail,
    CreditCard,
    Building2,
    Globe,
    DollarSign,
} from "lucide-react";
import * as Yup from "yup";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

const invoiceSchema = Yup.object().shape({
    client: Yup.string().required("انتخاب مشتری الزامی است"),
    invoiceNumber: Yup.string(), // Auto-generated if empty
    issueDate: Yup.date().required("تاریخ صدور الزامی است"),
    dueDate: Yup.date().required("تاریخ سررسید الزامی است"),
    status: Yup.string().oneOf(["draft", "sent", "partial", "paid", "overdue", "cancelled"]),
    items: Yup.array()
        .of(
            Yup.object().shape({
                description: Yup.string().required("شرح خدمات الزامی است"),
                quantity: Yup.number().min(1, "تعداد حداقل ۱").required("الزامی"),
                unitPrice: Yup.number().min(0, "قیمت حداقل ۰").required("الزامی"),
            })
        )
        .min(1, "حداقل یک ردیف کالا یا خدمات الزامی است"),
    notes: Yup.string(),
    taxRate: Yup.number().min(0).max(100),
    currency: Yup.string().oneOf(["IRT", "TOMAN", "USD", "EUR", "CAD", "TRY", "AED"]).required("واحد مالی الزامی است"),
    promotion: Yup.object().shape({
        code: Yup.string(),
        discountAmount: Yup.number().min(0),
        discountType: Yup.string().oneOf(['percentage', 'fixed']),
        discountValue: Yup.number()
    })
});

function InvoicesPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const invoiceIdParam = searchParams.get("id");
    const isAdmin = ["admin", "manager"].includes(user?.role);
    
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [sendingId, setSendingId] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchInvoices(), fetchClients(), fetchPackages()]);
        };
        init();
    }, []);

    // Handle Stripe redirect status
    useEffect(() => {
        const stripeStatus = searchParams.get("status");
        if (stripeStatus === "success") {
            toast.success("پرداخت با موفقیت انجام شد! صورتحساب در حال بروزرسانی است.");
        } else if (stripeStatus === "cancel") {
            toast.error("پرداخت لغو شد.");
        }
    }, [searchParams]);

    // Effect to open detail view if ID is in URL
    useEffect(() => {
        if (invoiceIdParam && invoices.length > 0) {
            const inv = invoices.find(i => i._id === invoiceIdParam || i.id === invoiceIdParam);
            if (inv) {
                setSelectedInvoice(inv);
                setIsViewModalOpen(true);
            }
        }
    }, [invoiceIdParam, invoices]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/invoices");
            if (data.success) {
                setInvoices(data.data);
                return data.data;
            }
        } catch (error) {
            toast.error("خطا در دریافت لیست فاکتورها");
        } finally {
            setLoading(false);
        }
        return [];
    };

    const fetchClients = async () => {
        try {
            const { data } = await axios.get("/api/clients");
            if (data.success) setClients(data.data || []);
        } catch (error) {
            console.error("Failed to fetch clients");
        }
    };

    const fetchPackages = async () => {
        try {
            const { data } = await axios.get("/api/packages");
            if (data.success) setPackages(data.data || []);
        } catch (error) {
            console.error("Failed to fetch packages");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (selectedInvoice) {
                const { data } = await axios.put(`/api/invoices/${selectedInvoice._id}`, values);
                if (data.success) {
                    toast.success("فاکتور بروزرسانی شد");
                    fetchInvoices();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axios.post("/api/invoices", values);
                if (data.success) {
                    toast.success("فاکتور با موفقیت صادر شد");
                    fetchInvoices();
                    setIsModalOpen(false);
                    resetForm();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "عملیات با خطا مواجه شد");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("آیا از حذف این فاکتور اطمینان دارید؟")) return;
        try {
            await axios.delete(`/api/invoices/${id}`);
            toast.success("فاکتور حذف شد");
            fetchInvoices();
        } catch (error) {
            toast.error("خطا در حذف فاکتور");
        }
    };

    const handleSendInvoice = async (inv) => {
        if (!inv.client?.email) {
            toast.error("مشتری ایمیلی ندارد");
            return;
        }
        setSendingId(inv._id);
        try {
            const { data } = await axios.post(`/api/invoices/${inv._id}/send`);
            if (data.success) {
                toast.success(data.message || "فاکتور ارسال شد!");
                fetchInvoices();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "خطا در ارسال فاکتور");
        } finally {
            setSendingId(null);
        }
    };


    const openCreateModal = () => {
        setSelectedInvoice(null);
        setIsModalOpen(true);
    };

    const openEditModal = (inv) => {
        setSelectedInvoice(inv);
        setIsModalOpen(true);
    };

    const filteredInvoices = invoices.filter(
        (inv) =>
            inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            inv.client?.name?.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate totals for live preview
    const calculateTotals = (values) => {
        const subtotal = values.items.reduce(
            (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
            0
        );
        const tax = subtotal * ((Number(values.taxRate) || 0) / 100);
        
        let discount = Number(values.promotion?.discountAmount) || 0;
        
        // If we have type/value info, recalculate the amount (dynamic percentage)
        if (values.promotion?.discountType === 'percentage' && values.promotion?.discountValue) {
            discount = (subtotal * values.promotion.discountValue) / 100;
        }

        return { subtotal, tax, discount, total: Math.max(0, subtotal + tax - discount) };
    };

    return (
        <ContentWrapper>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-right" style={{ direction: 'rtl' }}>
                <div>
                    <h1
                        className="text-2xl font-black flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <FileText className="w-6 h-6 text-indigo-600" />
                        مدیریت فاکتورها
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        صدور، مشاهده و پیگیری صورتحساب‌های مشتریان
                    </p>
                </div>
                {["admin", "manager"].includes(user?.role) && (
                    <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                        صدور فاکتور جدید
                    </Button>
                )}
            </div>


            <Card>
                <div className="mb-6 relative" style={{ direction: 'rtl' }}>
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="جستجو در فاکتورها (شماره فاکتور، نام مشتری...)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-transparent text-[var(--color-text-primary)]"
                        style={{ borderColor: "var(--color-border)", textAlign: 'right' }}

                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse" style={{ direction: 'rtl' }}>
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]/50">
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
                                    جزئیات فاکتور
                                </th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">مشتری</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">تاریخ صدور</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">نوع فاکتور</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] text-right">مبلغ کل</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] text-center">وضعیت</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] text-left">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-[var(--color-text-secondary)]">
                                        در حال بارگذاری...
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500 font-bold">
                                        فاکتوری یافت نشد.
                                    </td>
                                </tr>

                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr
                                        key={inv._id}
                                        className="hover:bg-[var(--color-hover)] transition-colors text-right"
                                    >
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    {inv.invoiceNumber}
                                                </span>
                                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-medium">#{inv._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[var(--color-text-primary)]">
                                                    {inv.client?.name || "نامشخص"}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-secondary)]">{inv.client?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--color-text-secondary)] font-medium text-right">
                                            {new Date(inv.issueDate).toLocaleDateString('fa-IR')}
                                        </td>
                                        <td className="p-4 text-right">
                                            {(() => {
                                                if (inv.paymentPlan?.isInstallment) {
                                                    if (inv.paymentPlan.downPayment && inv.paymentPlan.downPayment > 0) {
                                                        if (Math.abs(inv.total - inv.paymentPlan.downPayment) < 0.01) {
                                                            return (
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    پیش‌پرداخت
                                                                </span>
                                                            );
                                                        }
                                                    }
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                                                            <Clock className="w-3 h-3" />
                                                            اقساطی
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                                        <CheckCircle className="w-3 h-3" />
                                                        نقدی
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4 font-black text-[var(--color-text-primary)] text-right">
                                            {formatCurrency(inv.total, inv.currency)}
                                        </td>
                                        <td className="p-4 text-center">
                                            {(() => {
                                                if (inv.status === "paid") {
                                                    return <Badge variant="success" size="sm">تسویه شده</Badge>;
                                                }
                                                
                                                if (inv.paymentPlan?.isInstallment) {
                                                    if (inv.status === "pending") {
                                                        return (
                                                            <Badge variant="warning" size="sm">
                                                                <Clock className="w-3 h-3 inline ml-1" />
                                                                انتظار پرداخت
                                                            </Badge>
                                                        );
                                                    } else if (inv.status === "partial") {
                                                        return (
                                                            <Badge variant="primary" size="sm">
                                                                <Clock className="w-3 h-3 inline ml-1" />
                                                                اقساط فعال
                                                            </Badge>
                                                        );
                                                    }
                                                }
                                                
                                                if (inv.status === "overdue") {
                                                    return <Badge variant="danger" size="sm">معوقه</Badge>;
                                                }
                                                if (inv.status === "pending") {
                                                    return <Badge variant="primary" size="sm">در انتظار پرداخت</Badge>;
                                                }
                                                if (inv.status === "partial") {
                                                    return <Badge variant="warning" size="sm">پرداخت جزیی</Badge>;
                                                }
                                                
                                                return <Badge variant="secondary" size="sm">{inv.status === 'sent' ? 'ارسال شده' : inv.status === 'draft' ? 'پیش‌نویس' : inv.status.toUpperCase()}</Badge>;
                                            })()}
                                            {inv.paymentMethod && inv.status !== 'paid' && (
                                                <div className="mt-1">
                                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                                        روش: {inv.paymentMethod === 'bank_transfer' ? 'کارت به کارت' : inv.paymentMethod === 'zarinpal' ? 'زرین پال' : inv.paymentMethod.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {["admin", "manager"].includes(user?.role) ? (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSendInvoice(inv);
                                                            }}
                                                            disabled={sendingId === inv._id}
                                                            className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors disabled:opacity-50"
                                                            title="ارسال فاکتور"
                                                        >
                                                            {sendingId === inv._id ? (
                                                                <span className="animate-spin text-sm">
                                                                    ...
                                                                </span>
                                                            ) : (
                                                                <Mail className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(inv)}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 transition-colors"
                                                            title="ویرایش"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(inv._id)}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 transition-colors"
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {["sent", "overdue"].includes(inv.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedInvoice(inv);
                                                                    setIsPaymentModalOpen(true);
                                                                }}
                                                            >
                                                                پرداخت آنلاین
                                                            </Button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInvoice(inv);
                                                                setIsViewModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 transition-colors"
                                                            title="مشاهده جزئیات"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    selectedInvoice
                        ? `ویرایش فاکتور ${selectedInvoice.invoiceNumber}`
                        : "صدور فاکتور جدید"
                }
                size="4xl"
            >
                <Formik
                    initialValues={{
                        client: selectedInvoice?.client?._id || selectedInvoice?.client || "",
                        package: selectedInvoice?.package?._id || selectedInvoice?.package || "",
                        invoiceNumber: selectedInvoice?.invoiceNumber || "",
                        issueDate: selectedInvoice?.issueDate
                            ? new Date(selectedInvoice.issueDate).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        dueDate: selectedInvoice?.dueDate
                            ? new Date(selectedInvoice.dueDate).toISOString().split("T")[0]
                            : new Date(Date.now() + 12096e5).toISOString().split("T")[0],
                        status: selectedInvoice?.status || "draft",
                         items: selectedInvoice?.items || [
                            { description: "", quantity: 1, unitPrice: "" },
                        ],
                        notes: selectedInvoice?.notes || "",
                        taxRate: selectedInvoice?.taxRate ?? "",
                        paymentPlan: {
                            isInstallment: selectedInvoice?.paymentPlan?.isInstallment || false,
                            downPayment: selectedInvoice?.paymentPlan?.downPayment ?? "",
                            installmentsCount: selectedInvoice?.paymentPlan?.installmentsCount ?? "",
                            installmentAmount: selectedInvoice?.paymentPlan?.installmentAmount ?? "",
                            period: selectedInvoice?.paymentPlan?.period || "monthly",
                        },
                        promotion: {
                            code: selectedInvoice?.promotion?.code || "",
                            discountAmount: selectedInvoice?.promotion?.discountAmount ?? "",
                            discountType: selectedInvoice?.promotion?.discountType || "fixed",
                            discountValue: selectedInvoice?.promotion?.discountValue ?? "",
                        },
                        currency: selectedInvoice?.currency || "IRT",
                    }}
                    validationSchema={invoiceSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ values, isSubmitting, setFieldValue }) => {
                        const totals = calculateTotals(values);
                        return (
                            <Form className="space-y-6 text-right" style={{ direction: 'rtl' }}>
                                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                                    <SelectField name="client" label="مشتری">
                                        <option value="">-- انتخاب مشتری --</option>
                                        {clients.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </SelectField>
                                    <SelectField name="package" label="محصول متصل">
                                        <option value="">-- هیچکدام --</option>
                                        {packages.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} ({formatCurrency(p.price || 0, 'IRT')})
                                            </option>
                                        ))}
                                    </SelectField>
                                    <SelectField name="status" label="وضعیت">
                                        <option value="draft">پیش‌نویس</option>
                                        <option value="sent">ارسال شده</option>
                                        <option value="partial">پرداخت جزیی</option>
                                        <option value="paid">تسویه شده</option>
                                        <option value="overdue">معوقه</option>
                                        <option value="cancelled">لغو شده</option>
                                    </SelectField>

                                    <InputField type="date" name="issueDate" label="تاریخ صدور" />
                                    <InputField type="date" name="dueDate" label="تاریخ سررسید" />
                                    <SelectField name="currency" label="واحد مالی">
                                        <option value="IRT">تومان (IRT)</option>
                                        <option value="TOMAN">تومان (TOMAN)</option>
                                        <option value="USD">دلار (USD)</option>
                                        <option value="EUR">یورو (EUR)</option>
                                        <option value="AED">درهم (AED)</option>
                                    </SelectField>
                                </div>


                                {/* Items Table */}
                                <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 grid grid-cols-12 gap-2 text-sm font-semibold text-gray-500">
                                        <div className="col-span-6">شرح محصول / خدمات</div>
                                        <div className="col-span-2">تعداد</div>
                                        <div className="col-span-3">قیمت واحد</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <FieldArray name="items">
                                        {({ push, remove }) => (
                                            <div className="p-2 space-y-2">
                                                {values.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-12 gap-2 items-start"
                                                    >
                                                        <div className="col-span-6">
                                                            <InputField
                                                                name={`items.${index}.description`}
                                                                placeholder="شرح کالا یا خدمات را وارد کنید..."
                                                            />
                                                        </div>

                                                        <div className="col-span-2">
                                                            <InputField
                                                                type="number"
                                                                name={`items.${index}.quantity`}
                                                                min="1"
                                                            />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <InputField
                                                                type="number"
                                                                name={`items.${index}.unitPrice`}
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 pt-2 flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        push({
                                                            description: "",
                                                            quantity: 1,
                                                            unitPrice: 0,
                                                        })
                                                    }
                                                    icon={<Plus className="w-3 h-3" />}
                                                >
                                                    افزودن ردیف
                                                </Button>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>

                                <div className="flex justify-start">
                                    <div className="w-full md:w-1/3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>جمع فرعی:</span>
                                            <span className="font-semibold">
                                                {formatCurrency(totals.subtotal, values.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span>نرخ مالیات (%):</span>
                                            <div className="w-20">
                                                <InputField type="number" name="taxRate" min="0" max="100" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>مبلغ مالیات:</span>
                                            <span className="font-semibold">
                                                {formatCurrency(totals.tax, values.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-2">تخفیف / جشنواره:</span>
                                            <div className="flex flex-col gap-2 w-48">
                                                <div className="flex gap-1">
                                                    <div className="flex-1">
                                                        <InputField name="promotion.code" placeholder="کد تخفیف" />
                                                    </div>
                                                    <Button 
                                                        type="button" 
                                                        variant="secondary" 
                                                        size="sm" 
                                                        className="px-2"
                                                        onClick={async () => {
                                                            if (!values.promotion.code) return;
                                                            try {
                                                                const res = await axios.post("/api/promotions/validate", {
                                                                    code: values.promotion.code,
                                                                    subtotal: totals.subtotal,
                                                                    items: values.items
                                                                });
                                                                if (res.data.success) {
                                                                    const { discountAmount, discountType, discountValue } = res.data.data;
                                                                    setFieldValue("promotion.discountAmount", discountAmount);
                                                                    setFieldValue("promotion.discountType", discountType);
                                                                    setFieldValue("promotion.discountValue", discountValue);
                                                                    toast.success(`تخفیف اعمال شد: ${discountType === 'percentage' ? discountValue + '%' : formatCurrency(discountValue, values.currency)}`);
                                                                }
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || "کد نامعتبر است");
                                                            }
                                                        }}
                                                    >
                                                        اعمال
                                                    </Button>
                                                </div>
                                                <InputField type="number" name="promotion.discountAmount" placeholder="مبلغ تخفیف" min="0" step="0.01" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                            <span>مبلغ نهایی:</span>
                                            <div className="flex flex-col items-start">
                                                <span className="text-indigo-600">
                                                    {formatCurrency(totals.total, values.currency)}
                                                </span>
                                                {totals.discount > 0 && (
                                                    <span className="text-[10px] text-emerald-600">
                                                        (سود شما: {formatCurrency(totals.discount, values.currency)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                 <div className="bg-[var(--color-background-secondary)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
                                     <div className="flex items-center justify-between">
                                         <h4 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                             <CreditCard className="w-4 h-4 text-indigo-600" />
                                             تنظیمات پرداخت اقساطی
                                         </h4>
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <input
                                                 type="checkbox"
                                                 className="rounded text-indigo-600"
                                                 name="paymentPlan.isInstallment"
                                                 checked={values.paymentPlan.isInstallment}
                                                 onChange={(e) => setFieldValue("paymentPlan.isInstallment", e.target.checked)}
                                             />
                                             <span className="text-xs font-semibold text-[var(--color-text-secondary)]">فعال‌سازی اقساط</span>
                                         </label>
                                     </div>

                                     {values.paymentPlan.isInstallment && (
                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                             <InputField
                                                 type="number"
                                                 name="paymentPlan.downPayment"
                                                 label="مبلغ پیش‌پرداخت"
                                             />
                                             <InputField
                                                 type="number"
                                                 name="paymentPlan.installmentAmount"
                                                 label="مبلغ هر قسط"
                                             />
                                             <InputField
                                                 type="number"
                                                 name="paymentPlan.installmentsCount"
                                                 label="تعداد اقساط"
                                             />
                                             <SelectField name="paymentPlan.period" label="دوره پرداخت">
                                                 <option value="monthly">ماهانه</option>
                                                 <option value="weekly">هفتگی</option>
                                                 <option value="quarterly">سه ماهه (فصلی)</option>
                                             </SelectField>
                                         </div>
                                     )}
                                 </div>

                                 <TextareaField
                                     name="notes"
                                     label="یادداشت‌ها / دستورالعمل پرداخت"
                                     rows={2}
                                 />

                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        انصراف
                                    </Button>
                                    <Button type="submit" loading={isSubmitting}>
                                        {selectedInvoice ? "ذخیره تغییرات" : "ایجاد نهایی فاکتور"}
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </Modal>

            {/* View Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`جزئیات فاکتور: ${selectedInvoice?.invoiceNumber}`}
                size="3xl"
            >
                {selectedInvoice && (
                    <div className="space-y-6 py-2 text-right" style={{ direction: 'rtl' }}>
                        <div className="grid grid-cols-2 gap-8 border-b pb-6 dark:border-gray-700">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">صورتحساب برای</p>
                                <p className="font-bold text-lg text-[var(--color-text-primary)]">{selectedInvoice.client?.name || 'مشتری نامشخص'}</p>
                                <p className="text-sm text-[var(--color-text-secondary)]">{selectedInvoice.client?.email}</p>
                            </div>
                            <div className="text-left" style={{ direction: 'rtl' }}>
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">وضعیت فاکتور</p>
                                <Badge
                                    variant={
                                        selectedInvoice.status === "paid"
                                            ? "success"
                                            : selectedInvoice.status === "overdue"
                                                 ? "danger"
                                                 : "primary"
                                    }
                                >
                                    {selectedInvoice.status === 'paid' ? 'تایید شده' : 
                                     selectedInvoice.status === 'overdue' ? 'معوقه' : 
                                     selectedInvoice.status === 'sent' ? 'ارسال شده' : 'پیش‌نویس'}
                                </Badge>
                                {selectedInvoice.paymentMethod && selectedInvoice.status !== 'paid' && (
                                    <div className="mt-3">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                روش انتخاب شده: {selectedInvoice.paymentMethod === 'bank_transfer' ? 'کارت به کارت' : selectedInvoice.paymentMethod}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-amber-500 mt-1 italic">
                                            دستورالعمل پرداخت توسط ادمین برای شما ارسال خواهد شد.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                                <p className="text-gray-400 mb-1">شماره فاکتور</p>
                                <p className="font-mono font-bold text-[var(--color-text-primary)]">{selectedInvoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">تاریخ صدور</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{new Date(selectedInvoice.issueDate).toLocaleDateString('fa-IR')}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">تاریخ سررسید</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{new Date(selectedInvoice.dueDate).toLocaleDateString('fa-IR')}</p>
                            </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden border-[var(--color-border)]">
                            <table className="w-full text-right">
                                <thead className="bg-[var(--color-background-secondary)]">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">شرح خدمات</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">تعداد</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-left">قیمت واحد</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-left">جمع کل</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {selectedInvoice.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-primary)] font-medium">{item.description}</td>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)] text-center">{item.quantity}</td>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)] text-left">{formatCurrency(item.unitPrice, selectedInvoice.currency)}</td>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-primary)] font-bold text-left">{formatCurrency(item.quantity * item.unitPrice, selectedInvoice.currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-start pt-4">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                                    <span>جمع فرعی</span>
                                    <span>{formatCurrency(selectedInvoice.subtotal || (selectedInvoice.total / (1 + (selectedInvoice.taxRate || 0)/100)), selectedInvoice.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                                    <span>مالیات ({selectedInvoice.taxRate || 0}%)</span>
                                    <span>{formatCurrency(selectedInvoice.taxAmount || 0, selectedInvoice.currency)}</span>
                                </div>
                                {selectedInvoice.promotion?.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-bold">
                                        <span>کد تخفیف ({selectedInvoice.promotion.code})</span>
                                        <span>-{formatCurrency(selectedInvoice.promotion.discountAmount, selectedInvoice.currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-[var(--color-text-primary)] border-t pt-3 dark:border-gray-700">
                                    <span>مبلغ قابل پرداخت</span>
                                    <span className="text-indigo-600">{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</span>
                                </div>
                            </div>
                        </div>

                        {selectedInvoice.paymentPlan?.isInstallment && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/20">
                                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    برنامه پرداخت اقساطی
                                </h4>
                                
                                <div className="space-y-3">
                                    {/* Down Payment */}
                                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                                        ['partial', 'paid'].includes(selectedInvoice.status) 
                                        ? 'bg-emerald-100/50 dark:bg-emerald-900/30' 
                                        : 'bg-amber-100/50 dark:bg-amber-900/30'
                                    }`}>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${
                                            ['partial', 'paid'].includes(selectedInvoice.status)
                                            ? 'text-emerald-800 dark:text-emerald-200'
                                            : 'text-amber-800 dark:text-amber-200'
                                        }`}>
                                            {['partial', 'paid'].includes(selectedInvoice.status) ? 'پیش‌پرداخت (تسویه شده)' : 'پیش‌پرداخت (سررسید جاری)'}
                                        </span>
                                        <span className={`text-lg font-bold ${
                                            ['partial', 'paid'].includes(selectedInvoice.status)
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {formatCurrency(selectedInvoice.paymentPlan.downPayment, selectedInvoice.currency)}
                                        </span>
                                    </div>

                                    {/* Remaining Balance */}
                                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                                        selectedInvoice.status === 'partial' 
                                        ? 'bg-amber-100/50 dark:bg-amber-900/30' 
                                        : selectedInvoice.status === 'paid'
                                            ? 'bg-emerald-100/50 dark:bg-emerald-900/30'
                                            : ''
                                    }`}>
                                        <span className={`text-xs ${
                                            selectedInvoice.status === 'partial'
                                            ? 'font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide'
                                            : selectedInvoice.status === 'paid'
                                                ? 'font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide'
                                                : 'text-indigo-400 dark:text-indigo-500 uppercase font-bold'
                                        }`}>
                                            {selectedInvoice.status === 'partial' 
                                                ? 'مبلغ باقیمانده (اقساط فعال)' 
                                                : selectedInvoice.status === 'paid'
                                                    ? 'مبلغ باقیمانده (تسویه شده)'
                                                    : 'مبلغ باقیمانده (پس از پیش‌پرداخت)'
                                            }
                                        </span>
                                        <span className={`text-lg font-bold ${
                                            selectedInvoice.status === 'partial'
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : selectedInvoice.status === 'paid'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-indigo-900 dark:text-indigo-100'
                                        }`}>
                                            {formatCurrency(selectedInvoice.total - selectedInvoice.paymentPlan.downPayment, selectedInvoice.currency)}
                                        </span>
                                    </div>
                                    
                                    {selectedInvoice.paymentPlan.installmentAmount > 0 && (
                                        <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-indigo-200 dark:border-indigo-800/30">
                                            <div>
                                                <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-bold">جزئیات اقساط</p>
                                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                                                    {selectedInvoice.paymentPlan.installmentsCount} قسط x {formatCurrency(selectedInvoice.paymentPlan.installmentAmount, selectedInvoice.currency)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-bold">دوره پرداخت</p>
                                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 capitalize">
                                                    {selectedInvoice.paymentPlan.period === 'monthly' ? 'ماهانه' : 
                                                     selectedInvoice.paymentPlan.period === 'weekly' ? 'هفتگی' : 'فصلی'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                         {selectedInvoice.notes && (
                             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-[var(--color-border)]">
                                 <p className="text-xs uppercase font-bold text-gray-400 mb-2">یادداشت‌ها</p>
                                 <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic whitespace-pre-wrap">{selectedInvoice.notes}</p>
                             </div>
                         )}

                        <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>بستن</Button>
                            <Link href={`/panel/invoices/${selectedInvoice._id}/print`}>
                                <Button variant="primary" icon={<Download className="w-4 h-4" />}>دریافت فایل PDF</Button>
                            </Link>
                            {!isAdmin && ['sent', 'overdue'].includes(selectedInvoice.status) && (
                                <Button variant="success" onClick={() => { setIsViewModalOpen(false); setIsPaymentModalOpen(true); }}>پرداخت آنلاین</Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Method Selection Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="انتخاب روش پرداخت"
                size="md"
            >
                <div className="space-y-6 p-2 text-right" style={{ direction: 'rtl' }}>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        لطفاً روش پرداخت مورد نظر خود را برای فاکتور شماره <strong>{selectedInvoice?.invoiceNumber}</strong> انتخاب کنید.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'zarinpal', name: 'پرداخت آنلاین (زرین‌پال)', desc: 'پرداخت با تمامی کارت‌های عضو شتاب', icon: <CreditCard className="w-5 h-5 text-indigo-600" /> },
                            { id: 'bank_transfer', name: 'کارت به کارت / حواله بانکی', desc: 'واریز مستقیم به حساب شرکت', icon: <Building2 className="w-5 h-5" /> },
                            { id: 'crypto', name: 'ارز دیجیتال', desc: 'USDT (TRC20), BTC, or ETH', icon: <Globe className="w-5 h-5" /> },
                            { id: 'cash', name: 'پرداخت نقدی', desc: 'مراجعه حضوری به دفتر مرکزی', icon: <CreditCard className="w-5 h-5" /> },
                            { id: 'stripe', name: 'Stripe (International)', desc: 'Credit / Debit Card (USD/EUR)', icon: <Globe className="w-5 h-5" /> }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={async () => {
                                    if (method.id === 'zarinpal') {
                                        try {
                                            const { data } = await axios.post('/api/payments/zarinpal/request', {
                                                invoiceId: selectedInvoice._id
                                            });
                                            if (data.url) {
                                                window.location.href = data.url;
                                            } else {
                                                toast.error("خطا در ایجاد لینک پرداخت");
                                            }
                                        } catch (err) {
                                            toast.error(err.response?.data?.error || "سیستم پرداخت در دسترس نیست");
                                        }
                                        return;
                                    }
                                    if (method.id === 'stripe') {
                                        try {
                                            const { data } = await axios.post('/api/payments/stripe/checkout', {
                                                invoiceId: selectedInvoice._id
                                            });
                                            if (data.url) {
                                                window.location.href = data.url;
                                            } else {
                                                toast.error("Failed to generate checkout link");
                                            }
                                        } catch (err) {
                                            toast.error(err.response?.data?.error || "Payment system unavailable");
                                        }
                                        return;
                                    }
                                    try {
                                        const { data } = await axios.patch(`/api/invoices/${selectedInvoice._id}/payment-method`, {
                                            paymentMethod: method.id
                                        });
                                        if (data.success) {
                                            toast.success(`روش ${method.name} انتخاب شد. منتظر تایید مدیریت باشید.`);
                                            setIsPaymentModalOpen(false);
                                            fetchInvoices();
                                        }
                                    } catch (err) {
                                        toast.error("خطا در ثبت روش پرداخت");
                                    }
                                }}
                                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-right group"
                            >
                                <div className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-lg transition-colors">
                                    {method.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[var(--color-text-primary)]">{method.name}</h4>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{method.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="pt-4 border-t border-[var(--color-border)] text-center">
                        <p className="text-[10px] text-[var(--color-text-tertiary)] italic">
                            پس از انتخاب روش‌های غیرآنلاین، اطلاعات واریز توسط ادمین برای شما ارسال می‌شود.
                        </p>
                    </div>
                </div>
            </Modal>

        </ContentWrapper>
    );
}

import { Suspense } from "react";

export default function InvoicesPageWithSuspense() {
    return (
        <Suspense fallback={<div className="text-center py-12">در حال بارگزاری...</div>}>
            <InvoicesPage />
        </Suspense>
    );
}
