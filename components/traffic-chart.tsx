"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
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
    date: string;
    visitors: number;
    rawDate: string;
}

export function TrafficChart() {
    const [data, setData] = useState<TrafficData[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<'7d' | '30d' | '6m' | '12m'>('30d');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Determine days
                let days = 30;
                switch (range) {
                    case '7d': days = 7; break;
                    case '30d': days = 30; break;
                    case '6m': days = 180; break;
                    case '12m': days = 365; break;
                }

                const startDate = new Date();
                startDate.setDate(startDate.getDate() - (days - 1));
                const dateStr = startDate.toISOString();

                const { data: visits, error } = await supabase
                    .from('site_visits')
                    .select('created_at')
                    .gte('created_at', dateStr);

                if (error) {
                    console.error('Error fetching analytics:', error);
                    return;
                }

                if (visits) {
                    // Group by date
                    const counts: Record<string, number> = {};

                    // Initialize dates
                    for (let i = 0; i < days; i++) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dayStr = d.toISOString().split("T")[0];
                        counts[dayStr] = 0;
                    }

                    // Count actual visits
                    visits.forEach((visit: any) => {
                        const dayStr = new Date(visit.created_at).toISOString().split("T")[0];
                        if (counts[dayStr] !== undefined) {
                            counts[dayStr]++;
                        }
                    });

                    // Format for chart
                    const formattedData = Object.entries(counts)
                        .map(([date, count]) => ({
                            date: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
                            visitors: count,
                            rawDate: date
                        }))
                        .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

                    setData(formattedData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [range]);

    return (
        <div className="min-w-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-900 mb-0">Traffico Web (Reale)</h2>
                <div className="flex gap-1 text-xs bg-stone-100 p-1 rounded-lg">
                    {(['7d', '30d', '6m', '12m'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-2 py-1 rounded-md transition-all ${range === r
                                    ? 'bg-white text-rose-500 shadow-sm font-medium'
                                    : 'text-stone-500 hover:text-stone-900'
                                }`}
                        >
                            {r === '7d' ? '7G' : r === '30d' ? '30G' : r === '6m' ? '6M' : '1A'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-[300px] flex items-center justify-center text-stone-400">Caricamento dati...</div>
            ) : (
                <div className="w-full h-[300px] min-h-[300px] min-w-0">
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
                                interval={Math.floor(data.length / 5)} // Show fewer labels dynamically
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
                                name="Visitatori"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
