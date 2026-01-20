import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TemporalMatrix = ({ entries, routines = [], onSelectDate, selectedDate, actions }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0=Sun -> 6, 1=Mon -> 0 (Adjust for Mon start visual)
    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    const getDayData = (day) => {
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 1. Real Entries
        const dayEntries = entries.filter(e => e.date === dateStr);
        const dayHours = dayEntries.reduce((sum, e) => sum + parseFloat(e.hours), 0);

        // 2. Ghost Routines
        // JS getDay(): 0=Sun, 1=Mon... 
        // My AddEntryModal saves 0=Sun, 1=Mon (based on the array ['S','M'...])
        const dayIndex = dateObj.getDay();
        const dayRoutines = routines.filter(r => r.days && r.days.includes(dayIndex));

        return { dateStr, dayHours, dayEntries, dayRoutines };
    };

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-8 px-2 border-b border-white/5 pb-4">
                {/* LEFT: Time Controls */}
                <div className="flex items-center gap-6">
                    <div className="flex gap-1">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center gap-4">
                        <h4 className="text-3xl font-thin tracking-[0.2em] text-platinum min-w-[200px]">{monthNames[currentDate.getMonth()]}</h4>
                        <span className="text-sm text-slate-500 font-mono tracking-widest border border-slate-700/50 px-2 py-0.5 rounded">{currentDate.getFullYear()}</span>
                    </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2 text-center pb-2 mx-1 opacity-40">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (<div key={i} className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{d}</div>))}
            </div>

            <div className="grid grid-cols-7 flex-1 border-t border-l border-white/5 bg-black/20 overflow-y-auto">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="border-r border-b border-white/5 bg-transparent min-h-[80px]" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const { dateStr, dayHours, dayEntries, dayRoutines } = getDayData(day);
                    const isSelected = selectedDate === dateStr;

                    const getFullActivityColor = (str) => {
                        const s = str.toLowerCase();
                        if (s.includes('gym') || s.includes('workout') || s.includes('run') || s.includes('sport') || s.includes('fit') || s.includes('box')) return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
                        if (s.includes('art') || s.includes('music') || s.includes('design') || s.includes('write') || s.includes('draw')) return 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]';
                        if (s.includes('math') || s.includes('phys') || s.includes('algo') || s.includes('data') || s.includes('struct')) return 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]';
                        if (s.includes('code') || s.includes('dev') || s.includes('react') || s.includes('js') || s.includes('c++') || s.includes('python')) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
                        return 'bg-slate-500';
                    };

                    let bgClass = "bg-transparent hover:bg-white/5";
                    if (isSelected) bgClass = "bg-white z-10 shadow-[0_0_20px_rgba(255,255,255,0.4)]";
                    else if (dayHours > 0) bgClass = "bg-slate-900/40 hover:bg-slate-800/60";

                    return (
                        <button
                            key={day}
                            onClick={() => onSelectDate(dateStr)}
                            className={`border-r border-b border-white/5 relative flex flex-col justify-end p-0 transition-all duration-300 group overflow-hidden min-h-[80px] ${bgClass}`}
                        >
                            <span className={`absolute top-1.5 left-2 text-lg font-bold tracking-tighter z-20 ${isSelected ? 'text-black' : 'text-slate-600 group-hover:text-slate-400'}`}>{day}</span>

                            {dayHours > 0 && (
                                <span className={`absolute top-2 right-2 text-[10px] font-mono font-bold z-20 ${isSelected ? 'text-black' : 'text-slate-400'}`}>
                                    {dayHours.toFixed(1)}h
                                </span>
                            )}

                            <div className="w-full h-full relative z-10 flex items-end pb-1">
                                {/* GHOSTS (Routines) */}
                                {dayRoutines.map((routine, idx) => {
                                    let startH = 12, startM = 0;
                                    if (routine.startTime) {
                                        const parts = routine.startTime.split(':');
                                        startH = parseInt(parts[0]);
                                        startM = parseInt(parts[1]);
                                    }
                                    const startDecimal = startH + startM / 60;
                                    const duration = parseFloat(routine.hours);
                                    const leftPct = (startDecimal / 24) * 100;
                                    const widthPct = (duration / 24) * 100;

                                    return (
                                        <div
                                            key={`ghost-${idx}`}
                                            className={`absolute bottom-0 rounded-t-sm backdrop-blur-[0px] pointer-events-none ${getFullActivityColor(routine.course).split(' ')[0]}`}
                                            style={{
                                                left: `${leftPct}%`,
                                                width: `${Math.max(widthPct, 1.5)}%`,
                                                height: '25%', // Slightly shorter
                                                opacity: 0.25, // Visible but subtle
                                            }}
                                        />
                                    );
                                })}

                                {/* REAL ENTRIES */}
                                {dayEntries.map((entry, idx) => {
                                    let startH = 12, startM = 0;
                                    if (entry.startTime) {
                                        const parts = entry.startTime.split(':');
                                        startH = parseInt(parts[0]);
                                        startM = parseInt(parts[1]);
                                    }
                                    const startDecimal = startH + startM / 60;
                                    const duration = parseFloat(entry.hours);
                                    const leftPct = (startDecimal / 24) * 100;
                                    const widthPct = (duration / 24) * 100;

                                    return (
                                        <div
                                            key={idx}
                                            className={`absolute bottom-0 rounded-t transition-all duration-300 group/bar border-x border-black/10 backdrop-blur-sm ${getFullActivityColor(entry.course).replace('shadow-[', 'shadow-none ')}`}
                                            style={{
                                                left: `${leftPct}%`,
                                                width: `${Math.max(widthPct, 1.5)}%`,
                                                height: isSelected ? '60%' : '40%',
                                                opacity: isSelected ? 1 : 0.9
                                            }}
                                        >
                                            <div className={`absolute inset-0 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-white/20`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TemporalMatrix;
