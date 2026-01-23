# Version 2.0 - Refactoring & Architecture Requirements

Based on Professor's Email Feedback.

## 1. Refactoring & Architecture
- **State Management**: Replace `useState`/`Context` with **Zustand** or **Redux Toolkit** for better scalability.
- **Data Persistence**: Move from LocalStorage to a **Hybrid DB Architecture** (IndexedDB/SQLite) for queries, using **TOON (Token-Oriented Object Notation)** for data exchange and AI-ready exports.
- **Type Safety**: Full migration to **TypeScript**.

## 2. Simplification Phase
- **UI/UX Polish**: Reduce "Glassmorphic" overkill and heavy blur effects to improve readability and performance (GPU optimization).
- **Repo Cleanup**: Remove **Docker** if focusing strictly on a local Desktop app to reduce bloat.

## 3. Data Analysis & Senior Features
- **Correlations**: Implement insights (e.g., "Lack of sleep reduces workout probability by 40%").
- **Predictive Analytics**: Add linear regression for level-up predictions (e.g., when you will reach "Architect" rank).
- **Heatmaps**: Add GitHub-style activity heatmaps for habit streaks (Replacing simple 🔥 icons).
- **Web Workers**: Offload heavy analytics calculations to avoid freezing the UI.
- **Auto-Backup**: Integration with Google Drive or Dropbox API using the **TOON** format for 40% more efficient tokens and human-readability.

## 4. Advanced System Integration
- **Mini-Focus Window**: A compact "Always-on-Top" mini-HUD showing only the timer and current habit (Optimized for laptops/single screens).
- **System Tray Integration**: Full background persistence with a tray menu for quick habit logging.
- **Export Engine**: Beautiful PDF and Image summary generation for social sharing ("Pulse Architect" report).
- **Testing**: Implement **Unit & Integration Tests** using **Vitest** for core algorithms (XP, stats).
