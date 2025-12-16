"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Megaphone, Check } from "lucide-react";

interface Offer {
    id: string;
    title: string;
    description: string;
    is_active: boolean;
    type: string;
}

export default function MarketingPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "popup",
    });

    const fetchOffers = async () => {
        const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
        if (data) setOffers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleAdd = async () => {
        if (!formData.title) {
            alert("Il titolo è obbligatorio.");
            return;
        }
        await supabase.from("offers").insert([formData]);
        setShowAddForm(false);
        setFormData({ title: "", description: "", type: "popup" });
        fetchOffers();
    };

    const toggleActive = async (offer: Offer) => {
        // If turning on, turn off all others first (optional rule, but good for popups)
        if (!offer.is_active) {
            await supabase.from("offers").update({ is_active: false }).neq("id", offer.id);
        }

        await supabase.from("offers").update({ is_active: !offer.is_active }).eq("id", offer.id);
        fetchOffers();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Eliminare questa offerta?")) return;
        await supabase.from("offers").delete().eq("id", id);
        fetchOffers();
    };

    if (loading) return <div className="text-stone-500">Caricamento...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900">Marketing</h1>
                    <p className="text-stone-500 mt-1">Crea offerte e popup per i visitatori del sito.</p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="bg-rose-500 hover:bg-rose-600">
                    <Plus size={18} className="mr-2" /> Nuova Offerta
                </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
                    <h3 className="font-semibold text-stone-900">Crea Offerta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Titolo (es. Sconto Primavera -20%)"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="popup">Popup (Finestra modale)</option>
                            <option value="banner">Banner (Striscia in alto - Coming Soon)</option>
                        </select>
                        <Input
                            placeholder="Descrizione (opzionale)"
                            className="md:col-span-2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">Salva e Attiva dopo</Button>
                        <Button variant="outline" onClick={() => setShowAddForm(false)}>Annulla</Button>
                    </div>
                </div>
            )}

            {/* Offers List */}
            {offers.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-200 text-center text-stone-400">
                    <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
                    Nessuna offerta creata. Inizia ora!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((offer) => (
                        <div key={offer.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${offer.is_active ? 'border-green-500 ring-1 ring-green-500' : 'border-stone-200'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-stone-900 text-lg">{offer.title}</h3>
                                    <p className="text-stone-500 text-sm mt-1">{offer.description || "Nessuna descrizione"}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${offer.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                                    {offer.is_active ? 'ATTIVA' : 'INATTIVA'}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-stone-100 mt-4">
                                <Button
                                    size="sm"
                                    variant={offer.is_active ? "outline" : "default"}
                                    className={offer.is_active ? "" : "bg-green-600 hover:bg-green-700"}
                                    onClick={() => toggleActive(offer)}
                                >
                                    {offer.is_active ? "Disattiva" : "Attiva Ora"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-200 hover:bg-red-50 ml-auto"
                                    onClick={() => handleDelete(offer.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
