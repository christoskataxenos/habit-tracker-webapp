# Changelog

All notable changes to the **Pulse Protocol** (formerly Study Tracker) project will be documented in this file.

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
