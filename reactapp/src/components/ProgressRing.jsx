import React from 'react';

const ProgressRing = ({ progress, size = 120, stroke = 8 }) => {
    const radius = size / 2 - stroke;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} fill="transparent" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#blueGradient)" strokeWidth={stroke} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default ProgressRing;
