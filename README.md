# PULSE SYSTEM v1.3
> *Bio-Digital Focus Enhancement Environment*

<div align="center">

## 📥 DOWNLOAD LATEST (v1.3.0)

| 🪟 **WINDOWS** | 🐧 **LINUX** |
| :---: | :---: |
| [![Windows Setup](https://img.shields.io/badge/Windows-Installer_v1.3-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/v1.3.0/PULSE.Setup.1.3.0.exe) <br> *Standard Installation* | [![Linux Deb](https://img.shields.io/badge/Linux-Debian%2FUbuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/v1.3.0/pulse-tracker_1.3.0_amd64.deb) <br> *Debian, Ubuntu, Mint* |
| [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/v1.3.0/PULSE.1.3.0.exe) <br> *No Install Needed* | [![Linux RPM](https://img.shields.io/badge/Linux-Fedora%2FRHEL-294172?style=for-the-badge&logo=fedora&logoColor=white)](https://github.com/christoskataxenos/habit-tracker-webapp/releases/download/v1.3.0/pulse-tracker-1.3.0.x86_64.rpm) <br> *Fedora, RedHat* |

</div>

<br>

![PULSE Dashboard](assets/dashboard_preview.png)

**PULSE** is a high-performance **Daily Activity & Focus System**. It is designed to quantify **everything you do in your day**—from coding and building to fitness and logistics.

> *"If you can measure it, you can master it."*

---

## 🏗️ SYSTEM ARCHITECTURE
The system is built as a high-performance desktop application:

### PULSE VISUAL (`/reactapp`)
> *The Flagship Experience*
- **Tech Stack:** React, Electron, TailwindCSS, Recharts.
- **Features:**
  - 💎 **Glassmorphic UI:** A stunning, futuristic interface.
  - 🏆 **Gamification Engine:** Earn XP, Level Up, and unlock Ranks (Initiate -> Architect).
  - 📊 **Analytics Vault (v1.3):** Comprehensive filtered statistics (Weekly/Monthly) with Bar & Pie charts.
  - ⏱️ **Live Focus HUD (v1.3):** Real-time system clock and "Engaged" status in Focus Mode.
  - 👻 **Smart Ghosts:** Non-intrusive scheduled protocol visualization.

---

## 🛠️ INSTALLATION & DEPLOYMENT

### 🪟 WINDOWS (Primary Support)
1. Navigate to `\reactapp`.
2. Run `npm install` (first time only).
3. **Development:** Run `npm run dev` for hot-reload.
4. **Production Build:** Run `npm run electron:build` to generate a `.exe` installer.

---

### 🐳 DOCKER (Universal / Server)
*Ideal for shared access on a local network (LAN).*

1. Navigate to `\reactapp`.
2. Run: `docker-compose up -d --build`
3. Access the app via browser at: `http://localhost:5173`
   * *(Or use your PC's IP address to access from Tablet/Phone)*

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
  - `LVL 01-09`: **INITIATE**
  - `LVL 10-24`: **OPERATOR**
  - `LVL 25-49`: **NETRUNNER**
  - `LVL 50-99`: **VANGUARD**
  - `LVL 100+`: **ARCHITECT**

## 📜 HISTORY & UPDATES
For a detailed breakdown of changes, features, and daily progress, view the [**Development Log (CALENDAR)**](./CALENDAR.md).

---
*System Version: 1.3 "The Analytics Vault"*