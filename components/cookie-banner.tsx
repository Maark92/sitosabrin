"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if user has already accepted
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            setShow(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie-consent", "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-stone-900/95 text-white backdrop-blur-sm shadow-2xl border-t border-stone-700 animate-slide-up">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-stone-300 text-center md:text-left">
                    <p>
                        Utilizziamo cookie tecnici per garantirti la migliore esperienza. Continuando a navigare accetti la nostra{" "}
                        <Link href="/cookie-policy" className="underline hover:text-white">
                            Cookie Policy
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={acceptCookies}
                        className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                        Accetta e Chiudi
                    </button>
                </div>
            </div>
        </div>
    );
}
