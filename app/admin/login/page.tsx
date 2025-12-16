"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Email o password non validi.");
            setLoading(false);
        } else {
            router.push("/admin/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-stone-900 mb-2">
                        Lumière <span className="text-rose-400">.</span>
                    </h1>
                    <p className="text-stone-500 text-sm">Area Riservata</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm text-stone-600 mb-1 block">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-stone-600 mb-1 block">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                        disabled={loading}
                    >
                        {loading ? "Accesso in corso..." : "Accedi"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
