"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
    LayoutDashboard,
    Image,
    Scissors,
    LogOut,
    Menu,
    X,
    Calendar,
    CalendarCheck,
    Settings,
    Megaphone,
    Moon,
    Sun
} from "lucide-react";
import Link from "next/link";
import { NotificationCenter } from "@/components/notification-center";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/admin/login");
            } else {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100">
                <div className="animate-pulse text-stone-500">Caricamento...</div>
            </div>
        );
    }

    const navItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/dashboard/services", icon: Scissors, label: "Servizi" },
        { href: "/admin/dashboard/portfolio", icon: Image, label: "Portfolio" },
        { href: "/admin/dashboard/slots", icon: Calendar, label: "Disponibilità" },
        { href: "/admin/dashboard/bookings", icon: CalendarCheck, label: "Prenotazioni" },
        { href: "/admin/dashboard/marketing", icon: Megaphone, label: "Marketing" },
        { href: "/admin/dashboard/settings", icon: Settings, label: "Impostazioni" },
    ];

    return (
        <div className={`flex min-h-screen ${darkMode ? "bg-stone-950" : "bg-stone-50"}`}>
            {/* Sidebar Desktop */}
            <aside
                className={`hidden lg:flex flex-col w-64 fixed h-full border-r transition-colors duration-200 ${darkMode ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
                    }`}
            >
                <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                    <h1 className={`font-serif text-2xl font-bold ${darkMode ? "text-white" : "text-stone-900"}`}>
                        Con Strass <span className="text-rose-500">o Senza</span>
                    </h1>
                    <p className="text-stone-400 text-xs mt-1">Admin Dashboard</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-rose-500 text-white shadow-md"
                                    : `${darkMode ? "text-stone-400 hover:bg-stone-800 hover:text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border transition-all ${darkMode
                            ? "bg-stone-800 border-stone-700 text-yellow-400 hover:bg-stone-700"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                            }`}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="text-sm font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-colors ${darkMode ? "text-stone-400 hover:bg-stone-800 hover:text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                            }`}
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 p-4 flex items-center justify-between border-b ${darkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"
                }`}>
                <h1 className="font-serif text-xl font-bold">
                    Con Strass <span className="text-rose-500">o Senza</span>
                </h1>
                <div className="flex items-center gap-4">
                    <NotificationCenter />
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
                    <aside
                        className={`w-[80%] max-w-sm h-full pt-6 p-4 flex flex-col shadow-2xl ${darkMode ? "bg-stone-900 text-white" : "bg-white text-stone-900"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h2 className="font-serif text-xl font-bold">Menu</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-2 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? "bg-rose-500 text-white shadow-md"
                                            : `${darkMode ? "text-stone-400 hover:bg-stone-800" : "text-stone-600 hover:bg-stone-100"}`
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border transition-all ${darkMode
                                    ? "bg-stone-800 border-stone-700 text-yellow-400 hover:bg-stone-700"
                                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                                    }`}
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="text-sm font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-colors ${darkMode ? "text-stone-400 hover:bg-stone-800" : "text-stone-600 hover:bg-stone-100"
                                    }`}
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 p-6 lg:ml-64 pt-24 lg:pt-6 transition-colors duration-200 ${darkMode ? "text-stone-100" : "text-stone-900"
                }`}>
                <div className="hidden lg:flex justify-end mb-6">
                    <NotificationCenter />
                </div>
                {children}
            </main>
        </div>
    );
}
