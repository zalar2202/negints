"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AccountingStats from '@/components/accounting/AccountingStats';
import TransactionsTable from '@/components/accounting/TransactionsTable';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function UserAccountingPage() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get("/api/invoices");
                if (data.success) {
                    setInvoices(data.data);
                    
                    const totalSpentBase = data.data
                        .filter(inv => inv.status === 'paid')
                        .reduce((sum, inv) => sum + (inv.totalInBaseCurrency || inv.total || 0), 0);
                    
                    const activeServicesCount = data.data.filter(inv => inv.status === 'paid').length;
                    
                    const pendingInvoice = data.data.find(inv => ['sent', 'overdue', 'partial'].includes(inv.status));

                    setStats([
                        { title: "کل پرداختی", value: formatCurrency(totalSpentBase, 'IRT'), percentage: "", trend: "up", description: "مجموع تراکنش‌های موفق" },
                        { 
                            title: "صورتحساب معلق", 
                            value: pendingInvoice ? formatCurrency(pendingInvoice.total, pendingInvoice.currency) : formatCurrency(0, 'IRT'), 
                            percentage: "", 
                            trend: pendingInvoice ? "down" : "neutral", 
                            description: pendingInvoice ? `سررسید بعدی: ${new Date(pendingInvoice.dueDate).toLocaleDateString('fa-IR')}` : "تمامی صورتحساب‌ها پرداخت شده" 
                        },
                        { title: "خدمات فعال", value: activeServicesCount.toString(), percentage: "", trend: "neutral", description: "سرویس‌های در حال اجرا" },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch billing data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', direction: 'rtl' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div className="text-right">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px', color: 'var(--color-text-primary)' }} className="font-black">تراکنش‌ها و صورتحساب‌ها</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }} className="font-medium">گزارش کامل هزینه‌ها، فاکتورهای صادر شده و وضعیت اشتراک‌های فعال شما.</p>
                </div>
                <button className="negints-btn bg-white dark:bg-gray-950 border border-[var(--color-border)] px-6 py-3 rounded-xl font-black text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                    <CreditCardIcon className="ml-1 w-5 h-5 text-indigo-600" /> مدیریت روش‌های پرداخت
                </button>
            </div>

            <AccountingStats stats={stats} />

            <div style={{ marginTop: '40px' }} className="space-y-6">
                <TransactionsTable transactions={invoices} type="user" />
            </div>
        </div>
    );
}


