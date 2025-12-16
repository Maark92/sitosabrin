"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, X } from "lucide-react";

interface PortfolioItem {
    id: string;
    title: string;
    image_url: string;
    category: string;
}

export default function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Partial<PortfolioItem>>({});

    const fetchItems = async () => {
        const { data } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });
        if (data) setItems(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = async () => {
        if (!formData.image_url) {
            alert("Inserisci almeno l'URL dell'immagine.");
            return;
        }
        await supabase.from("portfolio").insert([formData]);
        setShowAddForm(false);
        setFormData({});
        fetchItems();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Sei sicuro di voler eliminare questa foto?")) return;
        await supabase.from("portfolio").delete().eq("id", id);
        fetchItems();
    };

    if (loading) return <div className="text-stone-500">Caricamento...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900">Portfolio</h1>
                    <p className="text-stone-500 mt-1">Gestisci le foto dei tuoi lavori.</p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="bg-rose-500 hover:bg-rose-600">
                    <Plus size={18} className="mr-2" /> Aggiungi Foto
                </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
                    <h3 className="font-semibold text-stone-900">Nuova Foto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="URL Immagine *" value={formData.image_url || ""} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                        <Input placeholder="Titolo (opzionale)" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        <Input placeholder="Categoria (es. Nail Art)" value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">Salva</Button>
                        <Button variant="outline" onClick={() => { setShowAddForm(false); setFormData({}); }}><X size={16} className="mr-1" /> Annulla</Button>
                    </div>
                </div>
            )}

            {/* Portfolio Grid */}
            {items.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-200 text-center text-stone-400">
                    Nessuna foto nel portfolio. Aggiungi la prima!
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.image_url}
                                alt={item.title || "Portfolio"}
                                className="w-full aspect-square object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 size={16} className="mr-1" /> Elimina
                                </Button>
                            </div>
                            {item.title && (
                                <p className="text-sm text-stone-600 mt-2 truncate">{item.title}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
