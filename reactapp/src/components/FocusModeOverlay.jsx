import React from 'react';
import { Zap, Square } from 'lucide-react';

export default function FocusModeOverlay({ isFocusMode, elapsed, onTerminate, formatTime, currentTime }) {
    if (!isFocusMode) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
            {/* Background Glows to fill space without being "huge" */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>

            <div className="w-full max-w-4xl flex items-center justify-between px-6 md:px-12 mb-12 md:mb-24 relative z-10">
                <div className="text-left">
                    <h3 className="text-slate-500 text-sm md:text-xl uppercase tracking-[0.4em] mb-2">Focus Mode</h3>
                    <div className="text-2xl md:text-4xl text-white font-light tracking-widest mb-2">ENGAGED</div>
                    <div className="text-lg md:text-2xl text-cyan-400 font-mono tracking-wider opacity-80 backdrop-blur-md">
                        {currentTime ? currentTime.toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--'}
                    </div>
                </div>
                <Zap className="w-10 h-10 md:w-16 md:h-16 text-blue-500 animate-pulse drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full scale-150"></div>
                {/*
                    Fixed Typography Scaling:
                    Using clamp() to ensure text never gets too small or too large regardless of screen size.
                */}
                <h2 className="text-white font-thin tracking-tighter font-mono leading-none select-none relative z-10 text-platinum text-center"
                    style={{ fontSize: 'clamp(5rem, 25vw, 15rem)' }}>
                    {formatTime(elapsed)}
                </h2>
            </div>

            <button
                onClick={onTerminate}
                className="mt-12 md:mt-24 group flex items-center gap-4 px-10 py-5 md:px-16 md:py-8 bg-red-600 hover:bg-red-500 text-white rounded-2xl transition-all shadow-[0_0_60px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95 border border-red-400/50 relative z-10"
            >
                <Square className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                <span className="font-bold text-lg md:text-xl uppercase tracking-[0.2em]">Terminate</span>
            </button>
        </div>
    );
}
