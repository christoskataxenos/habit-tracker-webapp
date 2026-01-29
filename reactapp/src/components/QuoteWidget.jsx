import React, { useState, useEffect, useRef } from 'react';
import { quotes } from '../data/quotes';

// Helper: Fisher-Yates Shuffle
const getShuffledIndices = (length) => {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
};

export default function QuoteWidget({
    className = "",
    textClass = "text-slate-400 text-right",
    authorClass = ""
}) {
    // 1. Initial Shuffle (Safe for render via useMemo)
    const initialDeck = React.useMemo(() => getShuffledIndices(quotes.length), []);

    // 2. Refs to maintain the shuffle deck state across rotations
    const deckRef = useRef(initialDeck);
    const pointerRef = useRef(1);

    const [currentQuote, setCurrentQuote] = useState(quotes[initialDeck[0]] || { text: "Keep pushing.", author: "System" });
    const [isVisible, setIsVisible] = useState(true);

    const pickNextQuote = () => {
        if (!quotes || quotes.length === 0) return { text: "No quotes found.", author: "System" };

        // Initialize or Refill Deck if empty/exhausted
        if (deckRef.current.length === 0 || pointerRef.current >= deckRef.current.length) {
            deckRef.current = getShuffledIndices(quotes.length);
            pointerRef.current = 0;
            // console.log("Quote Deck Shuffled/Refilled");
        }

        const quoteIndex = deckRef.current[pointerRef.current];
        pointerRef.current++;
        return quotes[quoteIndex];
    };

    useEffect(() => {
        // Setup Rotation Timer
        const interval = setInterval(() => {
            setIsVisible(false); // Start fade out

            // Wait for fade out to complete before changing text
            setTimeout(() => {
                const nextQ = pickNextQuote();
                setCurrentQuote(nextQ);
                setIsVisible(true); // Fade in
            }, 500); // 500ms matches CSS transition duration

        }, 60000); // 1 Minute Interval

        return () => clearInterval(interval);
    }, []);

    if (!currentQuote) return null;

    return (
        <div className={`flex flex-col transition-opacity duration-1000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}>
            <p className={`font-light italic text-sm tracking-wide leading-relaxed drop-shadow-md ${textClass}`}>
                "{currentQuote.text}"
            </p>
            <div className={`flex items-center gap-2 mt-1 ${authorClass}`}>
                <div className="h-[1px] w-8 bg-slate-700/50"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                    {currentQuote.author}
                </span>
            </div>
        </div>
    );
}
