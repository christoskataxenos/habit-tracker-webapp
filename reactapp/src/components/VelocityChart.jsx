import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function VelocityChart({ entries }) {
    // Calculate last 7 days including today
    const data = useMemo(() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const hours = entries
                .filter(e => e.date === dateStr)
                .reduce((sum, e) => sum + parseFloat(e.hours), 0);

            result.push({
                view: d.toLocaleDateString('en-US', { weekday: 'short' }),
                hours: parseFloat(hours.toFixed(1))
            });
        }
        return result;
    }, [entries]);

    return (
        <div className="w-full h-24 mb-4 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center mb-1 pr-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">7D VELOCITY</span>
                <span className="text-[9px] font-mono text-blue-400 font-bold">{data.reduce((a, b) => a + b.hours, 0).toFixed(1)}h TOTAL</span>
            </div>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                // Dynamic theme detection inside the render function for Tooltip
                                const isLightMode = document.documentElement.classList.contains('light');

                                return (
                                    <div className={`${isLightMode ? 'bg-white/95 border-slate-200 shadow-xl' : 'bg-black/90 border-white/10 shadow-2xl'} backdrop-blur-md border p-2 rounded-lg`}>
                                        <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">{payload[0].payload.view}</div>
                                        <div className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{payload[0].value} HOURS</div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#velocityGrad)"
                    />
                    <XAxis dataKey="view" hide />
                    <YAxis hide domain={[0, 'auto']} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
