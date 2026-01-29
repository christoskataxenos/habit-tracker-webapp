import React, { useEffect, useState } from 'react';
import { Play, Pause, ExternalLink } from 'lucide-react';
import { useTimerStore } from '../stores/useTimerStore';

const formatTime = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const HUD = () => {
    const { isActive, startTime, elapsedTime, activeSession, pauseTimer, resumeTimer } = useTimerStore();
    const [displayTime, setDisplayTime] = useState(0);

    // Sync timer interval
    useEffect(() => {
        let interval: any;
        if (isActive && startTime) {
            const tick = () => {
                const now = Date.now();
                setDisplayTime(elapsedTime + (now - startTime));
            };
            tick();
            interval = setInterval(tick, 1000);
        } else {
            setDisplayTime(elapsedTime);
        }
        return () => clearInterval(interval);
    }, [isActive, startTime, elapsedTime]);

    return (
        <div className="h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-blue-500/5 radial-gradient" />

            {/* Header info */}
            <div className="relative z-10 mb-6 text-center animate-in slide-in-from-top-5 duration-500">
                <div className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold mb-2 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    {activeSession?.tag || 'FOCUS'}
                </div>
                <div className="text-lg font-light text-white/90 truncate max-w-[240px]">
                    {activeSession?.course || 'Focus Session'}
                </div>
            </div>

            {/* Timer */}
            <div className="relative z-10 text-7xl font-mono font-bold tracking-wider mb-8 tabular-nums drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                {formatTime(Math.floor(displayTime / 1000))}
            </div>

            {/* Controls */}
            <div className="relative z-10 flex gap-4 animate-in slide-in-from-bottom-5 duration-500 delay-100">
                {isActive ? (
                    <button
                        onClick={pauseTimer}
                        className="group relative p-5 bg-amber-500/10 text-amber-500 rounded-2xl hover:bg-amber-500/20 transition-all border border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                        title="Pause Session"
                    >
                        <Pause className="w-8 h-8 fill-current" />
                    </button>
                ) : (
                    <button
                        onClick={resumeTimer}
                        className="group relative p-5 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500/20 transition-all border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        title="Resume Session"
                    >
                        <Play className="w-8 h-8 fill-current pl-1" />
                    </button>
                )}
            </div>

            <div className="relative z-10 mt-8 text-[10px] text-slate-600 uppercase tracking-widest">
                Pulse Mini-HUD
            </div>
        </div>
    );
};

export default HUD;
