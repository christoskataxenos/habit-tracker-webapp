// ====================
// PULSE V2 - Stats Calculator
// Υπολογισμός στατιστικών, XP, Level, Badges
// ====================
import type { Entry, Stats, Badge, Rank, CourseProgress, CourseGoals, CourseForecast } from '../types';

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

// --- Πρόβλεψη Στόχων (Predictive Analytics) ---
export const calculateForecasts = (
    entries: Entry[],
    courseGoals: CourseGoals,
    lookbackDays: number = 14
): CourseForecast[] => {
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - lookbackDays);

    // Filter recent entries
    const recentEntries = entries.filter(e => new Date(e.date) >= cutoffDate);

    // Group recent hours by course
    const recentHoursByCourse: Record<string, number> = {};
    recentEntries.forEach(e => {
        recentHoursByCourse[e.course] = (recentHoursByCourse[e.course] || 0) + e.hours;
    });

    // Calculate total progress per course
    const totalHoursByCourse: Record<string, number> = {};
    entries.forEach(e => {
        totalHoursByCourse[e.course] = (totalHoursByCourse[e.course] || 0) + e.hours;
    });

    const forecasts: CourseForecast[] = [];

    Object.entries(courseGoals).forEach(([course, goal]) => {
        if (goal <= 0) return;

        const currentHours = totalHoursByCourse[course] || 0;
        const remaining = Math.max(0, goal - currentHours);

        if (remaining === 0) {
            forecasts.push({
                courseName: course,
                hoursRemaining: 0,
                velocity: 0,
                estimatedCompletionDate: "DONE",
                daysRemaining: 0
            });
            return;
        }

        const hoursLastPeriod = recentHoursByCourse[course] || 0;
        const velocity = hoursLastPeriod / lookbackDays; // Hrs/Day

        if (velocity <= 0.01) {
            forecasts.push({
                courseName: course,
                hoursRemaining: remaining,
                velocity: 0,
                estimatedCompletionDate: null, // "Infinity"
                daysRemaining: null
            });
        } else {
            const daysToFinish = Math.ceil(remaining / velocity);
            const finishDate = new Date();
            finishDate.setDate(today.getDate() + daysToFinish);

            forecasts.push({
                courseName: course,
                hoursRemaining: remaining,
                velocity: Number(velocity.toFixed(2)),
                estimatedCompletionDate: finishDate.toISOString().split('T')[0],
                daysRemaining: daysToFinish
            });
        }
    });

    return forecasts.sort((a, b) => (a.daysRemaining || 9999) - (b.daysRemaining || 9999));
};

// --- Smart Insights (Correlations) ---
// --- Smart Insights (Correlations) ---
export const calculateInsights = (entries: Entry[]) => {
    if (!entries || entries.length === 0) return null;

    // 1. Init Counters
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayHours = new Array(7).fill(0);
    const hourFreq = new Array(24).fill(0);
    let totalDuration = 0;
    let validEntriesCount = 0;

    // 2. Process Entries
    entries.forEach(e => {
        // Day Stats
        if (!e.date) return;
        const d = new Date(e.date);

        // VALIDATION: Skip invalid dates
        if (isNaN(d.getTime())) return;

        const dayIndex = d.getDay();
        if (dayIndex >= 0 && dayIndex < 7) {
            dayHours[dayIndex] += (e.hours || 0);
        }

        totalDuration += (e.hours || 0);
        validEntriesCount++;

        // Hour Stats (Frequency of starting at this hour)
        if (e.startTime) {
            const hour = parseInt(e.startTime.split(':')[0]);
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
                hourFreq[hour]++;
            }
        }
    });

    if (validEntriesCount === 0) return null;

    // 3. Find Maxima
    let maxDayIndex = dayHours.indexOf(Math.max(...dayHours));
    if (maxDayIndex === -1) maxDayIndex = 0; // Fallback

    const maxHourIndex = hourFreq.indexOf(Math.max(...hourFreq));
    const avgSession = totalDuration / validEntriesCount;

    // 4. Determine "Time of Day" Label
    let timeLabel = "Anytime";
    if (maxHourIndex >= 5 && maxHourIndex < 12) timeLabel = "Morning Person";
    else if (maxHourIndex >= 12 && maxHourIndex < 17) timeLabel = "Afternoon Focus";
    else if (maxHourIndex >= 17 && maxHourIndex < 22) timeLabel = "Evening Grinder";
    else timeLabel = "Night Owl";

    return {
        bestDay: days[maxDayIndex],
        bestDayTotal: (dayHours[maxDayIndex] || 0).toFixed(1),
        goldenHour: `${maxHourIndex}:00 - ${maxHourIndex + 1}:00`,
        goldenHourLabel: timeLabel,
        avgSession: avgSession.toFixed(1)
    };
};
