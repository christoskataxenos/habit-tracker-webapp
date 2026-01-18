#include "raylib.h"
#include <math.h>
#include <stdio.h>

// --- DESIGN TOKENS (Cyberpunk Palette) ---
#define COLOR_BG (Color){10, 12, 16, 255}      // Dark Void
#define COLOR_CYAN (Color){0, 240, 255, 255}   // Neon Cyan
#define COLOR_GLASS (Color){30, 40, 50, 100}   // Semi-transparent
#define COLOR_TEXT (Color){200, 200, 200, 255} // Platinum

int main(void) {
  // 1. System Initialization
  const int screenWidth = 400;
  const int screenHeight = 600;

  // Anti-aliasing for smooth circles
  SetConfigFlags(FLAG_MSAA_4X_HINT | FLAG_WINDOW_TRANSPARENT);
  InitWindow(screenWidth, screenHeight, "PULSE CORE");

  // Asset Loading (Using default font for low memory footprint)
  SetTargetFPS(60);

  // --- APP STATE ---
  bool isFocusActive = false;
  float timer = 0.0f;
  float pulseRadius = 0.0f;

  // 2. Main Event Loop
  while (!WindowShouldClose()) {
    // --- LOGIC ---
    if (IsKeyPressed(KEY_SPACE)) {
      isFocusActive = !isFocusActive;
    }

    if (isFocusActive) {
      timer += GetFrameTime();
    }

    // Animate the pulse
    float time = (float)GetTime();
    pulseRadius = 100.0f + (sinf(time * 2.0f) * 5.0f); // Breathing effect

    // --- RENDER ---
    BeginDrawing();
    ClearBackground(COLOR_BG);

    // A. The Header
    DrawRectangle(0, 0, screenWidth, 40, COLOR_GLASS);
    DrawText("PULSE v1.0 (C-CORE)", 10, 10, 10, DARKGRAY);
    DrawText("SYS: ONLINE", 300, 10, 10, GREEN);

    // B. The Neural Ring (Centerpiece)
    Vector2 center = {screenWidth / 2, screenHeight / 2 - 50};

    // Outer Glow
    if (isFocusActive) {
      DrawCircleGradient((int)center.x, (int)center.y, pulseRadius + 20,
                         Fade(COLOR_CYAN, 0.2f), Fade(COLOR_CYAN, 0.0f));
    }

    // Main Rings
    DrawRing(center, pulseRadius - 5, pulseRadius, 0, 360, 0,
             Fade(COLOR_CYAN, 0.3f)); // Ghost ring
    DrawRing(center, pulseRadius - 5, pulseRadius, 180 + (time * 50),
             360 + (time * 50), 0, COLOR_CYAN); // Active spinner

    // C. The Data (Timer)
    // Convert seconds to HH:MM:SS
    int hours = (int)timer / 3600;
    int minutes = ((int)timer % 3600) / 60;
    int seconds = (int)timer % 60;
    const char *timeText =
        TextFormat("%02d:%02d:%02d", hours, minutes, seconds);

    // Center the text
    int textWidth = MeasureText(timeText, 40);
    DrawText(timeText, center.x - textWidth / 2, center.y - 15, 40, WHITE);

    // State Label
    const char *status =
        isFocusActive ? "FOCUS SEQUENCE ACTIVE" : "PRESS [SPACE] TO ENGAGE";
    int statusWidth = MeasureText(status, 10);
    DrawText(status, center.x - statusWidth / 2, center.y + 60, 10,
             isFocusActive ? COLOR_CYAN : RAYWHITE);

    // D. The Grid (Footer)
    DrawRectangleLines(20, screenHeight - 120, screenWidth - 40, 100,
                       Fade(WHITE, 0.1f));
    DrawText(" NEURAL FEED", 30, screenHeight - 110, 10, GRAY);
    // Mock data bars
    for (int i = 0; i < 10; i++) {
      DrawRectangle(30 + (i * 35), screenHeight - 30, 25,
                    -GetRandomValue(10, 60), Fade(COLOR_CYAN, 0.5f));
    }

    EndDrawing();
  }

  // 3. De-Initialization
  CloseWindow();

  return 0;
}
