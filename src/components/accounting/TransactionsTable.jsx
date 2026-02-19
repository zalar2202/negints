"use client";
import React from 'react';
import Link from 'next/link';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { formatCurrency } from '@/lib/utils';

const TransactionsTable = ({ transactions, type = 'user' }) => {
    // type: 'user' or 'admin'
    // If admin, show user name column.

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedId, setSelectedId] = React.useState(null);

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'completed':
                return { background: 'var(--color-success-surface)', color: 'var(--color-success-foreground)' };
            case 'pending':
            case 'sent':
                return { background: 'var(--color-warning-surface)', color: 'var(--color-warning-foreground)' };
            case 'failed':
            case 'overdue':
                return { background: 'var(--color-danger-surface)', color: 'var(--color-danger-foreground)' };
            default:
                return { background: 'var(--color-background-tertiary)', color: 'var(--color-text-secondary)' };
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return 'نامشخص';
        switch (status.toLowerCase()) {
            case 'completed':
            case 'paid':
                return 'پرداخت شده';
            case 'pending':
                return 'در انتظار';
            case 'sent':
                return 'ارسال شده';
            case 'failed':
                return 'ناموفق';
            case 'overdue':
                return 'معوقه';
            case 'partial':
                return 'پرداخت جزیی';
            default:
                return status;
        }
    };

    return (
        <div className="negints-card border-[var(--color-border)] shadow-xl overflow-hidden" style={{ padding: '0', direction: 'rtl' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="bg-[var(--color-background-elevated)]/30 backdrop-blur-sm">
                <h3 className="font-black text-xl text-[var(--color-text-primary)]">فهرست تراکنش‌های اخیر</h3>
                <div className="flex gap-2">
                    <span className="text-xs font-bold text-[var(--color-text-tertiary)] bg-[var(--color-background-tertiary)] px-3 py-1 rounded-full">{transactions?.length.toLocaleString('fa-IR')} مورد</span>
                </div>
            </div>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-background-secondary)' }} className="border-b border-[var(--color-border)]">
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">فاکتور</th>
                            {type === 'admin' && <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">مشتری</th>}
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">تاریخ صدور</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">توضیحات سرویس</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">مبلغ کل</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">وضعیت نهایی</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900', textAlign: 'left' }} className="font-black uppercase tracking-widest">اقدامات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions?.map((tx) => {
                            const txId = tx._id || tx.id;
                            const invoiceNo = tx.invoiceNumber || tx.id;
                            const clientName = tx.client?.name || tx.clientName || 'نامشخص';
                            const dateStr = tx.issueDate ? new Date(tx.issueDate).toLocaleDateString('fa-IR') : tx.date;
                            const amountStr = formatCurrency(tx.total || tx.amount, tx.currency || 'IRT');
                            const descriptionStr = tx.items?.[0]?.description || tx.description || 'فاکتور خدمات دیجیتال';

                            return (
                                <tr key={txId} style={{ borderBottom: '1px solid var(--color-border)', transition: 'all 0.2s' }} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 group">
                                    <td style={{ padding: '16px 24px' }}>
                                        <Link href={`/panel/invoices?id=${txId}`} className="text-indigo-600 font-black hover:text-indigo-700 transition-colors uppercase tracking-widest">
                                            #{invoiceNo}
                                        </Link>
                                    </td>
                                    {type === 'admin' && <td style={{ padding: '16px 24px' }} className="font-bold text-[var(--color-text-primary)]">{clientName}</td>}
                                    <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }} className="font-medium">{dateStr}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <Link href={`/panel/invoices?id=${txId}`} className="text-[var(--color-text-primary)] hover:text-indigo-600 transition-colors no-underline font-bold text-sm">
                                            {descriptionStr}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '16px 24px' }} className="font-black text-[var(--color-text-primary)] tracking-tight">{amountStr}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            ...getStatusStyle(tx.status),
                                            padding: '6px 14px',
                                            borderRadius: '10px',
                                            fontSize: '0.7rem',
                                            boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
                                        }} className="font-black inline-flex items-center gap-1.5 ring-1 ring-inset ring-black/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></div>
                                            {getStatusLabel(tx.status)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                                            <Link 
                                                href={`/panel/invoices?id=${txId}`}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-indigo-600 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 active:scale-90"
                                                title="مشاهده جزئیات"
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </Link>
                                            <Link 
                                                href={`/panel/invoices/${txId}/print`}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-indigo-600 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 active:scale-90"
                                                title="دریافت فاکتور"
                                            >
                                                <DownloadIcon fontSize="small" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default TransactionsTable;
