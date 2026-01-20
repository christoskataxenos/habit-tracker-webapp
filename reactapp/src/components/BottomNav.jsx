import React from 'react';
import { LayoutDashboard, Zap, Database, FilePlus2, BarChart3 } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onFocusClick, onManualLogClick, onDataClick }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-2xl border-t border-white/5 z-40 flex items-center justify-around px-6 pb-2 safe-area-pb">
            <button
                onClick={() => onTabChange('dashboard')}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
            >
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Dash</span>
            </button>

            <button
                onClick={() => onDataClick('vault')}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-all"
            >
                <Database className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Vault</span>
            </button>

            {/* Prominent Center Focus Button */}
            <div className="relative -top-8">
                <button
                    onClick={onFocusClick}
                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.6)] border border-blue-400/50 hover:scale-110 transition-transform active:scale-90 group"
                >
                    <div className="-rotate-45 flex flex-col items-center">
                        <Zap className="w-6 h-6 text-white fill-current group-hover:animate-pulse" />
                    </div>
                </button>
            </div>

            <button
                onClick={onManualLogClick}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-all"
            >
                <FilePlus2 className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add</span>
            </button>

            <button
                onClick={() => onDataClick('stats')}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-all"
            >
                <BarChart3 className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Stats</span>
            </button>
        </nav>
    );
}
