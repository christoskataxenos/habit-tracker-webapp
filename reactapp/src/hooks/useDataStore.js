import { useState, useEffect } from 'react';

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'toon_study_tracker_v1';
const GOAL_KEY = import.meta.env.VITE_GOAL_KEY || 'ascend_daily_goal';
const ROUTINES_KEY = import.meta.env.VITE_ROUTINES_KEY || 'pulse_routines_v1';
const COURSE_GOALS_KEY = import.meta.env.VITE_COURSE_GOALS_KEY || 'pulse_course_goals_v1';

export function useDataStore() {
    const [entries, setEntries] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse entries", e);
            return [];
        }
    });

    const [routines, setRoutines] = useState(() => {
        const saved = localStorage.getItem(ROUTINES_KEY);
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse routines", e);
            return [];
        }
    });

    const [dailyGoal, setDailyGoal] = useState(() => {
        const saved = localStorage.getItem(GOAL_KEY);
        return saved ? parseFloat(saved) : 4;
    });

    const [courseGoals, setCourseGoals] = useState(() => {
        const saved = localStorage.getItem(COURSE_GOALS_KEY);
        try {
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Failed to parse course goals", e);
            return {};
        }
    });

    const [loading] = useState(false);

    // Save entries & routines & goals
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
            localStorage.setItem(COURSE_GOALS_KEY, JSON.stringify(courseGoals));
        }
    }, [entries, routines, courseGoals, loading]);

    // Save goal
    const updateDailyGoal = (newGoal) => {
        setDailyGoal(newGoal);
        localStorage.setItem(GOAL_KEY, newGoal.toString());
    };

    const updateCourseGoal = (course, target) => {
        setCourseGoals(prev => ({
            ...prev,
            [course]: parseFloat(target)
        }));
    };

    const addEntry = (entry) => {
        const newEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };
        setEntries(prev => [newEntry, ...prev]);
    };

    const deleteEntry = (id) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const updateEntry = (id, updatedFields) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    };

    // --- ROUTINE MANAGEMENT ---
    const addRoutine = (routine) => {
        const newRoutine = {
            ...routine,
            id: crypto.randomUUID(),
            createdAt: Date.now()
        };
        setRoutines(prev => [...prev, newRoutine]);
    };

    const updateRoutine = (id, updatedFields) => {
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    };

    const deleteRoutine = (id) => {
        setRoutines(prev => prev.filter(r => r.id !== id));
    };

    const getStats = () => {
        const totalHours = entries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);

        // --- GAMIFICATION ENGINE ---
        const xp = Math.floor(totalHours * 100);
        const level = Math.floor(xp / 1000) + 1;
        const currentLevelXp = xp % 1000;
        const progress = (currentLevelXp / 1000) * 100;
        const xpToNext = 1000 - currentLevelXp;

        let rank = "INITIATE";
        if (level >= 10) rank = "OPERATOR";
        if (level >= 25) rank = "NETRUNNER";
        if (level >= 50) rank = "VANGUARD";
        if (level >= 100) rank = "ARCHITECT";

        const byCourse = entries.reduce((acc, e) => {
            acc[e.course] = (acc[e.course] || 0) + parseFloat(e.hours || 0);
            return acc;
        }, {});

        const courseData = Object.entries(byCourse).map(([name, hours]) => ({
            name,
            hours,
            goal: courseGoals[name] || 0
        })).sort((a, b) => b.hours - a.hours);

        // --- BADGE SYSTEM ---
        const badges = [];

        // 1. UNIVERSAL BADGES
        // Early Bird: Session ended before 8:00 AM
        if (entries.some(e => {
            const h = parseInt(e.endTime?.split(':')[0] || "99");
            return h < 8;
        })) {
            badges.push({ id: 'early_bird', name: 'Early Bird', icon: 'Sunrise', desc: 'Completed a session before 8 AM' });
        }

        // Night Owl: Session started after 11:00 PM or before 4:00 AM
        if (entries.some(e => {
            const h = parseInt(e.startTime?.split(':')[0] || "12");
            return h >= 23 || h < 4;
        })) {
            badges.push({ id: 'night_owl', name: 'Night Owl', icon: 'Moon', desc: 'Completed a session late at night' });
        }

        // Marathoner: Single session > 3 hours
        if (entries.some(e => parseFloat(e.hours || 0) >= 3)) {
            badges.push({ id: 'marathoner', name: 'Marathoner', icon: 'Flame', desc: 'Focused for over 3 hours in one go' });
        }

        // Streak Master
        const sortedDates = [...new Set(entries.map(e => e.date))].sort((a, b) => new Date(b) - new Date(a));
        let maxStreak = 0;
        let currentStreak = 0;
        if (sortedDates.length > 0) {
            let streak = 1;
            for (let i = 0; i < sortedDates.length - 1; i++) {
                const d1 = new Date(sortedDates[i]);
                const d2 = new Date(sortedDates[i + 1]);
                const diffTime = Math.abs(d1 - d2);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    streak++;
                } else {
                    if (streak > maxStreak) maxStreak = streak;
                    streak = 1;
                }
            }
            if (streak > maxStreak) maxStreak = streak;

            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            let tempStreak = 1;
            for (let i = 0; i < sortedDates.length - 1; i++) {
                const d1 = new Date(sortedDates[i]);
                const d2 = new Date(sortedDates[i + 1]);
                const diffDays = Math.ceil(Math.abs(d1 - d2) / (86400000));
                if (diffDays === 1) tempStreak++;
                else break;
            }
            if (sortedDates[0] === today || sortedDates[0] === yesterday) currentStreak = tempStreak;
        }

        if (currentStreak >= 3) badges.push({ id: 'streak_3', name: 'Heating Up', icon: 'Zap', desc: '3 Day Streak' });
        if (currentStreak >= 7) badges.push({ id: 'streak_7', name: 'On Fire', icon: 'Zap', desc: '7 Day Streak' });
        if (currentStreak >= 30) badges.push({ id: 'streak_30', name: 'Unstoppable', icon: 'Crown', desc: '30 Day Streak' });

        // Weekend Warrior
        const entriesByDate = entries.reduce((acc, e) => {
            acc[e.date] = (acc[e.date] || 0) + parseFloat(e.hours || 0);
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
        const hoursByTag = entries.reduce((acc, e) => {
            acc[e.tag] = (acc[e.tag] || 0) + parseFloat(e.hours || 0);
            return acc;
        }, {});

        if ((hoursByTag['Deep Work'] || 0) >= 50) badges.push({ id: 'deep_diver', name: 'Deep Diver', icon: 'Anchor', desc: '50+ Hours of Deep Work' });
        if ((hoursByTag['Build'] || 0) >= 50) badges.push({ id: 'architect', name: 'The Architect', icon: 'Hammer', desc: '50+ Hours Building' });
        if ((hoursByTag['Learn'] || 0) >= 50) badges.push({ id: 'scholar', name: 'The Scholar', icon: 'Book', desc: '50+ Hours Learning' });
        if (((hoursByTag['Health'] || 0) + (hoursByTag['Life'] || 0)) >= 20) badges.push({ id: 'life_balancer', name: 'Life Balancer', icon: 'Heart', desc: '20+ Hours on Health & Life' });

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
            maxStreak
        };
    };

    const uniqueCourses = [...new Set(entries.map(e => e.course))];

    return {
        entries,
        routines,
        loading,
        dailyGoal,
        courseGoals,
        setDailyGoal: updateDailyGoal,
        updateCourseGoal,
        addEntry,
        deleteEntry,
        updateEntry,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        getStats,
        uniqueCourses
    };
}
