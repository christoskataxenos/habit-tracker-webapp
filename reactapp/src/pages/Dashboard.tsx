// ====================
// PULSE V2 - Dashboard (Main View)
// Κεντρική σελίδα της εφαρμογής
// ====================
import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import confetti from 'canvas-confetti';

// V2 Stores (Zustand) - Θα αντικαταστήσουν σταδιακά το useDataStore
import { useEntryStore } from '../stores/useEntryStore';
import { useRoutineStore } from '../stores/useRoutineStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useTimerStore } from '../stores/useTimerStore';
import { calculateStats, calculateForecasts, calculateInsights, getUniqueCourses } from '../utils/statsCalculator';
import type { Entry } from '../types';

// Legacy Hooks (θα αφαιρεθούν μετά την πλήρη μετάβαση)
// import { useDataStore } from '../hooks/useDataStore'; // REMOVED - Now using Zustand
import { useSmartContext } from '../hooks/useSmartContext';

// Components
import Background from '../components/Background';
import Header from '../components/Header';
import QuoteWidget from '../components/QuoteWidget'; // Added QuoteWidget import
import ActivityHeatmap from '../components/ActivityHeatmap';
import TimelineStream from '../components/TimelineStream';
import TemporalMatrix from '../components/TemporalMatrix';
import FocusModeOverlay from '../components/FocusModeOverlay';
import BottomNav from '../components/BottomNav';
import AnalyticsModal from '../components/AnalyticsModal';
import SettingsModal from '../components/SettingsModal';
import OnboardingModal from '../components/OnboardingModal';
import { AddEntryModal, GoalModal, DayDetailModal } from '../components/Modals';
import VelocityChart from '../components/VelocityChart';
import pkg from '../../package.json';

// --- Τύποι για το Dashboard ---
interface SessionData {
    start: number;
    end: number;
}

interface Preferences {
    theme: 'dark' | 'light' | 'system';
    clockFace: 'standard' | 'retro';
}

