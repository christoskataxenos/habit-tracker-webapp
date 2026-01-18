import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Download, List, Search, X } from 'lucide-react';

// Hooks
import { useDataStore } from '../hooks/useDataStore';
import { useSmartContext } from '../hooks/useSmartContext';

// Components
import Background from '../components/Background';
import Header from '../components/Header';
import TimelineStream from '../components/TimelineStream';
import TemporalMatrix from '../components/TemporalMatrix';
import ActivityChart from '../components/ActivityChart';
import FocusModeOverlay from '../components/FocusModeOverlay';
import { AddEntryModal, GoalModal, DataManagementModal } from '../components/Modals';

export default function Dashboard() {
    const { entries, addEntry, deleteEntry, updateEntry, getStats, uniqueCourses, dailyGoal, setDailyGoal } = useDataStore();

    // UI State
    const [isModalOpen, setModalOpen] = useState(false);
    const [isGoalModalOpen, setGoalModalOpen] = useState(false);
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);

    // Timer State
    const [timerStart, setTimerStart] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [lastSession, setLastSession] = useState(null);

    // System State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');

    // Derived State
    const stats = getStats();
    const smartCourse = useSmartContext(entries);

    // --- EFFECTS ---

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isFocusMode && timerStart) {
            interval = setInterval(() => { setElapsed(Math.floor((Date.now() - timerStart) / 1000)); }, 1000);
        }
        return () => clearInterval(interval);
    }, [isFocusMode, timerStart]);

    // --- HANDLERS ---

    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
        setModalOpen(true);
    };

    const handleSaveEntry = (data) => {
        if (editingEntry) {
            updateEntry(editingEntry.id, data);
        } else {
            addEntry(data);
        }
        setModalOpen(false); // Ensure modal closes
    };

    const toggleFocus = () => {
        if (!isFocusMode) {
            setIsFocusMode(true);
            setTimerStart(Date.now());
            setElapsed(0);
            setLastSession(null);
        } else {
            const now = Date.now();
            if (timerStart) setLastSession({ start: timerStart, end: now });
            setIsFocusMode(false);
            setTimerStart(null);
            setModalOpen(true);
        }
    };

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Filter Logic
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

    // Backup functions moved to DataManagementModal

    return (
        <>
            <div className="fixed inset-0 z-0 pointer-events-none"><Background /></div>
            <div className="relative z-10 min-h-screen flex flex-col p-6 font-sans text-slate-300 selection:bg-blue-500/30">

                <Header
                    currentTime={currentTime}
                    dailyProgress={dailyProgress}
                    dailyGoal={dailyGoal}
                    onGoalClick={() => setGoalModalOpen(true)}
                    onManualLogClick={() => setModalOpen(true)}
                    onDataClick={() => setIsDataModalOpen(true)}
                    onFocusClick={toggleFocus}
                    // Gamification
                    level={stats.level}
                    rank={stats.rank}
                    progress={stats.progress}
                    xpToNext={stats.xpToNext}
                />

                {/* MAIN SPLIT VIEW */}
                <div className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-0 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-6">

                    {/* LEFT: NEURAL FEED (25% on Desktop, Stacked on Mobile) */}
                    <div className="col-span-1 lg:col-span-3 glass-silver rounded-2xl flex flex-col overflow-hidden h-[500px] lg:h-full relative order-2 lg:order-1">
                        <div className="p-4 border-b border-white/5 bg-black/20 backdrop-blur-md flex justify-between items-center z-10">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                                Neural Feed
                            </h2>
                            <div className="relative w-32">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Active Recon..."
                                    className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-700 outline-none focus:border-blue-500/30 focus:bg-black/60 transition-all font-mono"
                                />
                                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"><X className="w-3 h-3" /></button>}
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 bg-transparent p-2">
                            <TimelineStream
                                entries={displayedEntries}
                                onDelete={deleteEntry}
                                onEdit={handleEditEntry}
                            />
                        </div>
                    </div>

                    {/* RIGHT: TEMPORAL MATRIX (75% on Desktop, Stacked on Mobile) */}
                    <div className="col-span-1 lg:col-span-9 glass-silver rounded-2xl flex flex-col overflow-hidden p-4 lg:p-6 relative h-[600px] lg:h-full order-1 lg:order-2">
                        <TemporalMatrix
                            entries={entries}
                            onSelectDate={setSelectedDate}
                            selectedDate={selectedDate}
                        />
                    </div>

                </div>

                <FocusModeOverlay
                    isFocusMode={isFocusMode}
                    elapsed={elapsed}
                    onTerminate={toggleFocus}
                    formatTime={formatTime}
                />

                <AddEntryModal
                    isOpen={isModalOpen}
                    onClose={() => { setModalOpen(false); setLastSession(null); setEditingEntry(null); }}
                    onSave={handleSaveEntry}
                    uniqueCourses={uniqueCourses}
                    recentCourses={recentCourses}
                    initialStartTime={editingEntry?.startTime || (lastSession ? new Date(lastSession.start).toTimeString().slice(0, 5) : '')}
                    initialEndTime={editingEntry?.endTime || (lastSession ? new Date(lastSession.end).toTimeString().slice(0, 5) : '')}
                    initialCourse={editingEntry?.course || smartCourse || ''}
                    initialDate={editingEntry?.date || selectedDate || ''}
                    initialHours={editingEntry?.hours || ''}
                    initialTag={editingEntry?.tag || ''}
                />

                <GoalModal
                    isOpen={isGoalModalOpen}
                    onClose={() => setGoalModalOpen(false)}
                    currentGoal={dailyGoal}
                    onSave={setDailyGoal}
                />

                <DataManagementModal
                    isOpen={isDataModalOpen}
                    onClose={() => setIsDataModalOpen(false)}
                />
            </div>
        </>
    );
}
