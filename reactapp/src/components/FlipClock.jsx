// Single Digit Flip Component (Pure, No Labels)
const FlipDigit = ({ digit }) => {
    return (
        <div className="flex flex-col items-center mx-1 md:mx-2">
            <div className="flip-card relative w-16 h-24 md:w-24 md:h-36 bg-zinc-900 rounded-lg shadow-2xl overflow-hidden border border-white/10 transition-colors duration-500">
                {/* Top Half (Now Full Height Visual) */}
                <div className="flip-card-top absolute inset-0 bg-zinc-800 flex items-center justify-center transition-colors duration-500">
                    <span className="flip-text text-5xl md:text-7xl font-sans text-white font-light tracking-wide transition-colors duration-500">{digit}</span>
                </div>

                {/* Shine effect (Subtle) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};

// Separator (Minimal Dots)
const Separator = () => (
    <div className="flex flex-col gap-3 md:gap-5 pb-2">
        <div className="flip-dot w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-500/50 rounded-full"></div>
        <div className="flip-dot w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-500/50 rounded-full"></div>
    </div>
);

export default function FlipClock({ elapsed }) {
    // Format elapsed seconds into HH MM SS strings
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');

    return (
        <div className="flip-container flex items-center justify-center p-6 md:p-10 bg-black/40 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl transition-colors duration-500">
            <div className="flex items-center">
                <FlipDigit digit={h[0]} />
                <FlipDigit digit={h[1]} />
            </div>

            <div className="mx-2 md:mx-4"><Separator /></div>

            <div className="flex items-center">
                <FlipDigit digit={m[0]} />
                <FlipDigit digit={m[1]} />
            </div>

            <div className="mx-2 md:mx-4"><Separator /></div>

            <div className="flex items-center">
                <FlipDigit digit={s[0]} />
                <FlipDigit digit={s[1]} />
            </div>
        </div>
    );
}
