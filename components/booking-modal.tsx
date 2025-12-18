"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Calendar as CalendarIcon, Clock, CheckCircle, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { format, addDays, isSameDay, startOfToday, parseISO, isBefore } from "date-fns";
import { it } from "date-fns/locale";
import { sendAdminNotification } from "@/app/actions/notifications";

interface Slot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
}

interface Service {
    id: string;
    title: string;
    price: string;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedServiceId: string | null;
}

export function BookingModal({ isOpen, onClose, preselectedServiceId }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [selectedService, setSelectedService] = useState<string | null>(preselectedServiceId);
    const [formData, setFormData] = useState({ name: "", phone: "", email: "", notes: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (preselectedServiceId) setSelectedService(preselectedServiceId);
        }
    }, [isOpen, preselectedServiceId]);

    const fetchData = async () => {
        // Fetch available slots (not booked)
        const { data: slotsData } = await supabase
            .from("availability_slots")
            .select("*")
            .eq("is_booked", false)
            .gte("date", new Date().toISOString().split("T")[0])
            .order("date")
            .order("start_time");
        if (slotsData) {
            // Filter out past slots for today
            const now = new Date();
            const todayStr = now.toISOString().split("T")[0];
            const currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

            const validSlots = slotsData.filter((s: Slot) => {
                if (s.date > todayStr) return true;
                if (s.date === todayStr && s.start_time >= currentTime) return true;
                return false;
            });
            setSlots(validSlots);
        }

        // Fetch services
        const { data: servicesData } = await supabase.from("services").select("id, title, price");
        if (servicesData) setServices(servicesData);
    };

    const handleSubmit = async () => {
        if (!selectedSlot || !formData.name || !formData.phone) {
            alert("Compila tutti i campi obbligatori (Nome, Telefono).");
            return;
        }

        setLoading(true);

        const selectedServiceObj = services.find(s => s.id === selectedService);

        // Create booking
        const { error: bookingError } = await supabase.from("bookings").insert([
            {
                slot_id: selectedSlot.id,
                service_id: selectedService || null, // Handle skip case
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
                notes: formData.notes,
            },
        ]);

        if (bookingError) {
            alert("Errore nella prenotazione: " + bookingError.message);
            setLoading(false);
            return;
        }

        // Mark slot as booked
        await supabase.from("availability_slots").update({ is_booked: true }).eq("id", selectedSlot.id);

        // Send Telegram Notification (Server Action)
        sendAdminNotification({
            customer_name: formData.name,
            date: selectedSlot.date,
            start_time: selectedSlot.start_time,
            service_name: selectedServiceObj ? selectedServiceObj.title : "In negozio"
        });

        // Send Internal Dashboard Notification (RPC)
        await supabase.rpc('notify_admin_new_booking', {
            customer_name: formData.name,
            booking_date: formatDate(selectedSlot.date),
            booking_time: formatTime(selectedSlot.start_time),
            service_title: selectedServiceObj ? selectedServiceObj.title : "In negozio"
        });

        setLoading(false);
        setSuccess(true);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
    };

    const formatTime = (timeStr: string) => timeStr.slice(0, 5);

    const resetAndClose = () => {
        setStep(1);
        setSelectedSlot(null);
        setSelectedService(preselectedServiceId);
        setFormData({ name: "", phone: "", email: "", notes: "" });
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    // Group slots by date
    const groupedSlots = slots.reduce((acc: Record<string, Slot[]>, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <button
                    onClick={resetAndClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-12">
                            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                            <h2 className="text-2xl font-serif text-stone-900 mb-2">Prenotazione Confermata!</h2>
                            <p className="text-stone-600 mb-6">Ti contatteremo a breve per confermare.</p>
                            <Button onClick={resetAndClose} className="bg-rose-500 hover:bg-rose-600">
                                Chiudi
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-serif text-stone-900">Prenota Appuntamento</h2>
                                <p className="text-stone-500 text-sm mt-1">
                                    {step === 1 && "Seleziona data e orario"}
                                    {step === 2 && "Scegli il trattamento"}
                                    {step === 3 && "I tuoi dati"}
                                    {step === 4 && "Riepilogo e Conferma"}
                                </p>
                            </div>

                            {/* Progress */}
                            <div className="flex gap-2 mb-6">
                                {[1, 2, 3, 4].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-rose-500" : "bg-stone-200"
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Step 1: Select Slot */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    {Object.keys(groupedSlots).length === 0 ? (
                                        <div className="text-center py-8 text-stone-400">
                                            <div className="bg-rose-50 p-2 rounded-lg inline-block mb-4">
                                                <CalendarIcon className="text-rose-500" size={24} />
                                            </div>
                                            <p>Nessuno slot disponibile al momento.</p>
                                        </div>
                                    ) : (
                                        Object.entries(groupedSlots).map(([date, dateSlots]) => (
                                            <div key={date}>
                                                <p className="font-medium text-stone-700 mb-2 capitalize">📅 {formatDate(date)}</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {dateSlots.map((slot) => (
                                                        <button
                                                            key={slot.id}
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className={`p-3 rounded-xl text-center border transition-colors ${selectedSlot?.id === slot.id
                                                                ? "bg-rose-500 text-white border-rose-500"
                                                                : "bg-stone-50 border-stone-200 hover:border-rose-300"
                                                                }`}
                                                        >
                                                            <Clock size={16} className="mx-auto mb-1" />
                                                            <span className="text-sm font-medium">{formatTime(slot.start_time)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <Button
                                        onClick={() => setStep(2)}
                                        disabled={!selectedSlot}
                                        className="w-full bg-rose-500 hover:bg-rose-600 mt-4"
                                    >
                                        Continua
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Select Service */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service.id)}
                                            className={`w-full p-4 rounded-xl border text-left transition-colors ${selectedService === service.id
                                                ? "bg-rose-50 border-rose-500"
                                                : "bg-stone-50 border-stone-200 hover:border-rose-300"
                                                }`}
                                        >
                                            <p className="font-semibold text-stone-900">{service.title}</p>
                                            <p className="text-rose-600 font-medium">{service.price}</p>
                                        </button>
                                    ))}
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                            Indietro
                                        </Button>
                                        <Button
                                            onClick={() => setStep(3)}
                                            className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700"
                                        >
                                            Salta (Sceglierò in negozio)
                                        </Button>
                                        <Button
                                            onClick={() => setStep(3)}
                                            disabled={!selectedService}
                                            className="flex-1 bg-rose-500 hover:bg-rose-600"
                                        >
                                            Continua
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Customer Info */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-stone-600 block mb-1">Nome *</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Il tuo nome"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-stone-600 block mb-1">Telefono *</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+39 333 1234567"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-stone-600 block mb-1">Email (opzionale)</label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@esempio.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-stone-600 block mb-1">Note (opzionale)</label>
                                        <Input
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Es: preferenze, allergie..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                                            Indietro
                                        </Button>
                                        <Button
                                            onClick={() => setStep(4)} // Go to Confirm Step
                                            className="flex-1 bg-rose-500 hover:bg-rose-600"
                                        >
                                            Riepilogo
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirmation */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                                        <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                                            <Info size={18} className="text-rose-500" />
                                            Riepilogo Prenotazione
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-stone-100 pb-2">
                                                <span className="text-stone-500">Data</span>
                                                <span className="font-medium text-stone-900">{selectedSlot ? formatDate(selectedSlot.date) : "-"}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-stone-100 pb-2">
                                                <span className="text-stone-500">Orario</span>
                                                <span className="font-medium text-stone-900">{selectedSlot ? formatTime(selectedSlot.start_time) : "-"}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-stone-100 pb-2">
                                                <span className="text-stone-500">Trattamento</span>
                                                <span className="font-medium text-stone-900">
                                                    {services.find(s => s.id === selectedService)?.title || "In negozio"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-1">
                                                <span className="text-stone-500">Cliente</span>
                                                <span className="font-medium text-stone-900">{formData.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm flex gap-3 items-start">
                                        <Info className="shrink-0 mt-0.5" size={16} />
                                        <p>Sei sicuro di voler confermare? Riceverai un promemoria prima dell'appuntamento.</p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                                            Modifica Dati
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 bg-rose-500 hover:bg-rose-600 font-bold"
                                        >
                                            {loading ? "Invio..." : "CONFERMA ✅"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
