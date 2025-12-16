"use client";

import React, { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface TrafficData {
    time: number; // timestamp
    visitors: number;
    pageviews: number;
}

export function TrafficChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/analytics');
                if (!res.ok) throw new Error('Failed');
                const json = await res.json();

                // Vercel API response formatting
                // Solitamente restituisce data: [{ day: '2023-01-01', visitors: 10, ... }]
                if (json.data) {
                    const formatted = json.data.map((item: any) => ({
                        date: new Date(item.day).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
                        visitors: item.visitors,
                        pageviews: item.pageviews
                    }));
                    setData(formatted);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="h-[300px] flex items-center justify-center text-stone-400">Caricamento dati...</div>;
    if (error) return <div className="h-[300px] flex items-center justify-center text-red-400">Errore caricamento dati Vercel (Controlla Token)</div>;
    if (data.length === 0) return <div className="h-[300px] flex items-center justify-center text-stone-400">Nessun dato disponibile ancora</div>;

    return (
        <div className="w-full h-[300px] min-h-[300px] min-w-0 mt-4">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 0,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#10B981', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVisitors)"
                        name="Visitatori Unici"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
