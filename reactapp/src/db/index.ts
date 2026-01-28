// ====================
// PULSE V2 - IndexedDB Database (Dexie)
// Κεντρική βάση δεδομένων για entries, routines, settings
// ====================
import Dexie, { type Table } from 'dexie';
import type { Entry, Routine } from '../types';

// --- Επέκταση του Entry interface για την DB ---
export interface DBEntry extends Entry {
    // Το id είναι ήδη στο Entry, αλλά εδώ είναι το primary key
}

// --- Επέκταση του Routine interface για την DB ---
export interface DBRoutine extends Routine {
    // Το id είναι ήδη στο Routine
}

// --- Settings Table ---
export interface DBSetting {
    key: string;
    value: string | number | boolean | object;
}

// --- Dexie Database Class ---
class PulseDatabase extends Dexie {
    // Δηλώνουμε τα tables
    entries!: Table<DBEntry, string>;     // Primary key: string (id)
    routines!: Table<DBRoutine, string>;  // Primary key: string (id)
    settings!: Table<DBSetting, string>;  // Primary key: string (key)

    constructor() {
        super('PulseDB');

        // Schema Definition - Version 1
        this.version(1).stores({
            // Indexes: id (primary), date, course, tag, timestamp
            entries: 'id, date, course, tag, timestamp',
            // Indexes: id (primary), course, isActive
            routines: 'id, course, isActive',
            // Indexes: key (primary)
            settings: 'key'
        });
    }
}

// --- Singleton Instance ---
export const db = new PulseDatabase();

// --- Helper Functions ---

// Entries
export const dbEntries = {
    // Προσθήκη νέας καταχώρησης
    async add(entry: Omit<Entry, 'id' | 'timestamp'>): Promise<string> {
        const id = crypto.randomUUID();
        await db.entries.add({
            ...entry,
            id,
            timestamp: Date.now(),
        });
        return id;
    },

    // Ενημέρωση
    async update(id: string, changes: Partial<Entry>): Promise<void> {
        await db.entries.update(id, changes);
    },

    // Διαγραφή
    async delete(id: string): Promise<void> {
        await db.entries.delete(id);
    },

    // Λήψη όλων
    async getAll(): Promise<DBEntry[]> {
        return db.entries.orderBy('timestamp').reverse().toArray();
    },

    // Λήψη κατά ημερομηνία
    async getByDate(date: string): Promise<DBEntry[]> {
        return db.entries.where('date').equals(date).toArray();
    },

    // Λήψη κατά εύρος ημερομηνιών
    async getByDateRange(startDate: string, endDate: string): Promise<DBEntry[]> {
        return db.entries
            .where('date')
            .between(startDate, endDate, true, true)
            .toArray();
    },

    // Λήψη κατά μάθημα
    async getByCourse(course: string): Promise<DBEntry[]> {
        return db.entries.where('course').equals(course).toArray();
    },

    // Μετρητής
    async count(): Promise<number> {
        return db.entries.count();
    },

    // Καθαρισμός όλων
    async clear(): Promise<void> {
        await db.entries.clear();
    },

    // Bulk import (για migration)
    async bulkAdd(entries: DBEntry[]): Promise<void> {
        await db.entries.bulkPut(entries);
    }
};

// Routines
export const dbRoutines = {
    async add(routine: Omit<Routine, 'id' | 'createdAt'>): Promise<string> {
        const id = crypto.randomUUID();
        await db.routines.add({
            ...routine,
            id,
            createdAt: Date.now(),
        });
        return id;
    },

    async update(id: string, changes: Partial<Routine>): Promise<void> {
        await db.routines.update(id, changes);
    },

    async delete(id: string): Promise<void> {
        await db.routines.delete(id);
    },

    async getAll(): Promise<DBRoutine[]> {
        return db.routines.toArray();
    },

    async getActive(): Promise<DBRoutine[]> {
        return db.routines.where('isActive').equals(1).toArray();
    }
};

// Settings
export const dbSettings = {
    async get<T>(key: string, defaultValue: T): Promise<T> {
        const setting = await db.settings.get(key);
        return setting ? (setting.value as T) : defaultValue;
    },

    async set(key: string, value: string | number | boolean | object): Promise<void> {
        await db.settings.put({ key, value });
    },

    async delete(key: string): Promise<void> {
        await db.settings.delete(key);
    }
};

export default db;
