import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 900,
        minHeight: 600,
        frame: false,            // No default OS chrome (Frameless)
        transparent: false,      // DISABLED for compatibility
        backgroundColor: '#020617', // Solid Background Color
        show: false,             // Hide until content is loaded
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
        icon: path.join(__dirname, '../build/icon.png')
    });

    // --- HUD WINDOW HANDLER ---
    // Intercepts window.open('.../hud') call from React
    mainWindow.webContents.setWindowOpenHandler(({ _url, frameName }) => {
        if (frameName === 'PulseHUD') {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: 320,
                    height: 220,
                    resizable: false, // Fixed size
                    frame: false,     // No Chrome
                    transparent: true,
                    alwaysOnTop: true, // KEY FEATURE
                    minimizable: false,
                    maximizable: false,
                    titleBarStyle: 'hidden',
                    backgroundColor: '#00000000', // Transparent
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                }
            };
        }
        return { action: 'allow' };
    });

    // Show window smoothly when content is ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // In production, we load the build file. In dev, the Vite URL.
    const isDev = process.env.NODE_ENV === 'development';
    const startUrl = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Cleanup
    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// --- IPC WINDOW CONTROLS (RESTORED) ---
ipcMain.on('window-minimize', () => {
    mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWindow?.close();
});

ipcMain.handle('save-backup', async (event, content, defaultFilename) => {
    if (!mainWindow) return;
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultFilename,
        filters: [{ name: 'Pulse Backup', extensions: ['json'] }]
    });

    if (filePath) {
        const fs = await import('fs/promises');
        await fs.writeFile(filePath, content);
        return true;
    }
    return false;
});
