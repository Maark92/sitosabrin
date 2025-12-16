"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { X, Megaphone } from "lucide-react";

interface Offer {
    id: string;
    title: string;
    description: string;
    type: string;
}

export function MarketingBanner() {
    const [offer, setOffer] = useState<Offer | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchActiveBanner = async () => {
            const { data } = await supabase
                .from("offers")
                .select("*")
                .eq("is_active", true)
                .eq("type", "banner")
                .limit(1)
                .single();

            if (data) {
                setOffer(data);
            }
        };
        fetchActiveBanner();
    }, []);

    if (!offer || !isVisible) return null;

    return (
        <div className="bg-rose-500 text-white text-sm py-2 px-4 relative z-50">
            <div className="container mx-auto flex items-center justify-center gap-2 text-center pr-8">
                <Megaphone size={16} className="shrink-0 animate-pulse" />
                <span className="font-medium">{offer.title}</span>
                {offer.description && <span className="hidden md:inline text-rose-100">- {offer.description}</span>}
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-rose-600 rounded-full transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
}
