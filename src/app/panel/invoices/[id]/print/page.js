"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader2, Download, Printer, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/common/Button";
import { formatCurrency } from "@/lib/utils";

export default function InvoicePrintPage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const { data } = await axios.get(`/api/invoices/${id}`);
                if (data.success) {
                    setInvoice(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch invoice:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">فاکتور یافت نشد</h1>
                    <Button onClick={() => window.history.back()}>بازگشت</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 md:p-10">
            {/* Header Controls - Hidden during print */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between print:hidden" style={{ direction: 'rtl' }}>
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors font-bold"
                >
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    بازگشت به پیشخوان
                </button>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        icon={<Printer className="w-4 h-4" />}
                        onClick={handlePrint}
                    >
                        چاپ فاکتور
                    </Button>
                    <Button 
                        icon={<Download className="w-4 h-4" />}
                        onClick={handlePrint}
                    >
                        دریافت فایل PDF
                    </Button>
                </div>
            </div>

            {/* Invoice Paper */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print-container print:bg-white print:text-black" style={{ direction: 'rtl' }}>
                {/* Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />
                
                <div className="p-8 md:p-12">
                    {/* Invoice Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-10 mb-12 text-right">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                                    <img 
                                        src="/assets/logo/negints-logo.png" 
                                        alt="NeginTS" 
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">
                                    Negin<span className="text-indigo-600">TS</span>
                                </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                <p>آدرس دفتر مرکزی: تهران</p>
                                <p>خیابان آزادی، نبش جمالزاده جنوبی، برج آفتاب، طبقه14، واحد 11</p>
                                <p>ایمیل: info@negints.com</p>
                                <p>تلفن پشتیبانی: ۰۲۱-۶۵۰۲۳۹۸۰</p>
                            </div>
                        </div>

                        <div className="text-left" style={{ direction: 'rtl' }}>
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 uppercase">صورتحساب</h2>
                            <p className="font-mono text-gray-500 dark:text-gray-400 mb-6 font-bold">#{invoice.invoiceNumber}</p>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">تاریخ صدور:</span>
                                    <span className="font-bold dark:text-white">{new Date(invoice.issueDate).toLocaleDateString('fa-IR')}</span>
                                </div>
                                <div className="flex justify-between gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">تاریخ سررسید:</span>
                                    <span className="font-bold dark:text-white">{new Date(invoice.dueDate).toLocaleDateString('fa-IR')}</span>
                                </div>
                                <div className="flex justify-between gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">وضعیت پرداخت:</span>
                                    <span className={`font-black uppercase tracking-wider ${
                                        invoice.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>
                                        {invoice.status === 'paid' ? 'تسویه شده' : 
                                         invoice.status === 'overdue' ? 'معوقه' : 
                                         invoice.status === 'sent' ? 'منتظر پرداخت' : 'پیش‌نویس'}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">نوع فاکتور:</span>
                                    <span className="font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        {(() => {
                                            if (invoice.paymentPlan?.isInstallment) {
                                                if (invoice.paymentPlan.downPayment && invoice.paymentPlan.downPayment > 0) {
                                                    if (Math.abs(invoice.total - invoice.paymentPlan.downPayment) < 0.01) {
                                                        return "پیش‌پرداخت";
                                                    }
                                                }
                                                return "اقساطی";
                                            }
                                            return "نقدی / یکجا";
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800 mb-12" />

                    {/* Billing Details */}
                    <div className="grid md:grid-cols-2 gap-12 mb-12 text-right">
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">صورتحساب برای</h4>
                            <div className="text-gray-900 dark:text-white">
                                <p className="text-lg font-black">
                                    {invoice.client?.company || invoice.client?.linkedUser?.company || invoice.client?.name}
                                </p>
                                <div className="text-gray-500 dark:text-gray-400 text-sm mt-2 space-y-1 font-medium">
                                    <p>{invoice.client?.email || invoice.client?.linkedUser?.email}</p>
                                    <p>{invoice.client?.phone || invoice.client?.linkedUser?.phone}</p>
                                    
                                    {(invoice.client?.taxId || invoice.client?.linkedUser?.taxId) && (
                                        <p className="font-bold text-xs mt-2">
                                            شناسه ملی/کد اقتصادی: {invoice.client?.taxId || invoice.client?.linkedUser?.taxId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 mb-12">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <th className="p-4">شرح خدمات</th>
                                    <th className="p-4 text-center">تعداد</th>
                                    <th className="p-4 text-left">قیمت واحد</th>
                                    <th className="p-4 text-left">جمع کل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {invoice.items?.map((item, idx) => (
                                    <tr key={idx} className="text-sm dark:text-gray-300">
                                        <td className="p-4 font-bold text-gray-900 dark:text-white">{item.description}</td>
                                        <td className="p-4 text-center font-bold">{item.quantity}</td>
                                        <td className="p-4 text-left font-medium">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                                        <td className="p-4 text-left font-black text-gray-900 dark:text-white">{formatCurrency(item.amount, invoice.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-start mb-12 text-right">
                        <div className="w-full md:w-1/3 space-y-4">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-bold">جمع فرعی</span>
                                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-bold">مالیات ({invoice.taxRate}%)</span>
                                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                            </div>

                            {invoice.promotion?.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-black">
                                    <span>کد تخفیف ({invoice.promotion.code})</span>
                                    <span>-{formatCurrency(invoice.promotion.discountAmount, invoice.currency)}</span>
                                </div>
                            )}
                            
                            {/* Installment Breakdown */}
                            {invoice.paymentPlan?.isInstallment && invoice.paymentPlan.downPayment > 0 ? (
                                <>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                            {invoice.promotion?.discountAmount > 0 ? 'مبلغ نهایی (پس از تخفیف)' : 'ارزش کل پکیج'}
                                        </span>
                                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(invoice.total, invoice.currency)}</span>
                                    </div>
                                    
                                    {/* Down Payment Row */}
                                    <div className={`flex justify-between items-center p-3 rounded-xl -mx-2 ${
                                        ['partial', 'paid'].includes(invoice.status) 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900' 
                                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-900'
                                    }`}>
                                        <span className="text-sm font-black uppercase tracking-wide">
                                            {['partial', 'paid'].includes(invoice.status) ? 'پیش‌پرداخت (تسویه شده)' : 'پیش‌پرداخت (سررسید فعلی)'}
                                        </span>
                                        <span className="text-2xl font-black">
                                            {formatCurrency(invoice.paymentPlan.downPayment, invoice.currency)}
                                        </span>
                                    </div>

                                    {/* Remaining Balance Row */}
                                    <div className={`flex justify-between items-center p-3 rounded-xl -mx-2 mt-1 ${
                                        invoice.status === 'partial' 
                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-900' 
                                        : invoice.status === 'paid'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900'
                                            : ''
                                    }`}>
                                        <span className="text-sm font-black uppercase tracking-wide">
                                            {invoice.status === 'partial' 
                                                ? 'باقیمانده اقساط (سررسید جاری)' 
                                                : invoice.status === 'paid'
                                                    ? 'باقیمانده اقساط (تسویه شده)'
                                                    : 'باقیمانده اقساط (تعویقی)'
                                            }
                                        </span>
                                        <span className="text-2xl font-black">
                                            {formatCurrency(invoice.total - invoice.paymentPlan.downPayment, invoice.currency)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <span className="text-lg font-black text-gray-900 dark:text-white">مبلغ قابل پرداخت</span>
                                    <span className="text-3xl font-black text-indigo-600">{formatCurrency(invoice.total, invoice.currency)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Plan / Installments */}
                    {invoice.paymentPlan?.isInstallment && (
                        <div className="mb-12 p-8 border-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/5 rounded-3xl text-right">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest">برنامه پرداخت اقساطی</h4>
                            </div>
                            <div className="flex flex-wrap gap-x-12 gap-y-6">
                                <div>
                                    <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">پیش‌پرداخت</p>
                                    <p className="text-lg font-bold text-indigo-900 dark:text-white">{formatCurrency(invoice.paymentPlan.downPayment, invoice.currency)}</p>
                                </div>
                                {invoice.paymentPlan.installmentAmount > 0 ? (
                                    <>
                                        <div>
                                            <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">مبلغ هر قسط</p>
                                            <p className="text-lg font-bold text-indigo-900 dark:text-white">{formatCurrency(invoice.paymentPlan.installmentAmount, invoice.currency)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">دوره پرداخت</p>
                                            <p className="text-lg font-bold text-indigo-900 dark:text-white">
                                                {invoice.paymentPlan.period === 'monthly' ? 'ماهانه' : 
                                                 invoice.paymentPlan.period === 'weekly' ? 'هفتگی' : 'فصلی'}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">باقیمانده کل</p>
                                        <p className="text-lg font-bold text-indigo-900 dark:text-white">{formatCurrency(invoice.total - invoice.paymentPlan.downPayment, invoice.currency)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">تعداد اقساط</p>
                                    <p className="text-lg font-bold text-indigo-900 dark:text-white">{invoice.paymentPlan.installmentsCount}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 text-right">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">یادداشت‌ها و دستورالعمل پرداخت</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed font-medium">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Signature & Footer */}
                    <div className="mt-24 grid grid-cols-2 gap-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-right">
                        <div>
                            <div className="w-48 h-px bg-gray-300 dark:bg-gray-700 mb-2" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">محل مهر و امضای مجاز</p>
                        </div>
                        <div className="text-center pt-8">
                            <p className="text-gray-500 text-xs mb-1 font-bold">با تشکر از اعتماد شما!</p>
                            <p className="text-gray-300 text-[10px] font-mono">www.negints.com</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">NeginTS - انتخاب برتر در تجهیزات پزشکی</p>
                    </div>
                </div>
            </div>
            
            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        direction: rtl !important;
                    }
                    .print-container {
                        padding: 1.5cm !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .shadow-2xl {
                        box-shadow: none !important;
                    }
                    .rounded-2xl {
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}

