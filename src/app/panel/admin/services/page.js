"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
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
import { 
    Activity, 
    Plus, 
    Search, 
    Calendar, 
    CreditCard, 
    Clock, 
    Zap, 
    AlertTriangle,
    Trash2, 
    Edit,
    Filter,
    X
} from "lucide-react";
import * as Yup from "yup";

const serviceSchema = Yup.object().shape({
    user: Yup.string().required("User is required"),
    package: Yup.string().required("Package is required"),
    price: Yup.number().min(0).required("Price is required"),
    billingCycle: Yup.string().required("Billing cycle is required"),
    status: Yup.string().required("Status is required"),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().nullable(),
    autoRenew: Yup.boolean(),
    notes: Yup.string(),
});

export default function AdminServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [packages, setPackages] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [expirationFilter, setExpirationFilter] = useState("all");

    const isAdmin = user && ['admin', 'manager'].includes(user.role);

    useEffect(() => {
        if (isAdmin) {
            fetchServices();
            fetchPackages();
            fetchUsersList();
        }
    }, [isAdmin]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/services");
            if (data.success) setServices(data.data);
        } catch (error) {
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
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

    const fetchUsersList = async () => {
        try {
            const { data } = await axios.get("/api/users?limit=1000");
            if (data.success) setUsers(data.data || []);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (selectedService) {
                const { data } = await axios.put(`/api/services/${selectedService._id}`, values);
                if (data.success) {
                    toast.success("Service updated");
                    fetchServices();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axios.post("/api/services", values);
                if (data.success) {
                    toast.success("Service assigned successfully");
                    fetchServices();
                    setIsModalOpen(false);
                    resetForm();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this service assignment?")) return;
        try {
            await axios.delete(`/api/services/${id}`);
            toast.success("Service removed");
            fetchServices();
        } catch (error) {
            toast.error("Failed to remove service");
        }
    };

    // Calculate expiration status
    const getExpirationStatus = (service) => {
        if (!service.endDate || service.status !== 'active') return null;
        
        const now = new Date();
        const endDate = new Date(service.endDate);
        const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'danger' };
        if (daysUntilExpiry <= 7) return { status: 'critical', days: daysUntilExpiry, color: 'danger' };
        if (daysUntilExpiry <= 30) return { status: 'warning', days: daysUntilExpiry, color: 'warning' };
        return { status: 'ok', days: daysUntilExpiry, color: 'success' };
    };

    // Filter services
    const filteredServices = services.filter(s => {
        const matchesSearch = 
            s.package?.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.user?.email?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        
        let matchesExpiration = true;
        if (expirationFilter !== 'all') {
            const expStatus = getExpirationStatus(s);
            if (expirationFilter === 'expired') {
                matchesExpiration = expStatus?.status === 'expired';
            } else if (expirationFilter === 'expiring-soon') {
                matchesExpiration = expStatus?.status === 'critical' || expStatus?.status === 'warning';
            } else if (expirationFilter === 'expiring-week') {
                matchesExpiration = expStatus?.status === 'critical';
            }
        }
        
        return matchesSearch && matchesStatus && matchesExpiration;
    });

    const activeServices = services.filter(s => s.status === 'active');
    const expiringServices = services.filter(s => {
        const exp = getExpirationStatus(s);
        return exp && (exp.status === 'critical' || exp.status === 'warning');
    });
    const expiredServices = services.filter(s => {
        const exp = getExpirationStatus(s);
        return exp?.status === 'expired';
    });

    if (!isAdmin) {
        return (
            <ContentWrapper>
                <div className="text-center py-12" style={{ direction: 'rtl' }}>
                    <h1 className="text-2xl font-bold text-red-600">عدم دسترسی</h1>
                    <p className="text-gray-500 mt-2">شما اجازه مشاهده این صفحه را ندارید.</p>
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-right" style={{ direction: 'rtl' }}>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                        <Activity className="w-6 h-6 text-emerald-600" />
                        مدیریت تمامی خدمات
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        مدیریت تخصیص خدمات به مشتریان و رهگیری تاریخ انقضا.
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedService(null); setIsModalOpen(true); }}>
                    تخصیص سرویس جدید
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-right" style={{ direction: 'rtl' }}>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">سرویس‌های فعال</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeServices.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">کل سرویس‌ها</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{services.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setExpirationFilter('expiring-soon')}>
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">نزدیک انقضا</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{expiringServices.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setExpirationFilter('expired')}>
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">منقضی شده</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{expiredServices.length}</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 text-right" style={{ direction: 'rtl' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                        <input
                            type="text"
                            placeholder="جستجو در سرویس‌ها، کاربران..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-transparent text-[var(--color-text-primary)] text-right"
                            style={{ borderColor: "var(--color-border)" }}
                        />
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-transparent text-[var(--color-text-primary)]"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            <option value="active">فعال</option>
                            <option value="pending">در انتظار</option>
                            <option value="expired">منقضی شده</option>
                            <option value="suspended">تعلیق شده</option>
                            <option value="cancelled">لغو شده</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                        <select
                            value={expirationFilter}
                            onChange={(e) => setExpirationFilter(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-transparent text-[var(--color-text-primary)]"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <option value="all">همه انقضاها</option>
                            <option value="expiring-week">انقضا در ۷ روز آینده</option>
                            <option value="expiring-soon">انقضا در ۳۰ روز آینده</option>
                            <option value="expired">از قبل منقضی شده</option>
                        </select>
                    </div>
                </div>

                {(statusFilter !== 'all' || expirationFilter !== 'all' || search) && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[var(--color-text-secondary)]">فیلترهای فعال:</span>
                        {statusFilter !== 'all' && (
                            <Badge variant="primary" size="sm" className="flex items-center gap-1">
                                وضعیت: {statusFilter === 'active' ? 'فعال' : statusFilter === 'pending' ? 'در انتظار' : statusFilter}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                            </Badge>
                        )}
                        {expirationFilter !== 'all' && (
                            <Badge variant="warning" size="sm" className="flex items-center gap-1">
                                انقضا: {expirationFilter === 'expired' ? 'منقضی شده' : expirationFilter}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setExpirationFilter('all')} />
                            </Badge>
                        )}
                        {search && (
                            <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                                جستجو: "{search}"
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                            </Badge>
                        )}
                        <button
                            onClick={() => { setStatusFilter('all'); setExpirationFilter('all'); setSearch(''); }}
                            className="text-xs text-indigo-600 hover:underline mr-2"
                        >
                            حذف همه فیلترها
                        </button>
                    </div>
                )}
            </Card>

            {/* Services List */}
            <Card>
                <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">در حال بارگزاری سرویس‌ها...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">سرویسی با این فیلترها یافت نشد.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredServices.map((svc) => {
                                const expStatus = getExpirationStatus(svc);
                                return (
                                    <div key={svc._id} className="p-4 border border-[var(--color-border)] rounded-xl hover:shadow-md transition-all group relative">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <Badge variant={svc.status === 'active' ? 'success' : svc.status === 'pending' ? 'warning' : 'secondary'} size="sm" className="capitalize">
                                                        {svc.status === 'active' ? 'فعال' : svc.status === 'pending' ? 'در انتظار' : svc.status}
                                                    </Badge>
                                                    {expStatus && (
                                                        <Badge variant={expStatus.color} size="sm" className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {expStatus.status === 'expired' 
                                                                ? `${expStatus.days} روز پیش منقضی شد`
                                                                : `${expStatus.days} روز مانده`
                                                            }
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-[var(--color-text-tertiary)] font-mono">#{svc._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1 truncate">
                                                    {svc.package?.name || "طرح ویژه"}
                                                </h3>
                                                <p className="text-sm text-emerald-600 font-medium mb-2">
                                                    مشتری: {svc.user?.name} ({svc.user?.email})
                                                </p>
                                                
                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                        <Clock className="w-4 h-4" />
                                                        <span>شروع: {new Date(svc.startDate).toLocaleDateString('fa-IR')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>انقضا: {svc.endDate ? new Date(svc.endDate).toLocaleDateString('fa-IR') : 'نامحدود'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                        <CreditCard className="w-4 h-4" />
                                                        <span>{formatCurrency(svc.price || 0, 'IRT')} / {svc.billingCycle === 'monthly' ? 'ماهانه' : svc.billingCycle === 'yearly' ? 'سالانه' : svc.billingCycle}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                        <Zap className="w-4 h-4" />
                                                        <span>تمدید خودکار: {svc.autoRenew ? "بله" : "خیر"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => { setSelectedService(svc); setIsModalOpen(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(svc._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {svc.notes && (
                                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 italic">
                                                "{svc.notes}"
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            {/* Admin Modal for Assigning/Editing */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedService ? "ویرایش سرویس" : "تخصیص سرویس جدید"} size="lg">
                <Formik
                    initialValues={{
                        user: selectedService?.user?._id || selectedService?.user || "",
                        package: selectedService?.package?._id || "",
                        price: selectedService?.price || 0,
                        billingCycle: selectedService?.billingCycle || "monthly",
                        status: selectedService?.status || "active",
                        startDate: selectedService?.startDate ? new Date(selectedService.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        endDate: selectedService?.endDate ? new Date(selectedService.endDate).toISOString().split('T')[0] : "",
                        autoRenew: selectedService?.autoRenew ?? true,
                        notes: selectedService?.notes || "",
                    }}
                    validationSchema={serviceSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ values, isSubmitting, setFieldValue }) => {
                        const handlePackageChange = (e) => {
                            const pkgId = e.target.value;
                            setFieldValue('package', pkgId);
                            const pkg = packages.find(p => p._id === pkgId);
                            if (pkg) {
                                setFieldValue('price', pkg.price);
                            }
                        };

                        return (
                            <Form className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                                <SelectField name="user" label="انتخاب مشتری">
                                    <option value="">-- انتخاب کاربر --</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </SelectField>

                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField name="package" label="پکیج" onChange={handlePackageChange}>
                                        <option value="">-- انتخاب پکیج --</option>
                                        {packages.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </SelectField>
                                    <InputField type="number" name="price" label="قیمت (تومان)" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField name="billingCycle" label="دوره صورتحساب">
                                        <option value="monthly">ماهانه</option>
                                        <option value="quarterly">سه ماهه</option>
                                        <option value="semi-annually">شش ماهه</option>
                                        <option value="annually">سالانه</option>
                                        <option value="one-time">یکبار پرداخت</option>
                                    </SelectField>
                                    <SelectField name="status" label="وضعیت">
                                        <option value="active">فعال</option>
                                        <option value="pending">در انتظار</option>
                                        <option value="expired">منقضی شده</option>
                                        <option value="suspended">تعلیق شده</option>
                                        <option value="cancelled">لغو شده</option>
                                    </SelectField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField type="date" name="startDate" label="تاریخ شروع" />
                                    <InputField type="date" name="endDate" label="تاریخ انقضا (اختیاری)" />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="autoRenew" checked={values.autoRenew} onChange={e => setFieldValue('autoRenew', e.target.checked)} className="rounded text-emerald-600" />
                                    <span className="text-sm font-medium">فعال‌سازی تمدید خودکار</span>
                                </label>

                                <TextareaField name="notes" label="یادداشت‌های مدیریت" rows={3} placeholder="اطلاعات سرور، جزئیات داخلی و ..." />

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>انصراف</Button>
                                    <Button type="submit" loading={isSubmitting}>
                                        {selectedService ? "ذخیره تغییرات" : "تایید تخصیص سرویس"}
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </Modal>

        </ContentWrapper>
    );
}
