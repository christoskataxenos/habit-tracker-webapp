import React, { useState, useEffect } from 'react';
import { Target, X, Edit3, Mic, MicOff, Calendar, Clock, Activity, Zap, Plus } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function GoalModal({ isOpen, onClose, currentGoal, onSave }) {
    const [goal, setGoal] = useState(currentGoal);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-sm glass-silver p-8 rounded-2xl relative">
                <h3 className="text-xl text-platinum mb-6 uppercase tracking-widest flex items-center justify-center gap-2"><Target className="w-5 h-5" /> Target</h3>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={() => setGoal(Math.max(1, goal - 1))} className="w-12 h-12 rounded-full border border-white/20 text-white hover:bg-white/10 text-2xl font-thin transition-all hover:scale-110">-</button>
                    <div className="text-6xl font-thin text-white w-32 text-center">{goal}<span className="text-lg text-slate-500 ml-1">h</span></div>
                    <button onClick={() => setGoal(goal + 1)} className="w-12 h-12 rounded-full border border-white/20 text-white hover:bg-white/10 text-2xl font-thin transition-all hover:scale-110">+</button>
                </div>
                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 text-xs text-slate-500 uppercase tracking-widest hover:text-white border border-transparent hover:border-white/10 rounded-xl transition-all">Cancel</button>
                    <button onClick={() => { onSave(goal); onClose(); }} className="flex-[2] btn-silver py-3">Update</button>
                </div>
            </div>
        </div>
    );
}

const ACTIVITY_TAGS = ['Deep Work', 'Build', 'Learn', 'Logistics', 'Health', 'Life'];

