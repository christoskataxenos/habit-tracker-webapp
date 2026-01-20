import { useState, useEffect } from 'react';

const STORAGE_KEY = 'toon_study_tracker_v1';
const GOAL_KEY = 'ascend_daily_goal';
const ROUTINES_KEY = 'pulse_routines_v1';

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

    const [loading] = useState(false);

    // Save entries & routines
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
        }
    }, [entries, routines, loading]);

    // Save goal
    const updateDailyGoal = (newGoal) => {
        setDailyGoal(newGoal);
        localStorage.setItem(GOAL_KEY, newGoal.toString());
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
            hours
        })).sort((a, b) => b.hours - a.hours);

        return {
            totalHours,
            count: entries.length,
            courseData,
            // Gamification Stats
            xp,
            level,
            progress,
            xpToNext,
            rank
        };
    };

    const uniqueCourses = [...new Set(entries.map(e => e.course))];

    return {
        entries,
        routines,
        loading,
        dailyGoal,
        setDailyGoal: updateDailyGoal,
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
