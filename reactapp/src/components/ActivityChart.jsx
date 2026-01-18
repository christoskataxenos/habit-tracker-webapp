import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ActivityChart({ entries }) {
    // 1. Get last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Sum hours for this day
        const dayHours = entries
            .filter(e => e.date === dateStr)
            .reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);

        data.push({
            day: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
            hours: dayHours,
            fullDate: dateStr
        });
    }

    return (
        <div className="h-24 w-full mt-2 mb-4 bg-black/20 rounded-lg overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                        itemStyle={{ color: '#06b6d4' }}
                        labelStyle={{ display: 'none' }}
                        cursor={{ stroke: '#ffffff20' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHours)"
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Overlay Grid Lines for aesthetic */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
        </div>
    );
}
