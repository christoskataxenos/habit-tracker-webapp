import React, { useState, useEffect } from 'react';
import { Target, X, Edit3, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';

export function GoalModal({ isOpen, onClose, currentGoal, onSave }) {
    if (!isOpen) return null;
    const [goal, setGoal] = useState(currentGoal);
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

export function AddEntryModal({ isOpen, onClose, onSave, uniqueCourses, recentCourses = [], initialHours = '', initialStartTime = '', initialEndTime = '', initialCourse = '', initialDate = '', initialTag = '' }) {
    if (!isOpen) return null;

    const [course, setCourse] = useState(initialCourse);
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(initialStartTime || "09:00");
    const [endTime, setEndTime] = useState(initialEndTime || "10:00");
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState(initialHours || "1.0");
    const [tag, setTag] = useState(initialTag || 'Self-Study');

    const { isListening, startListening, stopListening, hasSupport } = useVoiceInput();

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCourse(initialCourse);
            setDate(initialDate || new Date().toISOString().split('T')[0]);
            setTag(initialTag || 'Self-Study');

            let sTime = initialStartTime || "09:00";
            let eTime = initialEndTime;

            // If we have hours (legacy data) but no explicit times, calculate End Time based on Duration
            if (initialHours && !initialEndTime && !initialStartTime) {
                const h = Number(initialHours);
                const now = new Date();
                const startObj = new Date(now.toDateString() + ' ' + sTime);
                const endObj = new Date(startObj.getTime() + h * 3600000);
                eTime = endObj.toTimeString().slice(0, 5);
            } else if (!eTime) {
                // Default to +1 hour from start or current time if creating new
                if (!initialStartTime) {
                    const now = new Date();
                    sTime = now.toTimeString().slice(0, 5);
                    now.setHours(now.getHours() + 1);
                    eTime = now.toTimeString().slice(0, 5);
                } else {
                    const d = new Date(`2000-01-01T${sTime}`);
                    d.setHours(d.getHours() + 1);
                    eTime = d.toTimeString().slice(0, 5);
                }
            }

            setStartTime(sTime);
            setEndTime(eTime);
            setTopic('');
        }
    }, [isOpen, initialCourse, initialDate, initialStartTime, initialEndTime, initialHours, initialTag]);

    // Auto-calculate duration when times change
    useEffect(() => {
        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            let diff = (end - start) / 1000 / 3600;
            if (diff < 0) diff += 24;
            setDuration(diff.toFixed(1));
        }
    }, [startTime, endTime]);

    // Custom 24h Time Input Handler
    const handleTimeInput = (value, setter) => {
        // Remove non-digits
        let clean = value.replace(/\D/g, '');

        // Limit logic
        if (clean.length > 4) clean = clean.slice(0, 4);

        // Format logic
        let formatted = clean;
        if (clean.length >= 3) {
            const hours = parseInt(clean.slice(0, 2));
            const mins = parseInt(clean.slice(2, 4));

            // Validate Hour (00-23)
            if (hours > 23) {
                formatted = '23' + clean.slice(2);
            }
            // Add colon
            formatted = clean.slice(0, 2) + ':' + clean.slice(2);
        } else if (clean.length === 2 && parseInt(clean) > 23) {
            // Prevent typing like 50:XX
            formatted = '23';
        }

        setter(formatted);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!course) return;
        onSave({ course, date, hours: duration, startTime, endTime, topic, tag });
        onClose();
    };

    const toggleVoice = () => {
        if (isListening) stopListening();
        else startListening((text) => setTopic(prev => prev + (prev ? ' ' : '') + text));
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Type</label>
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
            } catch (err) {
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
