// ====================
// PULSE V2 - Settings Store (Zustand)
// Διαχείριση ρυθμίσεων χρήστη (θέμα, στόχοι, κτλ)
// ====================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, UserSettings, CourseGoals } from '../types';

// --- Κλειδιά αποθήκευσης ---
const SETTINGS_KEY = 'pulse_settings_v2';

// --- Interface για το State του Store ---
interface SettingsState extends UserSettings {
    // Στόχοι ανά μάθημα
    courseGoals: CourseGoals;

    // Actions
    setTheme: (theme: Theme) => void;
    setClockStyle: (style: 'digital' | 'retro') => void;
    setDailyGoal: (goal: number) => void;
    setShowAnimations: (show: boolean) => void;
    setCourseGoal: (course: string, target: number) => void;
    resetSettings: () => void;
}

// --- Προεπιλεγμένες ρυθμίσεις ---
const defaultSettings: UserSettings & { courseGoals: CourseGoals } = {
    theme: 'dark',
    clockStyle: 'digital',
    dailyGoal: 4, // Ώρες ανά ημέρα
    showAnimations: true,
    courseGoals: {},
};

// --- Zustand Store με Persistence ---
export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            // Αλλαγή θέματος
            setTheme: (theme) => set({ theme }),

            // Αλλαγή στυλ ρολογιού
            setClockStyle: (clockStyle) => set({ clockStyle }),

            // Ορισμός ημερήσιου στόχου
            setDailyGoal: (dailyGoal) => set({ dailyGoal }),

            // Ενεργοποίηση/απενεργοποίηση animations
            setShowAnimations: (showAnimations) => set({ showAnimations }),

            // Ορισμός στόχου για συγκεκριμένο μάθημα
            setCourseGoal: (course, target) => set((state) => ({
                courseGoals: {
                    ...state.courseGoals,
                    [course]: target,
                },
            })),

            // Επαναφορά στις προεπιλογές
            resetSettings: () => set(defaultSettings),
        }),
        {
            name: SETTINGS_KEY,
        }
    )
);
