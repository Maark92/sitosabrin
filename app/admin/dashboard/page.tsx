"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Scissors, Image, TrendingUp, Calendar, Clock, Megaphone } from "lucide-react";
import { BookingsChart } from "@/components/bookings-chart";
import { TrafficChart } from "@/components/traffic-chart";

interface Booking {
    id: string;
    customer_name: string;
    customer_phone: string;
    slot: {
        date: string;
        start_time: string;
    };
}

function getWhatsAppLink(phone: string, name: string, time: string) {
    if (!phone) return "#";
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Ciao ${name}! Ti ricordo il tuo appuntamento da Con Strass o Senza oggi alle ${time}. A dopo! ✨`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export default function DashboardHome() {
    const [stats, setStats] = useState({
        services: 0,
        portfolio: 0,
        offers: 0,
    });
    const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
    const [nextBooking, setNextBooking] = useState<Booking | null>(null);
    const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            // Counts
            const { count: servicesCount } = await supabase.from("services").select("*", { count: "exact", head: true });
            const { count: portfolioCount } = await supabase.from("portfolio").select("*", { count: "exact", head: true });
            const { count: offersCount } = await supabase.from("offers").select("*", { count: "exact", head: true });

            setStats({
                services: servicesCount || 0,
                portfolio: portfolioCount || 0,
                offers: offersCount || 0,
            });

            // Today's Bookings
            const today = new Date().toISOString().split("T")[0];
            const { data: todayData } = await supabase
                .from("bookings")
                .select("*, slot:availability_slots!inner(*)")
                .eq("slot.date", today);
            if (todayData) {
                // Ordina per start_time in JavaScript
                const sorted = todayData.sort((a: any, b: any) => 
                    a.slot.start_time.localeCompare(b.slot.start_time)
                );
                setTodayBookings(sorted as any);
            }

            // Next Booking
            const { data: nextData } = await supabase
                .from("bookings")
                .select("*, slot:availability_slots!inner(*)")
                .gte("slot.date", today);
            if (nextData && nextData.length > 0) {
                // Ordina per data e poi per start_time in JavaScript
                const sorted = nextData.sort((a: any, b: any) => {
                    const dateCompare = a.slot.date.localeCompare(b.slot.date);
                    if (dateCompare !== 0) return dateCompare;
                    return a.slot.start_time.localeCompare(b.slot.start_time);
                });
                setNextBooking(sorted[0] as any);
            }

            // Fetch Last 7 Days Trends
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            const dateStr = sevenDaysAgo.toISOString().split("T")[0];

            const { data: trendData } = await supabase
                .from("bookings")
                .select("slot:availability_slots!inner(date)")
                .gte("slot.date", dateStr);

            if (trendData) {
                // Group by date
                const counts: Record<string, number> = {};
                // Initialize last 7 days with 0
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    counts[d.toISOString().split("T")[0]] = 0;
                }

                // Count actual bookings
                trendData.forEach((item: any) => {
                    if (counts[item.slot.date] !== undefined) {
                        counts[item.slot.date]++;
                    }
                });

                // Convert to array and sort
                const formattedData = Object.entries(counts)
                    .map(([date, count]) => ({
                        date: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
                        count,
                        rawDate: date
                    }))
                    .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

                setChartData(formattedData);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-stone-900">Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-stone-500">Benvenuto nel pannello di gestione.</p>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Analytics Attive</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-stone-200 min-w-0">
                    <h2 className="text-lg font-bold text-stone-900 mb-2">Andamento Prenotazioni</h2>
                    <p className="text-sm text-stone-500 mb-4">Ultimi 7 giorni</p>
                    <BookingsChart data={chartData} />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 min-w-0">
                    <h2 className="text-lg font-bold text-stone-900 mb-2">Traffico Web (Reale)</h2>
                    <p className="text-sm text-stone-500 mb-4">Visitatori unici ultimi 30 giorni</p>
                    <TrafficChart />
                </div>
            </div>

            {/* Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                            <Calendar className="text-rose-500" size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm">Oggi</p>
                            <p className="text-2xl font-bold text-stone-900">{todayBookings.length} Appuntamenti</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Megaphone className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm">Offerte Attive</p>
                            <p className="text-2xl font-bold text-stone-900">{stats.offers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Image className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm">Portfolio</p>
                            <p className="text-2xl font-bold text-stone-900">{stats.portfolio}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm">Servizi</p>
                            <p className="text-2xl font-bold text-stone-900">{stats.services}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Next Client Widget */}
                {/* ... existing next client widget content ... */}
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-medium opacity-90 mb-6">Prossimo Cliente</h2>
                        {nextBooking ? (
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">
                                        👤
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">{nextBooking.customer_name}</p>
                                        <p className="opacity-80">Ha prenotato un trattamento</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-black/20 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <Calendar size={18} />
                                        <span>{new Date(nextBooking.slot.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="bg-black/20 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <Clock size={18} />
                                        <span>{nextBooking.slot.start_time.slice(0, 5)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center opacity-80">
                                Nessun appuntamento futuro in programma.
                            </div>
                        )}
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>

                {/* Today's List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-serif text-stone-900 mb-6">Appuntamenti di Oggi</h2>
                    {todayBookings.length === 0 ? (
                        <div className="text-stone-400 text-center py-10">
                            Nessun impegno per oggi. Goditi la giornata! ☀️
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todayBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                        {booking.customer_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-stone-900">{booking.customer_name}</p>
                                        <p className="text-sm text-stone-500">Trattamento Base</p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <a
                                            href={getWhatsAppLink(booking.customer_phone, booking.customer_name, booking.slot.start_time.slice(0, 5))}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors shadow-sm"
                                            title="Invia Reminder WhatsApp"
                                        >
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        </a>
                                        <p className="text-lg font-bold text-rose-500">{booking.slot.start_time.slice(0, 5)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
