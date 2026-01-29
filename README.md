# PULSE PROTOCOL v2.0.0
> *Bio-Digital Focus Enhancement Environment*

<div align="center">

## 📥 DOWNLOAD LATEST (v2.0.0)

### 🪟 WINDOWS
*Universal Support (x64 & ARM64)*

| 💿 **INSTALLER** | 🎒 **PORTABLE** |
| :---: | :---: |
| [![Windows Installer](https://img.shields.io/badge/Download-Setup.exe-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/V2.0/PULSE.Setup.2.0.0.exe) | [![Windows Portable](https://img.shields.io/badge/Download-Portable.exe-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/V2.0/PULSE.Portable.2.0.0.exe) |
| *Recommended* | *No Install Required* |

### 🐧 LINUX
*Architecture Note: **x64** (Intel/AMD) packages are labeled as **amd64** (.deb) or **x86_64** (.rpm).*

| PACKAGE TYPE | 💻 **x64** (Amd64 / x86_64) | ⚡ **ARM64** (aarch64) |
| :--- | :---: | :---: |
| **.DEB** <br> *(Ubuntu, Debian)* | [![Deb x64](https://img.shields.io/badge/Download-amd64.deb-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/V2.0/pulse-tracker_2.0.0_amd64.deb) | [![Deb ARM](https://img.shields.io/badge/Download-arm64.deb-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/V2.0/pulse-tracker_2.0.0_arm64.deb) |
| **.RPM** <br> *(Fedora, RHEL)* | [![RPM x64](https://img.shields.io/badge/Download-x86__64.rpm-294172?style=for-the-badge&logo=fedora&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/V2.0/pulse-tracker-2.0.0.x86_64.rpm) | [![RPM ARM](https://img.shields.io/badge/Download-aarch64.rpm-294172?style=for-the-badge&logo=fedora&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/V2.0/pulse-tracker-2.0.0.aarch64.rpm) |

</div>

<br>

![PULSE Dashboard](assets/Preview.png)

**PULSE** is a high-performance **Daily Activity & Focus System**. It is designed to quantify **everything you do in your day**—from coding and building to fitness and logistics.

> *"If you can measure it, you can master it."*

---

## 🏗️ SYSTEM ARCHITECTURE
The system is built as a high-performance desktop application:

### PULSE VISUAL (`/reactapp`)
> *The Flagship Experience*
- **Tech Stack:** React 19, TypeScript, Electron, Zustand, TailwindCSS, Recharts.
- **Features:**
  - 💎 **Glassmorphic UI:** A stunning, futuristic interface in Dark or Light mode.
  - 🔮 **Predictive Analytics (v2.0):** AI-driven goal forecasts and behavioral correlation insights.
  - ⏱️ **Focus HUD:** A compact, always-on-top timer window for distraction-free work.
  - ✨ **Micro-Animations:** Framer Motion transitions and celebratory confetti.
  - 🔥 **Activity Streaks:** Visual feedback for consistency.
  - 📊 **Analytics Vault 3.0:** Redesigned Operations Hub for deep statistics and smart data merge.
  - 🌓 **Dual-Theme Engine:** 
    - **Dark Protocol:** The signature deep space interface.
    - **Frost & Silver:** A monochromatic, high-contrast Light Mode.
  - 🏆 **Gamification Engine:** Earn XP, Level Up, and unlock Ranks (Initiate -> Architect).
  - 💾 **Local Vault:** 100% private JSON/CSV storage with native OS Save Dialogs and Smart Merge.

---

## 🛠️ INSTALLATION & DEPLOYMENT

### 🪟 WINDOWS (Primary Support)
1. Navigate to `\reactapp`.
2. Run `npm install` (first time only).
3. **Development:** Run `npm run dev` for hot-reload.
4. **Production Build:** Run `npm run electron:build` (or use `PulseBuilder.exe`) to generate a `.exe` installer.

---

### 🐧 LINUX / 🍎 MACOS
*Requires Node.js installed.*

1. Navigate to `/reactapp`.
2. Run `npm install`.
3. Run `npm run dev` to start the web interface.
   * *Note: Electron builds for Linux are possible via `npm run electron:build:linux` but untested.*



---

## 🎮 GAMIFICATION RULES
- **1 Hour** = 100 XP
- **Level Up** every 1000 XP (10 Hours).
- **Ranks:**
  - `LVL 00-09`: **NOVICE**
  - `LVL 10-24`: **APPRENTICE**
  - `LVL 25-49`: **ADEPT**
  - `LVL 50-99`: **EXPERT**
  - `LVL 100+`: **ARCHITECT**

## 📜 HISTORY & UPDATES
For a detailed breakdown of changes, features, and daily progress, view the [**Development Log (CALENDAR)**](./CALENDAR.md) or the [**Full Changelog**](./CHANGELOG.md).

## ❤️ ACKNOWLEDGEMENTS
Special thanks to the community for their feedback and support:
- **[@giwgos99](https://github.com/giwgos99)**: For identifying critical bugs in the Focus Mode logic and suggesting the CSV Import feature.

---
*System Version: 2.0.0 "The Quantified Future"*
