import { formatCurrency } from '@/lib/utils';
import LoopIcon from '@mui/icons-material/Loop';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ExpensesTable = ({ expenses, onEdit, onDelete }) => {
    
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return { background: 'var(--color-success-surface)', color: 'var(--color-success-foreground)' };
            case 'pending':
                return { background: 'var(--color-warning-surface)', color: 'var(--color-warning-foreground)' };
            default:
                return { background: 'var(--color-background-tertiary)', color: 'var(--color-text-secondary)' };
        }
    };

    const getCategoryLabel = (cat) => {
        const categories = {
            hosting: 'هاستینگ',
            domain: 'دامنه',
            software: 'نرم‌افزار',
            marketing: 'بازاریابی',
            salary: 'حقوق و دستمزد',
            office: 'اجاره دفتر',
            other: 'سایر'
        };
        return categories[cat?.toLowerCase()] || cat || 'سایر';
    };

    return (
        <div className="negints-card border-[var(--color-border)] shadow-xl overflow-hidden" style={{ padding: '0', direction: 'rtl' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="bg-[var(--color-background-elevated)]/30 backdrop-blur-sm">
                <h3 className="font-black text-xl text-[var(--color-text-primary)]">مدیریت هزینه‌های عملیاتی</h3>
                <div className="flex gap-2">
                    <span className="text-xs font-bold text-[var(--color-text-tertiary)] bg-[var(--color-background-tertiary)] px-3 py-1 rounded-full">{expenses?.length.toLocaleString('fa-IR')} رکورد هزینه‌ای</span>
                </div>
            </div>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-background-secondary)' }} className="border-b border-[var(--color-border)]">
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">زمان ثبت</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">شرح و جزئیات هزینه</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">نوع هزینه</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">مبلغ نهایی</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest">وضعیت پرداخت</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900' }} className="font-black uppercase tracking-widest text-center">دوره تکرار</th>
                            <th style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '900', textAlign: 'left' }} className="font-black uppercase tracking-widest">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses?.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }} className="font-bold text-lg opacity-40">
                                    هنوز در این بخش هزینه‌ای ثبت نشده است.
                                </td>
                            </tr>
                        ) : (
                            expenses?.map((ex) => (
                                <tr key={ex._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'all 0.2s' }} className="hover:bg-red-50/20 dark:hover:bg-red-900/5 group">
                                    <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }} className="font-medium">
                                        {new Date(ex.date).toLocaleDateString('fa-IR')}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div className="font-black text-[var(--color-text-primary)]">{ex.description}</div>
                                        {ex.notes && <div className="text-[10px] text-[var(--color-text-tertiary)] mt-1 font-bold opacity-80">{ex.notes}</div>}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span className="px-3 py-1 rounded-lg bg-[var(--color-background-tertiary)] text-[10px] font-black tracking-tight text-[var(--color-text-secondary)]">
                                            {getCategoryLabel(ex.category)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }} className="font-black text-red-500 tracking-tight">
                                        - {formatCurrency(ex.amount, 'IRT')}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            ...getStatusStyle(ex.status),
                                            padding: '6px 14px',
                                            borderRadius: '10px',
                                            fontSize: '0.7rem',
                                            boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
                                        }} className="font-black inline-flex items-center gap-1.5 ring-1 ring-inset ring-black/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></div>
                                            {ex.status === 'paid' ? 'پرداخت شده' : 'در انتظار'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        {ex.recurring ? (
                                            <div className="inline-flex flex-col items-center">
                                                <LoopIcon style={{ fontSize: '1.1rem' }} className="text-indigo-600 animate-spin-slow" />
                                                <span className="text-[9px] font-black text-indigo-500 uppercase mt-0.5">{ex.frequency === 'monthly' ? 'ماهانه' : 'سالانه'}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold">—</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                                            <button 
                                                onClick={() => onEdit(ex)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-indigo-600 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 active:scale-90"
                                                title="ویرایش تراکنش"
                                            >
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(ex._id)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 border border-[var(--color-border)] text-red-400 hover:text-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 active:scale-90"
                                                title="حذف رکورد"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default ExpensesTable;
