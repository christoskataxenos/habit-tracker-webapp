import React from 'react';
import { X, Moon, Sun, Monitor, Clock, Check } from 'lucide-react';

const CLOCK_FACES = [
    { id: 'standard', name: 'Terminal Link', desc: 'Raw console hacking interface' },
    { id: 'flip', name: 'Retro', desc: 'Mechanical split-flap aesthetic' },
    { id: 'minimal', name: 'Zen Minimal', desc: 'Clean typography only' },
];

export default function SettingsModal({ isOpen, onClose, preferences, updatePreferences }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div id="settings-modal-panel" className="w-full max-w-2xl glass-silver p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl text-platinum mb-8 font-light tracking-tight flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-slate-600"></span>
                    System Preferences
                </h2>

                <div className="space-y-8">
                    {/* VISUAL THEME */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Monitor className="w-3 h-3" /> Interface Theme
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => updatePreferences('theme', 'dark')}
                                className={`p-4 rounded-xl border border-white/10 flex flex-col gap-3 text-left transition-all group ${preferences.theme === 'dark' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-black/20 hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between w-full">
                                    <div className="p-2 bg-black rounded-lg text-slate-200"><Moon className="w-5 h-5" /></div>
                                    {preferences.theme === 'dark' && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Dark Protocol</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Default</div>
                                </div>
                            </button>

                            <button
                                onClick={() => updatePreferences('theme', 'light')}
                                className={`p-4 rounded-xl border border-white/10 flex flex-col gap-3 text-left transition-all group ${preferences.theme === 'light' ? 'bg-white/90 border-transparent' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                <div className="flex justify-between w-full">
                                    <div className="p-2 bg-slate-200 rounded-lg text-slate-800"><Sun className="w-5 h-5" /></div>
                                    {preferences.theme === 'light' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>}
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${preferences.theme === 'light' ? 'text-black' : 'text-slate-300'}`}>Light Mode</div>
                                    <div className={`text-[10px] uppercase tracking-wider ${preferences.theme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>Beta</div>
                                </div>
                            </button>

                            <button
                                onClick={() => updatePreferences('theme', 'system')}
                                className={`p-4 rounded-xl border border-white/10 flex flex-col gap-3 text-left transition-all group ${preferences.theme === 'system' ? 'bg-purple-600/20 border-purple-500/50' : 'bg-black/20 hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between w-full">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-200"><Monitor className="w-5 h-5" /></div>
                                    {preferences.theme === 'system' && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]"></div>}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">System Sync</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Auto-Detect</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* CLOCK FACES */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Focus Matrix Style
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {CLOCK_FACES.map(face => (
                                <button
                                    key={face.id}
                                    onClick={() => updatePreferences('clockFace', face.id)}
                                    className={`relative p-4 rounded-xl border text-left transition-all ${preferences.clockFace === face.id
                                        ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                                        : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                                >
                                    <div className="text-sm font-bold text-platinum mb-1">{face.name}</div>
                                    <div className="text-[10px] text-slate-500 leading-tight">{face.desc}</div>
                                    {preferences.clockFace === face.id && (
                                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest font-mono">
                    <span>Pulse v1.5.0 "Frost & Silver"</span>
                </div>
            </div>
        </div>
    );
}
