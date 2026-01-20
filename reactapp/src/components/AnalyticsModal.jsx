import React, { useState, useMemo } from 'react';
import { X, Calendar, PieChart, BarChart as BarIcon, Download, Upload } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#d946ef', '#f97316', '#10b981', '#64748b'];

export default function AnalyticsModal({ isOpen, onClose, entries, initialView = 'stats' }) {
    const [range, setRange] = useState('week'); // 'week', 'month', 'all'
    const [showDataMgmt, setShowDataMgmt] = useState(initialView === 'vault');

    // Filter Data based on Range
    const filteredEntries = useMemo(() => {
        if (!entries) return [];
        const now = new Date();
        const cutoff = new Date();

        if (range === 'week') cutoff.setDate(now.getDate() - 7);
        if (range === 'month') cutoff.setDate(now.getDate() - 30);
        if (range === 'all') cutoff.setFullYear(2000); // Far past

        return entries.filter(e => new Date(e.date) >= cutoff).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [range, entries]);

    // 1. Total Stats
    const totalHours = filteredEntries.reduce((acc, curr) => acc + parseFloat(curr.hours), 0);

    // 2. Data for Bar Chart (Hours per Day)
    const dailyData = useMemo(() => {
        const map = {};
        // Initialize map based on range to ensure empty days show 0? 
        // For simplicity, just map existing entries for now, or building a proper timeline is better.
        // Let's do simple aggregation first.
        filteredEntries.forEach(e => {
            const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            map[d] = (map[d] || 0) + parseFloat(e.hours);
        });
        return Object.keys(map).map(date => ({ date, hours: map[date] }));
    }, [filteredEntries]);

    // 3. Data for Pie Chart (Subject Distribution)
    const subjectData = useMemo(() => {
        const map = {};
        filteredEntries.forEach(e => {
            map[e.course] = (map[e.course] || 0) + parseFloat(e.hours);
        });
        return Object.keys(map)
            .map(name => ({ name, value: map[name] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6
    }, [filteredEntries]);

    if (!isOpen) return null;

    // --- DATA MANAGEMENT HANDLERS ---
    const handleExport = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pulse_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (window.confirm('Overwrite all data?')) {
                    localStorage.clear();
                    Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
                    window.location.reload();
                }
            } catch { alert('Invalid File'); }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl h-[85vh] glass-silver flex flex-col rounded-3xl overflow-hidden relative shadow-2xl border border-white/5">

                {/* TOOLBAR */}
                <div className="shrink-0 p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl text-white font-thin tracking-tight">Analytics Vault</h2>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Performance Metrics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Toggle Data Mgmt */}
                        <button
                            onClick={() => setShowDataMgmt(!showDataMgmt)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${showDataMgmt ? 'bg-white/10 text-white border-white/20' : 'text-slate-500 border-transparent hover:text-white'}`}
                        >
                            {showDataMgmt ? 'View Stats' : 'Manage Data'}
                        </button>

                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">

                    {showDataMgmt ? (
                        <div className="max-w-md mx-auto mt-12 space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="text-center mb-8">
                                <h3 className="text-xl text-white font-light">Data Operations</h3>
                                <p className="text-slate-500 text-sm">Backup or Restore your local dataset.</p>
                            </div>

                            <button onClick={handleExport} className="w-full p-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl flex items-center justify-center gap-4 group hover:border-cyan-400/60 transition-all">
                                <Download className="w-6 h-6 text-cyan-400" />
                                <span className="text-cyan-400 font-bold uppercase tracking-widest">Export JSON</span>
                            </button>

                            <div className="relative">
                                <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                <button className="w-full p-6 bg-gradient-to-r from-fuchsia-900/30 to-purple-900/30 border border-fuchsia-500/30 rounded-xl flex items-center justify-center gap-4 group hover:border-fuchsia-400/60 transition-all">
                                    <Upload className="w-6 h-6 text-fuchsia-400" />
                                    <span className="text-fuchsia-400 font-bold uppercase tracking-widest">Import JSON</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4">

                            {/* RANGE SELECTOR */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-white/5 p-1 rounded-xl flex gap-1">
                                    {['week', 'month', 'all'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setRange(r)}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${range === r ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {r === 'all' ? 'All Time' : `Last ${r === 'week' ? '7 Days' : '30 Days'}`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* KPI GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <div className="text-slate-500 text-xs uppercase tracking-widest mb-2">Total Focus</div>
                                    <div className="text-4xl text-white font-thin">{totalHours.toFixed(1)}<span className="text-sm text-slate-600 ml-1">h</span></div>
                                </div>
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <div className="text-slate-500 text-xs uppercase tracking-widest mb-2">Activity Count</div>
                                    <div className="text-4xl text-white font-thin">{filteredEntries.length}</div>
                                </div>
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <div className="text-slate-500 text-xs uppercase tracking-widest mb-2">Top Subject</div>
                                    <div className="text-xl text-white font-medium truncate">{subjectData[0]?.name || 'N/A'}</div>
                                    <div className="text-xs text-blue-400 font-mono mt-1">{subjectData[0]?.value.toFixed(1) || 0}h</div>
                                </div>
                            </div>

                            {/* CHARTS CONTAINER */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">

                                {/* BAR CHART */}
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col">
                                    <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <BarIcon className="w-4 h-4" /> Daily Output
                                    </h4>
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dailyData}>
                                                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* PIE CHART */}
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col">
                                    <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <PieChart className="w-4 h-4" /> Subject Distribution
                                    </h4>
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPie>
                                                <Pie
                                                    data={subjectData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {subjectData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                                            </RechartsPie>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
