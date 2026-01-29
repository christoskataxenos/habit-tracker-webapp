# Changelog

All notable changes to the **Pulse Protocol** (formerly Study Tracker) project will be documented in this file.

## [v2.0.8] - 2026-01-29 - "Total Control"
### Fixed
- **UI Layering (Critical):** Increased Save Log modal z-index to 300, ensuring it always appears above the Focus Mode overlay.
- **HUD Synchronization:** Re-engineered the Save sequence to pause the timer *before* signaling the main app, guaranteeing the overlay disappears instantly.
- **Metadata Persistence:** The Save Log now correctly inherits the Kurs/Tag data directly from the active session.
- **Feed Layout:** Final containment fixes for the Activity Feed to prevent horizontal scrolling on all resolutions.

## [v2.0.7] - 2026-01-29 - "Precision Engine"
### Fixed
- **HUD-to-Dashboard Handoff (Critical):** Fixed a race condition where terminating a session from the HUD would sometimes fail to trigger the Save Log or lose the final duration data. 
- **Time Capture Fidelity:** Re-engineered the sync logic to ensure 100% accurate time-tracking when bridging from tactical (HUD) to detailed (Dashboard) modes.
- **Improved Stability:** Fortified the storage event listener to handle high-frequency cross-window updates.

## [v2.0.6] - 2026-01-29 - "Tactical Handoff"
### Added
- **Detailed HUD Logging:**
  - **Remote Triggering:** HUD "Save" now triggers the detailed `AddEntryModal` in the main Dashboard window instead of a quick-save.
  - **Workflow Optimization:** HUD automatically closes after signaling, allowing the user to provide full session metadata in the main app.
  - **Enhanced Sync Engine:** Strengthened the cross-window communication for reliable session handovers.

### Fixed
- **Feed/Timeline Layout:** Resolved horizontal overflow issues in the Activity Feed and metallic cards, ensuring correct responsive behavior.
- **Visual Trim:** Cleanup of the Bottom Navigation for improved consistency.

## [v2.0.5] - 2026-01-29 - "Tactical Pivot"
### Changed
- **Navigation Overhaul:**
  - **HUD Primacy:** Replaced the "Dashboard" nav button with a dedicated "HUD" pop-out trigger. 
  - **Distraction-Free UX:** Streamlined the bottom bar by removing redundant navigation, acknowledging that main views (Stats, Settings, Logs) are already modal-based.
  - **Clean Layout:** Removed the secondary HUD floating button next to the center Focus control for a cleaner, balanced interface.

## [v2.0.3] - 2026-01-29 - "Remote Control"
### Added
- **HUD Session Management:**
  - **Finish & Save:** Introduced a "Stop" (Square) button in the Mini-HUD that triggers a specialized save flow.
  - **Direct Entry Commit:** Users can now commit focus sessions to their log directly from the HUD window without needing to interact with the main dashboard.
  - **Discard Workflow:** Added a secure discard flow with confirmation for accidental session terminations.
  - **HUD History Persistence:** Integrated `useEntryStore` into the HUD controller for autonomous data operations.

### Changed
- **Visual Feedback:** Added a high-contrast "Save Session?" confirmation view in the HUD with Discard, Build, and Back controls.
- **Icon Set Expansion:** Integrated `Square`, `Check`, and `Trash2` into the HUD UI for clearer semantic actions.

## [v2.0.2] - 2026-01-29 - "Stability Matrix"
### Added
- **Migration Fortification:** Improved recovery logic for legacy routines, ensuring mandatory fields like `daysOfWeek` are correctly initialized during V1 -> V2 data transition.
- **Enhanced Type Safety:** Added defensive checks in filtering logic to prevent `TypeError` when processing malformed or incomplete data objects.

### Fixed
- **Calendar Crash (Critical):** Resolved a "White Screen of Death" triggered by clicking a day in the calendar when legacy routine data was missing recurrence arrays.
- **Console Warnings:** Suppressed benign Recharts `width(0)` warnings by optimizing `ResponsiveContainer` interaction with hidden layout panels.

## [v2.0.1] - 2026-01-29 - "Refined Focus"
### Added
- **Mini-HUD Upgrades:**
  - **Dynamic Scaling:** HUD text and elements now scale intelligently to fit compact window sizes.
  - **Interactivity:** Integrated a dedicated Close (X) button and a draggable header region for better desktop management.
- **UX Stability:**
  - **Focus Theme Restoration:** Re-enabled selection and rendering of all Focus Mode themes (Terminal, Retro, Zen Minimal) from the Dashboard.
  - **Dual-Theme Focus Fix:** Completely refactored Focus Mode for Light Mode ("Frost Focus"), ensuring high contrast and zero "mixed mode" artifacts.

### Changed
- **Version Uniformity:** Synchronized system versioning across Package, Header, HUD, and Error Boundaries to v2.0.1.
- **HUD Access:** Made the Pop-out HUD button always visible in the Bottom Navigation for faster access.

### Fixed
- **UI Persistence:** Fixed a bug where Focus Mode themes were being ignored in favor of inline defaults.
- **Layout Overflow:** Resolved text clipping issues in the Mini-HUD by implementing better padding and font-size clamping.

## [v2.0.0] - 2026-01-28 - "The Quantified Future"
### Added
- **Predictive Analytics Engine:**
  - **Goal Forecasts:** Dynamic projections for course completion based on current velocity.
  - **Correlation Insights:** AI-driven analysis identifying "Golden Hours" and "Power Days."
- **Focus HUD & Global State:**
  - **Mini-Focus HUD:** A compact, always-on-top window for distraction-free tracking.
  - **Zustand Migration:** Centralized global state with `useTimerStore` ensuring real-time synchronization across all app instances.
