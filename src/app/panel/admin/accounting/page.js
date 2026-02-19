"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import AccountingStats from '@/components/accounting/AccountingStats';
import TransactionsTable from '@/components/accounting/TransactionsTable';
import ExpensesTable from '@/components/accounting/ExpensesTable';
import AddIcon from '@mui/icons-material/Add';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet, Tag } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";


export default function AdminAccountingPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'expenses'
    
    // Data
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    
    // Expenses Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "other",
        date: new Date().toISOString().split('T')[0],
        status: "paid",
        notes: "",
        recurring: false,
        frequency: ""
    });

    const metrics = useMemo(() => {
        const revenue = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.totalInBaseCurrency || inv.total || 0), 0);
        
        const outstanding = invoices
            .filter(inv => ['sent', 'overdue', 'partial'].includes(inv.status))
            .reduce((sum, inv) => {
                const totalBase = inv.totalInBaseCurrency || inv.total || 0;
                const rate = inv.exchangeRate || 1;
                
                if (inv.status === 'partial' && inv.paymentPlan?.isInstallment) {
                    const downPaymentBase = (inv.paymentPlan?.downPayment || 0) * rate;
                    return sum + (totalBase - downPaymentBase);
                }
                return sum + totalBase;
            }, 0);
        
        const totalExpenses = expenses
            .filter(exp => exp.status === 'paid')
            .reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const totalPromotions = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => {
                const promoAmt = inv.promotion?.discountAmount || 0;
                const rate = inv.exchangeRate || 1;
                return sum + (promoAmt * rate);
            }, 0);

        const netProfit = revenue - totalExpenses;
        const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;
        
        const paidCount = invoices.filter(inv => inv.status === 'paid').length;
        const pendingCount = invoices.filter(inv => ['sent', 'partial'].includes(inv.status)).length;

        return {
            totalRevenue: revenue,
            totalExpenses,
            totalPromotions,
            netProfit,
            outstanding,
            paidCount,
            pendingCount,
            profitMargin
        };
    }, [invoices, expenses]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [invoicesRes, expensesRes] = await Promise.all([
                axios.get("/api/invoices"),
                axios.get("/api/expenses") // Assume this route exists
            ]);

            if (invoicesRes.data.success) {
                setInvoices(invoicesRes.data.data);
            }
            if (expensesRes.data.success) {
                setExpenses(expensesRes.data.data);
            }

        } catch (error) {
            console.error("Failed to fetch accounting data:", error);
            toast.error("خطا در بارگزاری داده‌های مالی");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);



    // Form Handling
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setFormData({
            description: "",
            amount: "",
            category: "other",
            date: new Date().toISOString().split('T')[0],
            status: "paid",
            notes: "",
            recurring: false,
            frequency: ""
        });
        setIsModalOpen(true);
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setFormData({
            ...expense,
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : "",
            amount: expense.amount || ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Sanitize payload
            const payload = { ...formData };
            if (!payload.recurring || !payload.frequency) {
                payload.frequency = null;
            }

            if (editingExpense) {
                await axios.put(`/api/expenses/${editingExpense._id}`, payload);
                toast.success('هزینه بروزرسانی شد');
            } else {
                await axios.post('/api/expenses', payload);
                toast.success('هزینه با موفقیت ثبت شد');
            }
            await fetchData(); // Refresh all data
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'عملیات با خطا مواجه شد');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!confirm("آیا از حذف این هزینه اطمینان دارید؟")) return;
        try {
            await axios.delete(`/api/expenses/${id}`);
            toast.success('هزینه حذف شد');
            fetchData();
        } catch (error) {
            toast.error("خطا در حذف هزینه");
        }
    };

    const stats = [
        { 
            title: "کل درآمد", 
            value: formatCurrency(metrics.totalRevenue, 'IRT'), 
            percentage: `${metrics.paidCount} پرداخت شده`, 
            trend: "up", 
            description: "مجموع فاکتورهای تسویه شده",
            icon: <DollarSign className="w-5 h-5 text-emerald-500" />
        },
        { 
            title: "کل هزینه‌ها", 
            value: formatCurrency(metrics.totalExpenses, 'IRT'), 
            percentage: `${expenses.length} رکورد`, 
            trend: "down", 
            description: "هزینه‌های عملیاتی",
            icon: <TrendingDown className="w-5 h-5 text-red-500" />
        },
        { 
            title: "سود خالص", 
            value: formatCurrency(metrics.netProfit, 'IRT'), 
            percentage: `${metrics.profitMargin}% حاشیه سود`, 
            trend: metrics.netProfit >= 0 ? "up" : "down", 
            description: "درآمد منهای هزینه‌ها",
            icon: <Wallet className="w-5 h-5 text-indigo-500" />
        },
        { 
            title: "تخفیف‌های اهدایی", 
            value: formatCurrency(metrics.totalPromotions, 'IRT'), 
            percentage: "مزایای مشتریان", 
            trend: "neutral", 
            description: "کل تخفیفات داده شده",
            icon: <Tag className="w-5 h-5 text-purple-500" />
        },
        { 
            title: "مطالبات معوق", 
            value: formatCurrency(metrics.outstanding, 'IRT'), 
            percentage: `${metrics.pendingCount} در انتظار`, 
            trend: "neutral", 
            description: "در انتظار پرداخت",
            icon: <TrendingUp className="w-5 h-5 text-amber-500" />
        },
    ];

    if (loading && invoices.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto', direction: 'rtl' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div className="text-right">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-black">گزارش جامع مالی</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }} className="font-medium">مدیریت هوشمند امور مالی، فاکتورها و هزینه‌های عملیاتی کسب‌وکار شما.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={openAddModal} className="font-bold">
                        <AddIcon className="ml-2 w-4 h-4" /> ثبت هزینه جدید
                    </Button>
                    <Link 
                        href="/panel/invoices" 
                        className="negints-btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 px-6 py-2.5 rounded-xl font-black no-underline shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <AddIcon style={{ fontSize: '1.2rem' }} /> صدور فاکتور جدید
                    </Link>
                </div>
            </div>

            <AccountingStats stats={stats} />

            <div style={{ marginTop: '40px' }} className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-[var(--color-border)]">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-8 py-4 font-black text-sm transition-all duration-300 relative ${activeTab === 'invoices' ? 'text-indigo-600 dark:text-indigo-400 translate-y-[-1px]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        درآمد و فاکتورها
                        {activeTab === 'invoices' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full shadow-[0_-2px_6px_rgba(79,70,229,0.3)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-8 py-4 font-black text-sm transition-all duration-300 relative ${activeTab === 'expenses' ? 'text-indigo-600 dark:text-indigo-400 translate-y-[-1px]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        مدیریت هزینه‌ها
                        {activeTab === 'expenses' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full shadow-[0_-2px_6px_rgba(79,70,229,0.3)]" />}
                    </button>
                </div>

                {activeTab === 'invoices' ? (
                    <TransactionsTable transactions={invoices} type="admin" />
                ) : (
                    <ExpensesTable expenses={expenses} onEdit={openEditModal} onDelete={handleDeleteExpense} />
                )}
            </div>

            {/* Expense Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingExpense ? "ویرایش هزینه" : "ثبت هزینه جدید"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">شرح هزینه</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="مثلاً: هزینه هاستینگ سرور"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">مبلغ (تومان)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                required
                                min="0"
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">تاریخ</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">دسته‌بندی</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="hosting">هاستینگ</option>
                                <option value="domain">دامنه</option>
                                <option value="software">نرم‌افزار</option>
                                <option value="marketing">بازاریابی</option>
                                <option value="salary">حقوق و دستمزد</option>
                                <option value="office">اجاره دفتر</option>
                                <option value="other">سایر</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">وضعیت</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="paid">پرداخت شده</option>
                                <option value="pending">در انتظار</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="recurring"
                            name="recurring"
                            checked={formData.recurring}
                            onChange={handleInputChange}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="recurring" className="text-sm font-bold text-[var(--color-text-primary)] cursor-pointer">
                            هزینه تکرار شونده
                        </label>
                    </div>

                    {formData.recurring && (
                         <div>
                            <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">دوره تکرار</label>
                            <select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">انتخاب دوره</option>
                                <option value="monthly">ماهانه</option>
                                <option value="yearly">سالانه</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">یادداشت</label>
                        <textarea
                            name="notes"
                            value={formData.notes || ""}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            انصراف
                        </Button>
                        <Button type="submit" variant="primary" loading={isSubmitting}>
                            {editingExpense ? "بروزرسانی" : "ثبت هزینه"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

