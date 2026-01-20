#include <stdio.h>
#include <windows.h>


// Definitions for controls
#define ID_BTN_WIN_INSTALLER 1
#define ID_BTN_WIN_PORTABLE 2
#define ID_BTN_LIN_DEBIAN 3
#define ID_BTN_LIN_REDHAT 4
#define ID_BTN_LIN_ARM 5
#define ID_BTN_WIN_ARM 6
#define ID_BTN_FULL 7
#define ID_BTN_EXIT 8

// Global variables to store brush for dark theme
HBRUSH hBrushBtn;
HBRUSH hBrushBg;

void RunBuild(const char *target_name, const char *builder_args) {
  char command[2048];
  // We construct a command that launches a new CMD window to run Docker
  // This allows the user to see the build progress output.
  sprintf(
      command,
      "/k title Build: %s && docker run --rm -v \"%%CD%%:/project\" -w "
      "/project/reactapp electronuserland/builder:wine /bin/bash -c \"npm "
      "install && npm run build && npx electron-builder %s\" && pause && exit",
      target_name, builder_args);

  // Use ShellExecute to open a new terminal window
  ShellExecute(NULL, "open", "cmd.exe", command, NULL, SW_SHOWNORMAL);
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam,
                            LPARAM lParam) {
  switch (uMsg) {
  case WM_CREATE: {
    // Create UI Buttons
    int x = 20, y = 20, w = 260, h = 40;
    int gap = 50;

    CreateWindow("BUTTON", "WINDOWS INSTALLER (.exe)",
                 WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h, hwnd,
                 (HMENU)ID_BTN_WIN_INSTALLER,
                 ((LPCREATESTRUCT)lParam)->hInstance, NULL);
    y += gap;
    CreateWindow("BUTTON", "WINDOWS PORTABLE (.exe)",
                 WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h, hwnd,
                 (HMENU)ID_BTN_WIN_PORTABLE,
                 ((LPCREATESTRUCT)lParam)->hInstance, NULL);
    y += gap;
    CreateWindow("BUTTON", "LINUX DEBIAN (.deb)",
                 WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h, hwnd,
                 (HMENU)ID_BTN_LIN_DEBIAN, ((LPCREATESTRUCT)lParam)->hInstance,
                 NULL);
    y += gap;
    CreateWindow("BUTTON", "LINUX REDHAT (.rpm)",
                 WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h, hwnd,
                 (HMENU)ID_BTN_LIN_REDHAT, ((LPCREATESTRUCT)lParam)->hInstance,
                 NULL);
    y += gap;
    CreateWindow("BUTTON", "LINUX ARM64 (Pi/VM)",
                 WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h, hwnd,
                 (HMENU)ID_BTN_LIN_ARM, ((LPCREATESTRUCT)lParam)->hInstance,
                 NULL);
    y += gap;
    CreateWindow("BUTTON", "WINDOWS ARM64 (Surface)",
                 WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h, hwnd,
                 (HMENU)ID_BTN_WIN_ARM, ((LPCREATESTRUCT)lParam)->hInstance,
                 NULL);
    y += gap + 10;

    // Full Build & Exit
    CreateWindow("BUTTON", "FULL DEPLOYMENT (ALL)",
                 WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h, hwnd,
                 (HMENU)ID_BTN_FULL, ((LPCREATESTRUCT)lParam)->hInstance, NULL);
    y += gap;
    CreateWindow("BUTTON", "EXIT", WS_VISIBLE | WS_CHILD | BS_FLAT, x, y, w, h,
                 hwnd, (HMENU)ID_BTN_EXIT, ((LPCREATESTRUCT)lParam)->hInstance,
                 NULL);
    break;
  }

  case WM_CTLCOLORBTN:
  case WM_CTLCOLORSTATIC: {
    // Simple Dark Theme Logic for controls
    HDC hdc = (HDC)wParam;
    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, RGB(255, 255, 255)); // Text Color
    SetBkColor(hdc, RGB(30, 30, 30));      // Background of Text
    return (LRESULT)hBrushBg;
  }

  case WM_COMMAND: {
    int wmId = LOWORD(wParam);
    switch (wmId) {
    case ID_BTN_WIN_INSTALLER:
      RunBuild("WINDOWS INSTALLER", "--win nsis");
      break;
    case ID_BTN_WIN_PORTABLE:
      RunBuild("WINDOWS PORTABLE", "--win portable");
      break;
    case ID_BTN_LIN_DEBIAN:
      RunBuild("LINUX DEBIAN", "--linux deb");
      break;
    case ID_BTN_LIN_REDHAT:
      RunBuild("LINUX REDHAT", "--linux rpm");
      break;
    case ID_BTN_LIN_ARM:
      RunBuild("LINUX ARM64", "--linux --arm64");
      break;
    case ID_BTN_WIN_ARM:
      RunBuild("WINDOWS ARM64", "--win --arm64");
      break;
    case ID_BTN_FULL:
      RunBuild("FULL SUITE", "--win --linux");
      break;
    case ID_BTN_EXIT:
      PostQuitMessage(0);
      break;
    }
    break;
  }

  case WM_DESTROY:
    PostQuitMessage(0);
    return 0;
  }
  return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance,
                   LPSTR lpCmdLine, int nCmdShow) {
  const char CLASS_NAME[] = "BuilderWindow";

  // Create brushes for dark theme
  hBrushBg = CreateSolidBrush(RGB(30, 30, 30));

  WNDCLASS wc = {};
  wc.lpfnWndProc = WindowProc;
  wc.hInstance = hInstance;
  wc.lpszClassName = CLASS_NAME;
  wc.hbrBackground = hBrushBg; // Dark Background
  wc.hCursor = LoadCursor(NULL, IDC_ARROW);

  RegisterClass(&wc);

  HWND hwnd = CreateWindowEx(0, CLASS_NAME, "Pulse Tracker Builder",
                             WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU |
                                 WS_MINIMIZEBOX, // Fixed window size
                             CW_USEDEFAULT, CW_USEDEFAULT, 320,
                             500, // Width 320, Height 500
                             NULL, NULL, hInstance, NULL);

  if (hwnd == NULL) {
    return 0;
  }

  ShowWindow(hwnd, nCmdShow);

  MSG msg = {};
  while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }

  return 0;
}