- **Enhanced Data Safety:**
  - **Smart Merge Engine:** Intelligent CSV/JSON restoration that preserves existing data while merging conflicts.
  - **Excel Compatibility:** Standardized CSV exports with BOM and semicolon support for Greek/European locales.
- **TypeScript Core:**
  - Full type safety across the entire application architecture.
  - Core interfaces: `Entry`, `Routine`, `Stats`, `Badge`, `Rank`, `UserSettings`.

### Changed
- **Overlay Refactoring:** Replaced legacy `FocusModeOverlay` with high-performance inline CSS-driven transitions.
- **Local-First Philosophy:** Reinforced manual backup controls over cloud-dependent sync for 100% data ownership.
- **UX Layout:** Optimized vertical real estate for 1080p and laptop screens.

### Fixed
- **Electron Boot Failure:** Resolved a critical `SyntaxError` in the main process (`main.js`) caused by corrupted source text.
- **ESM Module Compatibility:** Fixed missing `__dirname` and `path` resolution issues in the Electron entry point.

### Technical
- Tech Stack: `react-19`, `vite-7`, `zustand`, `lucide-react`, `vitest`.
- Testing: Implemented unit tests for math-heavy analytics and XP engines.

---

## [v1.6.0] - 2026-01-23 - "The Pulse Enhancement"
### Added
- **Master Sync & Backup**: A unified, high-performance data center replacing the separate backup and cloud bridge cards.
- **Native OS Save Dialog (Electron)**: Integrated direct file system access. Users can now save backups directly into cloud-synced folders (Dropbox/Drive/OneDrive) using the standard OS "Save As" window.
- **Smart Data Sync (Smart Merge)**: Sync data between multiple devices using your own Cloud Drive. Pulse now intelligently merges backups without overwriting local data.
- **Analytics Vault 2.5**: A complete UI redesign of the "Operations Hub":
  - **Heroic Layout**: Full-width primary operations for better visual balance and accessibility.
  - **Last Synced Ledger**: Real-time timestamp tracking for all backup/sync operations.
  - **Hall of Trophies**: Compact, high-visibility badge layout.
  - **Project Goals (Compact)**: Streamlined row-based tracking for zero-scroll visibility.
- **Micro-Animations (The "Juice")**: Enhanced transitions, celebrate session completions with `canvas-confetti`.
- **Velocity Tracker**: 7-day volume visualization directly on the main Dashboard.
- **PulseBuilder (v1.6)**: Native build utility for Windows, automating web-to-desktop deployment.

### Changed
- **UX Layouts**: Reduced vertical bloat across all modals to ensure "above the fold" visibility for all core functions.
- **Visual Aesthetics**: Centered hover glows and implemented "Frost Silver" button patterns for Light Mode.

---

## [v1.5.0] - 2026-01-22 - "Frost & Silver" Update
### Added
- **Dynamic Light Mode**: A complete overhaul of the UI to support a stunning Light Theme ("Frost & Silver").
  - Features a monochromatic Silver/Grey palette (No blue artifacts).
  - Glassmorphic White Panels for Calendar, Feed, and Navigation.
  - High-contrast Slate typography for optimal readability.
- **Analytics Overhaul (Light)**:
  - **Daily Audit (Day Detail)**: Fully refactored for Light Mode with silver gradients and white cards.
  - **Neutral Palettes**: Charts now use an "Earth & Silver" neutral palette to reduce eye strain.
- **Header Refinement**:
  - Moved Gamification HUD (Level/Rank) underneath the logo for better horizontal spacing.
  - Added **"Silver Type"** effect to the Pulse logo with a faded shadow for visibility.
- **Terminal Clock (Clean)**: Removed scanlines and "emerald glows" from the Focus Overlay in Light Mode for a cleaner, modern look.
- **System Sync**: Added a "System Sync" theme option that automatically switches between Dark and Light modes based on OS preferences.

### Changed
- **UI Architecture**: Refactored CSS to use specific IDs (`#dashboard-calendar-panel`, `#day-detail-panel`) for robust theme overrides.
- **Branding**: Renamed "Retro Flip" clock to simply **"Retro"**.
- **Feed Aesthetics**: Refined cards to be off-white with solid gray duration badges for improved visual hierarchy.

### Fixed
- Fixed critical background gradient overlaps in the Analytics Vault.
- Fixed inconsistent text shadows in Light Mode that caused eye fatigue.
- Eliminated "emerald artifacts" in the Focus Overlay during light theme usage.

---

## [v1.4.0] - 2026-01-16 - "Pulse OS" Refinement
### Added
- **Gamification HUD**: Level, Rank (Initiate, etc.), and XP Progress Bar added to the Header.
- **Focus Modes**: Added "Zen Minimal" and "Retro Flip" clock styles.
- **Keyboard Shortcuts**: Added support for fast navigation.

### Changed
- **Timeline Feed**: Redesigned feed to show "Rhythmic Echoes" and daily logs in a stream format.
- **Modals**: Complete styling overhaul of Add Entry, Goal, and Day Detail panels to match the "Divinity" aesthetic.

---

## [v1.3.0] - 2026-01-10 - "Divinity" UI Overhaul
### Added
- **God Aura**: Implemented the signature animated background aura.
- **Particle System**: Added subtle background particle effects.
- **Glassmorphism**: Introduced the core `.glass` utility classes for the "frosted" look.

---

## [v1.2.0] - 2026-01-05 - Core Functionality
### Added
- **Electron Integration**: Full wrapper for desktop app capabilities.
- **Minimize/Close Controls**: Custom window controls for frameless window mode.
- **Local Persistence**: Data is now saved reliably to local JSON storage.

---

## [v1.0.0] - 2025-12-25 - Initial Release
- Basic Habit Tracking functionality.
- Simple Calendar View.
- Daily Log input forms.
