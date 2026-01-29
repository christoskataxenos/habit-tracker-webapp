import { describe, it, expect } from 'vitest';
import { calculateStats } from './statsCalculator';
import type { Entry } from '../types';

describe('Stats Calculator Logic', () => {

    it('calculates total hours and XP correctly', () => {
        const mockEntries: Entry[] = [
            { id: '1', date: '2025-01-01', course: 'Math', hours: 2, tag: 'Learn', startTime: '10:00', endTime: '12:00', timestamp: 123 },
            { id: '2', date: '2025-01-01', course: 'Physics', hours: 3, tag: 'Deep Work', startTime: '14:00', endTime: '17:00', timestamp: 124 }
        ];
        const goals = {};

        const stats = calculateStats(mockEntries, goals, 5);

        // Total Hours = 2 + 3 = 5
        expect(stats.totalHours).toBe(5);

        // XP Formula: Hours * 100 => 5 * 100 = 500
        expect(stats.xp).toBe(500);

        // Level Formula: floor(XP / 1000) + 1 => floor(0.5) + 1 = 1
        expect(stats.level).toBe(1);

        // Progress: (XP % 1000) / 10 => 500 / 10 = 50%
        expect(stats.progress).toBe(50);
    });

    it('Calculates Streaks correctly based on current date', () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const mockEntries: Entry[] = [
            { id: '1', date: today, course: 'A', hours: 1, tag: 'A', startTime: '10:00', endTime: '11:00', timestamp: 1 },
            { id: '2', date: yesterday, course: 'A', hours: 1, tag: 'A', startTime: '10:00', endTime: '11:00', timestamp: 2 },
        ];

        const stats = calculateStats(mockEntries, {}, 5);
        expect(stats.currentStreak).toBe(2);
    });

    it('Assigns correct Rank based on Level thresholds', () => {
        // Create entry to reach Level 11 (100 hours = 10000 XP)
        const mockEntries: Entry[] = [
            { id: '1', date: '2025-01-01', course: 'Big Project', hours: 100, tag: 'Build', startTime: '00:00', endTime: '100:00', timestamp: 1 }
        ];

        const stats = calculateStats(mockEntries, {}, 5);

        // 100h * 100 = 10000 XP
        // Level = 10000 / 1000 + 1 = 11
        expect(stats.level).toBe(11);

        // Level >= 10 => APPRENTICE
        expect(stats.rank).toBe('APPRENTICE');
    });

    it('Calculates Badges (Marathoner)', () => {
        const mockEntries: Entry[] = [
            { id: '1', date: '2025-01-01', course: 'Hard Work', hours: 4, tag: 'Deep Work', startTime: '10:00', endTime: '14:00', timestamp: 1 }
        ];

        const stats = calculateStats(mockEntries, {}, 5);

        const hasMarathoner = stats.badges.some(b => b.id === 'marathoner');
        expect(hasMarathoner).toBe(true);
    });

    it('Aggregates Course Data correctly', () => {
        const mockEntries: Entry[] = [
            { id: '1', date: '2025-01-01', course: 'Math', hours: 2, tag: 'Learn', startTime: '10:00', endTime: '12:00', timestamp: 123 },
            { id: '2', date: '2025-01-02', course: 'Math', hours: 3, tag: 'Learn', startTime: '14:00', endTime: '17:00', timestamp: 124 },
            { id: '3', date: '2025-01-02', course: 'Physics', hours: 4, tag: 'Learn', startTime: '14:00', endTime: '17:00', timestamp: 125 }
        ];

        const stats = calculateStats(mockEntries, {}, 5);
        const mathStats = stats.courseData.find(c => c.name === 'Math');
        const physicsStats = stats.courseData.find(c => c.name === 'Physics');

        expect(mathStats?.hours).toBe(5);
        expect(physicsStats?.hours).toBe(4);
    });

});
