import React, { useState, useMemo } from 'react';
import { X, Calendar, PieChart, BarChart as BarIcon, Download, Upload, Sunrise, Moon, Flame, Zap, Crown, Sword, Anchor, Hammer, Book, Heart, Trophy, Medal, FileText, Target, Database, Cloud, RefreshCw, AlertTriangle, ShieldCheck, GitMerge, Sun, Clock, Check } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import { calculateForecasts, calculateInsights } from '../utils/statsCalculator';
import ActivityHeatmap from './ActivityHeatmap';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#d946ef', '#f97316', '#10b981', '#64748b'];
const COLORS_LIGHT = ['#475569', '#94a3b8', '#cbd5e1', '#64748b', '#334155', '#1e293b', '#e2e8f0']; // Earth & Silver

export default function AnalyticsModal({ isOpen, onClose, entries, badges = [], initialView = 'stats', courseGoals, updateCourseGoal }) {
    const [range, setRange] = useState('week'); // 'week', 'month', 'all'
    const [currentView, setCurrentView] = useState(initialView || 'stats'); // 'stats', 'achievements', 'vault'
    const [lastSync, setLastSync] = useState(localStorage.getItem('pulse_last_sync') || null);
    const [pendingImport, setPendingImport] = useState(null); // { data, type, entryCount }

    // Theme Detection
    const isLightMode = document.documentElement.classList.contains('light');
    const chartColors = isLightMode ? COLORS_LIGHT : COLORS;
    const tooltipStyle = isLightMode
        ? { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }
        : { backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' };
    const tooltipItemStyle = isLightMode ? { color: '#1e293b' } : { color: '#fff' };

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

    // 4. Forecasts (AI Predictions)
    const forecasts = useMemo(() => {
        if (!entries || !courseGoals) return [];
        return calculateForecasts(entries, courseGoals, 30); // 30 Days Lookback for stability
    }, [entries, courseGoals]);

    const insights = useMemo(() => calculateInsights(entries), [entries]);

    if (!isOpen) return null;

    // --- DATA MANAGEMENT HANDLERS ---
    const handleExport = async () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        const jsonContent = JSON.stringify(data, null, 2);
        const fileName = `pulse_backup_${new Date().toISOString().split('T')[0]}.json`;

        const performExport = () => {
            const now = new Date().toLocaleString();
            setLastSync(now);
            localStorage.setItem('pulse_last_sync', now);
        };

        // --- NATIVE ELECTRON SAVE DIALOG ---
        if (window.ipcRenderer || (window.require && window.require('electron'))) {
            try {
                const ipc = window.ipcRenderer || window.require('electron').ipcRenderer;
                const success = await ipc.invoke('save-backup', jsonContent, fileName);
                if (success) {
                    performExport();
                    return;
                }
            } catch (e) {
                console.warn('Native Save failed, falling back...', e);
            }
        }

        // --- BROWSER FALLBACK ---
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        performExport();
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
                    const data = JSON.parse(content);
                    setPendingImport({ data, type: 'json' });
                } else {
                    // CSV Logic
                    const parseCSVLine = (line) => {
                        const result = [];
                        let current = '';
                        let inQuotes = false;
                        for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            if (char === '"' && line[i + 1] === '"') {
                                current += '"';
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

                    let lines = content.split('\n').filter(l => l.trim());
                    // Skip optional Excel separator line (sep=,)
                    if (lines.length > 0 && lines[0].startsWith('sep=')) {
                        lines = lines.slice(1);
                    }
                    if (lines.length < 2) throw new Error('Invalid CSV format');

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
                    setPendingImport({ data: newEntries, type: 'csv', entryCount: newEntries.length });
                }
            } catch (err) {
                console.error(err);
                alert('Import Failed: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const executeFullRestore = () => {
        if (!pendingImport || pendingImport.type !== 'json') return;
        localStorage.clear();
        Object.keys(pendingImport.data).forEach(k => localStorage.setItem(k, pendingImport.data[k]));
        window.location.reload();
    };

    const executeSmartMerge = () => {
        if (!pendingImport) return;
        const STORAGE_KEY = 'pulse_entries_v2';
        const ROUTINES_KEY = 'pulse_routines_v2';
        const COURSE_GOALS_KEY = 'pulse_settings_v2';

        if (pendingImport.type === 'json') {
            const data = pendingImport.data;
            // Merge Entries
            const incomingEntries = JSON.parse(data[STORAGE_KEY] || '[]');
            const currentEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const entryMap = new Map(currentEntries.map(e => [e.id, e]));
            incomingEntries.forEach(e => { if (e.id) entryMap.set(e.id, e); });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(entryMap.values())));

            // Merge Routines
            const incomingRoutines = JSON.parse(data[ROUTINES_KEY] || '[]');
            const currentRoutines = JSON.parse(localStorage.getItem(ROUTINES_KEY) || '[]');
            const routineMap = new Map(currentRoutines.map(r => [r.id, r]));
            incomingRoutines.forEach(r => { if (r.id) routineMap.set(r.id, r); });
            localStorage.setItem(ROUTINES_KEY, JSON.stringify(Array.from(routineMap.values())));

            // Merge Course Goals
            const incomingGoals = JSON.parse(data[COURSE_GOALS_KEY] || '{}');
            const currentGoals = JSON.parse(localStorage.getItem(COURSE_GOALS_KEY) || '{}');
            localStorage.setItem(COURSE_GOALS_KEY, JSON.stringify({ ...currentGoals, ...incomingGoals }));
        } else if (pendingImport.type === 'csv') {
            const currentEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const map = new Map(currentEntries.map(e => [e.id, e]));
            pendingImport.data.forEach(e => {
                if (e.id && e.date && e.course) map.set(e.id, e);
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(map.values())));
        }
        window.location.reload();
    };

    return (
        <div id="analytics-modal-backdrop" className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            {/* CONFLICT RESOLUTION HUB - MODAL OVERLAY */}
            {pendingImport && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                    <div className={`w-full max-w-lg relative z-[70] overflow-hidden rounded-[2.5rem] border shadow-2xl p-8 md:p-12 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950 border-white/10'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-3xl mb-8 flex items-center justify-center border shadow-xl ${isLightMode ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>
                                <Database className="w-10 h-10" />
                            </div>

                            <h3 className={`text-2xl md:text-3xl font-black mb-4 tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Resolve Import Strategy</h3>
                            <p className={`text-sm mb-10 leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                Πώς θα θέλατε να προχωρήσετε με το αρχείο <b>{pendingImport.type.toUpperCase()}</b>; Ο συγχρονισμός προστατεύει τα υπάρχοντα δεδομένα σας.
                            </p>

                            <div className="w-full flex flex-col gap-4">
                                {/* SMART MERGE BUTTON */}
                                <button
                                    onClick={executeSmartMerge}
                                    className={`w-full p-6 rounded-3xl border text-left transition-all hover:scale-[1.02] flex items-center gap-6 group ${isLightMode ? 'bg-indigo-50 border-indigo-200 hover:bg-white shadow-md' : 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10'}`}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                        <GitMerge className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className={`font-black text-sm tracking-widest uppercase mb-1 ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`}>SMART MERGE (Safe)</div>
                                        <div className={`text-[10px] uppercase font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Maintain current database and add new records.</div>
                                    </div>
                                </button>

                                {/* FULL RESTORE BUTTON */}
                                {pendingImport.type === 'json' && (
                                    <button
                                        onClick={executeFullRestore}
                                        className={`w-full p-6 rounded-3xl border text-left transition-all hover:scale-[1.02] flex items-center gap-6 group ${isLightMode ? 'bg-rose-50/50 border-rose-100 hover:bg-rose-50' : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'}`}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                                            <AlertTriangle className="w-6 h-6 text-rose-400" />
                                        </div>
                                        <div>
                                            <div className={`font-black text-sm tracking-widest uppercase mb-1 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`}>FULL RESTORE (Wipe)</div>
                                            <div className="text-[10px] text-rose-500/70 uppercase font-bold italic">Warning: This will overwrite ALL current local data.</div>
                                        </div>
                                    </button>
                                )}

                                <button
                                    onClick={() => setPendingImport(null)}
                                    className={`mt-4 w-full py-4 text-xs font-black uppercase tracking-[0.3em] ${isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-slate-600 hover:text-white'} transition-colors`}
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div id="analytics-vault-panel" className="w-full md:w-[98%] lg:max-w-6xl h-full md:h-[92vh] glass-silver flex flex-col md:rounded-3xl overflow-hidden relative shadow-2xl border-0 md:border border-white/5">

                {/* TOOLBAR */}
                <div className="shrink-0 p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
                            <PieChart className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl text-white font-thin tracking-tight">Analytics Vault</h2>
                            <p className="hidden md:block text-xs text-slate-500 uppercase tracking-widest">Performance Metrics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        {/* View Toggles */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
                            <button
                                onClick={() => setCurrentView('stats')}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentView === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Stats
                            </button>
                            <button
                                onClick={() => setCurrentView('achievements')}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentView === 'achievements' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Badges
                            </button>
                            <button
                                onClick={() => setCurrentView('goals')}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentView === 'goals' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Goals
                            </button>
                            <button
                                onClick={() => setCurrentView('vault')}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentView === 'vault' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
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
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">

                    {currentView === 'vault' && (
                        <div className="animate-in slide-in-from-bottom-4 flex flex-col items-center">
                            <div className="text-center mb-8 md:mb-12">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 mb-4 border border-indigo-500/20">
                                    <Database className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl md:text-3xl text-white font-thin tracking-tight">Data Operations</h3>
                                <p className="text-slate-500 text-xs md:text-sm mt-1">Securely manage and sync your professional workspace.</p>
                            </div>

                            <div className="w-full max-w-4xl flex flex-col gap-8">
                                {/* PRIMARY HERO SYNC CARD */}
                                <button
                                    onClick={handleExport}
                                    className={`w-full text-left bg-gradient-to-br ${isLightMode ? 'from-indigo-50 to-white/50 border-indigo-100 shadow-md hover:bg-indigo-100/70' : 'from-indigo-900/30 to-black/60 border-white/5 hover:border-indigo-500/40'} border p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group transition-all hover:scale-[1.01] active:scale-[0.98] shadow-2xl`}
                                >
                                    {/* CENTERED GLOW */}
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-64 ${isLightMode ? 'bg-indigo-500/5' : 'bg-indigo-500/10'} blur-[120px] rounded-full group-hover:bg-indigo-500/20 transition-all pointer-events-none`} />

                                    <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${isLightMode ? 'bg-slate-100 border-slate-200 shadow-sm' : 'bg-indigo-600/20 border-indigo-500/30'} flex items-center justify-center border shrink-0 transition-all group-hover:scale-110 group-hover:rotate-6 shadow-xl`}>
                                            <Cloud className={`w-10 h-10 md:w-12 md:h-12 ${isLightMode ? 'text-slate-600' : 'text-indigo-400'}`} />
                                        </div>

                                        <div className="flex-1 text-center lg:text-left">
                                            <div className="flex flex-col md:flex-row items-center lg:items-start gap-3 mb-2">
                                                <h4 className={`text-2xl md:text-3xl font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Master Sync & Backup</h4>
                                                <span className={`px-3 py-1 ${isLightMode ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'} text-[10px] font-black uppercase tracking-widest rounded-full border`}>Privacy First</span>
                                            </div>
                                            <p className={`text-sm md:text-base ${isLightMode ? 'text-slate-600' : 'text-slate-400'} max-w-2xl leading-relaxed`}>
                                                Your data never leaves your control. Save this encrypted snapshot directly to your <b>Dropbox, Drive, or OneDrive</b> to sync seamlessly between your Work and Home setups.
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center lg:items-end gap-3 min-w-[160px]">
                                            <div className={`px-6 py-3 rounded-2xl border font-black text-sm tracking-[0.2em] transition-all shadow-lg ${isLightMode ? 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95' : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/40 group-hover:bg-indigo-500/20 shadow-indigo-500/10'}`}>
                                                SYNC NOW
                                            </div>
                                            {lastSync && (
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-tighter opacity-80">
                                                    <RefreshCw className="w-3 h-3 animate-spin-slow" />
                                                    Last: {lastSync}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <button
                                        onClick={() => {
                                            // CSV Export
                                            // CSV Export - Use Semicolon for compatibility with Greek/Euro Excel
                                            const headers = ['ID', 'Course', 'Date', 'Hours', 'Start Time', 'End Time', 'Topic', 'Tag', 'Focus Score'];
                                            const rows = entries.map(e => [
                                                e.id,
                                                `"${(e.course || '').replace(/"/g, '""')}"`,
                                                e.date,
                                                e.hours,
                                                e.startTime || '',
                                                e.endTime || '',
                                                `"${(e.topic || '').replace(/"/g, '""')}"`,
                                                `"${(e.tag || '').replace(/"/g, '""')}"`,
                                                e.focusScore || '-'
                                            ]);

                                            // Add BOM (\uFEFF) so Excel recognizes UTF-8 (Greek characters)
                                            // Delimiter: Semicolon (;)
                                            const BOM = '\uFEFF';
                                            const csvContent = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `pulse_data_${new Date().toISOString().split('T')[0]}.csv`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }}
                                        className={`group relative ${isLightMode ? 'bg-white border-slate-200 hover:border-emerald-500/50' : 'bg-black/20 border-white/5 hover:border-emerald-500/50'} border p-6 rounded-3xl text-left transition-all flex items-center gap-5 overflow-hidden shadow-xl`}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
                                            <FileText className="w-7 h-7 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Spreadsheet Export</h4>
                                            <p className="text-xs text-slate-500 leading-snug">CSV for Excel/External Analysis</p>
                                        </div>
                                    </button>

                                    <div className="relative group w-full">
                                        <input type="file" accept=".json, .csv" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                        <div className={`h-full ${isLightMode ? 'bg-white border-slate-200 group-hover:border-fuchsia-500/50' : 'bg-black/20 border-white/5 group-hover:border-fuchsia-500/50'} border p-6 rounded-3xl text-left transition-all flex items-center gap-5 overflow-hidden shadow-xl`}>
                                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20 shrink-0 group-hover:scale-110 transition-transform">
                                                <Upload className="w-7 h-7 text-fuchsia-400" />
                                            </div>
                                            <div>
                                                <h4 className={`text-lg font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Restore Backup</h4>
                                                <p className="text-xs text-slate-500 leading-snug">Import a previous JSON snapshot or pulse CSV file.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentView === 'goals' && (
                        <div className="animate-in slide-in-from-bottom-4 space-y-8">
                            <div className="text-center mb-4 md:mb-6">
                                <h3 className="text-xl md:text-2xl text-white font-thin">Project Goals</h3>
                                <p className="text-slate-500 text-[10px] md:text-xs">Set monthly targets for your active courses.</p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                                <h4 className="text-slate-400 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Add New Target
                                </h4>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        id="newGoalSubject"
                                        placeholder="Subject Name"
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
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase text-[10px] tracking-wider transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from(new Set([...subjectData.map(s => s.name), ...(courseGoals ? Object.keys(courseGoals) : [])])).sort().map((subjectName, idx) => {
                                    const dataItem = subjectData.find(s => s.name === subjectName);
                                    const current = dataItem ? dataItem.value : 0;
                                    const goal = (courseGoals && courseGoals[subjectName]) || 0;
                                    return (
                                        <div key={idx} className="bg-black/20 p-3 md:p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <h4 className="text-white font-medium text-sm md:text-base truncate">{subjectName}</h4>
                                                <div className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider">
                                                    {current.toFixed(1)}h / {goal > 0 ? `${goal}h` : 'No Target'}
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="SET"
                                                className="bg-black/40 border border-white/10 rounded-lg w-16 px-2 py-1 text-center text-xs text-blue-400 outline-none focus:border-blue-500/50 font-mono"
                                                defaultValue={goal || ''}
                                                onBlur={(e) => updateCourseGoal(subjectName, e.target.value)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {currentView === 'achievements' && (
                        <div className="animate-in slide-in-from-bottom-4">
                            <div className="text-center mb-6 md:mb-8">
                                <h3 className="text-xl md:text-2xl text-white font-thin tracking-tight mb-1">Hall of Trophies</h3>
                                <p className="text-slate-500 text-[10px] md:text-xs">Your dedication immortalized.</p>
                            </div>
                            {badges.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                    <Trophy className="w-24 h-24 text-slate-700 mb-4" />
                                    <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No Achievements Yet</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                    {badges.map((badge, idx) => (
                                        <div key={idx} className="group relative bg-black/40 p-4 md:p-5 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all flex flex-col items-center text-center w-36 md:w-44 shrink-0">
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 border border-purple-500/20 group-hover:bg-purple-500/20">
                                                <Medal className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                                            </div>
                                            <h4 className="text-xs md:text-sm text-white font-bold mb-1 truncate w-full">{badge.name}</h4>
                                            <p className="text-[9px] md:text-[10px] text-slate-500 line-clamp-2 leading-tight">{badge.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentView === 'stats' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4">
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

                            {/* Activity Heatmap */}
                            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Activity Heatmap
                                </h4>
                                <ActivityHeatmap entries={entries} period="quarter" isLightMode={isLightMode} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'}`}>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Total Focus</div>
                                    <div className={`text-3xl font-thin ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{totalHours.toFixed(1)}<span className="text-sm text-slate-500 ml-1">h</span></div>
                                </div>
                                <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'}`}>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Activity Count</div>
                                    <div className={`text-3xl font-thin ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{filteredEntries.length}</div>
                                </div>
                                <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'}`}>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Top Subject</div>
                                    <div className={`text-lg font-medium truncate ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{subjectData[0]?.name || 'No Data'}</div>
                                    <div className="text-[10px] text-blue-500 font-mono mt-0.5">{subjectData[0] ? subjectData[0].value.toFixed(1) : '0.0'}h</div>
                                </div>
                            </div>

                            {insights && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4 animate-in fade-in slide-in-from-bottom-5">
                                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${isLightMode ? 'bg-indigo-50 border-indigo-100' : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20'}`}>
                                        <div className={`p-2 rounded-lg ${isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={`text-[9px] uppercase tracking-widest font-bold ${isLightMode ? 'text-indigo-600' : 'text-indigo-200'}`}>Power Day</div>
                                            <div className={`text-lg font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{insights.bestDay}</div>
                                            <div className={`text-[9px] ${isLightMode ? 'text-indigo-600/70' : 'text-indigo-300 opacity-80'}`}>{insights.bestDayTotal}h total</div>
                                        </div>
                                    </div>

                                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${isLightMode ? 'bg-amber-50 border-amber-100' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'}`}>
                                        <div className={`p-2 rounded-lg ${isLightMode ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-300'}`}>
                                            <Sun className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={`text-[9px] uppercase tracking-widest font-bold ${isLightMode ? 'text-amber-600' : 'text-amber-200'}`}>Golden Hour</div>
                                            <div className={`text-lg font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{insights.goldenHour}</div>
                                            <div className={`text-[9px] ${isLightMode ? 'text-amber-600/70' : 'text-amber-300 opacity-80'}`}>{insights.goldenHourLabel}</div>
                                        </div>
                                    </div>

                                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${isLightMode ? 'bg-emerald-50 border-emerald-100' : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20'}`}>
                                        <div className={`p-2 rounded-lg ${isLightMode ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={`text-[9px] uppercase tracking-widest font-bold ${isLightMode ? 'text-emerald-600' : 'text-emerald-200'}`}>Avg Session</div>
                                            <div className={`text-lg font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{insights.avgSession}h</div>
                                            <div className={`text-[9px] ${isLightMode ? 'text-emerald-600/70' : 'text-emerald-300 opacity-80'}`}>Consistency Metric</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[340px]">
                                {/* AI FORECASTS REPLACING BARCHART */}
                                <div className={`p-6 rounded-2xl border flex flex-col relative overflow-hidden group h-full ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'}`}>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10 shrink-0">
                                        <Zap className="w-4 h-4 text-amber-500" /> AI Predictive Goals
                                    </h4>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 min-h-0">
                                        {forecasts.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-50 gap-3">
                                                <div className={`p-3 rounded-full border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                                                    <Target className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div className={`text-xs font-light text-center ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    No active predictions.<br />
                                                    <button
                                                        onClick={() => setCurrentView('goals')}
                                                        className="text-xs text-blue-500 hover:text-blue-600 underline mt-1"
                                                    >
                                                        Set Goals
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                {forecasts.map((f) => (
                                                    <div key={f.courseName} className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${isLightMode ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}>
                                                        <div className="flex justify-between items-center">
                                                            <span className={`text-xs font-bold truncate pr-2 ${isLightMode ? 'text-slate-800' : 'text-white'}`} title={f.courseName}>{f.courseName}</span>
                                                            <span className={`text-[10px] font-mono font-bold ${f.velocity > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                                {f.velocity > 0 ? f.velocity + 'h/d' : 'STALLED'}
                                                            </span>
                                                        </div>

                                                        {f.estimatedCompletionDate === 'DONE' ? (
                                                            <div className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                                                                <Check className="w-3 h-3" /> DONE
                                                            </div>
                                                        ) : f.daysRemaining === null ? (
                                                            <div className="text-slate-400 text-[10px] italic">Not enough data to forecast</div>
                                                        ) : (
                                                            <div className="flex justify-between items-end">
                                                                <div className="text-blue-400 font-mono font-bold text-sm leading-none">
                                                                    {new Date(f.estimatedCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                </div>
                                                                <div className={`text-[10px] font-mono ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                                                                    {f.daysRemaining}d left
                                                                </div>
                                                            </div>
                                                        )}

                                                        {f.estimatedCompletionDate !== 'DONE' && (
                                                            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500/50"
                                                                    style={{ width: `${Math.min(100, Math.max(5, (1 - (f.hoursRemaining / (f.hoursRemaining + (f.velocity * 30)))) * 100))}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`p-6 rounded-2xl border flex flex-col ${isLightMode ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'}`}>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <PieChart className="w-4 h-4" /> Subject Distribution
                                    </h4>
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                            <RechartsPie>
                                                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={0} outerRadius={100} paddingAngle={0} dataKey="value" isAnimationActive={true} animationDuration={600} animationBegin={100} stroke="none">
                                                    {subjectData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
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
            {/* --- RESTORE MODAL --- */}
            {pendingImport && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 transform animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 text-fuchsia-400">
                            <Upload className="w-8 h-8" />
                            <h3 className="text-2xl font-bold text-white">Restore Backup?</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-slate-300 text-sm">
                                Found {pendingImport.type === 'json' ? 'Full System Snapshot' : `${pendingImport.entryCount} Entries`}.
                            </p>

                            {pendingImport.type === 'json' ? (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Warning</p>
                                    <p className="text-red-200 text-xs leading-relaxed">This action will <strong className="text-white">DELETE</strong> all current data and replace it with the backup content. This cannot be undone.</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-blue-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><GitMerge className="w-3 h-3" /> Merge Mode</p>
                                    <p className="text-blue-200 text-xs leading-relaxed">New entries will be added to your existing data. No existing data will be overwritten.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setPendingImport(null)} className="flex-1 py-3 rounded-xl hover:bg-white/5 text-slate-400 font-bold text-sm transition-colors border border-transparent hover:border-white/10">
                                Cancel
                            </button>
                            {pendingImport.type === 'json' ? (
                                <button onClick={executeFullRestore} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> REPLACE ALL
                                </button>
                            ) : (
                                <button onClick={executeSmartMerge} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" /> IMPORT
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