export function AddEntryModal({ isOpen, onClose, onSave, recentCourses = [], initialHours = '', initialStartTime = '', initialEndTime = '', initialCourse = '', initialDate = '', initialTag = '', initialScore = 5 }) {
    const [course, setCourse] = useState(initialCourse);
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(initialStartTime || "09:00");
    const [endTime, setEndTime] = useState(initialEndTime || "10:00");
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState(initialHours || "1.0");
    const [tag, setTag] = useState(initialTag || 'Self-Study');
    const [score, setScore] = useState(initialScore);
    const [recurrence, setRecurrence] = useState([]); // Days 0-6

    const { isListening, startListening, stopListening, hasSupport } = useVoiceInput();

    useEffect(() => {
        const calculateDuration = () => {
            if (!startTime || !endTime) return;
            const [h1, m1] = startTime.split(':').map(Number);
            const [h2, m2] = endTime.split(':').map(Number);
            if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return;
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff < 0) diff += 24 * 60; // Handle overnight
            setDuration((diff / 60).toFixed(1));
        };
        calculateDuration();
    }, [startTime, endTime]);

    const handleTimeInput = (val, setter) => {
        // Remove non-numeric
        let clean = val.replace(/\D/g, '');
        if (clean.length > 4) clean = clean.slice(0, 4);

        if (clean.length >= 3) {
            setter(`${clean.slice(0, 2)}:${clean.slice(2)}`);
        } else {
            setter(clean);
        }
    };

    if (!isOpen) return null;

    // ... (rest of effects)

    // ... (rest of handlers)

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!course) return;
        onSave({ course, date, hours: duration, startTime, endTime, topic, tag, score, recurrence });
        onClose();
    };

    const toggleVoice = () => {
        if (isListening) stopListening();
        else startListening((text) => setTopic(prev => prev + (prev ? ' ' : '') + text));
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg relative glass-silver p-5 lg:p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute right-4 top-4 lg:right-6 lg:top-6 text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"><X className="w-6 h-6" strokeWidth={2} /></button>
                <h2 className="text-2xl lg:text-3xl font-light text-platinum mb-2 tracking-tighter flex items-center gap-2"><Edit3 className="w-6 h-6 lg:w-8 lg:h-8 text-slate-400" /> Log <span className="font-bold">Entry</span></h2>

                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6 mt-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl py-4 px-5 text-lg text-white font-bold placeholder-slate-700 outline-none transition-all group-hover:bg-black/60"
                                placeholder="Select or type..."
                                autoFocus
                            />
                            {/* Suggestions List would go here */}
                        </div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {recentCourses.slice(0, 3).map(c => (
                                <button key={c} type="button" onClick={() => setCourse(c)} className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 rounded-md px-2 py-1 text-slate-400 uppercase tracking-wider transition-colors">
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                            Activity Type
                            <span className="text-blue-400">Rate: {score}/10</span>
                        </label>
                        <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                            <div className="flex flex-wrap gap-2">
                                {ACTIVITY_TAGS.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTag(t)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${tag === t
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                                            : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Focus Score Slider */}
                            <div className="bg-black/20 p-2 rounded-lg border border-white/5 w-32">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={score}
                                    onChange={(e) => setScore(Number(e.target.value))}
                                    className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    title="Focus Score"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                            <input type="date" className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all font-mono text-center" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</label>
                            <div className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 flex items-center justify-center">
                                <span className="text-xl font-bold text-blue-400 font-mono">{duration}h</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Start Time (24h)</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl py-4 px-2 text-xl text-white outline-none transition-all font-mono text-center placeholder-slate-700"
                                value={startTime}
                                onChange={e => handleTimeInput(e.target.value, setStartTime)}
                                placeholder="HH:MM"
                                maxLength={5}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">End Time (24h)</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl py-4 px-2 text-xl text-white outline-none transition-all font-mono text-center placeholder-slate-700"
                                value={endTime}
                                onChange={e => handleTimeInput(e.target.value, setEndTime)}
                                placeholder="HH:MM"
                                maxLength={5}
                            />
                        </div>
                    </div>

                    {/* RECURRENCE SECTION */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Rhythmic Echo (Repeat)
                        </label>
                        <div className="flex gap-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRecurrence(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                                    className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-sm font-bold border transition-all ${recurrence.includes(i)
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                                        : 'bg-black/40 border-white/10 text-slate-600 hover:bg-white/5 hover:text-slate-400'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Voice Notes</label>
                        <div className="relative">
                            <input type="text" className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl py-4 px-5 pr-14 text-white placeholder-slate-600 outline-none transition-all" placeholder="Speak or type..." value={topic} onChange={e => setTopic(e.target.value)} />
                            {hasSupport && (<button type="button" onClick={toggleVoice} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}>{isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>)}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest text-xs">Cancel</button>
                        <button type="submit" className="flex-1 btn-silver py-4 text-black hover:bg-white">Commit Log</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function DayDetailModal({ isOpen, onClose, dateStr, entries, routines = [], onAddEntry }) {
    if (!isOpen || !dateStr) return null;

    const dateObj = new Date(dateStr);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const prettyDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const totalHours = entries.reduce((acc, curr) => acc + parseFloat(curr.hours), 0).toFixed(1);
    const activityCount = entries.length;

    // Generate Hourly Data for Wave Chart
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ time: i, intensity: 0 }));

    entries.forEach(entry => {
        let startH = 12; // default
        if (entry.startTime) {
            startH = parseInt(entry.startTime.split(':')[0]);
        }
        const duration = Math.ceil(parseFloat(entry.hours));

        for (let i = 0; i < duration; i++) {
            const hourIndex = (startH + i) % 24;
            // Add intensity (stacking if multiple activities overlap, though typically shouldn't)
            hourlyData[hourIndex].intensity += 50;
        }
    });

    // Add Ghost/Routine intensity (paler)
    routines.forEach(r => {
        let startH = 12;
        if (r.startTime) startH = parseInt(r.startTime.split(':')[0]);
        const duration = Math.ceil(parseFloat(r.hours));
        for (let i = 0; i < duration; i++) {
            const h = (startH + i) % 24;
            if (hourlyData[h].intensity === 0) hourlyData[h].intensity = 20; // Only add ghost intensity if empty
        }
    });

    // Smooth the curve slightly for visuals
    const smoothedData = hourlyData.map((d, i, arr) => {
        const prev = arr[i - 1]?.intensity || 0;
        const next = arr[i + 1]?.intensity || 0;
        const smoothVal = (prev + d.intensity * 2 + next) / 4;
        return { ...d, intensity: smoothVal > 5 ? smoothVal : 0 };
    });

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-4xl h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                {/* Close Button */}
                <button onClick={onClose} className="absolute right-4 top-4 z-50 p-2 rounded-full bg-black/50 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                </button>

                {/* LEFT COLUMN: Summary & Visuals */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-slate-900 via-black to-black p-8 relative flex flex-col border-b md:border-b-0 md:border-r border-white/5">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-2">Daily Audit</div>
                        <h2 className="text-4xl text-white font-thin tracking-tight mb-1">{dayName}</h2>
                        <div className="text-slate-500 font-light">{prettyDate}</div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest">Total Focus</span>
                            </div>
                            <div className="text-3xl text-white font-bold">{totalHours}<span className="text-sm font-thin text-slate-500 ml-1">h</span></div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <Activity className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest">Sessions</span>
                            </div>
                            <div className="text-3xl text-white font-bold">{activityCount}</div>
                        </div>
                    </div>

                    {/* WAVE CHART */}
                    <div className="flex-1 relative min-h-[150px] w-full bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
                        <div className="absolute top-4 left-4 text-[10px] text-slate-500 uppercase tracking-widest z-10 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-500" /> Energy Flow
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={smoothedData}>
                                <defs>
                                    <linearGradient id="colorIso" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="intensity"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIso)"
                                />
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[0, 100]} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RIGHT COLUMN: The Timeline / List */}
                <div className="w-full md:w-7/12 bg-[#050505] p-6 lg:p-8 overflow-y-auto custom-scrollbar">

                    {/* SCHEDULED PROTOCOLS (ROUTINES) */}
                    {routines.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl text-platinum/80 font-light mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                Scheduled Protocols
                            </h3>
                            <div className="space-y-3">
                                {routines.map((routine, idx) => {
                                    // Check if completed
                                    const isCompleted = entries.some(e => e.course === routine.course);
                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isCompleted ? 'bg-white/5 border-white/5 opacity-50' : 'bg-orange-500/10 border-orange-500/30'}`}>
                                            <div>
                                                <div className="text-sm font-bold text-white mb-1">{routine.course}</div>
                                                <div className="text-xs text-slate-400 font-mono">{routine.startTime} - {parseFloat(routine.hours)}h</div>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-black/40 border border-white/10">
                                                {isCompleted ? 'COMPLETE' : 'PENDING'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <h3 className="text-xl text-platinum/80 font-light mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Activity Log
                        <button
                            onClick={onAddEntry}
                            className="ml-2 p-1.5 rounded-full bg-white/5 hover:bg-blue-600 text-slate-400 hover:text-white transition-all border border-white/5 hover:border-blue-500/50 group"
                            title="Add Entry"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </h3>

                    {entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60%] text-slate-600">
                            <Calendar className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-mono tracking-widest uppercase">No Records Found</p>
                        </div>
                    ) : (
                        <div className="relative space-y-0.5">
                            {/* Vertical Line */}
                            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-white/10 z-0" />

                            {entries.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00')).map((entry, idx) => (
                                <div key={idx} className="group relative z-10 pl-16 py-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5">
                                    {/* Time Bubble */}
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[50px] text-right">
                                        <div className="text-xs font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                                            {entry.startTime}
                                        </div>
                                        <div className="text-[10px] text-slate-600">
                                            {entry.endTime}
                                        </div>
                                    </div>

                                    {/* Dot */}
                                    <div className={`absolute left-[24px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-black ${entry.tag === 'Deep Work' ? 'bg-blue-500' :
                                        entry.tag === 'Health' ? 'bg-orange-500' : 'bg-slate-500'
                                        } group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />

                                    {/* Content */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="text-lg text-platinum font-medium leading-none mb-1 group-hover:text-blue-400 transition-colors">
                                                {entry.course}
                                            </h4>
                                            <p className="text-sm text-slate-500 font-light line-clamp-1 group-hover:line-clamp-none transition-all">
                                                {entry.topic || 'No details provided.'}
                                            </p>
                                        </div>

                                        {/* Tag Badge */}
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/5 whitespace-nowrap">
                                                {entry.tag || 'GENERAL'}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-600 font-bold">
                                                {entry.hours}h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function DataManagementModal({ isOpen, onClose }) {
    if (!isOpen) return null;

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
        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (window.confirm('WARNING: This will overwrite your current data. Are you sure?')) {
                    localStorage.clear();
                    Object.keys(data).forEach(key => {
                        localStorage.setItem(key, data[key]);
                    });
                    alert('Data restored successfully! The app will now reload.');
                    window.location.reload();
                }
            } catch {
                alert('Invalid backup file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md glass-silver p-8 rounded-2xl relative">
                <button onClick={onClose} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>

                <h2 className="text-xl text-platinum mb-8 uppercase tracking-widest flex items-center justify-center gap-2 font-bold">
                    Data Management
                </h2>

                <div className="space-y-6">
                    {/* EXPORT SECTION */}
                    <button
                        onClick={handleExport}
                        className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 p-6 flex flex-col items-center gap-2 hover:border-cyan-400/60 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                    >
                        <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="text-cyan-400 font-bold uppercase tracking-widest text-sm relative z-10">Export Dataset</span>
                        <span className="text-xs text-slate-400 relative z-10">Save a local backup file (.json)</span>
                    </button>

                    {/* IMPORT SECTION */}
                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 border border-fuchsia-500/30 p-6 flex flex-col items-center gap-2 group-hover:border-fuchsia-400/60 transition-all">
                            <div className="absolute inset-0 bg-fuchsia-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm relative z-10">Import Dataset</span>
                            <span className="text-xs text-slate-400 relative z-10">Restore from backup (Overwrites current)</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                        PULSE_OS SECURE STORAGE
                    </p>
                </div>
            </div>
        </div>
    );
}
