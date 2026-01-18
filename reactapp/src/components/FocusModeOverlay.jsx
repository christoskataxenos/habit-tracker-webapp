import React from 'react';
import { Zap, Square } from 'lucide-react';

export default function FocusModeOverlay({ isFocusMode, elapsed, onTerminate, formatTime }) {
    if (!isFocusMode) return null;

    return (
        <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-full max-w-4xl flex items-center justify-between px-12 mb-24">
                <div className="text-left">
                    <h3 className="text-slate-500 text-xl uppercase tracking-[0.4em] mb-2">Focus Mode</h3>
                    <div className="text-4xl text-white font-light tracking-widest">ENGAGED</div>
                </div>
                <Zap className="w-16 h-16 text-blue-500 animate-pulse drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
            </div>

            <div className="relative">
                <div className="absolute -inset-10 bg-blue-500/10 blur-3xl rounded-full animate-pulse"></div>
                <h2 className="text-white text-[12rem] font-thin tracking-tighter font-mono leading-none select-none relative z-10 text-platinum shadow-silver">{formatTime(elapsed)}</h2>
            </div>

            <button onClick={onTerminate} className="mt-24 group flex items-center gap-4 px-16 py-8 bg-red-600 hover:bg-red-500 text-white rounded-2xl transition-all shadow-[0_0_60px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95 border border-red-400/50">
                <Square className="w-8 h-8 fill-current" /><span className="font-bold text-xl uppercase tracking-[0.2em]">Terminate</span>
            </button>
        </div>
    );
}
