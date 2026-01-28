// ====================
// PULSE V2 - Routine Store (Zustand)
// Διαχείριση επαναλαμβανόμενων ρουτινών/συνηθειών
// ====================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Routine } from '../types';

// --- Κλειδί αποθήκευσης ---
const ROUTINES_KEY = 'pulse_routines_v2';

// --- Interface για το State του Store ---
interface RoutineState {
    routines: Routine[];

    // Actions
    addRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => void;
    updateRoutine: (id: string, updatedFields: Partial<Routine>) => void;
    deleteRoutine: (id: string) => void;
    toggleRoutine: (id: string) => void;
}

// --- Zustand Store με Persistence ---
export const useRoutineStore = create<RoutineState>()(
    persist(
        (set) => ({
            routines: [],

            // Προσθήκη νέας ρουτίνας
            addRoutine: (routine) => set((state) => ({
                routines: [
                    ...state.routines,
                    {
                        ...routine,
                        id: crypto.randomUUID(),
                        createdAt: Date.now(),
                    },
                ],
            })),

            // Ενημέρωση ρουτίνας
            updateRoutine: (id, updatedFields) => set((state) => ({
                routines: state.routines.map((r) =>
                    r.id === id ? { ...r, ...updatedFields } : r
                ),
            })),

            // Διαγραφή ρουτίνας
            deleteRoutine: (id) => set((state) => ({
                routines: state.routines.filter((r) => r.id !== id),
            })),

            // Toggle ενεργοποίηση/απενεργοποίηση
            toggleRoutine: (id) => set((state) => ({
                routines: state.routines.map((r) =>
                    r.id === id ? { ...r, isActive: !r.isActive } : r
                ),
            })),
        }),
        {
            name: ROUTINES_KEY,
        }
    )
);
