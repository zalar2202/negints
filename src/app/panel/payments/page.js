"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { CreditCard, Plus, Search, Trash2, Edit, DollarSign, TrendingUp, Calendar } from "lucide-react";
import * as Yup from "yup";
import { formatCurrency } from "@/lib/utils";

const paymentSchema = Yup.object().shape({
    client: Yup.string().required("انتخاب مشتری الزامی است"),
    amount: Yup.number().min(0.01, "مبلغ باید بیشتر از صفر باشد").required("وارد کردن مبلغ الزامی است"),
    currency: Yup.string().required("انتخاب واحد مالی الزامی است"),
    method: Yup.string().required("انتخاب روش پرداخت الزامی است"),
    status: Yup.string(),
    reference: Yup.string(),
    paymentDate: Yup.date().required("انتخاب تاریخ پرداخت الزامی است"),
    notes: Yup.string(),
    invoice: Yup.string().nullable(),
});

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        fetchPayments();
        fetchClients();
        fetchInvoices();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/payments");
            if (data.success) setPayments(data.data);
        } catch (error) {
            toast.error("خطا در دریافت لیست تراکنش‌ها");
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const { data } = await axios.get("/api/clients");
            if (data.success) setClients(data.data || []);
        } catch (error) {
            console.error("Failed to fetch clients");
        }
    };

    const fetchInvoices = async () => {
        try {
            const { data } = await axios.get("/api/invoices");
            if (data.success) setInvoices(data.data || []);
        } catch (error) {
            console.error("Failed to fetch invoices");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = { ...values };
            if (!payload.invoice) delete payload.invoice;

            if (selectedPayment) {
                const { data } = await axios.put(`/api/payments/${selectedPayment._id}`, payload);
                if (data.success) {
                    toast.success("تراکنش بروزرسانی شد");
                    fetchPayments();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axios.post("/api/payments", payload);
                if (data.success) {
                    toast.success("تراکنش با موفقیت ثبت شد");
                    fetchPayments();
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
        if (!confirm("آیا از حذف این رکورد اطمینان دارید؟")) return;
        try {
            await axios.delete(`/api/payments/${id}`);
            toast.success("تراکنش حذف شد");
            fetchPayments();
        } catch (error) {
            toast.error("خطا در حذف تراکنش");
        }
    };

    const openCreateModal = () => {
        setSelectedPayment(null);
        setIsModalOpen(true);
    };

    const openEditModal = (payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const filteredPayments = payments.filter(p =>
        p.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const totalReceived = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.amountInBaseCurrency || p.amount || 0), 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.amountInBaseCurrency || p.amount || 0), 0);

    return (
        <ContentWrapper>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-right" style={{ direction: 'rtl' }}>
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                        <CreditCard className="w-6 h-6 text-green-600" />
                        مدیریت تراکنش‌ها
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        رهگیری و مدیریت تمامی پرداختی‌های مشتریان
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                    ثبت تراکنش جدید
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-right" style={{ direction: 'rtl' }}>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">کل دریافتی</p>
                        <p className="text-2xl font-black text-green-600">{formatCurrency(totalReceived, 'IRT')}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">در انتظار</p>
                        <p className="text-2xl font-black text-orange-600">{formatCurrency(pendingAmount, 'IRT')}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">تراکنش‌های ماه جاری</p>
                        <p className="text-2xl font-black text-indigo-600">{payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).length} مورد</p>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="mb-6 relative" style={{ direction: 'rtl' }}>
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="جستجو در تراکنش‌ها..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700"
                        style={{ borderColor: "var(--color-border)", textAlign: 'right' }}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-4 font-bold text-sm text-gray-500">تاریخ</th>
                                <th className="p-4 font-bold text-sm text-gray-500">مشتری</th>
                                <th className="p-4 font-bold text-sm text-gray-500">مبلغ</th>
                                <th className="p-4 font-bold text-sm text-gray-500">روش پرداخت</th>
                                <th className="p-4 font-bold text-sm text-gray-500 text-center">وضعیت</th>
                                <th className="p-4 font-bold text-sm text-gray-500">مرجع</th>
                                <th className="p-4 font-bold text-sm text-gray-500 text-left">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center">در حال بارگذاری...</td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-bold">تراکنشی یافت نشد.</td></tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="border-b last:border-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-sm font-medium">{new Date(payment.paymentDate).toLocaleDateString('fa-IR')}</td>
                                        <td className="p-4 font-bold">{payment.client?.name || "نامشخص"}</td>
                                        <td className="p-4 font-black text-green-600">{formatCurrency(payment.amount, payment.currency || 'IRT')}</td>
                                        <td className="p-4 text-sm">
                                            {payment.method === 'bank_transfer' ? 'حواله بانکی / کارت به کارت' : 
                                             payment.method === 'zarinpal' ? 'درگاه زرین‌پال' :
                                             payment.method === 'stripe' ? 'استرایپ (ارزی)' :
                                             payment.method === 'cash' ? 'نقدی' : payment.method}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Badge variant={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'} size="sm">
                                                {payment.status === 'completed' ? 'موفق' : payment.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 font-mono">{payment.reference || "-"}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button onClick={() => openEditModal(payment)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600" title="ویرایش">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(payment._id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600" title="حذف">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPayment ? "ویرایش تراکنش" : "ثبت تراکنش جدید"} size="lg">
                <Formik
                    initialValues={{
                        client: selectedPayment?.client?._id || "",
                        amount: selectedPayment?.amount || "",
                        currency: selectedPayment?.currency || "IRT",
                        method: selectedPayment?.method || "bank_transfer",
                        status: selectedPayment?.status || "completed",
                        reference: selectedPayment?.reference || "",
                        paymentDate: selectedPayment?.paymentDate ? new Date(selectedPayment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        notes: selectedPayment?.notes || "",
                        invoice: selectedPayment?.invoice?._id || "",
                    }}
                    validationSchema={paymentSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                            <SelectField name="client" label="مشتری">
                                <option value="">-- انتخاب مشتری --</option>
                                {clients.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </SelectField>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField type="number" name="amount" label="مبلغ" min="0" step="0.01" />
                                <SelectField name="currency" label="واحد مالی">
                                    <option value="IRT">تومان (IRT)</option>
                                    <option value="TOMAN">تومان (TOMAN)</option>
                                    <option value="USD">دلار (USD)</option>
                                    <option value="EUR">یورو (EUR)</option>
                                    <option value="AED">درهم (AED)</option>
                                </SelectField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField name="method" label="روش پرداخت">
                                    <option value="bank_transfer">حواله بانکی / کارت به کارت</option>
                                    <option value="zarinpal">درگاه زرین‌پال</option>
                                    <option value="cash">نقدی</option>
                                    <option value="credit_card">کارت اعتباری (بین‌المللی)</option>
                                    <option value="paypal">پی‌پال</option>
                                    <option value="crypto">ارز دیجیتال</option>
                                    <option value="other">سایر</option>
                                </SelectField>
                                <InputField type="date" name="paymentDate" label="تاریخ پرداخت" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <SelectField name="status" label="وضعیت">
                                    <option value="completed">موفق (تایید شده)</option>
                                    <option value="pending">در انتظار تایید</option>
                                    <option value="failed">ناموفق / لغو شده</option>
                                    <option value="refunded">مردود شده</option>
                                </SelectField>
                                <SelectField 
                                    name="invoice" 
                                    label="اتصال به فاکتور (اختیاری)"
                                    onChange={(e) => {
                                        const invId = e.target.value;
                                        setFieldValue("invoice", invId);
                                        const selectedInv = invoices.find(i => i._id === invId);
                                        if (selectedInv) {
                                            setFieldValue("amount", selectedInv.total);
                                            setFieldValue("currency", selectedInv.currency);
                                            setFieldValue("client", selectedInv.client?._id);
                                            if (selectedInv.paymentMethod) {
                                                setFieldValue("method", selectedInv.paymentMethod);
                                            }
                                        }
                                    }}
                                >
                                    <option value="">-- بدون فاکتور --</option>
                                    {invoices.map(inv => (
                                        <option key={inv._id} value={inv._id}>{inv.invoiceNumber} - {formatCurrency(inv.total, inv.currency)}</option>
                                    ))}
                                </SelectField>
                            </div>

                            <InputField name="reference" label="کد رهگیری / شماره مرجع" placeholder="مثلاً: 123456789" />
                            <TextareaField name="notes" label="یادداشت‌ها" rows={2} />

                            <div className="flex justify-start gap-3 pt-4 border-t dark:border-gray-700">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>انصراف</Button>
                                <Button type="submit" loading={isSubmitting}>
                                    {selectedPayment ? "بروزرسانی تراکنش" : "ثبت تراکنش"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </ContentWrapper>
    );
}

