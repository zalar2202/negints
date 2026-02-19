'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Search, 
    Upload, 
    Trash2, 
    Grid, 
    List, 
    Filter, 
    Download, 
    Copy,
    Image as ImageIcon,
    File,
    Film,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ContentWrapper } from '@/components/layout/ContentWrapper';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmModal } from '@/components/common/Modal';
import { MediaDetailsModal } from '@/components/media/MediaDetailsModal';

export default function MediaLibraryPage() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [view, setView] = useState('grid');
    const [search, setSearch] = useState('');
    const [folder, setFolder] = useState('blog');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [detailsMedia, setDetailsMedia] = useState(null);

    const handleMediaUpdate = (item) => {
        // Optimistic update
        setMedia(prev => prev.map(m => m._id === item._id ? item : m));
        if (detailsMedia && item._id !== detailsMedia._id) {
             fetchMedia(); 
        } else {
             setDetailsMedia(item);
        }
    };

    const handleMediaDelete = (id) => {
        setMedia(prev => prev.filter(m => m._id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
        if (detailsMedia?._id === id) setDetailsMedia(null);
    };

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                folder,
                search,
            };
            const { data } = await axios.get('/api/media', { params });
            if (data.success) {
                setMedia(data.data);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            toast.error('خطا در دریافت فایل‌ها');
        } finally {
            setLoading(false);
        }
    }, [page, folder, search]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const { data } = await axios.post('/api/media', formData);
            if (data.success) {
                toast.success('فایل با موفقیت آپلود شد');
                fetchMedia();
                e.target.value = '';
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'آپلود ناموفق بود');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        
        setIsDeleting(true);
        try {
            const { data } = await axios.delete('/api/media', {
                data: { ids: selectedIds }
            });
            if (data.success) {
                toast.success(data.message);
                setSelectedIds([]);
                setIsDeleteModalOpen(false);
                fetchMedia();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'حذف ناموفق بود');
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url);
        toast.success('آدرس فایل کپی شد');
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/')) return <ImageIcon size={24} />;
        if (mimeType.startsWith('video/')) return <Film size={24} />;
        return <File size={24} />;
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8" dir="rtl">
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">کتابخانه رسانه</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm font-medium">مدیریت و سازماندهی فایل‌ها</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <Button 
                            variant="danger" 
                            onClick={() => setIsDeleteModalOpen(true)}
                            icon={<Trash2 size={18} />}
                        >
                            حذف ({selectedIds.length})
                        </Button>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity font-bold">
                        {uploading ? <Loader2 size={18} className="animate-spin ml-2" /> : <Upload size={18} className="ml-2" />}
                        <span>آپلود فایل</span>
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>
            </div>

            <Card className="mb-6">
                <div className="flex flex-wrap items-center gap-4 p-4" dir="rtl">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={18} />
                        <input
                            type="text"
                            placeholder="جستجو..."
                            className="w-full pr-10 pl-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-[var(--color-text-secondary)]" />
                        <select
                            className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-right"
                            value={folder}
                            onChange={(e) => setFolder(e.target.value)}
                        >
                            <option value="blog">بلاگ</option>
                            <option value="avatars">آواتارها</option>
                            <option value="documents">اسناد</option>
                            <option value="general">عمومی</option>
                        </select>
                    </div>

                    <div className="flex items-center bg-[var(--color-background-secondary)] rounded-lg p-1 border border-[var(--color-border)]">
                        <button 
                            onClick={() => setView('grid')}
                            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </Card>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 size={48} className="animate-spin text-[var(--color-primary)]" />
                    <p className="text-[var(--color-text-secondary)]">در حال بارگزاری...</p>
                </div>
            ) : media.length === 0 ? (
                <Card className="py-20 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-background-tertiary)] flex items-center justify-center mb-6">
                        <ImageIcon size={40} className="text-[var(--color-text-tertiary)]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">هیچ فایلی یافت نشد</h3>
                    <p className="text-[var(--color-text-secondary)] max-w-sm text-center">
                        کتابخانه شما خالی است یا فایلی با مشخصات جستجو پیدا نشد. اولین فایل خود را آپلود کنید!
                    </p>
                </Card>
            ) : (
                <>
                    {view === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" dir="rtl">
                            {media.map((item) => (
                                <div key={item._id} className="group relative">
                                    <div 
                                        className={`aspect-square rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                                            selectedIds.includes(item._id) 
                                            ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary-light)]' 
                                            : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]'
                                        }`}
                                        onClick={() => setDetailsMedia(item)}
                                    >
                                        {item.mimeType.startsWith('image/') ? (
                                            <img 
                                                src={item.url} 
                                                alt={item.alt || item.originalName}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-[var(--color-background-tertiary)] flex flex-col items-center justify-center p-4">
                                                {getFileIcon(item.mimeType)}
                                                <span className="mt-2 text-[10px] text-center font-medium truncate w-full">
                                                    {item.originalName}
                                                </span>
                                            </div>
                                        )}

                                        {/* Selection Checkbox */}
                                        <div 
                                            className="absolute top-2 right-2 z-20"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={selectedIds.includes(item._id)}
                                                onChange={() => toggleSelect(item._id)}
                                                className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                            />
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                                                className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-700 hover:text-[var(--color-primary)]"
                                                title="کپی لینک"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <a 
                                                href={item.url} 
                                                download 
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-700 hover:text-[var(--color-primary)]"
                                                title="دانلود"
                                            >
                                                <Download size={16} />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="mt-2 px-1 text-right">
                                        <p className="text-xs font-medium truncate text-[var(--color-text-primary)] direction-ltr text-right">{item.originalName}</p>
                                        <p className="text-[10px] text-[var(--color-text-secondary)]">{formatSize(item.size)} • {item.mimeType.split('/')[1]?.toUpperCase()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="overflow-hidden border-[var(--color-border)]" dir="rtl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]">
                                            <th className="px-6 py-4 w-10">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.length === media.length}
                                                    onChange={(e) => setSelectedIds(e.target.checked ? media.map(m => m._id) : [])}
                                                    className="rounded border-[var(--color-border)]"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">نام فایل</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">فرمت</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">حجم</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">تاریخ</th>
                                            <th className="px-6 py-4 text-left"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--color-border)]">
                                        {media.map((item) => (
                                            <tr 
                                                key={item._id} 
                                                className="hover:bg-[var(--color-background-secondary)] transition-colors cursor-pointer"
                                                onClick={() => setDetailsMedia(item)}
                                            >
                                                <td className="px-6 py-4">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedIds.includes(item._id)}
                                                        onChange={() => toggleSelect(item._id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="rounded border-[var(--color-border)] cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-[var(--color-background-tertiary)] flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                            {item.mimeType.startsWith('image/') ? (
                                                                <img src={item.url} className="w-full h-full object-cover" alt="" />
                                                            ) : getFileIcon(item.mimeType)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate text-[var(--color-text-primary)] text-right direction-ltr">{item.originalName}</p>
                                                            <p className="text-xs text-[var(--color-text-tertiary)] truncate text-right direction-ltr">{item.url}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{item.mimeType}</td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{formatSize(item.size)}</td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{new Date(item.createdAt).toLocaleDateString('fa-IR')}</td>
                                                <td className="px-6 py-4 text-left">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => copyUrl(item.url)} className="p-2 hover:bg-[var(--color-background-tertiary)] rounded-full text-[var(--color-text-secondary)]" title="کپی لینک">
                                                            <Copy size={16} />
                                                        </button>
                                                        <a href={item.url} download className="p-2 hover:bg-[var(--color-background-tertiary)] rounded-full text-[var(--color-text-secondary)]" title="دانلود">
                                                            <Download size={16} />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </>
            )}

            <MediaDetailsModal
                isOpen={!!detailsMedia}
                onClose={() => setDetailsMedia(null)}
                mediaItem={detailsMedia}
                onUpdate={handleMediaUpdate}
                onDelete={handleMediaDelete}
            />
            
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title="حذف فایل‌ها"
                message={`آیا مطمئن هستید که می‌خواهید ${selectedIds.length} فایل را حذف کنید؟ این عملیات غیرقابل بازگشت است.`}
            />
        </ContentWrapper>
    );
}
