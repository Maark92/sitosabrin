"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Check } from "lucide-react";

export default function SettingsPage() {
    const [bgUrl, setBgUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from("site_settings").select("*").single();
            if (data) {
                setBgUrl(data.hero_bg_url);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage("");

        // Using upsert to create row 1 if it doesn't exist
        const { error } = await supabase
            .from("site_settings")
            .upsert({ id: 1, hero_bg_url: bgUrl });

        if (error) {
            alert("Errore nel salvataggio");
        } else {
            setMessage("Impostazioni salvate con successo!");
            setTimeout(() => setMessage(""), 3000);
        }
        setSaving(false);
    };

    if (loading) return <div className="text-stone-500">Caricamento...</div>;

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-stone-900">Impostazioni Sito</h1>
                <p className="text-stone-500 mt-1">Gestisci l'aspetto generale del sito.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <h2 className="text-lg font-semibold text-stone-900 mb-4">Sfondo Hero Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-stone-600 block mb-2">URL Immagine</label>
                        <div className="flex gap-2">
                            <Input
                                value={bgUrl}
                                onChange={(e) => setBgUrl(e.target.value)}
                                placeholder="https://..."
                            />
                            <Button onClick={handleSave} className="bg-rose-500 hover:bg-rose-600" disabled={saving}>
                                {saving ? "..." : <Save size={18} />}
                            </Button>
                        </div>
                    </div>

                    {/* Preview */}
                    {bgUrl && (
                        <div className="mt-6">
                            <p className="text-xs text-stone-400 mb-2">ANTEPRIMA</p>
                            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-stone-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={bgUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <p className="text-white font-serif text-2xl">Con Strass o Senza</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 mt-4">
                            <Check size={18} /> {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
