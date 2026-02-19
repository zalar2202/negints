"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, MessageSquare, Sparkles } from "lucide-react";
import axios from "axios";

export default function AIFloatingButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get("/api/admin/ai-assistant");
                if (data.success) {
                    const assistantData = data.data || {
                        isActive: true,
                        title: "دستیار هوشمند نگین",
                        welcomeMessage: "سلام! چطور می‌توانم کمکتان کنم؟",
                        primaryColor: "#32127a",
                        position: "bottom-right",
                        buttonIcon: "bot",
                    };

                    if (assistantData.isActive) {
                        setSettings(assistantData);
                        setMessages([{ role: "assistant", content: assistantData.welcomeMessage }]);
                        // Show greeting bubble after 3 seconds
                        setTimeout(() => setShowGreeting(true), 3000);
                    }
                }
            } catch (error) {
                // Suppress error logging for bots/crawlers or if blocked by robots.txt (403/499/NetworkError)
                const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
                if (!isBot) {
                     console.error("Failed to load AI settings:", error);
                }
                
                // Fallback to defaults if API fails (e.g. no DB connection or blocked by robots.txt)
                setSettings({
                    isActive: true,
                    title: "چت آنلاین نگین",
                    welcomeMessage: "سلام! چطور می‌توانم کمکتان کنم؟",
                    primaryColor: "#32127a",
                    position: "bottom-right",
                    buttonIcon: "bot",
                });
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);
        setShowGreeting(false);

        try {
            const { data } = await axios.post("/api/chat", {
                message: userMessage,
                sessionId: sessionId,
                history: messages.slice(-5),
            });

            // Extract response from n8n (handles arrays, nested data, and different field names)
            const responseData = Array.isArray(data) ? data[0] : data;
            
            // Look for the response text in common locations (including the one from your screenshot)
            const botResponse =
                responseData?.data?.reply || // Supports { data: { reply: "..." } }
                responseData?.reply ||        // Supports { reply: "..." }
                responseData?.output ||
                responseData?.message ||
                responseData?.text ||
                responseData?.response ||
                responseData?.data?.output ||
                (typeof responseData === "string" ? responseData : "پاسخی دریافت شد اما متن آن قابل نمایش نیست.");

            setMessages((prev) => [...prev, { role: "assistant", content: botResponse }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "متاسفانه مشکلی در ارتباط پیش آمده است. لطفاً بعداً تلاش کنید.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!settings || !settings.isActive) return null;

    const Icon =
        settings.buttonIcon === "message"
            ? MessageSquare
            : settings.buttonIcon === "spark"
              ? Sparkles
              : Bot;

    return (
        <div
            className={`fixed z-[9999] transition-all duration-500 ease-in-out ${settings.position === "bottom-left" ? "left-6" : "right-6"} bottom-6`}
            dir="rtl"
        >
            {/* Chat Window */}
            <div
                className={`
                fixed bottom-24 max-md:left-4 max-md:right-4 md:absolute md:bottom-20 md:w-[350px]
                ${settings.position === "bottom-left" ? "md:left-0" : "md:right-0"}
                h-[500px] max-h-[60vh] md:max-h-[calc(100vh-10rem)]
                bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden
                flex flex-col border border-gray-100 dark:border-gray-800
                transition-all duration-500 transform
                ${isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}
            `}
            >
                {/* Header */}
                <div
                    className="p-3 text-white flex items-center justify-between"
                    style={{
                        background: `linear-gradient(135deg, ${settings.primaryColor} 0%, #7c3aed 100%)`,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-base leading-tight m-0 text-right">{settings.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                    آنلاین
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close chat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar text-right">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} animate-fade-in-up`}
                        >
                            <div
                                className={`
                                max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                                ${
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-200 dark:shadow-none"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200/50 dark:border-gray-700"
                                }
                            `}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-end animate-fade-in">
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSend}
                    className="p-3 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm"
                >
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            id="ai-chat-input"
                            name="message"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="پیام خود را بنویسید..."
                            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3 pl-12 text-base md:text-sm focus:outline-none focus:border-indigo-500 transition-all dark:text-white text-right"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute left-2 p-2 text-indigo-600 hover:scale-110 disabled:opacity-50 disabled:scale-100 transition-all rotate-180"
                            aria-label="Send message"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-2 mb-0 font-medium" style={{marginBottom: "0", marginTop:"0.5rem"}}>
                        قدرت گرفته از هوش مصنوعی نگین
                    </p>
                </form>
            </div>

            {/* Greeting Prompt */}
            {!isOpen && showGreeting && (
                <div
                    className={`
                        absolute bottom-20 ${settings.position === "bottom-left" ? "left-0" : "right-0"}
                        bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30
                        w-[220px] animate-fade-in-up cursor-pointer hover:shadow-indigo-500/10 transition-all
                        max-md:hidden
                    `}
                    onClick={() => {
                        setIsOpen(true);
                        setShowGreeting(false);
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                پشتیبانی هوشمند
                            </p>
                            <p className="text-xs font-semibold dark:text-white truncate">
                                چطور می‌توانم کمکتان کنم؟
                            </p>
                        </div>
                    </div>
                    <button
                        className="absolute -top-2 -left-2 w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowGreeting(false);
                        }}
                        aria-label="Dismiss greeting"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowGreeting(false);
                }}
                className={`
                    w-16 h-16 rounded-full flex items-center justify-center shadow-2xl 
                    transition-all duration-300 transform hover:scale-110 active:scale-95
                    ${isOpen ? "rotate-90" : "rotate-0"}
                `}
                style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor} 0%, #7c3aed 100%)`,
                }}
                aria-label={isOpen ? "بستن پشتیبانی" : "باز کردن پشتیبانی"}
            >
                {isOpen ? (
                    <X className="w-7 h-7 text-white" />
                ) : (
                    <Icon className="w-8 h-8 text-white animate-float" />
                )}
            </button>
        </div>
    );
}
