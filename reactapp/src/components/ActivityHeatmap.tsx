// ====================
// PULSE V2 - GitHub-Style Activity Heatmap
// Εμφάνιση δραστηριότητας τύπου GitHub contributions
// ====================
import React, { useMemo } from 'react';

interface Entry {
    date: string;
    hours: number;
}

export type HeatmapPeriod = 'week' | 'month' | 'quarter';

interface ActivityHeatmapProps {
    entries: Entry[];
    period?: HeatmapPeriod;
    isLightMode?: boolean;
}

// Επίπεδα έντασης χρώματος
const INTENSITY_COLORS_DARK = [
    'bg-slate-800/50',      // 0: Καμία δραστηριότητα
    'bg-emerald-900/60',    // 1: Ελάχιστη (< 1h)
    'bg-emerald-700/70',    // 2: Χαμηλή (1-2h)
    'bg-emerald-500/80',    // 3: Μέτρια (2-4h)
    'bg-emerald-400',       // 4: Υψηλή (4-6h)
    'bg-emerald-300',       // 5: Πολύ υψηλή (> 6h)
];

const INTENSITY_COLORS_LIGHT = [
    'bg-slate-200',         // 0: Καμία δραστηριότητα
    'bg-emerald-200',       // 1: Ελάχιστη
    'bg-emerald-300',       // 2: Χαμηλή
    'bg-emerald-400',       // 3: Μέτρια
    'bg-emerald-500',       // 4: Υψηλή
    'bg-emerald-600',       // 5: Πολύ υψηλή
];

// Υπολογισμός επιπέδου έντασης βάσει ωρών
const getIntensityLevel = (hours: number): number => {
    if (hours === 0) return 0;
    if (hours < 1) return 1;
    if (hours < 2) return 2;
    if (hours < 4) return 3;
    if (hours < 6) return 4;
    return 5;
};

