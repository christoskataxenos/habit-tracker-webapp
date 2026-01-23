import React from 'react';
import { Zap, Square } from 'lucide-react';
import QuoteWidget from './QuoteWidget';
import FlipClock from './FlipClock';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusModeOverlay({ isFocusMode, elapsed, onTerminate, formatTime, currentTime, clockFace = 'standard' }) {
    return (
        <AnimatePresence>
            {isFocusMode && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    id="focus-overlay-container"
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between py-12 overflow-hidden"
                >
                    {/* Background Glows (Aurora) */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.1)_90deg,transparent_180deg,rgba(147,51,234,0.1)_270deg,transparent_360deg)] animate-[spin_20s_linear_infinite] blur-3xl opacity-50"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
                    </div>

                    {/* HEADER */}
                    <div className="w-full max-w-4xl flex items-center justify-between px-6 md:px-12 relative z-10 shrink-0">
                        <div className="text-left">
                            <h3 className="text-slate-500 text-sm md:text-xl uppercase tracking-[0.4em] mb-2">Focus Mode</h3>
                            <div className="text-2xl md:text-4xl text-white font-light tracking-widest mb-2">ENGAGED</div>
                            <div className="text-lg md:text-2xl text-slate-300 font-mono tracking-wider opacity-80 backdrop-blur-md">
                                {currentTime ? currentTime.toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--'}
                            </div>
                        </div>
                        <Zap className="w-10 h-10 md:w-16 md:h-16 text-slate-400 animate-pulse drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                    </div>

                    {/* MAIN CLOCK DISPLAY */}
                    <div className="relative z-10 w-full flex flex-col items-center justify-center flex-1 min-h-0 px-4">
                        <div className="absolute inset-0 bg-slate-500/5 blur-3xl rounded-full scale-150 pointer-events-none"></div>

                        {clockFace === 'flip' ? (
                            <div className="scale-75 md:scale-100 lg:scale-125 transition-transform duration-500">
                                <FlipClock elapsed={elapsed} />
                            </div>
                        ) : clockFace === 'minimal' ? (
                            <h2 className="text-white font-light tracking-wide font-sans leading-none select-none relative z-10 text-center transition-all duration-500"
                                style={{ fontSize: 'clamp(5rem, 15vw, 12rem)', textShadow: '0 0 50px rgba(255,255,255,0.1)' }}>
                                {formatTime(elapsed)}
                            </h2>
                        ) : (
                            <div className="flex flex-col items-center justify-center font-mono select-none">
                                <div className="text-emerald-500/50 text-sm md:text-xl mb-2 md:mb-6 tracking-[0.2em] uppercase typing-effect overflow-hidden whitespace-nowrap border-r-2 border-emerald-500/50 pr-1 animate-typing">
                                    System.Override(ACTIVE)
                                </div>
                                <div className="relative group">
                                    <h2 className="text-emerald-400 font-bold tracking-tighter leading-none relative z-10 text-center transition-all duration-500 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]"
                                        style={{ fontSize: 'clamp(4rem, 20vw, 12rem)', fontFamily: "'Courier New', Courier, monospace" }}>
                                        <span className="text-emerald-700/50 text-[0.4em] mr-4 align-middle opacity-50">{'>'}</span>
                                        {formatTime(elapsed)}
                                        <span className="animate-[pulse_1s_steps(2)_infinite] ml-2 inline-block w-[0.1em] h-[0.8em] bg-emerald-500 align-middle shadow-[0_0_10px_#34d399]"></span>
                                    </h2>
                                    <div className="scanlines-layer absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                                </div>
                                <div className="mt-8 flex gap-8 text-emerald-800 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-70">
                                    <span className="hidden md:inline">PID: 8492</span>
                                    <span>SECURE_SHELL</span>
                                    <span className="text-emerald-600 animate-pulse">ENCRYPTED</span>
                                </div>
                            </div>
                        )}

                        <QuoteWidget
                            className="mt-8 md:mt-16 max-w-3xl px-8 items-center opacity-80"
                            textClass="text-center text-slate-400 text-lg md:text-xl font-light tracking-wider"
                            authorClass="justify-center mt-3 opacity-70"
                        />
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="relative z-10 shrink-0 mb-8 md:mb-0">
                        <button
                            onClick={onTerminate}
                            className="group flex items-center gap-4 px-10 py-5 md:px-16 md:py-8 bg-red-600 hover:bg-red-500/90 text-white rounded-2xl transition-all shadow-[0_10px_40px_-10px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 border border-red-500/30"
                        >
                            <Square className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                            <span className="font-bold text-lg md:text-xl uppercase tracking-[0.2em] drop-shadow-none">Terminate</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
