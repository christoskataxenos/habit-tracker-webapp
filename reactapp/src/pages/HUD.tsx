import React, { useEffect, useState } from 'react';
import { Play, Pause, X, Square, Check, Trash2 } from 'lucide-react';
import { useTimerStore } from '../stores/useTimerStore';
import { useEntryStore } from '../stores/useEntryStore';

const formatTime = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const HUD = () => {
    const { isActive, startTime, elapsedTime, activeSession, pauseTimer, resumeTimer, stopTimer } = useTimerStore();
    const { addEntry } = useEntryStore();
    const [displayTime, setDisplayTime] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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

    const handleClose = () => {
        window.close();
    };

    const handleFinishRequest = () => {
        // High-Fidelity Signal: Close directly or show confirm
        setIsFinishing(true);
    };

    const handleSave = () => {
        try {
            // 1. STOP TIMER LOCALLY - Ensures state propagates correctly
            pauseTimer();

            // 2. REMOTE SIGNALING - Trigger detailed modal in main app
            localStorage.setItem('pulse_finish_trigger', Date.now().toString());

            // 3. Transition UI
            setIsSaved(true);
            setIsFinishing(false);

            // 4. Auto-Exit
            setTimeout(() => {
                window.close();
            }, 800);

        } catch (err) {
            console.error("CRITICAL HUD SIGNAL ERROR:", err);
            setIsFinishing(false);
        }
    };

    const handleDiscard = () => {
        if (window.confirm("Discard session? Time will not be logged.")) {
            stopTimer();
            setIsFinishing(false);
        }
    };

    return (
        <div className="h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 select-none overflow-hidden relative border border-white/10">
            {/* Draggable Header Area */}
            <div className="absolute top-0 left-0 right-0 h-6 draggable-header opacity-0 hover:opacity-100 transition-opacity bg-white/5 flex items-center px-3">
                <div className="text-[7px] uppercase tracking-[0.3em] font-bold text-slate-500">Pulse HUD Controller</div>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="absolute top-2 right-2 z-[100] p-1 rounded-lg bg-black/40 hover:bg-red-500/20 text-slate-500 hover:text-red-500 border border-white/5 hover:border-red-500/30 transition-all non-draggable"
                title="Exit HUD"
            >
                <X className="w-3 h-3" />
            </button>

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-blue-500/5 radial-gradient" />

            {isSaved ? (
                <div className="relative z-10 text-center animate-in zoom-in-50 duration-500">
                    <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-3 mx-auto">
                        <Check className="w-6 h-6 text-emerald-400" strokeWidth={3} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Locked & Saved</div>
                </div>
            ) : isFinishing ? (
                <div className="relative z-10 text-center animate-in zoom-in-95 duration-300">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold mb-4">
                        Save Session?
                    </div>
                    <div className="text-3xl font-mono font-bold mb-6 text-white/40 tabular-nums">
                        {formatTime(Math.floor(displayTime / 1000))}
                    </div>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleDiscard}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95"
                            title="Discard"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 border border-emerald-500/30 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:scale-105 active:scale-95"
                        >
                            <Check className="w-4 h-4" /> Commit
                        </button>
                        <button
                            onClick={() => setIsFinishing(false)}
                            className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 border border-white/10 transition-all text-[10px] uppercase font-bold active:scale-95"
                        >
                            Back
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header info */}
                    <div className="relative z-10 mb-2 text-center animate-in slide-in-from-top-5 duration-500">
                        <div className="text-[8px] uppercase tracking-[0.2em] text-blue-400 font-bold mb-1 flex items-center justify-center gap-1.5">
                            <span className={`w-1 h-1 rounded-full bg-blue-500 ${isActive ? 'animate-pulse' : 'opacity-40'}`}></span>
                            {activeSession?.tag || 'FOCUS'}
                        </div>
                        <div className="text-sm font-light text-white/90 truncate max-w-[180px]">
                            {activeSession?.course || 'Focus Session'}
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="relative z-10 text-5xl font-mono font-bold tracking-wider mb-4 tabular-nums drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                        {formatTime(Math.floor(displayTime / 1000))}
                    </div>

                    {/* Controls */}
                    <div className="relative z-10 flex gap-3 animate-in slide-in-from-bottom-5 duration-500 delay-100">
                        {isActive ? (
                            <button
                                onClick={pauseTimer}
                                className="group relative p-3 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-all border border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                title="Pause Session"
                            >
                                <Pause className="w-5 h-5 fill-current" />
                            </button>
                        ) : (
                            <button
                                onClick={resumeTimer}
                                className="group relative p-3 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                title="Resume Session"
                            >
                                <Play className="w-5 h-5 fill-current pl-0.5" />
                            </button>
                        )}

                        {(isActive || elapsedTime > 0) && (
                            <button
                                onClick={handleFinishRequest}
                                className="p-3 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 border border-white/10 transition-all hover:text-white"
                                title="Finish & Save"
                            >
                                <Square className="w-5 h-5 fill-current" />
                            </button>
                        )}
                    </div>
                </>
            )}

            <div className="relative z-10 mt-4 text-[8px] text-slate-600 uppercase tracking-widest font-bold opacity-40">
                System Active // v2.0.8
            </div>
        </div>
    );
};

export default HUD;
