import { useState, useEffect, useRef } from 'react';

export const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [hasSupport] = useState(() => typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window));
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (hasSupport) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
        }
    }, [hasSupport]);

    const startListening = (onResult) => {
        if (!recognitionRef.current) return;
        setIsListening(true);
        recognitionRef.current.onresult = (event) => { onResult(event.results[0][0].transcript); setIsListening(false); };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.start();
    };

    const stopListening = () => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); };

    return { isListening, startListening, stopListening, hasSupport };
};
