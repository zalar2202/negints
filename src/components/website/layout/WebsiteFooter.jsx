import Image from "next/image";
import Link from "next/link";
import { Linkedin, Twitter, Github, Instagram, Star } from "lucide-react";

/**
 * Footer - Simple footer component for NeginTS website pages
 */
export default function WebsiteFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand flex items-center justify-center gap-2 mb-4">
                    <Image
                        src="/assets/logo/negints-logo.png"
                        alt="NeginTS Logo"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                    />
                    <h2 className="text-2xl font-black text-white m-0">نگین تجهیز سپهر</h2>
                </div>
                <div className="footer-links flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6 text-sm font-bold">
                    <Link href="/products" className="transition-colors">همه محصولات</Link>
                    <Link href="/products?category=kits" className="transition-colors">کیت‌های تخصصی</Link>
                    <Link href="/products?category=instruments" className="transition-colors">تجهیزات پزشکی</Link>
                    <Link href="/products?category=healthcare" className="transition-colors">سلامت خانواده</Link>
                    <Link href="/contact-us" className="transition-colors">تماس با ما</Link>
                </div>
                
                <div className="social-links flex justify-center gap-6 mb-8">
                    <a 
                        href="https://linkedin.com/company/negints" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-all transform hover:-translate-y-1"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={24} />
                    </a>
                    <a 
                        href="https://instagram.com/negints" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#E1306C] transition-all transform hover:-translate-y-1"
                        aria-label="Instagram"
                    >
                        <Instagram size={24} />
                    </a>
                </div>

                {/* Enamad Vector Implementation (Bulletproof) */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-300">
                        <a 
                            target='_blank' 
                            href='https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU'
                            rel="noopener noreferrer"
                            className="block"
                            title="نماد اعتماد الکترونیکی"
                        >
                            <svg 
                                fill="#003e83" 
                                width="64px" 
                                height="64px" 
                                viewBox="0 0 24 24" 
                                role="img" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="cursor-pointer"
                            >
                                <path d="M0 20.766a42.59 42.59 0 0 1 7.814-4.644c4.267-1.892 8.33-4.988 8.33-9.083s-1.688-4.611-2.687-4.611c-1.376 0-5.373 1.638-6.643 8.567-1.27 6.929 1.548 10.418 3.924 10.557 2.375.14 3.333-.401 4.815-3.497 1.401-1.048 2.589-1.343 2.908-2.85a.696.696 0 0 0-.622-.82l-.64-.081a2.015 2.015 0 0 1 1.377-.967c.925-.139 1.548-1.752 1.548-1.752s-3.276.647-5.234 5.332c-1.957 4.685-5.733 2.408-6.053.516a16.282 16.282 0 0 1 1.557-11.254c2.154-3.751 6.61-.819 2.154 4.472C8.19 14.991.377 16.605 0 20.766zm20.95-8.69.82 1.368a.532.532 0 0 0 .819.123l1.237-1.09a.549.549 0 0 0 .098-.68l-.819-1.343a.532.532 0 0 0-.82-.122l-1.236 1.105a.54 0 0 0-.098.64z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="copyright text-[11px] font-bold uppercase tracking-widest pt-8 border-t border-white/5">
                    © 2024-{currentYear} نگین تجهیز سپهر (NeginTS). تمامی حقوق محفوظ است.
                </div>

            </div>
        </footer>
    );
}

