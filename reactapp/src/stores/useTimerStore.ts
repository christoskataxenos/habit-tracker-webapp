import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveSession {
    course: string;
    tag: string;
}

interface TimerState {
    isActive: boolean;
    startTime: number | null; // Timestamp when current segment started
    elapsedTime: number; // Accumulated time in ms before current segment
    activeSession: ActiveSession | null;

    startTimer: (course: string, tag: string) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    stopTimer: () => void; // Clears state
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            isActive: false,
            startTime: null,
            elapsedTime: 0,
            activeSession: null,

            startTimer: (course, tag) => set({
                isActive: true,
                startTime: Date.now(),
                elapsedTime: 0, // Reset elapsed on fresh start
                activeSession: { course, tag }
            }),

            pauseTimer: () => {
                const { startTime, elapsedTime, isActive } = get();
                if (isActive && startTime) {
                    const currentSegment = Math.max(0, Date.now() - startTime);
                    set({
                        isActive: false,
                        startTime: null,
                        elapsedTime: elapsedTime + currentSegment
                    });
                }
            },

            resumeTimer: () => set({
                isActive: true,
                startTime: Date.now()
            }),

            stopTimer: () => set({
                isActive: false,
                startTime: null,
                elapsedTime: 0,
                activeSession: null
            })
        }),
        {
            name: 'pulse_timer_state', // LocalStorage key
            // We want this to persist across tabs/windows
        }
    )
);