export default function Dashboard() {
    // === V2 ZUSTAND STORES ===
    // Entries Store
    const entries = useEntryStore((state) => state.entries);
    const addEntry = useEntryStore((state) => state.addEntry);
    const deleteEntry = useEntryStore((state) => state.deleteEntry);
    const updateEntry = useEntryStore((state) => state.updateEntry);

    // Routines Store
    const routines = useRoutineStore((state) => state.routines);
    const addRoutine = useRoutineStore((state) => state.addRoutine);

    // Settings Store
    const dailyGoal = useSettingsStore((state) => state.dailyGoal);
    const setDailyGoal = useSettingsStore((state) => state.setDailyGoal);
    const courseGoals = useSettingsStore((state) => state.courseGoals);
    const updateCourseGoal = useSettingsStore((state) => state.setCourseGoal);

    // Υπολογισμός Stats με το νέο utility
    const stats = useMemo(() => calculateStats(entries, courseGoals, dailyGoal), [entries, courseGoals, dailyGoal]);
    const uniqueCourses = useMemo(() => getUniqueCourses(entries), [entries]);

    // === UI STATE ===
    const [activeTab, setActiveTab] = useState<'dashboard' | 'feed'>('dashboard');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isGoalModalOpen, setGoalModalOpen] = useState(false);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Onboarding / Terms State
    const [showOnboarding, setShowOnboarding] = useState(() => {
        const lastAccepted = localStorage.getItem('pulse_terms_accepted_version');
        return lastAccepted !== pkg.version;
    });

    // Preferences State (θα μεταφερθεί στο useSettingsStore αργότερα)
    const [preferences, setPreferences] = useState<Preferences>(() => {
        const saved = localStorage.getItem('pulse_preferences');
        return saved ? JSON.parse(saved) : { theme: 'dark', clockFace: 'standard' };
    });

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    // const [isFocusMode, setIsFocusMode] = useState(false); // REPLACED BY STORE
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [analyticsView, setAnalyticsView] = useState<'stats' | 'badges' | 'goals'>('stats');

    // Timer Global State
    const { isActive, startTime, elapsedTime, activeSession, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimerStore();
    const [displayTime, setDisplayTime] = useState(0);
    const [lastSession, setLastSession] = useState<{ start: number, end: number } | null>(null);

    // System State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');

    // Smart Context (legacy hook - θα μεταφερθεί αργότερα)
    const smartCourse = useSmartContext(entries);

    // --- EFFECTS ---
    // --- DATA MIGRATION (V1 -> V2) ---
    useEffect(() => {
        const MIGRATION_KEY = 'pulse_v1_to_v2_migration_complete';
        const isMigrated = localStorage.getItem(MIGRATION_KEY);

        if (!isMigrated) {
            console.log('🚀 Checking for V1 Legacy Data...');

            // 1. Storage Keys from V1
            const V1_STORAGE_KEY = 'toon_study_tracker_v1';
            const V1_ROUTINES_KEY = 'pulse_routines_v1';
            const V1_GOAL_KEY = 'ascend_daily_goal';
            const V1_COURSE_GOALS_KEY = 'pulse_course_goals_v1';

            try {
                // Entries Migration
                const legacyEntriesRaw = localStorage.getItem(V1_STORAGE_KEY);
                if (legacyEntriesRaw) {
                    const legacyEntries = JSON.parse(legacyEntriesRaw);
                    if (Array.isArray(legacyEntries) && legacyEntries.length > 0) {
                        console.log(`📦 Found ${legacyEntries.length} legacy entries. Migrating...`);
                        // Standardize format if necessary (V2 uses similar format but with focusScore)
                        const standardized = legacyEntries.map((e: any) => ({
                            ...e,
                            focusScore: e.focusScore || e.score || 5, // V1 used 'score' occasionally or lacked it
                            timestamp: e.timestamp || Date.now()
                        }));
                        useEntryStore.getState().importEntries(standardized);
                    }
                }

                // Routines Migration
                const legacyRoutinesRaw = localStorage.getItem(V1_ROUTINES_KEY);
                if (legacyRoutinesRaw) {
                    const legacyRoutines = JSON.parse(legacyRoutinesRaw);
                    if (Array.isArray(legacyRoutines) && legacyRoutines.length > 0) {
                        console.log(`🔄 Found ${legacyRoutines.length} legacy routines. Migrating...`);
                        legacyRoutines.forEach((r: any) => {
                            useRoutineStore.getState().addRoutine({
                                ...r,
                                id: r.id || crypto.randomUUID()
                            });
                        });
                    }
                }

                // Settings Migration
                const legacyDailyGoal = localStorage.getItem(V1_GOAL_KEY);
                if (legacyDailyGoal) {
                    console.log(`🎯 Migrating daily goal: ${legacyDailyGoal}`);
                    setDailyGoal(parseFloat(legacyDailyGoal));
                }

                const legacyCourseGoalsRaw = localStorage.getItem(V1_COURSE_GOALS_KEY);
                if (legacyCourseGoalsRaw) {
                    const legacyCourseGoals = JSON.parse(legacyCourseGoalsRaw);
                    console.log(`📊 Migrating course goals...`);
                    Object.entries(legacyCourseGoals).forEach(([course, hours]) => {
                        updateCourseGoal(course, Number(hours));
                    });
                }

                // Mark as migrated so we don't repeat and duplicate on every reload
                localStorage.setItem(MIGRATION_KEY, 'true');
                console.log('✅ V1 to V2 Migration Successful.');

                // Show a small notification or just reload if data was imported
                if (legacyEntriesRaw || legacyRoutinesRaw) {
                    // Optional: reload or show toast
                }
            } catch (err) {
                console.error('❌ Data Migration Failed:', err);
            }
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && startTime) {
            // Update UI every second
            const tick = () => {
                const now = Date.now();
                setDisplayTime(elapsedTime + (now - startTime));
            };
            tick(); // Immediate update
            interval = setInterval(tick, 1000);
        } else {
            setDisplayTime(elapsedTime);
        }
        return () => clearInterval(interval);
    }, [isActive, startTime, elapsedTime]);

    // Save preferences
    // Save preferences & Apply Theme
    useEffect(() => {
        localStorage.setItem('pulse_preferences', JSON.stringify(preferences));

        const applyTheme = () => {
            let isLight = false;
            if (preferences.theme === 'system') {
                isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            } else {
                isLight = preferences.theme === 'light';
            }

            if (isLight) {
                document.documentElement.classList.add('light');
            } else {
                document.documentElement.classList.remove('light');
            }
        };

        applyTheme();

        // Listen for system changes ONLY if (preferences.theme === 'system')
        if (preferences.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            const handler = (e) => {
                if (e.matches) document.documentElement.classList.add('light');
                else document.documentElement.classList.remove('light');
            };
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [preferences]);

    // --- HANDLERS ---
    const handleOpenAnalytics = (view: 'stats' | 'badges' | 'goals' = 'stats'): void => {
        setAnalyticsView(view);
        setIsDataModalOpen(true);
    };

    const updatePreferences = (key: keyof Preferences, value: string): void => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleMoveEntry = (entryId: string, newDate: string): void => {
        updateEntry(entryId, { date: newDate });
    };

    const handleDateSelect = (dateStr: string | null): void => {
        if (dateStr === selectedDate && isDayDetailOpen) {
            setIsDayDetailOpen(false);
        } else {
            setSelectedDate(dateStr);
            if (dateStr) setIsDayDetailOpen(true);
        }
    };

    const handleEditEntry = (entry: Entry): void => {
        setEditingEntry(entry);
        setModalOpen(true);
    };

    // Interface για νέα entry data
    interface EntryFormData {
        course: string;
        date: string;
        hours: number;
        startTime: string;
        endTime: string;
        tag: string;
        topic?: string;
        score?: number;
        recurrence?: number[];
    }

    const handleSaveEntry = (data: EntryFormData): void => {
        if (editingEntry) {
            updateEntry(editingEntry.id, data);
        } else {
            addEntry(data);
            // Celebration for new entry
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#ffffff', '#60a5fa'],
                disableForReducedMotion: true
            });
        }

        // Handle Recurring Rhythm Creation
        if (data.recurrence && data.recurrence.length > 0) {
            addRoutine({
                name: data.course,
                course: data.course,
                scheduledTime: data.startTime,
                duration: data.hours,
                tag: data.tag,
                daysOfWeek: data.recurrence,
                isActive: true
            });
        }

        setModalOpen(false);
        stopTimer(); // Ensure timer is reset after save
    };

    const toggleFocus = (): void => {
        if (!isActive) {
            // Start Default Session
            startTimer('Focus Session', 'Deep Work');
        } else {
            // Stop Request -> Pause Timer & Open Modal to Save
            const now = Date.now();
            if (startTime) setLastSession({ start: startTime, end: now });

            pauseTimer(); // Hide Overlay, keep state until Save/Cancel
            setModalOpen(true);
        }
    };

    // Interface για protocol data
    interface ProtocolData {
        course: string;
        hours: number;
        startTime: string;
        endTime: string;
        tag?: string;
        topic?: string;
    }

    const handleLogProtocol = (protocol: ProtocolData): void => {
        addEntry({
            course: protocol.course,
            date: selectedDate || today,
            hours: protocol.hours,
            startTime: protocol.startTime,
            endTime: protocol.endTime,
            tag: protocol.tag || 'Deep Work',
            notes: protocol.topic || 'Conducted per Protocol',
        });
        // Feedback
        confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#f97316', '#ffffff']
        });
    };

    const formatTime = (totalSeconds: number): string => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const displayedEntries = useMemo(() => {
        let data = selectedDate ? entries.filter(e => e.date === selectedDate) : entries;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(e => e.course.toLowerCase().includes(q) || (e.topic && e.topic.toLowerCase().includes(q)));
        }
        return data.slice(0, 50);
    }, [entries, selectedDate, searchQuery]);

    const recentCourses = [...new Set(entries.map(e => e.course))].slice(0, 5);
    const today = new Date().toISOString().split('T')[0];
    const todayHours = entries.filter(e => e.date === today).reduce((sum, e) => sum + Number(e.hours), 0);
    const dailyProgress = Math.min((todayHours / dailyGoal) * 100, 100);

    return (
        <>
            <div className="fixed inset-0 z-0 pointer-events-none"><Background /></div>

            {/* ROOT LAYOUT: Fixed 100vh container to prevent body scrolling */}
            <div className="relative z-10 h-screen w-full flex flex-col p-4 md:p-6 font-sans text-slate-300 selection:bg-blue-500/30 overflow-hidden">

                {/* HEADER */}
                <div className="shrink-0 mb-6">
                    <Header
                        currentTime={currentTime}
                        dailyProgress={dailyProgress}
                        dailyGoal={dailyGoal}
                        onGoalClick={() => setGoalModalOpen(true)}
                        onManualLogClick={() => setModalOpen(true)}
                        onDataClick={() => setIsDataModalOpen(true)}
                        onFocusClick={toggleFocus}
                        level={stats.level}
                        rank={stats.rank}
                        progress={stats.progress}
                        currentStreak={stats.currentStreak}
                    />
                </div>

                {/* MAIN CONTENT AREA */}
                {/* We use flex-1 to take remaining space, but enforce a bottom margin to clear the fixed nav */}
                <main className="flex-1 w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 min-h-0 mb-28 overflow-hidden">

                    {/* LEFT: CALENDAR / TEMPORAL MATRIX */}
                    <div id="dashboard-calendar-panel" className={`${activeTab === 'dashboard' ? 'block' : 'hidden lg:block'} h-full glass-silver rounded-3xl overflow-hidden p-6 flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5`}>
                        <TemporalMatrix
                            entries={entries}
                            routines={routines}
                            onSelectDate={handleDateSelect}
                            selectedDate={selectedDate}
                            onMoveEntry={handleMoveEntry}
                        />
                    </div>

                    {/* RIGHT: FEED */}
                    <div id="dashboard-feed-panel" className={`${activeTab === 'feed' ? 'block' : 'hidden lg:block'} h-full glass-silver rounded-3xl flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5`}>
                        <div className="p-4 border-b border-white/5 bg-black/20 backdrop-blur-md flex justify-between items-center shrink-0">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                                Feed
                            </h2>
                            <div className="relative w-40">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-xs text-white outline-none focus:border-blue-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            {/* Activity Heatmap - Compact */}
                            <div className="mb-4 p-3 bg-black/20 rounded-xl border border-white/5">
                                <ActivityHeatmap entries={entries} period="month" isLightMode={false} />
                            </div>
                            <VelocityChart entries={entries} />
                            <TimelineStream
                                entries={displayedEntries.slice(0, 4)}
                                onDelete={deleteEntry}
                                onEdit={handleEditEntry}
                            />
                        </div>
                    </div>
                    {/* FOCUS MODE OVERLAY */}
                    {isActive && (
                        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="mb-8 text-center animate-in slide-in-from-top-10 duration-700 delay-100">
                                <div className="text-blue-400 text-sm font-bold uppercase tracking-[0.3em] mb-4 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 inline-block shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                    Deep Focus Session
                                </div>
                                <h2 className="text-4xl text-white font-thin tracking-wider opacity-80">
                                    {activeSession?.course || 'Focus Session'}
                                </h2>
                                {activeSession?.tag && <div className="text-xl text-slate-500 mt-2 font-light">{activeSession.tag}</div>}
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse"></div>
                                <div className="text-[120px] md:text-[180px] font-bold font-mono text-white tracking-widest drop-shadow-[0_0_50px_rgba(59,130,246,0.5)] tabular-nums select-none transition-all duration-300 group-hover:scale-105">
                                    {formatTime(Math.floor(displayTime / 1000))}
                                </div>
                            </div>

                            <div className="mt-12 flex gap-6 animate-in slide-in-from-bottom-10 duration-700 delay-200">
                                <button
                                    onClick={toggleFocus}
                                    className="group relative px-10 py-4 bg-transparent border border-red-500/30 text-red-400 rounded-full font-bold uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Stop Session
                                    </span>
                                </button>
                            </div>

                            <div className="absolute bottom-8 w-full flex justify-center px-4">
                                <QuoteWidget
                                    className="max-w-2xl text-center opacity-60 hover:opacity-100 transition-opacity"
                                    textClass="text-slate-400 text-sm md:text-base font-light italic tracking-wide"
                                    authorClass="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold"
                                />
                            </div>
                        </div>
                    )}</main>

                {/* BOTTOM NAVIGATION (Fixed) */}
                <BottomNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onFocusClick={toggleFocus}
                    onManualLogClick={() => setModalOpen(true)}
                    onDataClick={handleOpenAnalytics}
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />

                {/* OVERLAYS & MODALS */}
                {/* FocusModeOverlay removed - replaced by inline overlay */}

                <AddEntryModal
                    key={isModalOpen ? (editingEntry?.id || 'new') : 'closed'}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setLastSession(null);
                        setEditingEntry(null);
                        stopTimer(); // Discard session on Cancel
                    }}
                    onSave={handleSaveEntry}
                    uniqueCourses={uniqueCourses}
                    recentCourses={recentCourses}
                    initialStartTime={editingEntry?.startTime || (lastSession ? new Date(lastSession.start).toTimeString().slice(0, 5) : '')}
                    initialEndTime={editingEntry?.endTime || (lastSession ? new Date(lastSession.end).toTimeString().slice(0, 5) : '')}
                    initialCourse={editingEntry?.course || smartCourse || ''}
                    initialTopic={editingEntry?.topic || ''}
                    initialTag={editingEntry?.tag || ''}
                    initialScore={editingEntry?.score || 5}
                    initialDate={editingEntry?.date || (lastSession ? (() => {
                        const d = new Date();
                        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                        return d.toISOString().split('T')[0];
                    })() : (selectedDate || ''))}
                />

                <GoalModal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} currentGoal={dailyGoal} onSave={setDailyGoal} />

                <AnalyticsModal
                    isOpen={isDataModalOpen}
                    onClose={() => setIsDataModalOpen(false)}
                    entries={entries}
                    badges={stats.badges}
                    initialView={analyticsView}
                    courseGoals={courseGoals}
                    updateCourseGoal={updateCourseGoal}
                />

                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    preferences={preferences}
                    updatePreferences={updatePreferences}
                />

                <DayDetailModal
                    isOpen={isDayDetailOpen}
                    onClose={() => setIsDayDetailOpen(false)}
                    dateStr={selectedDate}
                    entries={selectedDate ? entries.filter(e => e.date === selectedDate) : []}
                    routines={selectedDate ? routines.filter(r => r.days.includes(new Date(selectedDate).getDay())) : []}
                    onAddEntry={() => setModalOpen(true)}
                    onEdit={handleEditEntry}
                    onDelete={deleteEntry}
                    onLogRoutine={handleLogProtocol}
                />

                {/* ONBOARDING FLOW */}
                <OnboardingModal
                    isOpen={showOnboarding}
                    onComplete={() => {
                        localStorage.setItem('pulse_terms_accepted_version', pkg.version);
                        setShowOnboarding(false);
                    }}
                />
            </div>
        </>
    );
}
