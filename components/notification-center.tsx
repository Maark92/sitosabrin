"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();

        // Realtime Subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
                <Bell size={28} className="text-stone-600 dark:text-stone-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-6 h-6 bg-rose-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-stone-900 animate-pulse shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-[85vw] sm:w-96 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 z-50 overflow-hidden ring-1 ring-black/5">
                        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-800/50">
                            <h3 className="font-bold text-base text-stone-900 dark:text-white">Notifiche</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wide">
                                    Segna tutte lette
                                </button>
                            )}
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center text-stone-400">
                                    <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Nessuna notifica</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors ${!notif.is_read ? 'bg-rose-50/60 dark:bg-rose-900/20' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 shadow-sm ${!notif.is_read ? 'bg-rose-500 animate-pulse' : 'bg-stone-200 dark:bg-stone-700'}`} />
                                            <div className="flex-1">
                                                <h4 className={`text-base mb-1 ${!notif.is_read ? 'font-bold text-stone-900 dark:text-white' : 'font-medium text-stone-600 dark:text-stone-400'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                                                    {notif.message}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-stone-400 font-medium bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                                                        {new Date(notif.created_at).toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {!notif.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="text-stone-400 hover:text-rose-500 transition-colors"
                                                            title="Segna come letta"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
