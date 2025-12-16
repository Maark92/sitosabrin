"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Calendar, Check, X, Phone, Mail, User } from "lucide-react";

interface Booking {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    notes: string;
    status: string;
    created_at: string;
    slot: {
        id: string;
        date: string;
        start_time: string;
    };
    service: {
        id: string;
        title: string;
        price: string;
    } | null;
}

interface Slot {
    id: string;
    date: string;
    start_time: string;
    is_booked: boolean;
}

interface Service {
    id: string;
    title: string;
    price: string;
}

// Helper for WhatsApp Link used in multiple places
function getWhatsAppLink(phone: string, name: string, time: string) {
    if (!phone) return "#";
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Ciao ${name}! Ti ricordo il tuo appuntamento da Con Strass o Senza il ${time}. A dopo! ✨`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        slot_id: "",
        service_id: "",
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        notes: "",
    });

    const fetchBookings = async () => {
        const { data } = await supabase
            .from("bookings")
            .select(`
        *,
        slot:availability_slots(id, date, start_time),
        service:services(id, title, price)
      `)
            .order("created_at", { ascending: false });
        if (data) setBookings(data);
        setLoading(false);
    };

    const fetchSlots = async () => {
        const { data } = await supabase
            .from("availability_slots")
            .select("*")
            .eq("is_booked", false)
            .gte("date", new Date().toISOString().split("T")[0])
            .order("date")
            .order("start_time");
        if (data) setAvailableSlots(data);
    };

    const fetchServices = async () => {
        const { data } = await supabase.from("services").select("id, title, price");
        if (data) setServices(data);
    };

    useEffect(() => {
        fetchBookings();
        fetchSlots();
        fetchServices();
    }, []);

    const handleAdd = async () => {
        if (!formData.slot_id || !formData.customer_name || !formData.customer_phone) {
            alert("Compila slot, nome e telefono.");
            return;
        }

        // Create booking
        await supabase.from("bookings").insert([{
            slot_id: formData.slot_id,
            service_id: formData.service_id || null,
            customer_name: formData.customer_name,
            customer_phone: formData.customer_phone,
            customer_email: formData.customer_email || null,
            notes: formData.notes || null,
            status: "confirmed",
        }]);

        // Mark slot as booked
        await supabase.from("availability_slots").update({ is_booked: true }).eq("id", formData.slot_id);

        setShowAddForm(false);
        setFormData({ slot_id: "", service_id: "", customer_name: "", customer_phone: "", customer_email: "", notes: "" });
        fetchBookings();
        fetchSlots();
    };

    const handleCancel = async (booking: Booking) => {
        if (!confirm("Annullare questa prenotazione? Lo slot tornerà disponibile.")) return;

        // Delete booking
        await supabase.from("bookings").delete().eq("id", booking.id);

        // Free the slot
        if (booking.slot?.id) {
            await supabase.from("availability_slots").update({ is_booked: false }).eq("id", booking.slot.id);
        }

        fetchBookings();
        fetchSlots();
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
    };

    const formatTime = (timeStr: string) => timeStr?.slice(0, 5) || "";

    if (loading) return <div className="text-stone-500">Caricamento...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900">Prenotazioni</h1>
                    <p className="text-stone-500 mt-1">Visualizza e gestisci le prenotazioni dei clienti.</p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="bg-rose-500 hover:bg-rose-600">
                    <Plus size={18} className="mr-2" /> Aggiungi Manualmente
                </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
                    <h3 className="font-semibold text-stone-900">Nuova Prenotazione (Manuale)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-stone-600 block mb-1">Slot *</label>
                            <select
                                value={formData.slot_id}
                                onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Seleziona slot...</option>
                                {availableSlots.map((slot) => (
                                    <option key={slot.id} value={slot.id}>
                                        {formatDate(slot.date)} - {formatTime(slot.start_time)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-stone-600 block mb-1">Trattamento (opzionale)</label>
                            <select
                                value={formData.service_id}
                                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Nessun trattamento specifico</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.title} - {service.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input placeholder="Nome cliente *" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} />
                        <Input placeholder="Telefono *" value={formData.customer_phone} onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })} />
                        <Input placeholder="Email (opzionale)" value={formData.customer_email} onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })} />
                        <Input placeholder="Note (opzionale)" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700"><Check size={16} className="mr-1" /> Salva</Button>
                        <Button variant="outline" onClick={() => setShowAddForm(false)}><X size={16} className="mr-1" /> Annulla</Button>
                    </div>
                </div>
            )}

            {/* Bookings List */}
            {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-200 text-center text-stone-400">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    Nessuna prenotazione presente.
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                                            <User size={20} className="text-rose-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-stone-900">{booking.customer_name}</h3>
                                            <p className="text-sm text-stone-500">
                                                📅 {booking.slot ? `${formatDate(booking.slot.date)} alle ${formatTime(booking.slot.start_time)}` : "Slot non disponibile"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-stone-600 mt-3">
                                        <span className="flex items-center gap-1">
                                            <Phone size={14} /> {booking.customer_phone}
                                        </span>
                                        {booking.customer_email && (
                                            <span className="flex items-center gap-1">
                                                <Mail size={14} /> {booking.customer_email}
                                            </span>
                                        )}
                                    </div>
                                    {booking.service && (
                                        <p className="text-sm mt-2">
                                            <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg">
                                                {booking.service.title} - {booking.service.price}
                                            </span>
                                        </p>
                                    )}
                                    {booking.notes && (
                                        <p className="text-sm text-stone-400 mt-2 italic">Note: {booking.notes}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={getWhatsAppLink(booking.customer_phone, booking.customer_name, booking.slot ? formatDate(booking.slot.date) + " alle " + formatTime(booking.slot.start_time) : "prossimamente")}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-9 px-4 rounded-md flex items-center justify-center bg-green-500 hover:bg-green-600 text-white shadow-sm transition-colors text-sm font-medium"
                                        title="Invia Reminder WhatsApp"
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="mr-2"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        WhatsApp
                                    </a>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCancel(booking)}
                                        className="text-red-500 border-red-200 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} className="mr-1" /> Annulla
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
