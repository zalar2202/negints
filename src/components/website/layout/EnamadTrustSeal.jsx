"use client";

export default function EnamadTrustSeal() {
    const handleEnamadClick = (e) => {
        e.preventDefault();
        window.open('https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU', 'Enamad', 'width=500,height=500,resizable=yes,scrollbars=yes');
    };

    return (
        <a 
            href='https://trustseal.enamad.ir/?id=701546&Code=kQhdBY6Mi0OEMwAYP0SAXJpelRU5jiHU'
            target='_blank' 
            rel="noopener noreferrer"
            onClick={handleEnamadClick}
            className="block"
            title="نماد اعتماد الکترونیکی"
        >
            <img 
                src='/assets/logo/enamad.png' 
                alt='نماد اعتماد الکترونیکی' 
                width={64}
                height={64}
                style={{ cursor: 'pointer', display: 'block' }}
            />
        </a>
    );
}
