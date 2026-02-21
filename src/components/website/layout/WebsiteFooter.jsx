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
                <div className="footer-brand flex items-center justify-center gap-2 mb-2">
                    <Image
                        src="/assets/logo/negints-logo.png"
                        alt="NeginTS Logo"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                    />
                    <h2 className="text-xl font-bold m-0">نگین تجهیز سپهر</h2>
                </div>
                <div className="footer-links flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 text-sm font-medium">
                    <Link href="/products/kits" className="hover:text-[var(--color-primary)] transition-colors">کیت‌های تخصصی</Link>
                    <Link href="/products/instruments" className="hover:text-[var(--color-primary)] transition-colors">تجهیزات پزشکی</Link>
                    <Link href="/products/healthcare" className="hover:text-[var(--color-primary)] transition-colors">سلامت خانواده</Link>
                    <Link href="/products/pharma" className="hover:text-[var(--color-primary)] transition-colors">محصولات دارویی</Link>
                </div>
                
                <div className="social-links flex justify-center gap-4 mb-4">
                    <a 
                        href="#" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--color-text-secondary)] hover:text-[#0077b5] transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                    <a 
                        href="#" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--color-text-secondary)] hover:text-[#E1306C] transition-colors"
                        aria-label="Instagram"
                    >
                        <Instagram size={20} />
                    </a>
                </div>
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU'>
                            <img 
                                referrerpolicy='origin' 
                                src='https://trustseal.enamad.ir/logo.aspx?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU' 
                                alt='Enamad' 
                                style={{ cursor: 'pointer', height: '80px', width: 'auto' }} 
                            />
                        </a>
                    </div>
                </div>

                <div className="copyright">
                    © 2024-{currentYear} نگین تجهیز سپهر (NeginTS). تمامی حقوق محفوظ است.
                </div>

            </div>
        </footer>
    );
}

