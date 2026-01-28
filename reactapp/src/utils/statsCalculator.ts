// ====================
// PULSE V2 - Stats Calculator
// Υπολογισμός στατιστικών, XP, Level, Badges
// ====================
import type { Entry, Stats, Badge, Rank, CourseProgress, CourseGoals } from '../types';

// --- Υπολογισμός Rank βάσει Level ---
const getRank = (level: number): Rank => {
    if (level >= 100) return 'ARCHITECT';
    if (level >= 50) return 'EXPERT';
    if (level >= 25) return 'ADEPT';
    if (level >= 10) return 'APPRENTICE';
    return 'NOVICE';
};

// --- Υπολογισμός Streak (συνεχόμενες ημέρες) ---
const calculateStreak = (entries: Entry[]): { currentStreak: number; maxStreak: number } => {
    const sortedDates = [...new Set(entries.map((e) => e.date))].sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    if (sortedDates.length === 0) {
        return { currentStreak: 0, maxStreak: 0 };
    }

    let maxStreak = 1;
    let streak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = new Date(sortedDates[i]);
        const d2 = new Date(sortedDates[i + 1]);
        const diffDays = Math.ceil(Math.abs(d1.getTime() - d2.getTime()) / 86400000);

        if (diffDays === 1) {
            streak++;
        } else {
            if (streak > maxStreak) maxStreak = streak;
            streak = 1;
        }
    }
    if (streak > maxStreak) maxStreak = streak;

    // Υπολογισμός τρέχοντος streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const d1 = new Date(sortedDates[i]);
            const d2 = new Date(sortedDates[i + 1]);
            const diffDays = Math.ceil(Math.abs(d1.getTime() - d2.getTime()) / 86400000);
            if (diffDays === 1) currentStreak++;
            else break;
        }
    }

    return { currentStreak, maxStreak };
};

// --- Υπολογισμός Badges ---
const calculateBadges = (entries: Entry[], dailyGoal: number): Badge[] => {
    const badges: Badge[] = [];

    // 1. UNIVERSAL BADGES
    // Early Bird: Session ended before 8:00 AM
    if (entries.some((e) => {
        const h = parseInt(e.endTime?.split(':')[0] || '99');
        return h < 8;
    })) {
        badges.push({ id: 'early_bird', name: 'Early Bird', icon: 'Sunrise', desc: 'Completed a session before 8 AM' });
    }

    // Night Owl: Session started after 11:00 PM or before 4:00 AM
    if (entries.some((e) => {
        const h = parseInt(e.startTime?.split(':')[0] || '12');
        return h >= 23 || h < 4;
    })) {
        badges.push({ id: 'night_owl', name: 'Night Owl', icon: 'Moon', desc: 'Completed a session late at night' });
    }

    // Marathoner: Single session > 3 hours
    if (entries.some((e) => e.hours >= 3)) {
        badges.push({ id: 'marathoner', name: 'Marathoner', icon: 'Flame', desc: 'Focused for over 3 hours in one go' });
    }

    // Streak Badges
    const { currentStreak } = calculateStreak(entries);
    if (currentStreak >= 3) badges.push({ id: 'streak_3', name: 'Heating Up', icon: 'Zap', desc: '3 Day Streak' });
    if (currentStreak >= 7) badges.push({ id: 'streak_7', name: 'On Fire', icon: 'Zap', desc: '7 Day Streak' });
    if (currentStreak >= 30) badges.push({ id: 'streak_30', name: 'Unstoppable', icon: 'Crown', desc: '30 Day Streak' });

    // Weekend Warrior
    const entriesByDate = entries.reduce<Record<string, number>>((acc, e) => {
        acc[e.date] = (acc[e.date] || 0) + e.hours;
        return acc;
    }, {});

    const hasWeekendWin = Object.entries(entriesByDate).some(([date, hours]) => {
        const d = new Date(date).getDay();
        return (d === 0 || d === 6) && hours >= dailyGoal;
    });
    if (hasWeekendWin) {
        badges.push({ id: 'weekend_warrior', name: 'Weekend Warrior', icon: 'Sword', desc: 'Hit daily goal on a weekend' });
    }

    // 2. ADAPTIVE BADGES (Tag Based)
    const hoursByTag = entries.reduce<Record<string, number>>((acc, e) => {
        acc[e.tag] = (acc[e.tag] || 0) + e.hours;
        return acc;
    }, {});

    if ((hoursByTag['Deep Work'] || 0) >= 50) badges.push({ id: 'deep_diver', name: 'Deep Diver', icon: 'Anchor', desc: '50+ Hours of Deep Work' });
    if ((hoursByTag['Build'] || 0) >= 50) badges.push({ id: 'architect', name: 'The Architect', icon: 'Hammer', desc: '50+ Hours Building' });
    if ((hoursByTag['Learn'] || 0) >= 50) badges.push({ id: 'scholar', name: 'The Scholar', icon: 'Book', desc: '50+ Hours Learning' });
    if (((hoursByTag['Health'] || 0) + (hoursByTag['Life'] || 0)) >= 20) {
        badges.push({ id: 'life_balancer', name: 'Life Balancer', icon: 'Heart', desc: '20+ Hours on Health & Life' });
    }

    return badges;
};

// --- Κύρια Συνάρτηση Υπολογισμού Stats ---
export const calculateStats = (
    entries: Entry[],
    courseGoals: CourseGoals = {},
    dailyGoal: number = 4
): Stats => {
    // Συνολικές ώρες
    const totalHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);

    // Gamification Engine
    const xp = Math.floor(totalHours * 100);
    const level = Math.floor(xp / 1000) + 1;
    const currentLevelXp = xp % 1000;
    const progress = (currentLevelXp / 1000) * 100;
    const xpToNext = 1000 - currentLevelXp;
    const rank = getRank(level);

    // Στατιστικά ανά μάθημα
    const byCourse = entries.reduce<Record<string, number>>((acc, e) => {
        acc[e.course] = (acc[e.course] || 0) + (e.hours || 0);
        return acc;
    }, {});

    const courseData: CourseProgress[] = Object.entries(byCourse)
        .map(([name, hours]) => ({
            name,
            hours,
            goal: courseGoals[name] || 0,
        }))
        .sort((a, b) => b.hours - a.hours);

    // Badges & Streaks
    const badges = calculateBadges(entries, dailyGoal);
    const { currentStreak, maxStreak } = calculateStreak(entries);

    return {
        totalHours,
        count: entries.length,
        courseData,
        xp,
        level,
        progress,
        xpToNext,
        rank,
        badges,
        currentStreak,
        maxStreak,
    };
};

// --- Helper: Λίστα μοναδικών μαθημάτων ---
export const getUniqueCourses = (entries: Entry[]): string[] => {
    return [...new Set(entries.map((e) => e.course))];
};
