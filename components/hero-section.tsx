"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase";

interface Service {
    id: string;
    title: string;
    description: string;
    price: string;
    duration: string;
    image_url: string;
    is_popular: boolean;
}

export function HeroSection({ onOpenBooking, services = [] }: { onOpenBooking: (serviceId?: string) => void, services: any[] }) {
    const [bgImage, setBgImage] = useState("https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070&auto=format&fit=crop");
    const [displayServices, setDisplayServices] = useState<Service[]>([]);

    useEffect(() => {
        // Services Logic: Show Popular, or fallback to first 3 recent
        const popular = services.filter((s: Service) => s.is_popular);
        const toShow = popular.length > 0 ? popular : services.slice(0, 3);
        setDisplayServices(toShow);

        // Fetch Settings (Background)
        const fetchSettings = async () => {
            const { data: settingsData } = await supabase
                .from("site_settings")
                .select("hero_bg_url")
                .single();
            if (settingsData?.hero_bg_url) {
                setBgImage(settingsData.hero_bg_url);
            }
        };
        fetchSettings();
    }, [services]);

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('${bgImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Darker stone overlay and stronger pink tint */}
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 via-transparent to-transparent opacity-90" />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-light tracking-wide mb-6">
                            ESTETICA AVANZATA & NAIL ART
                        </span>
                        <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight drop-shadow-2xl">
                            Con Strass <br /> <span className="italic font-light">o Senza</span>
                        </h1>
                        <p className="text-lg md:text-xl text-stone-100 mb-8 font-light max-w-xl mx-auto drop-shadow-lg">
                            La tua destinazione per manicure di lusso e trattamenti estetici personalizzati nel cuore della città.
                        </p>
                        <button
                            onClick={() => onOpenBooking()}
                            className="bg-rose-500 hover:bg-rose-600 text-white text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            Prenota un Appuntamento
                        </button>
                    </motion.div>
                </div>

                {/* Featured Services Cards */}
                {displayServices.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
                        {displayServices.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
                                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-white/20"
                                onClick={() => onOpenBooking(service.id)}
                            >
                                <div
                                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                                    style={{
                                        backgroundImage: `url('${service.image_url}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                                {/* Stronger gradient for better readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90 transition-opacity duration-300" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-300 group-hover:translate-y-0">
                                    <h3 className="font-serif text-2xl mb-2 font-bold drop-shadow-lg">{service.title}</h3>
                                    <div className="flex items-center gap-4 text-sm font-medium text-stone-200 opacity-90">
                                        <span>{service.duration}</span>
                                        <span className="w-1 h-1 bg-stone-200 rounded-full" />
                                        <span>{service.price}</span>
                                    </div>
                                    <p className="mt-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-stone-200 line-clamp-2">
                                        {service.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
