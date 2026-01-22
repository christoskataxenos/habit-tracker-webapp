import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Single Digit Flip Component
const FlipDigit = ({ digit, label }) => {
    // We split the digit (e.g., "5") into previous and current for animation
    // Simplified for React: just animate the number change
    return (
        <div className="flex flex-col items-center mx-1 md:mx-2">
            <div className="relative w-16 h-24 md:w-24 md:h-36 bg-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden border border-white/10">
                {/* Top Half */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#252525] border-b border-black/50 overflow-hidden flex items-end justify-center">
                    <span className="text-5xl md:text-7xl font-mono text-white translate-y-[50%] font-bold">{digit}</span>
                </div>
                {/* Bottom Half */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#202020] overflow-hidden flex items-start justify-center">
                    <span className="text-5xl md:text-7xl font-mono text-white -translate-y-[50%] font-bold">{digit}</span>
                </div>

                {/* Visual Line */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black/80 z-20"></div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            </div>
            {label && <span className="mt-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>}
        </div>
    );
};

// Separator
const Separator = () => (
    <div className="flex flex-col gap-2 md:gap-4 mt-[-20px]">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500/50 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
        <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500/50 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
    </div>
);

export default function FlipClock({ elapsed }) {
    // Format elapsed seconds into HH MM SS strings
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');

    return (
        <div className="flex items-center justify-center p-8 bg-black/40 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
            <FlipDigit digit={h[0]} />
            <FlipDigit digit={h[1]} label="HOURS" />

            <div className="mx-2 md:mx-4"><Separator /></div>

            <FlipDigit digit={m[0]} />
            <FlipDigit digit={m[1]} label="MINUTES" />

            <div className="mx-2 md:mx-4"><Separator /></div>

            <FlipDigit digit={s[0]} />
            <FlipDigit digit={s[1]} label="SECONDS" />
        </div>
    );
}
