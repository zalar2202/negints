"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal, ConfirmModal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { 
    Building2, 
    Plus, 
    Search, 
    Link as LinkIcon, 
    CreditCard, 
    MoreVertical, 
    Edit, 
    Trash2,
    User,
    Mail,
    Phone,
    Clock,
    AlertTriangle
} from "lucide-react";
import * as Yup from "yup";

// Validation Schema
const clientSchema = Yup.object().shape({
    name: Yup.string().required("Company/Client name is required"),
    contactPerson: Yup.string(),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string(),
    status: Yup.string().oneOf(['active', 'inactive', 'prospective']),
    linkedUser: Yup.string().nullable(),
    company: Yup.string().nullable(),
    website: Yup.string().nullable(),
    taxId: Yup.string().nullable(),
    whatsapp: Yup.string().nullable(),
    preferredCommunication: Yup.string().oneOf(['email', 'whatsapp', 'phone', 'slack']),
    address: Yup.object({
        street: Yup.string().nullable(),
        city: Yup.string().nullable(),
        state: Yup.string().nullable(),
        zip: Yup.string().nullable(),
        country: Yup.string().nullable(),
    }),
    notes: Yup.string(),
});

export default function ClientsPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]); // For linking
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null); // If null, creating new
    const [activeTab, setActiveTab] = useState("details"); // details, payments, services
    const [clientInvoices, setClientInvoices] = useState([]);
    const [clientServicesData, setClientServicesData] = useState([]);
    const [allClientServices, setAllClientServices] = useState({});
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);

    useEffect(() => {
        fetchClients();
        fetchUsers();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/clients");
            if (data.success) {
                setClients(data.data);
                // Fetch services for each client to check expirations
                fetchAllClientServices(data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch clients");
        } finally {
            setLoading(false);
        }
    };



    const fetchAllClientServices = async (clientsList) => {
        try {
            const { data } = await axios.get("/api/services");
            if (data.success) {
                // Group services by user ID
                const servicesByUser = {};
                data.data.forEach(service => {
                    const userId = service.user?._id || service.user;
                    if (!servicesByUser[userId]) {
                        servicesByUser[userId] = [];
                    }
                    servicesByUser[userId].push(service);
                });
                setAllClientServices(servicesByUser);
            }
        } catch (error) {
            console.error("Failed to fetch services for expiration check");
        }
    };

    const getClientExpirationStatus = (client) => {
        if (!client.linkedUser) return null;
        const userId = client.linkedUser._id || client.linkedUser;
        const services = allClientServices[userId] || [];
        
        const activeServices = services.filter(s => s.status === 'active' && s.endDate);
        if (activeServices.length === 0) return null;

        let nearestExpiration = null;
        let daysUntilExpiry = Infinity;

        activeServices.forEach(service => {
            const now = new Date();
            const endDate = new Date(service.endDate);
            const days = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            
            if (days < daysUntilExpiry) {
                daysUntilExpiry = days;
                nearestExpiration = service;
            }
        });

        if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry), service: nearestExpiration };
        if (daysUntilExpiry <= 7) return { status: 'critical', days: daysUntilExpiry, service: nearestExpiration };
        if (daysUntilExpiry <= 30) return { status: 'warning', days: daysUntilExpiry, service: nearestExpiration };
        return null;
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/users?limit=1000"); // Get basic user list
            setUsers(data.data || []);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (selectedClient) {
                // Update Client
                const { data } = await axios.put(`/api/clients/${selectedClient._id}`, values);
                if (data.success) {
                    toast.success("Client updated successfully");
                    fetchClients();
                    setIsModalOpen(false);
                    // Don't reset form on edit success in case they want to re-open, 
                    // but since we close modal, it's fine.
                }
            } else {
                // Create Client
                const { data } = await axios.post("/api/clients", values);
                if (data.success) {
                    toast.success("Client created successfully");
                    fetchClients();
                    setIsModalOpen(false);
                    resetForm();
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const fetchClientInvoices = async (clientId) => {
        setInvoicesLoading(true);
        try {
            const { data } = await axios.get(`/api/invoices?clientId=${clientId}`);
            if (data.success) {
                setClientInvoices(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch client invoices");
        } finally {
            setInvoicesLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClient && activeTab === "payments") {
            fetchClientInvoices(selectedClient._id);
        }
        if (selectedClient && activeTab === "services" && selectedClient.linkedUser) {
            fetchClientServices(selectedClient.linkedUser._id || selectedClient.linkedUser);
        }
    }, [selectedClient, activeTab]);

    const fetchClientServices = async (userId) => {
        setServicesLoading(true);
        try {
            const { data } = await axios.get(`/api/services?userId=${userId}`);
            if (data.success) {
                setClientServicesData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch client services");
        } finally {
            setServicesLoading(false);
        }
    };

    const openCreateModal = () => {
        setSelectedClient(null);
        setActiveTab("details");
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        setSelectedClient(client);
        setActiveTab("details");
        setIsModalOpen(true);
    };

    // Filter clients
    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ContentWrapper>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-right" style={{ direction: 'rtl' }}>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                        <Building2 className="w-6 h-6 text-indigo-600" />
                        مشتریان
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        مدیریت شرکت‌ها، اتصال حساب‌های کاربری و پیگیری پرداخت‌ها.
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                    افزودن مشتری
                </Button>
            </div>

            <Card className="text-right" style={{ direction: 'rtl' }}>
                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="جستجوی مشتریان..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 text-right"
                        style={{ borderColor: "var(--color-border)" }}
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-4 font-semibold text-sm text-gray-500">مشتری / شرکت</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">اطلاعات تماس</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">حساب متصل</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">وضعیت</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">انقضای سرویس</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center">در حال بارگزاری...</td></tr>
                            ) : filteredClients.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">مشتری یافت نشد. برای شروع یکی اضافه کنید.</td></tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client._id} className="border-b last:border-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {typeof client.address === 'object' && client.address?.street ? (
                                                    `${client.address.street}${client.address.city ? `، ${client.address.city}` : ""}`
                                                ) : typeof client.address === 'string' && client.address ? (
                                                    client.address
                                                ) : (
                                                    "آدرسی ثبت نشده"
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {client.contactPerson && <div className="text-sm font-medium">{client.contactPerson}</div>}
                                            {client.email && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3" /> {client.email}
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5" style={{ direction: 'ltr', textAlign: 'right' }}>
                                                    <Phone className="w-3 h-3" /> {client.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {client.linkedUser ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {client.linkedUser.name?.[0] || "U"}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium">{client.linkedUser.name}</div>
                                                        <div className="text-[10px] text-gray-400">{client.linkedUser.email}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">متصل نشده</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <Badge 
                                                variant={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'danger' : 'warning'}
                                                size="sm"
                                            >
                                                {client.status === 'active' ? 'فعال' : client.status === 'inactive' ? 'غیرفعال' : 'احتمالی'}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {(() => {
                                                const expStatus = getClientExpirationStatus(client);
                                                if (!expStatus) return <span className="text-xs text-gray-400 italic">سرویس فعالی ندارد</span>;
                                                
                                                return (
                                                    <Badge 
                                                        variant={expStatus.status === 'expired' ? 'danger' : expStatus.status === 'critical' ? 'danger' : 'warning'}
                                                        size="sm"
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        {expStatus.status === 'expired' ? (
                                                            <>
                                                                <AlertTriangle className="w-3 h-3" />
                                                                منقضی شده ({expStatus.days} روز پیش)
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3" />
                                                                {expStatus.days} روز مانده
                                                            </>
                                                        )}
                                                    </Badge>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openEditModal(client)}
                                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                                    title="ویرایش مشتری"
                                                >
                                                    <Edit className="w-4 h-4" />
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

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedClient ? `ویرایش ${selectedClient.name}` : "مشتری جدید"}
                size="lg"
            >
                {selectedClient && (
                    <div className="flex border-b mb-6 dark:border-gray-700" style={{ direction: 'rtl' }}>
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "details" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab("details")}
                        >
                            جزئیات
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "payments" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab("payments")}
                        >
                            پرداخت‌ها
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "services" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab("services")}
                        >
                            سرویس‌ها
                        </button>
                    </div>
                )}

                {activeTab === "details" ? (
                    <Formik
                        initialValues={{
                            name: selectedClient?.name || "",
                            contactPerson: selectedClient?.contactPerson || "",
                            email: selectedClient?.email || "",
                            phone: selectedClient?.phone || "",
                            status: selectedClient?.status || "active",
                            linkedUser: selectedClient?.linkedUser?._id || selectedClient?.linkedUser || "",
                            company: selectedClient?.company || "",
                            website: selectedClient?.website || "",
                            taxId: selectedClient?.taxId || "",
                            whatsapp: selectedClient?.whatsapp || "",
                            preferredCommunication: selectedClient?.preferredCommunication || "email",
                            address: {
                                street: selectedClient?.address?.street || "",
                                city: selectedClient?.address?.city || "",
                                state: selectedClient?.address?.state || "",
                                zip: selectedClient?.address?.zip || "",
                                country: selectedClient?.address?.country || "",
                            },
                            notes: selectedClient?.notes || "",
                            currency: selectedClient?.currency || "IRT",
                        }}
                        validationSchema={clientSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                                <InputField name="name" label="نام مشتری / شرکت" placeholder="مثلاً: آریا سیستم" />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField name="contactPerson" label="شخص رابط" placeholder="نام و نام خانوادگی" />
                                    <SelectField name="status" label="وضعیت">
                                        <option value="active">فعال</option>
                                        <option value="prospective">احتمالی</option>
                                        <option value="inactive">غیرفعال</option>
                                    </SelectField>
                                    <SelectField name="currency" label="واحد پول ترجیحی">
                                        <option value="IRT">تومان (IRT)</option>
                                        <option value="USD">دلار (USD $)</option>
                                        <option value="EUR">یورو (EUR €)</option>
                                        <option value="AED">درهم (AED)</option>
                                    </SelectField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField name="email" label="ایمیل" placeholder="contact@company.com" />
                                    <InputField name="phone" label="تلفن" placeholder="+98..." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField name="website" label="وب‌سایت" placeholder="www.example.com" />
                                    <InputField name="taxId" label="شناسه ملی / کد اقتصادی" placeholder="123456789" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField name="whatsapp" label="واتس‌اپ" placeholder="+98..." />
                                    <SelectField name="preferredCommunication" label="روش تماس ترجیحی">
                                        <option value="email">ایمیل</option>
                                        <option value="whatsapp">واتس‌اپ</option>
                                        <option value="phone">تلفن</option>
                                        <option value="slack">اسلک</option>
                                    </SelectField>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" /> اتصال حساب کاربری
                                    </h4>
                                    <SelectField name="linkedUser" label="انتخاب کاربر ثبت‌نام شده برای اتصال">
                                        <option value="">-- متصل نشده --</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                        ))}
                                    </SelectField>
                                    <p className="text-xs text-gray-400 mt-1">اتصال کاربر اجازه می‌دهد فاکتورهای شرکت را مشاهده کند.</p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium border-b pb-1 dark:border-gray-700">آدرس صورتحساب</h4>
                                    <InputField name="address.street" label="آدرس (خیابان)" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="address.city" label="شهر" />
                                        <InputField name="address.state" label="استان" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="address.zip" label="کد پستی" />
                                        <InputField name="address.country" label="کشور" />
                                    </div>
                                </div>
                                <TextareaField name="notes" label="یادداشت‌های داخلی" rows={3} />

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                        انصراف
                                    </Button>
                                    <Button type="submit" loading={isSubmitting}>
                                        {selectedClient ? "ذخیره تغییرات" : "ایجاد مشتری"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                ) : activeTab === "payments" ? (
                    <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        {invoicesLoading ? (
                            <div className="py-12 text-center">در حال بارگزاری فاکتورها...</div>
                        ) : clientInvoices.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">سوابق پرداختی موجود نیست</h3>
                                <p className="max-w-xs mx-auto mt-1 text-sm">
                                    این مشتری هنوز فاکتور پرداختی ندارد. فاکتورها پس از صدور در اینجا ظاهر می‌شوند.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden border dark:border-gray-700 rounded-lg">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="p-3 font-semibold">شناسه فاکتور</th>
                                            <th className="p-3 font-semibold">تاریخ</th>
                                            <th className="p-3 font-semibold">مبلغ</th>
                                            <th className="p-3 font-semibold">وضعیت</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientInvoices.map((inv) => (
                                            <tr key={inv._id} className="border-t dark:border-gray-700">
                                                <td className="p-3 font-medium text-indigo-600">{inv.invoiceNumber}</td>
                                                <td className="p-3 text-gray-500">{new Date(inv.issueDate).toLocaleDateString('fa-IR')}</td>
                                                <td className="p-3 font-bold">{formatCurrency(inv.total || 0, inv.currency)}</td>
                                                <td className="p-3">
                                                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                                                        {inv.status === 'paid' ? 'پرداخت شده' : inv.status === 'overdue' ? 'معوقه' : 'در انتظار'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="flex justify-center pt-4">
                            <Button size="sm" variant="secondary" onClick={() => (window.location.href = `/panel/invoices`)}>
                                مشاهده تمامی فاکتورها
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        {!selectedClient.linkedUser ? (
                            <div className="py-12 text-center text-gray-500 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed">
                                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <h3 className="text-lg font-medium">حساب کاربری متصل نشده</h3>
                                <p className="max-w-xs mx-auto mt-1 text-sm">
                                    برای پیگیری سرویس‌های فعال، این مشتری را به یک حساب کاربری متصل کنید.
                                </p>
                            </div>
                        ) : servicesLoading ? (
                            <div className="py-12 text-center">در حال بارگزاری سرویس‌ها...</div>
                        ) : clientServicesData.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed">
                                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <h3 className="text-lg font-medium">سرویس فعالی یافت نشد</h3>
                                <p className="max-w-xs mx-auto mt-1 text-sm">
                                    این مشتری در حال حاضر سرویس یا اشتراک فعالی ندارد.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {clientServicesData.map((svc) => (
                                    <div key={svc._id} className="p-4 border dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">{svc.package?.name || "طرح ویژه"}</h4>
                                            <Badge variant={svc.status === 'active' ? 'success' : 'secondary'} size="sm">
                                                {svc.status === 'active' ? 'فعال' : 'غیرفعال'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500" style={{ direction: 'ltr', textAlign: 'right', justifyContent: 'flex-end' }}>
                                            <span className="flex items-center gap-1"> {svc.price}/{svc.billingCycle} <CreditCard className="w-3 h-3" /></span>
                                            <span>شروع: {new Date(svc.startDate).toLocaleDateString('fa-IR')}</span>
                                            {svc.endDate && <span>پایان: {new Date(svc.endDate).toLocaleDateString('fa-IR')}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-center gap-3 pt-4 border-t dark:border-gray-700 mt-4">
                            <Button size="sm" variant="secondary" onClick={() => (window.location.href = `/panel/services`)}>
                                مشاهده همه سرویس‌ها
                            </Button>
                            {selectedClient.linkedUser && (
                                <Button size="sm" onClick={() => (window.location.href = `/panel/services?assignTo=${selectedClient.linkedUser._id || selectedClient.linkedUser}`)}>
                                    <Plus className="w-4 h-4 ml-1" /> تخصیص پکیج جدید
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

        </ContentWrapper>
    );
}
