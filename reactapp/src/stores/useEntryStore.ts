// ====================
// PULSE V2 - Entry Store (Zustand)
// Διαχείριση καταχωρήσεων συνεδριών μελέτης/εργασίας
// ====================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Entry } from '../types';

// --- Κλειδί αποθήκευσης στο LocalStorage ---
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'pulse_entries_v2';

// --- Interface για το State του Store ---
interface EntryState {
    // Δεδομένα
    entries: Entry[];

    // Actions
    addEntry: (entry: Omit<Entry, 'id' | 'timestamp'>) => void;
    updateEntry: (id: string, updatedFields: Partial<Entry>) => void;
    deleteEntry: (id: string) => void;
    importEntries: (newEntries: Entry[]) => void;
    clearAllEntries: () => void;
}

// --- Zustand Store με Persistence ---
export const useEntryStore = create<EntryState>()(
    persist(
        (set) => ({
            // Αρχικό state
            entries: [],

            // Προσθήκη νέας καταχώρησης
            addEntry: (entry) => set((state) => ({
                entries: [
                    {
                        ...entry,
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                    },
                    ...state.entries,
                ],
            })),

            // Ενημέρωση υπάρχουσας καταχώρησης
            updateEntry: (id, updatedFields) => set((state) => ({
                entries: state.entries.map((e) =>
                    e.id === id ? { ...e, ...updatedFields } : e
                ),
            })),

            // Διαγραφή καταχώρησης
            deleteEntry: (id) => set((state) => ({
                entries: state.entries.filter((e) => e.id !== id),
            })),

            // Εισαγωγή πολλαπλών καταχωρήσεων (για restore/import)
            importEntries: (newEntries) => set((state) => {
                // Αποφυγή διπλοτύπων με βάση το ID
                const existingIds = new Set(state.entries.map((e) => e.id));
                const uniqueNewEntries = newEntries.filter((e) => !existingIds.has(e.id));
                return { entries: [...uniqueNewEntries, ...state.entries] };
            }),

            // Καθαρισμός όλων των δεδομένων
            clearAllEntries: () => set({ entries: [] }),
        }),
        {
            name: STORAGE_KEY, // Όνομα στο localStorage
        }
    )
);
