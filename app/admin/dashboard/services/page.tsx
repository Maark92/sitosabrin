"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Save, X } from "lucide-react";

interface Service {
    id: string;
    title: string;
    description: string;
    price: string;
    duration: string;
    image_url: string;
    is_popular: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>({});
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchServices = async () => {
        const { data } = await supabase.from("services").select("*").order("created_at");
        if (data) setServices(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setFormData(service);
    };

    const handleSave = async () => {
        if (!editingId) return;
        await supabase.from("services").update(formData).eq("id", editingId);
        setEditingId(null);
        setFormData({});
        fetchServices();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Sei sicuro di voler eliminare questo servizio?")) return;
        await supabase.from("services").delete().eq("id", id);
        fetchServices();
    };

    const handleAdd = async () => {
        if (!formData.title || !formData.price) return;
        await supabase.from("services").insert([formData]);
        setShowAddForm(false);
        setFormData({});
        fetchServices();
    };

    if (loading) return <div className="text-stone-500">Caricamento...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900">Servizi</h1>
                    <p className="text-stone-500 mt-1">Gestisci i trattamenti e i prezzi.</p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="bg-rose-500 hover:bg-rose-600">
                    <Plus size={18} className="mr-2" /> Aggiungi
                </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
                    <h3 className="font-semibold text-stone-900">Nuovo Servizio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Titolo" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        <Input placeholder="Prezzo (es. €45)" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                        <Input placeholder="Durata (es. 60min)" value={formData.duration || ""} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                        <Input placeholder="URL Immagine" value={formData.image_url || ""} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                        <Input placeholder="Descrizione" className="md:col-span-2" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700"><Save size={16} className="mr-1" /> Salva</Button>
                        <Button variant="outline" onClick={() => { setShowAddForm(false); setFormData({}); }}><X size={16} className="mr-1" /> Annulla</Button>
                    </div>
                </div>
            )}

            {/* Services List */}
            <div className="space-y-4">
                {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                        {editingId === service.id ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input placeholder="Titolo" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    <Input placeholder="Prezzo" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                    <Input placeholder="Durata" value={formData.duration || ""} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                                    <Input placeholder="URL Immagine" value={formData.image_url || ""} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                                    <Input placeholder="Descrizione" className="md:col-span-2" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save size={16} className="mr-1" /> Salva</Button>
                                    <Button variant="outline" onClick={() => { setEditingId(null); setFormData({}); }}><X size={16} className="mr-1" /> Annulla</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {service.image_url && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={service.image_url} alt={service.title} className="w-16 h-16 rounded-xl object-cover" />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-stone-900">{service.title}</h3>
                                        <p className="text-stone-500 text-sm">{service.description}</p>
                                        <p className="text-rose-600 font-bold mt-1">{service.price} • {service.duration}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>Modifica</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} className="text-red-500 border-red-200 hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