// Μορφοποίηση ημερομηνίας για tooltip
const formatDate = (date: Date): string => {
    return date.toLocaleDateString('el-GR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
};

export default function ActivityHeatmap({
    entries,
    period = 'quarter',
    isLightMode = false
}: ActivityHeatmapProps) {

    // Calculate weeks based on period
    const weeks = useMemo(() => {
        switch (period) {
            case 'week': return 1;
            case 'month': return 5;
            case 'quarter': return 12;
            default: return 12;
        }
    }, [period]);


    // Δημιουργία map με ώρες ανά ημέρα
    const hoursMap = useMemo(() => {
        const map = new Map<string, number>();

        // Defensive check
        if (!entries || !Array.isArray(entries)) {
            return map;
        }

        entries.forEach(entry => {
            // Validate entry structure
            if (!entry || !entry.date || typeof entry.hours !== 'number') {
                return;
            }

            const existing = map.get(entry.date) || 0;
            const hours = typeof entry.hours === 'number' && !isNaN(entry.hours) ? entry.hours : 0;
            map.set(entry.date, existing + hours);
        });

        return map;
    }, [entries]);

    // Δημιουργία grid με τις τελευταίες X εβδομάδες
    const grid = useMemo(() => {
        const today = new Date();
        const result: { date: Date; hours: number; dateStr: string }[][] = [];

        // Βρες την τελευταία Κυριακή (ή σήμερα αν είναι Κυριακή)
        const endDate = new Date(today);

        // Πάμε weeks εβδομάδες πίσω
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (weeks * 7));

        // Ξεκίνα από Δευτέρα
        while (startDate.getDay() !== 1) {
            startDate.setDate(startDate.getDate() + 1);
        }

        // Δημιούργησε το grid (κάθε στήλη = 1 εβδομάδα)
        let currentDate = new Date(startDate);
        let weekData: { date: Date; hours: number; dateStr: string }[] = [];

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hours = hoursMap.get(dateStr) || 0;

            weekData.push({
                date: new Date(currentDate),
                hours,
                dateStr
            });

            // Αν είναι Κυριακή ή τελευταία μέρα, κλείσε την εβδομάδα
            if (currentDate.getDay() === 0) {
                result.push(weekData);
                weekData = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Πρόσθεσε τυχόν υπόλοιπες μέρες
        if (weekData.length > 0) {
            result.push(weekData);
        }

        return result;
    }, [hoursMap, weeks]);

    // Adaptive size based on period
    const boxSizeClass = useMemo(() => {
        if (period === 'week') return 'w-8 h-8 rounded-md gap-1';
        if (period === 'month') return 'w-4 h-4 rounded-sm gap-0.5';
        return 'w-3 h-3 rounded-sm gap-0.5';
    }, [period]);

    // Υπολογισμός συνολικών στατιστικών
    const stats = useMemo(() => {
        let totalHours = 0;
        let activeDays = 0;
        let currentStreak = 0;

        const today = new Date().toISOString().split('T')[0];

        hoursMap.forEach((hours) => {
            // Validate that hours is a number
            const validHours = typeof hours === 'number' && !isNaN(hours) ? hours : 0;
            totalHours += validHours;
            if (validHours > 0) activeDays++;
        });

        // Υπολογισμός streak
        let checkDate = new Date();
        let daysChecked = 0;
        const maxDaysToCheck = 365; // Prevent infinite loop

        while (daysChecked < maxDaysToCheck) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const hours = hoursMap.get(dateStr) || 0;
            const validHours = typeof hours === 'number' && !isNaN(hours) ? hours : 0;

            if (validHours > 0) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
                daysChecked++;
            } else if (dateStr === today) {
                // Σήμερα δεν έχει ακόμα δραστηριότητα, ελέγξε χθες
                checkDate.setDate(checkDate.getDate() - 1);
                daysChecked++;
            } else {
                break;
            }
        }

        return {
            totalHours: totalHours || 0,
            activeDays: activeDays || 0,
            currentStreak: currentStreak || 0
        };
    }, [hoursMap]);

    const colors = isLightMode ? INTENSITY_COLORS_LIGHT : INTENSITY_COLORS_DARK;
    const dayLabels = ['Δ', '', 'Τ', '', 'Π', '', 'Σ'];

    return (
        <div className="w-full">
            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                            {stats.totalHours.toFixed(1)}h
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            Total
                        </span>
                    </div>
                    <div className="w-px h-4 bg-slate-600" />
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${isLightMode ? 'text-slate-700' : 'text-emerald-400'}`}>
                            {stats.activeDays}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            Days
                        </span>
                    </div>
                    {stats.currentStreak > 0 && (
                        <>
                            <div className="w-px h-4 bg-slate-600" />
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-orange-400">
                                    🔥 {stats.currentStreak}
                                </span>
                                <span className={`text-[10px] uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                    Streak
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1">
                    <span className={`text-[9px] mr-1 ${isLightMode ? 'text-slate-500' : 'text-slate-600'}`}>Less</span>
                    {colors.map((color, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-sm ${color}`}
                            title={`Level ${i}`}
                        />
                    ))}
                    <span className={`text-[9px] ml-1 ${isLightMode ? 'text-slate-500' : 'text-slate-600'}`}>More</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className={`flex ${period === 'week' ? 'gap-1' : 'justify-between w-full'}`}>
                {/* Day labels */}
                {period !== 'week' && (
                    <div className="flex flex-col gap-0.5 mr-1">
                        {dayLabels.map((label, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 text-[8px] flex items-center justify-end pr-0.5 ${isLightMode ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                )}

                {/* Weeks */}
                {grid.map((week, weekIdx) => (
                    <div key={weekIdx} className={`flex flex-col ${period === 'week' ? 'gap-1' : 'gap-0.5'}`}>
                        {week.map((day, dayIdx) => {
                            const level = getIntensityLevel(day.hours);
                            const isFuture = day.date > new Date();

                            return (
                                <div
                                    key={dayIdx}
                                    className={`
                                        ${boxSizeClass} cursor-pointer
                                        transition-all duration-200 hover:scale-125 hover:z-10
                                        ${isFuture ? 'opacity-20' : ''}
                                        ${colors[level]}
                                    `}
                                    title={`${formatDate(day.date)}: ${day.hours.toFixed(1)}h`}
                                >
                                    {/* Show label in week mode */}
                                    {period === 'week' && (
                                        <div className="text-[9px] text-white/50 flex items-center justify-center w-full h-full">
                                            {dayLabels[dayIdx]}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
