"use client";

import Image from "next/image";
import Link from "next/link";

export default function EnamadTrustSeal() {
    const handleEnamadClick = (e) => {
        e.preventDefault();
        window.open('https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU', 'Enamad', 'width=500,height=500,resizable=yes,scrollbars=yes');
    };

    return (
        <Link 
            href='https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU'
            target='_blank' 
            rel="noopener noreferrer"
            onClick={handleEnamadClick}
            className="block"
            title="نماد اعتماد الکترونیکی"
        >
            <Image 
                src='/assets/logo/enamad.png' 
                alt='نماد اعتماد الکترونیکی' 
                width={64}
                height={64}
                className="cursor-pointer block"
                priority
                unoptimized
            />
        </Link>
    );
}
