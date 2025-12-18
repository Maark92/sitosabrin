"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Calendar } from "lucide-react";

interface Slot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

export default function SlotsPage() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        date: "",
        start_time: "",
        end_time: "",
    });

    const fetchSlots = async () => {
        const { data } = await supabase
            .from("availability_slots")
            .select("*")
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

        if (data) {
            // Smart Filter: Hide past slots automatically
            const now = new Date();
            const todayStr = now.toISOString().split("T")[0];
            const currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

            const activeSlots = data.filter((s: Slot) => {
                if (s.date > todayStr) return true;
                if (s.date === todayStr && s.start_time >= currentTime) return true;
                return false;
            });
            setSlots(activeSlots);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleAdd = async () => {
        if (!formData.date || !formData.start_time) {
            alert("Compila Data e Ora Inizio.");
            return;
        }

        // Calculate end_time (start + 1 hour)
        const [hours, minutes] = formData.start_time.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        const end_time = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        await supabase.from("availability_slots").insert([{
            date: formData.date,
            start_time: formData.start_time,
            end_time: end_time
        }]);
        setShowAddForm(false);
        setFormData({ ...formData, date: "", start_time: "" });
        fetchSlots();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Eliminare questo slot?")) return;
        await supabase.from("availability_slots").delete().eq("id", id);
        fetchSlots();
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    };

    const formatTime = (timeStr: string) => timeStr.slice(0, 5);

    if (loading) return <div className="text-stone-500">Caricamento...</div>;

    // Group slots by date
    const groupedSlots = slots.reduce((acc: Record<string, Slot[]>, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900">Disponibilità</h1>
                    <p className="text-stone-500 mt-1">Gestisci gli slot orari per le prenotazioni.</p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="bg-rose-500 hover:bg-rose-600">
                    <Plus size={18} className="mr-2" /> Aggiungi Slot
                </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
                    <h3 className="font-semibold text-stone-900">Nuovo Slot (1 ora)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-stone-600 block mb-1">Data</label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-stone-600 block mb-1">Ora Inizio</label>
                            <Input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">Salva</Button>
                        <Button variant="outline" onClick={() => setShowAddForm(false)}>Annulla</Button>
                    </div>
                </div>
            )}

            {/* Slots List by Date */}
            {Object.keys(groupedSlots).length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-200 text-center text-stone-400">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    Nessuno slot disponibile. Aggiungi il primo!
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                        <div key={date} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                            <h3 className="font-semibold text-stone-900 mb-4 capitalize">
                                📅 {formatDate(date)}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {dateSlots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className={`relative p-3 rounded-xl text-center border ${slot.is_booked
                                            ? "bg-red-50 border-red-200 text-red-600"
                                            : "bg-green-50 border-green-200 text-green-700"
                                            }`}
                                    >
                                        <p className="font-bold">
                                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                        </p>
                                        <p className="text-xs mt-1">{slot.is_booked ? "Prenotato" : "Libero"}</p>
                                        {!slot.is_booked && (
                                            <button
                                                onClick={() => handleDelete(slot.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
