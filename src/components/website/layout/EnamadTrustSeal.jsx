"use client";

export default function EnamadTrustSeal() {
    return (
        <a 
            target='_blank' 
            referrerPolicy='origin' 
            href='https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU'
            rel="noopener noreferrer"
            className="block"
            title="نماد اعتماد الکترونیکی"
        >
            <img 
                src='/assets/logo/enamad.png' 
                alt='نماد اعتماد' 
                width={64}
                height={64}
                style={{ cursor: 'pointer', width: '64px', height: '64px', objectFit: 'contain' }} 
            />
        </a>
    );
}
