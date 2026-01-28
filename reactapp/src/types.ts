// ====================
// PULSE V2 - Κεντρικά Interfaces
// Αυτό το αρχείο περιέχει όλους τους τύπους δεδομένων της εφαρμογής.
// ====================

// --- Βασική Καταχώρηση (Entry) ---
// Αντιπροσωπεύει μία συνεδρία εργασίας/μελέτης
export interface Entry {
    id: string;                 // UUID μοναδικό αναγνωριστικό
    date: string;               // Μορφή YYYY-MM-DD
    course: string;             // Τίτλος μαθήματος/project
    tag: string;                // Κατηγορία: "Deep Work" | "Build" | "Learn" | "Health" | "Life"
    startTime: string;          // Μορφή HH:MM (24ωρο)
    endTime: string;            // Μορφή HH:MM (24ωρο)
    hours: number;              // Υπολογισμένη διάρκεια σε ώρες
    focusScore?: number;        // Βαθμολογία εστίασης 1-10 (προαιρετικό)
    notes?: string;             // Σημειώσεις χρήστη
    timestamp: number;          // Unix timestamp δημιουργίας
}

// --- Ρουτίνα (Recurring Task) ---
// Επαναλαμβανόμενες εργασίες/συνήθειες
export interface Routine {
    id: string;
    name: string;               // Τίτλος ρουτίνας
    course: string;             // Σχετικό μάθημα/project
    tag: string;
    scheduledTime: string;      // Ώρα εκτέλεσης HH:MM
    daysOfWeek: number[];       // Ημέρες εβδομάδας (0=Κυριακή, 6=Σάββατο)
    duration: number;           // Εκτιμώμενη διάρκεια σε ώρες
    isActive: boolean;
    createdAt: number;
}

// --- Στόχοι Μαθήματος ---
export interface CourseGoals {
    [courseName: string]: number;   // Στόχος ωρών ανά μάθημα
}

// --- Βασικά Στατιστικά ---
export interface Stats {
    totalHours: number;
    count: number;
    courseData: CourseProgress[];
    xp: number;
    level: number;
    progress: number;           // Ποσοστό προόδου επιπέδου (0-100)
    xpToNext: number;
    rank: Rank;
    badges: Badge[];
    currentStreak: number;
    maxStreak: number;
}

// --- Πρόοδος Μαθήματος ---
export interface CourseProgress {
    name: string;
    hours: number;
    goal: number;
}

// --- Βαθμίδες (Ranks) ---
export type Rank = "NOVICE" | "APPRENTICE" | "ADEPT" | "EXPERT" | "ARCHITECT";

// --- Badges ---
export interface Badge {
    id: string;
    name: string;
    icon: string;               // lucide-react icon name
    desc: string;
}

// --- Ετικέτες (Tags) ---
export type Tag = "Deep Work" | "Build" | "Learn" | "Health" | "Life";

// --- Θέμα (Theme) ---
export type Theme = "dark" | "light" | "system";

// --- Ρυθμίσεις Χρήστη ---
export interface UserSettings {
    theme: Theme;
    clockStyle: "digital" | "retro";
    dailyGoal: number;
    showAnimations: boolean;
}
