// ====================
// PULSE V2 - Data Migration Utility
// Μεταφορά δεδομένων από localStorage σε IndexedDB
// ====================
import { db, dbEntries, dbRoutines, dbSettings } from './index';
import type { Entry, Routine } from '../types';

// --- Παλιά κλειδιά localStorage (V1) ---
const V1_KEYS = {
    ENTRIES: 'toon_study_tracker_v1',
    ROUTINES: 'pulse_routines_v1',
    DAILY_GOAL: 'ascend_daily_goal',
    COURSE_GOALS: 'pulse_course_goals_v1',
    PREFERENCES: 'pulse_preferences',
    TERMS_ACCEPTED: 'pulse_terms_accepted_version'
};

// --- Νέα κλειδιά (V2 Zustand) ---
const V2_KEYS = {
    ENTRIES: 'pulse_entries_v2',
    SETTINGS: 'pulse_settings_v2',
    ROUTINES: 'pulse_routines_v2'
};

// --- Migration Status ---
const MIGRATION_KEY = 'pulse_migration_completed';

interface MigrationResult {
    success: boolean;
    entriesMigrated: number;
    routinesMigrated: number;
    errors: string[];
}

// --- Έλεγχος αν χρειάζεται migration ---
export const needsMigration = (): boolean => {
    const migrationDone = localStorage.getItem(MIGRATION_KEY);
    if (migrationDone === 'true') return false;

    // Έλεγχος αν υπάρχουν παλιά δεδομένα
    const hasV1Entries = localStorage.getItem(V1_KEYS.ENTRIES) !== null;
    const hasV2Entries = localStorage.getItem(V2_KEYS.ENTRIES) !== null;

    return hasV1Entries || hasV2Entries;
};

// --- Κύρια Συνάρτηση Migration ---
export const migrateToIndexedDB = async (): Promise<MigrationResult> => {
    const result: MigrationResult = {
        success: false,
        entriesMigrated: 0,
        routinesMigrated: 0,
        errors: []
    };

    try {
        // 1. Migrate Entries
        let entries: Entry[] = [];

        // Δοκιμή πρώτα V2 keys (Zustand), μετά V1
        const v2EntriesRaw = localStorage.getItem(V2_KEYS.ENTRIES);
        const v1EntriesRaw = localStorage.getItem(V1_KEYS.ENTRIES);

        if (v2EntriesRaw) {
            try {
                const parsed = JSON.parse(v2EntriesRaw);
                entries = parsed.state?.entries || [];
            } catch (e) {
                result.errors.push(`Failed to parse V2 entries: ${e}`);
            }
        } else if (v1EntriesRaw) {
            try {
                entries = JSON.parse(v1EntriesRaw);
            } catch (e) {
                result.errors.push(`Failed to parse V1 entries: ${e}`);
            }
        }

        if (entries.length > 0) {
            await dbEntries.bulkAdd(entries);
            result.entriesMigrated = entries.length;
        }

        // 2. Migrate Routines
        let routines: Routine[] = [];

        const v2RoutinesRaw = localStorage.getItem(V2_KEYS.ROUTINES);
        const v1RoutinesRaw = localStorage.getItem(V1_KEYS.ROUTINES);

        if (v2RoutinesRaw) {
            try {
                const parsed = JSON.parse(v2RoutinesRaw);
                routines = parsed.state?.routines || [];
            } catch (e) {
                result.errors.push(`Failed to parse V2 routines: ${e}`);
            }
        } else if (v1RoutinesRaw) {
            try {
                routines = JSON.parse(v1RoutinesRaw);
            } catch (e) {
                result.errors.push(`Failed to parse V1 routines: ${e}`);
            }
        }

        if (routines.length > 0) {
            for (const routine of routines) {
                await db.routines.put(routine);
            }
            result.routinesMigrated = routines.length;
        }

        // 3. Migrate Settings
        const dailyGoal = localStorage.getItem(V1_KEYS.DAILY_GOAL);
        if (dailyGoal) {
            await dbSettings.set('dailyGoal', parseFloat(dailyGoal));
        }

        const courseGoals = localStorage.getItem(V1_KEYS.COURSE_GOALS);
        if (courseGoals) {
            try {
                await dbSettings.set('courseGoals', JSON.parse(courseGoals));
            } catch (e) {
                result.errors.push(`Failed to parse course goals: ${e}`);
            }
        }

        const preferences = localStorage.getItem(V1_KEYS.PREFERENCES);
        if (preferences) {
            try {
                await dbSettings.set('preferences', JSON.parse(preferences));
            } catch (e) {
                result.errors.push(`Failed to parse preferences: ${e}`);
            }
        }

        // Σημείωση ότι ολοκληρώθηκε το migration
        localStorage.setItem(MIGRATION_KEY, 'true');
        result.success = true;

    } catch (error) {
        result.errors.push(`Migration failed: ${error}`);
    }

    return result;
};

// --- Καθαρισμός παλιών localStorage δεδομένων (εκτελείται μετά το migration) ---
export const cleanupLegacyStorage = (): void => {
    // Προσοχή: Καλείται μόνο αφού επιβεβαιωθεί ότι το migration ήταν επιτυχές
    Object.values(V1_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    Object.values(V2_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    console.log('[Migration] Legacy localStorage data cleaned up');
};

// --- Export για TOON format ---
export const exportToTOON = async (): Promise<string> => {
    const entries = await dbEntries.getAll();
    const routines = await dbRoutines.getAll();

    // Δομή δεδομένων για TOON export
    const data = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        entries,
        routines,
        settings: {
            dailyGoal: await dbSettings.get('dailyGoal', 4),
            courseGoals: await dbSettings.get('courseGoals', {})
        }
    };

    // Για τώρα επιστρέφουμε JSON - το TOON encoding θα γίνει αργότερα
    return JSON.stringify(data, null, 2);
};

// --- Import από TOON format ---
export const importFromTOON = async (toonData: string): Promise<MigrationResult> => {
    const result: MigrationResult = {
        success: false,
        entriesMigrated: 0,
        routinesMigrated: 0,
        errors: []
    };

    try {
        const data = JSON.parse(toonData);

        if (data.entries && Array.isArray(data.entries)) {
            await dbEntries.bulkAdd(data.entries);
            result.entriesMigrated = data.entries.length;
        }

        if (data.routines && Array.isArray(data.routines)) {
            for (const routine of data.routines) {
                await db.routines.put(routine);
            }
            result.routinesMigrated = data.routines.length;
        }

        if (data.settings) {
            if (data.settings.dailyGoal) {
                await dbSettings.set('dailyGoal', data.settings.dailyGoal);
            }
            if (data.settings.courseGoals) {
                await dbSettings.set('courseGoals', data.settings.courseGoals);
            }
        }

        result.success = true;
    } catch (error) {
        result.errors.push(`Import failed: ${error}`);
    }

    return result;
};
