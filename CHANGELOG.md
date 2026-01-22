# Changelog

All notable changes to the **Pulse Protocol** (formerly Study Tracker) project will be documented in this file.

## [v1.5.0] - 2026-01-22 - "Frost & Platinum" Update
### Added
- **Dynamic Light Mode**: A complete overhaul of the UI to support a stunning Light Theme ("Frost & Platinum").
  - Features a monochromatic Silver/Grey palette (No blue artifacts).
  - Glassmorphic White Panels for Calendar, Feed, and Navigation.
  - High-contrast Slate typography for optimal readability.
- **System Sync**: Added a "System Sync" theme option that automatically switches between Dark and Light modes based on OS preferences.
- **Settings Grid**: Reorganized Settings UI into a clean 3-column grid layout for clearer navigation.
- **Multi-line Quotes**: The Quote Widget in the header now supports up to 2 lines of text, ensuring longer quotes are fully readable.

### Changed
- **UI Architecture**: Refactored CSS to use specific IDs (`#dashboard-calendar-panel`, `#settings-modal-panel`) for robust theme overrides, solving conflicts with glassmorphism.
- **Visuals**:
  - Replaced standard blue accents in Light Mode with Silver/Slate tones.
  - Optimized "Flip Clock" styling for Light Mode transparency.
  - Fixed "Muddy/Creme" backgrounds on Calendar grids by enforcing pure transparency.
- **Components**:
  - Updated `UltraLogo` to dynamically switch between Platinum (Dark) and Obsidian (Light) gradients.
  - Refined `BottomNav` to transform into a White Glass dock in Light Mode.

### Fixed
- Fixed an issue where Settings Modal would retain Dark Mode styling while in Light Mode.
- Fixed inconsistent background colors on IPS vs VA monitors by removing shadowed background layers.
- Fixed truncation of long quotes in the Header widget.

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
