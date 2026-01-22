import React from 'react';

const UltraLogo = () => (
    <div className="relative w-10 h-10 flex items-center justify-center opacity-90">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full relative z-10">
            {/* The Shape: Standard (Dark Mode) uses Platinum. Light Mode override via CSS class. */}
            <path className="fill-platinum" d="M50 10 C50 10, 55 45, 90 50 C55 55, 50 90, 50 90 C50 90, 45 55, 10 50 C45 45, 50 10, 50 10 Z" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <defs>
                <linearGradient id="platinumGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                {/* Dark Gradient for Light Mode */}
                <linearGradient id="obsidianGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
            </defs>
            <style>{`
                .fill-platinum { fill: url(#platinumGradient); }
                .light .fill-platinum { fill: url(#obsidianGradient) !important; stroke: rgba(0,0,0,0.2) !important; }
            `}</style>
        </svg>
    </div>
);

export default UltraLogo;
