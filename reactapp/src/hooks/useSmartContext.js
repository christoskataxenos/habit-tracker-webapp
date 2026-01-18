import { useMemo } from 'react';

export const useSmartContext = (entries) => {
    return useMemo(() => {
        if (entries.length < 5) return null;
        const now = new Date();
        const currentDay = now.getDay();
        const getTimeBlock = (h) => (h >= 5 && h < 12) ? 'morning' : (h >= 12 && h < 18) ? 'afternoon' : (h >= 18 && h <= 23) ? 'evening' : 'night';
        const currentBlock = getTimeBlock(now.getHours());

        const scores = {};
        entries.forEach(entry => {
            if (!entry.timestamp) return;
            const entryDate = new Date(entry.timestamp);
            let weight = 0;
            if (entryDate.getDay() === currentDay) weight += 3;
            if (getTimeBlock(entryDate.getHours()) === currentBlock) weight += 2;
            if (weight > 0) scores[entry.course] = (scores[entry.course] || 0) + weight;
        });

        let winner = null, maxScore = -1;
        Object.entries(scores).forEach(([course, score]) => { if (score > maxScore) { maxScore = score; winner = course; } });
        return winner;
    }, [entries]);
};
