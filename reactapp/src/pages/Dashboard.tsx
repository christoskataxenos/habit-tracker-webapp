// ====================
// PULSE V2 - Dashboard (Main View)
// Κεντρική σελίδα της εφαρμογής
// ====================
import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import confetti from 'canvas-confetti';

// V2 Stores (Zustand) - Θα αντικαταστήσουν σταδιακά το useDataStore
import { useEntryStore, useSettingsStore, useRoutineStore } from '../stores';
import { calculateStats, getUniqueCourses } from '../utils/statsCalculator';
import type { Entry } from '../types';

// Legacy Hooks (θα αφαιρεθούν μετά την πλήρη μετάβαση)
// import { useDataStore } from '../hooks/useDataStore'; // REMOVED - Now using Zustand
import { useSmartContext } from '../hooks/useSmartContext';

// Components
import Background from '../components/Background';
import Header from '../components/Header';
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
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [analyticsView, setAnalyticsView] = useState<'stats' | 'badges' | 'goals'>('stats');

    // Timer State
    const [timerStart, setTimerStart] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [lastSession, setLastSession] = useState<SessionData | null>(null);

    // System State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');

    // Smart Context (legacy hook - θα μεταφερθεί αργότερα)
    const smartCourse = useSmartContext(entries);

    // --- EFFECTS ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let interval;
        if (isFocusMode && timerStart) {
            interval = setInterval(() => { setElapsed(Math.floor((Date.now() - timerStart) / 1000)); }, 1000);
        }
        return () => clearInterval(interval);
    }, [isFocusMode, timerStart]);

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
    };

    const toggleFocus = (): void => {
        if (!isFocusMode) {
            setIsFocusMode(true);
            setTimerStart(Date.now());
            setElapsed(0);
        } else {
            const now = Date.now();
            if (timerStart) setLastSession({ start: timerStart, end: now });
            setIsFocusMode(false);
            setTimerStart(null);
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
                </main>

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
                <FocusModeOverlay
                    isFocusMode={isFocusMode}
                    elapsed={elapsed}
                    onTerminate={toggleFocus}
                    formatTime={formatTime}
                    currentTime={currentTime}
                    clockFace={preferences.clockFace}
                />

                <AddEntryModal
                    key={isModalOpen ? (editingEntry?.id || 'new') : 'closed'}
                    isOpen={isModalOpen}
                    onClose={() => { setModalOpen(false); setLastSession(null); setEditingEntry(null); }}
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
