"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { MessageSquare, Send, User, Clock } from "lucide-react";

export default function CommentSection({ entityId, apiPath, allowComments = true }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        authorName: "",
        authorEmail: "",
        content: "",
        website: "", // Honeypot field
    });

    const fetchComments = async () => {
        try {
            const { data } = await axios.get(`${apiPath}`);
            if (data.success) {
                setComments(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (allowComments && apiPath) {
            fetchComments();
        }
    }, [apiPath, allowComments]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.authorName || !formData.authorEmail || !formData.content) {
            toast.error("لطفاً تمام فیلدهای الزامی را پر کنید.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data } = await axios.post(`${apiPath}`, formData);
            if (data.success) {
                toast.success(data.message || "دیدگاه شما برای تایید ارسال شد.");
                setFormData({
                    authorName: "",
                    authorEmail: "",
                    content: "",
                    website: "",
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "ارسال دیدگاه ناموفق بود.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (!allowComments) return null;

    return (
        <div className="mt-16 pt-12 border-t border-[var(--border-color)]" dir="rtl">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-[var(--accent-color)]" size={24} />
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                    دیدگاه‌ها ({comments.length})
                </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-12 p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm text-right">
                <h4 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">ارسال دیدگاه</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="comment-author-name" className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">نام *</label>
                        <input
                            type="text"
                            id="comment-author-name"
                            name="authorName"
                            value={formData.authorName}
                            onChange={handleChange}
                            required
                            placeholder="نام خود را وارد کنید"
                            className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--color-background)] focus:border-[var(--accent-color)] outline-none transition-colors text-right"
                        />
                    </div>
                    <div>
                        <label htmlFor="comment-author-email" className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ایمیل *</label>
                        <input
                            type="email"
                            id="comment-author-email"
                            name="authorEmail"
                            value={formData.authorEmail}
                            onChange={handleChange}
                            required
                            placeholder="ایمیل شما (منتشر نخواهد شد)"
                            className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--color-background)] focus:border-[var(--accent-color)] outline-none transition-colors text-right direction-ltr"
                            dir="ltr"
                        />
                    </div>
                </div>

                {/* Honeypot field - Hidden from users */}
                <div className="hidden">
                    <input
                        type="text"
                        id="comment-website-honeypot"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        tabIndex="-1"
                        autoComplete="off"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="comment-content" className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">دیدگاه *</label>
                    <textarea
                        id="comment-content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="نظر خود را بنویسید..."
                        className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--color-background)] focus:border-[var(--accent-color)] outline-none transition-colors resize-none text-right"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mr-auto ml-0"
                >
                    {isSubmitting ? "در حال ارسال..." : "ارسال دیدگاه"}
                    <Send size={18} className="rotate-180" />
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-10 text-center animate-pulse text-[var(--text-secondary)]">در حال بارگزاری دیدگاه‌ها...</div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment._id} className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] text-right">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent-color)]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)]">
                                            {comment.authorName}
                                            {comment.isAdminComment && (
                                                <span className="mr-2 inline-block px-1.5 py-0.5 text-[10px] bg-[var(--accent-color)] text-white rounded shadow-sm">مدیر</span>
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                            <Clock size={12} />
                                            {formatDate(comment.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                                {comment.content}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-[var(--text-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl">
                        هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!
                    </div>
                )}
            </div>
        </div>
    );
}
