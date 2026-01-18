# 💠 Instinct Study Tracker (Desktop)

A high-performance, cyberpunk-themed productivity application built for desktop environments.
It features a frameless "Neural Interface" design, system integration, and advanced study tracking analytics.

## 🛠️ Tech Stack

- **Core:** React 19, JavaScript (ES6+)
- **Build Tool:** Vite
- **Wrapper:** Electron (v40)
- **Packaging:** Electron Builder
- **Styling:** Tailwind CSS v3 (Custom Configuration)
- **Routing:** React Router DOM (HashRouter)

## 📦 Installation & Setup

Prerequisites: Node.js (v18+ recommended)

```bash
# Navigate to the project folder
cd reactapp

# Install dependencies
npm install
```

## ⚡ Development (Live Reload)

To run the app in development mode with Hot Module Replacement (HMR):

```bash
npm run electron
```
*This starts the Vite server and launches the Electron window simultaneously.*

## 🏭 Building for Production

### 🪟 Windows (.exe)
Generates an Installer (NSIS) and a Portable executable in `../builds/win`.

```bash
npm run electron:build
```

### 🐧 Linux (.deb, .rpm)
**Requirement:** Must be run from a Linux environment (e.g., WSL Ubuntu).
Generates Debian and RedHat packages in `../builds/linux`.

```bash
npm run electron:build:linux
```

*Note: Requires `rpm` and `libfuse2` installed on the Linux system.*

## 📂 Key Files & Structure

- **`electron/main.js`**: The Backend Process. Handles window creation, lifecycle, and IPC events (minimize/close).
- **`src/App.jsx`**: Main React entry point with Routing setup.
- **`src/components/Header.jsx`**: Custom window controls (System Hud) implementation.
- **`package.json`**: Contains all build configurations and scripts.

---
*Instinct OS v1.0*
