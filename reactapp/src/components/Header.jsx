import React from 'react';
import { FilePlus2, Play, Database, Sunrise, Moon, Flame, Zap, Crown, Sword, Anchor, Hammer, Book, Heart, Trophy, Medal } from 'lucide-react';
import UltraLogo from './UltraLogo';
import QuoteWidget from './QuoteWidget';

export default function Header({
    currentTime,
    level = 1,
    rank = "INITIATE",
    progress = 0,
    badges = []
}) {
    const isElectron = window && window.process && window.process.type;

    const handleMinimize = () => {
        if (isElectron && window.require) window.require('electron').ipcRenderer.send('window-minimize');
    };
    const handleMaximize = () => {
        if (isElectron && window.require) window.require('electron').ipcRenderer.send('window-maximize');
    };
    const handleClose = () => {
        if (isElectron && window.require) window.require('electron').ipcRenderer.send('window-close');
    };

    return (
        <>
            {/* --- LAYER 1: SYSTEM TITLE BAR (Fixed Top) - Only show on Electron --- */}
            {isElectron && (
                <div className="fixed top-0 left-0 w-full h-8 z-[200] flex justify-between items-center draggable-header pl-4 pr-1 select-none">
                    <div className="text-[10px] text-slate-600 font-mono tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                        PULSE_OS v1.2
                    </div>

                    <div className="flex items-center h-full non-draggable">
                        <button
                            onClick={handleMinimize}
                            className="h-full w-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none focus:outline-none"
                            title="Minimize"
                            aria-label="Minimize"
                        >
                            <div className="w-2.5 h-[1px] bg-current"></div>
                        </button>

                        <button
                            onClick={handleMaximize}
                            className="h-full w-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none focus:outline-none"
                            title="Maximize"
                            aria-label="Maximize"
                        >
                            <div className="w-2.5 h-2.5 border border-current rounded-[1px]"></div>
                        </button>

                        <button
                            onClick={handleClose}
                            className="h-full w-12 flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500 transition-all outline-none focus:outline-none"
                            title="Close"
                            aria-label="Close"
                        >
                            <div className="relative w-3 h-3">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-current rotate-45 transform origin-center"></div>
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-current -rotate-45 transform origin-center"></div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* --- LAYER 2: APP COMMAND DECK (Main Header) --- */}
            <header className={`w-full max-w-[1800px] mx-auto mb-8 relative ${isElectron ? 'pt-6' : 'pt-2'}`}>

                {/* DESKTOP LAYOUT: Grid that matches Dashboard (1fr | 380px) to align items with panels */}
                <div className="hidden lg:grid grid-cols-[1fr_380px] gap-8 w-full items-end">

                    {/* LEFT COLUMN: Logo (Left) + Quote (Right) -> Aligns with Calendar */}
                    <div className="flex items-center justify-between w-full pr-1">
                        {/* Identity & Rank System */}
                        <div className="flex flex-col gap-1 select-none">
                            <div className="flex items-center gap-4 group cursor-default">
                                <UltraLogo />
                                <h1 className="text-xl md:text-2xl font-extralight tracking-[0.3em] md:tracking-[0.5em] text-slate-200 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Pulse
                                </h1>
                            </div>

                            {/* GAMIFICATION HUD */}
                            <div className="ml-12 md:ml-[3.25rem] flex items-center gap-3 animate-in fade-in duration-700 slide-in-from-left-4">
                                <div className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-white/5 tracking-wider">
                                    LVL <span className="text-white font-bold">{level}</span>
                                </div>

                                <span className="hidden sm:inline text-[9px] text-cyan-400 uppercase tracking-widest font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                                    {rank}
                                </span>

                                <div className="w-16 md:w-24 h-0.5 bg-slate-800 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-cyan-500 shadow-[0_0_10px_cyan] transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Quote Widget: Right Aligned in this column */}
                        <QuoteWidget
                            className="hidden lg:flex items-end justify-center h-full max-w-[500px]"
                            authorClass="justify-end"
                        />
                    </div>

                    {/* RIGHT COLUMN: System Time -> Aligns with Feed */}
                    <div className="flex flex-col items-end pointer-events-none z-10 select-none">
                        <span className="text-[10px] tracking-[0.4em] text-cyan-500/40 uppercase font-bold mb-1">System Time</span>
                        <div className="text-4xl font-light tracking-tighter text-white/90 font-mono shadow-black drop-shadow-lg">
                            {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
                        </div>
                    </div>
                </div>

                {/* MOBILE/TABLET LAYOUT: Original Flexbox behavior */}
                <div className="lg:hidden flex items-center justify-between">
                    {/* Identity & Rank System */}
                    <div className="flex flex-col gap-1 select-none">
                        <div className="flex items-center gap-4 group cursor-default">
                            <UltraLogo />
                            <h1 className="text-xl md:text-2xl font-extralight tracking-[0.3em] md:tracking-[0.5em] text-slate-200 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Pulse
                            </h1>
                        </div>

                        {/* GAMIFICATION HUD */}
                        <div className="ml-12 md:ml-[3.25rem] flex items-center gap-3 animate-in fade-in duration-700 slide-in-from-left-4">
                            <div className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-white/5 tracking-wider">
                                LVL <span className="text-white font-bold">{level}</span>
                            </div>
                            <div className="w-16 h-0.5 bg-slate-800 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-cyan-500 shadow-[0_0_10px_cyan] transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* System Time (Compact) */}
                    <div className="flex flex-col items-end pointer-events-none z-10 select-none">
                        <div className="text-xl font-light tracking-tighter text-white/90 font-mono">
                            {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
                        </div>
                    </div>
                </div>

            </header>
        </>
    );
}
