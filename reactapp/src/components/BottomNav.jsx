import React from 'react';
import { LayoutDashboard, Zap, FilePlus2, BarChart3, Settings, ExternalLink } from 'lucide-react';

export default function BottomNav({ onFocusClick, onManualLogClick, onDataClick, onSettingsClick }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-2xl border-t border-white/5 z-40 flex items-center justify-around px-6 pb-2 safe-area-pb">
            {/* 1. HUD POP-OUT */}
            <button
                onClick={() => window.open('#/hud', 'PulseHUD', 'width=320,height=220,menubar=no,toolbar=no,location=no,status=no')}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-cyan-400 transition-all group"
            >
                <ExternalLink className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">HUD</span>
            </button>

            {/* 2. ANALYTICS (Combines Stats + Vault) */}
            <button
                onClick={() => onDataClick('stats')}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-all"
            >
                <BarChart3 className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Stats</span>
            </button>

            {/* 3. FOCUS (Center) - Silver Edition */}
            <div className="relative -top-8 flex flex-col items-center group/main">
                <button
                    onClick={onFocusClick}
                    aria-label="Toggle Focus Mode"
                    className="w-16 h-16 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/50 hover:scale-110 transition-transform active:scale-90 group"
                >
                    <div className="-rotate-45 flex flex-col items-center">
                        <Zap className="w-6 h-6 text-slate-900 fill-current group-hover:animate-pulse" />
                    </div>
                </button>
            </div>

            {/* 4. ADD ENTRY */}
            <button
                onClick={onManualLogClick}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-all"
            >
                <FilePlus2 className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add</span>
            </button>

            {/* 5. SETTINGS */}
            <button
                onClick={onSettingsClick}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-all"
            >
                <Settings className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Setup</span>
            </button>
        </nav>
    );
}
