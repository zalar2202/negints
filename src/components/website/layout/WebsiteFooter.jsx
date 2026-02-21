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

                {/* Enamad Debug/Fix */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/95 p-3 rounded-2xl shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300 backdrop-blur-sm">
                        <a 
                            referrerPolicy='origin' 
                            target='_blank' 
                            href='https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU'
                            className="block"
                        >
                            <img 
                                referrerPolicy='origin' 
                                src='https://trustseal.enamad.ir/logo.aspx?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU' 
                                alt='Enamad Seal' 
                                className="h-16 w-auto cursor-pointer"
                                style={{ minWidth: '60px' }}
                            />
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

