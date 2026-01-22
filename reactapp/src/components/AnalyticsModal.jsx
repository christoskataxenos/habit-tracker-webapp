import React, { useState, useMemo } from 'react';
import { X, Calendar, PieChart, BarChart as BarIcon, Download, Upload, Sunrise, Moon, Flame, Zap, Crown, Sword, Anchor, Hammer, Book, Heart, Trophy, Medal, FileText, Target, Database } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#d946ef', '#f97316', '#10b981', '#64748b'];

export default function AnalyticsModal({ isOpen, onClose, entries, badges = [], initialView = 'stats', courseGoals, updateCourseGoal }) {
    const [range, setRange] = useState('week'); // 'week', 'month', 'all'
    const [currentView, setCurrentView] = useState(initialView || 'stats'); // 'stats', 'achievements', 'vault'

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
            const content = ev.target.result;
            const isJson = file.name.toLowerCase().endsWith('.json');

            try {
                if (isJson) {
                    // --- JSON RESTORE (Full Backup) ---
                    const data = JSON.parse(content);
                    if (window.confirm('Restore Full System Backup? This will overwrite ALL current data.')) {
                        localStorage.clear();
                        Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
                        window.location.reload();
                    }
                } else {
                    // --- CSV RESTORE (Entries Only) ---
                    // Simple CSV Parser handling quoted strings
                    const parseCSVLine = (line) => {
                        const result = [];
                        let current = '';
                        let inQuotes = false;
                        for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            if (char === '"' && line[i + 1] === '"') {
                                current += '"'; // Handle escaped quotes
                                i++;
                            } else if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                result.push(current);
                                current = '';
                            } else {
                                current += char;
                            }
                        }
                        result.push(current);
                        return result;
                    };

                    const lines = content.split('\n').filter(l => l.trim());
                    if (lines.length < 2) throw new Error('Invalid CSV format');

                    // Headers: ID, Course, Date, Hours, Start Time, End Time, Topic, Tag, Focus Score
                    // Indices: 0   1       2     3      4           5         6      7    8
                    const newEntries = lines.slice(1).map(line => {
                        const cols = parseCSVLine(line.trim());
                        return {
                            id: cols[0],
                            course: cols[1],
                            date: cols[2],
                            hours: cols[3],
                            startTime: cols[4],
                            endTime: cols[5],
                            topic: cols[6],
                            tag: cols[7],
                            score: cols[8] === '-' ? null : cols[8]
                        };
                    });

                    if (newEntries.length === 0) throw new Error('No entries found in CSV');

                    if (window.confirm(`Import ${newEntries.length} entries from CSV? This will MERGE with existing data.`)) {
                        // Merge logic: Add new, ignore duplicates based on ID?
                        // Or just append? Let's just append/overwrite based on ID if exists, or just replacement.
                        // Simple approach: Get current entries, filter out ones with colliding IDs, add new ones.
                        // Actually, let's just REPLACE entries for now to be safe/consistent with "Restore", 
                        // OR maybe smart merge relative to ID. 
                        // Given it's a "Restore" feature essentially...
                        // Let's go with: Load existing LS entries, replace any that match ID, add others.

                        const currentEntries = JSON.parse(localStorage.getItem('entries') || '[]');
                        const map = new Map(currentEntries.map(e => [e.id, e]));

                        newEntries.forEach(e => {
                            if (e.id && e.date && e.course) map.set(e.id, e); // Basic validation
                        });

                        localStorage.setItem('entries', JSON.stringify(Array.from(map.values())));
                        window.location.reload();
                    }
                }
            } catch (err) {
                console.error(err);
                alert('Import Failed: ' + err.message);
            }
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
                        {/* View Toggles */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setCurrentView('stats')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${currentView === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Stats
                            </button>
                            <button
                                onClick={() => setCurrentView('achievements')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${currentView === 'achievements' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Badges
                            </button>
                            <button
                                onClick={() => setCurrentView('goals')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${currentView === 'goals' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Goals
                            </button>
                            <button
                                onClick={() => setCurrentView('vault')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${currentView === 'vault' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Data
                            </button>
                        </div>

                        <button onClick={onClose} aria-label="Close Modal" className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">

                    {currentView === 'vault' && (
                        <div className="animate-in slide-in-from-bottom-4 space-y-8">
                            <div className="text-center mb-12">
                                <h3 className="text-3xl text-white font-thin tracking-tight mb-2">Data Operations</h3>
                                <p className="text-slate-500 text-sm">Manage your local dataset securely.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                {/* EXPORT JSON */}
                                <button
                                    onClick={handleExport}
                                    className="group relative bg-black/40 hover:bg-cyan-900/20 border border-white/5 hover:border-cyan-500/50 p-8 rounded-3xl text-left transition-all flex flex-col gap-4 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
                                    <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                                        <Database className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg text-white font-bold mb-1">System Backup</h4>
                                        <p className="text-xs text-slate-500">Download a full JSON snapshot of your database.</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                                        <Download className="w-4 h-4" /> Export JSON
                                    </div>
                                </button>

                                {/* EXPORT CSV */}
                                <button
                                    onClick={() => {
                                        const headers = ['ID', 'Course', 'Date', 'Hours', 'Start Time', 'End Time', 'Topic', 'Tag', 'Focus Score'];
                                        const rows = entries.map(e => [
                                            e.id,
                                            `"${e.course.replace(/"/g, '""')}"`,
                                            e.date,
                                            e.hours,
                                            e.startTime,
                                            e.endTime,
                                            `"${(e.topic || '').replace(/"/g, '""')}"`,
                                            e.tag,
                                            e.score || '-'
                                        ]);
                                        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `pulse_data_${new Date().toISOString().split('T')[0]}.csv`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }}
                                    className="group relative bg-black/40 hover:bg-emerald-900/20 border border-white/5 hover:border-emerald-500/50 p-8 rounded-3xl text-left transition-all flex flex-col gap-4 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                                    <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg text-white font-bold mb-1">Spreadsheet Export</h4>
                                        <p className="text-xs text-slate-500">Generate a CSV report for Excel or Analysis.</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </div>
                                </button>

                                {/* IMPORT JSON - DROP ZONE STYLE */}
                                <div className="relative group md:col-span-2">
                                    <input type="file" accept=".json, .csv" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                    <div className="relative bg-black/20 hover:bg-fuchsia-900/10 border-2 border-dashed border-white/10 hover:border-fuchsia-500/50 p-10 rounded-3xl transition-all flex flex-col items-center justify-center gap-4 group-hover:scale-[1.01]">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-fuchsia-500/50 group-hover:bg-fuchsia-900/20 transition-all">
                                            <Upload className="w-8 h-8 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl text-white font-bold mb-1">Restore from Backup</h4>
                                            <p className="text-sm text-slate-500">Drop your JSON file here or click to browse</p>
                                        </div>
                                        <div className="mt-2 px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-white group-hover:bg-fuchsia-600 group-hover:border-fuchsia-500 transition-colors">
                                            Select File
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentView === 'goals' && (
                        <div className="animate-in slide-in-from-bottom-4 space-y-8">
                            <div className="text-center mb-8">
                                <h3 className="text-xl text-white font-light">Project Goals</h3>
                                <p className="text-slate-500 text-sm">Set monthly targets for your active courses.</p>
                            </div>

                            {/* MANUAL ADD GOAL */}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                                <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Add New Target
                                </h4>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        id="newGoalSubject"
                                        placeholder="Subject Name (e.g. Physics)"
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
                                    />
                                    <input
                                        type="number"
                                        id="newGoalHours"
                                        placeholder="Hours"
                                        className="w-28 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50 text-center"
                                    />
                                    <button
                                        onClick={() => {
                                            const sub = document.getElementById('newGoalSubject').value;
                                            const hrs = document.getElementById('newGoalHours').value;
                                            if (sub && hrs) {
                                                updateCourseGoal(sub, hrs);
                                                document.getElementById('newGoalSubject').value = '';
                                                document.getElementById('newGoalHours').value = '';
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(() => {
                                    // Combine existing data subjects and stored goal subjects
                                    const allSubjects = new Set([
                                        ...subjectData.map(s => s.name),
                                        ...(courseGoals ? Object.keys(courseGoals) : [])
                                    ]);

                                    return Array.from(allSubjects).sort().map((subjectName, idx) => {
                                        // Find current hours from subjectData (which is filtered by range)
                                        const dataItem = subjectData.find(s => s.name === subjectName);
                                        const current = dataItem ? dataItem.value : 0;

                                        const goal = (courseGoals && courseGoals[subjectName]) || 0;
                                        const percent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

                                        return (
                                            <div key={idx} className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-white font-medium text-lg">{subjectName}</h4>
                                                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                                                            {current.toFixed(1)}h / {goal > 0 ? `${goal}h Target` : 'No Target'}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        placeholder="Target"
                                                        className="bg-black/40 border border-white/10 rounded-xl w-24 px-3 py-2 text-center text-sm text-blue-400 outline-none focus:border-blue-500/50 transition-all"
                                                        defaultValue={goal || ''}
                                                        onBlur={(e) => updateCourseGoal(subjectName, e.target.value)}
                                                    />
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ease-out ${percent >= 100 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-blue-500'}`}
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-end mt-2">
                                                    <span className={`text-xs font-mono ${percent >= 100 ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                        {percent.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {subjectData.length === 0 && (!courseGoals || Object.keys(courseGoals).length === 0) && (
                                <p className="text-center text-slate-500 mt-12">No data available for this range.</p>
                            )}
                        </div>
                    )}

                    {currentView === 'achievements' && (
                        <div className="animate-in slide-in-from-bottom-4">
                            <div className="text-center mb-12">
                                <h3 className="text-3xl text-white font-thin tracking-tight mb-2">Hall of Trophies</h3>
                                <p className="text-slate-500 text-sm max-w-md mx-auto">
                                    Your dedication is immortalized here. Earn badges by maintaining streaks, working late, and mastering your craft.
                                </p>
                            </div>

                            {badges.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                    <Trophy className="w-24 h-24 text-slate-700 mb-4" />
                                    <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No Achievements Yet</p>
                                    <p className="text-slate-600 text-xs mt-2">Start logging sessions to unlock greatness.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {badges.map((badge, idx) => {
                                        // Icon Mapping based on ID/String
                                        const IconComponent = {
                                            'Sunrise': Sunrise,
                                            'Moon': Moon,
                                            'Flame': Flame,
                                            'Zap': Zap,
                                            'Crown': Crown,
                                            'Sword': Sword,
                                            'Anchor': Anchor,
                                            'Hammer': Hammer,
                                            'Book': Book,
                                            'Heart': Heart
                                        }[badge.icon] || Medal;

                                        return (
                                            <div key={idx} className="group relative bg-gradient-to-br from-white/5 to-transparent p-6 rounded-2xl border border-white/5 hover:border-purple-500/50 hover:bg-purple-900/10 transition-all hover:-translate-y-1 flex flex-col items-center text-center">
                                                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all border border-white/10 group-hover:border-purple-500/50">
                                                    <IconComponent className="w-8 h-8 text-slate-400 group-hover:text-purple-400 transition-colors" />
                                                </div>
                                                <h4 className="text-white font-bold tracking-tight mb-1 group-hover:text-purple-200">{badge.name}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">{badge.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {currentView === 'stats' && (
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
                                                    innerRadius={0}
                                                    outerRadius={100}
                                                    paddingAngle={0}
                                                    dataKey="value"
                                                    isAnimationActive={true}
                                                    stroke="none"
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
