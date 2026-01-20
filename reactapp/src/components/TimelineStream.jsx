import React from 'react';
import { AlignLeft, Edit3, Trash2 } from 'lucide-react';

// Helper to format decimal hours to HH:MM:SS
const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours * 60) % 60);
    const s = Math.floor((hours * 3600) % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const TimelineStream = ({ entries, onDelete, onEdit }) => {
    if (entries.length === 0) {
        // ... (void state)
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center">
                    <AlignLeft className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em]">Void</span>
            </div>
        );
    }

    return (
        <div className="relative pl-4 h-full overflow-y-auto no-scrollbar pt-2 pb-12">
            <div className="absolute left-2 top-2 bottom-0 w-px bg-gradient-to-b from-slate-700/50 via-slate-500/20 to-transparent"></div>
            {entries.map((entry) => (
                <div key={entry.id} className="group relative mb-3 last:mb-0 pl-6">
                    <div className="absolute left-[5px] top-3 w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-blue-400 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all z-10 box-content border-2 border-[#0B1221]"></div>

                    <div className="card-metallic p-3 flex flex-col group-hover:translate-x-1 transition-transform relative">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[9px] font-mono text-slate-500">{entry.date}</span>
                                    {entry.startTime && (
                                        <>
                                            <span className="text-[9px] text-slate-700">•</span>
                                            <span className="text-[9px] font-mono text-blue-400/80">{entry.startTime} - {entry.endTime}</span>
                                        </>
                                    )}
                                    {entry.tag && <span className="text-[8px] font-bold text-slate-400 bg-white/5 border border-white/10 rounded px-1 uppercase tracking-wider">{entry.tag}</span>}
                                </div>
                                <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{entry.course}</h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-300 bg-black/30 px-2 py-1 rounded border border-white/5 mr-6">{formatDuration(Number(entry.hours))}</span>
                        </div>
                        {entry.topic && (<p className="text-[10px] text-slate-500 mt-1 font-light italic border-l border-white/10 pl-2 group-hover:text-slate-400">"{entry.topic}"</p>)}

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button onClick={() => onEdit(entry)} className="text-blue-400 hover:text-blue-300 transition-all p-1.5 hover:bg-black/40 rounded shadow-sm border border-transparent hover:border-white/10" title="Edit Entry">
                                <Edit3 className="w-3 h-3" />
                            </button>
                            <button onClick={() => onDelete(entry.id)} className="text-red-400 hover:text-red-300 transition-all p-1.5 hover:bg-black/40 rounded shadow-sm border border-transparent hover:border-white/10" title="Delete Entry">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            ))
            }
        </div >
    );
};

export default TimelineStream;
