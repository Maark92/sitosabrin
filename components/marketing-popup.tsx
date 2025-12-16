"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { X, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Offer {
    id: string;
    title: string;
    description: string;
    type: string;
}

export function MarketingPopup() {
    const [offer, setOffer] = useState<Offer | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchActiveOffer = async () => {
            const { data } = await supabase
                .from("offers")
                .select("*")
                .eq("is_active", true)
                .eq("type", "popup")
                .limit(1)
                .single();

            if (data) {
                // Check if seen in this session (optional, simpler for now to always show or check active)
                // For now, let's show it after a small delay
                setTimeout(() => {
                    setOffer(data);
                    setIsVisible(true);
                }, 2000);
            }
        };
        fetchActiveOffer();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!offer) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl max-w-sm w-full p-8 relative shadow-2xl text-center border-4 border-rose-100"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full p-1"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                            <Megaphone size={32} />
                        </div>

                        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">{offer.title}</h3>
                        <p className="text-stone-600 mb-8 leading-relaxed">{offer.description}</p>

                        <button
                            onClick={handleClose}
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            Ho capito!
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
