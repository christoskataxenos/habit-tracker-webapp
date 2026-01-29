#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <windows.h>

#define MAX_HISTORY 20

typedef struct {
  char target[100];
  double total_time;
  int success;
} BuildLog;

BuildLog session_history[MAX_HISTORY];
int history_count = 0;

// Function to add a log entry
void add_log(const char *target, double time, int success) {
  if (history_count < MAX_HISTORY) {
    strncpy(session_history[history_count].target, target, 99);
    session_history[history_count].total_time = time;
    session_history[history_count].success = success;
    history_count++;
  }
}

// Function to set console color
void set_color(int color) {
  SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), color);
}

// Function to print the logo
void print_header() {
  system("cls"); // Clear screen
  set_color(11); // Light Cyan

  printf("\n");
  printf("  $$$$$$$\\  $$\\   $$\\ $$\\        $$$$$$\\  $$$$$$$$\\ \n");
  printf("  $$  __$$\\ $$ |  $$ |$$ |      $$  __$$\\ $$  _____|\n");
  printf("  $$ |  $$ |$$ |  $$ |$$ |      $$ /  \\__|$$ |      \n");
  printf("  $$$$$$$  |$$ |  $$ |$$ |      \\$$$$$$\\  $$$$$\\    \n");
  printf("  $$  ____/ $$ |  $$ |$$ |       \\____$$\\ $$  __|   \n");
  printf("  $$ |      $$ |  $$ |$$ |      $$\\   $$ |$$ |      \n");
  printf("  $$ |      \\$$$$$$  |$$$$$$$$\\ \\$$$$$$  |$$$$$$$$\\ \n");
  printf("  \\__|       \\______/ \\________| \\______/ \\________|\n");
  printf("\n");
  printf("  ==================================================\n");
  printf("     BUILD CONTROL SYSTEM v2.21 (Split-Timer Edition)\n");
  printf("  ==================================================\n\n");
}

// Function to format and print time
void print_timer(const char *task, double seconds) {
  int m = (int)seconds / 60;
  int s = (int)seconds % 60;
  if (strlen(task) > 0)
    printf("   - %-15s: %02d min %02d sec\n", task, m, s);
  else
    printf("%02d min %02d sec\n", m, s);
}

// Function to execute a split build command for individual targets
void run_split_build(const char *group_name, const char *targets[],
                     const char *args[], int count, int is_docker) {
  time_t start_session = time(NULL);

  set_color(14); // Yellow
  printf("\n  [+] GROUP INITIATED: %s\n", group_name);
  printf("  [+] STARTING SPLIT PERFORMANCE TRACKING...\n");

  for (int i = 0; i < count; i++) {
    time_t target_start = time(NULL);
    set_color(11); // Cyan
    printf("\n  >> Building Target [%d/%d]: %s\n", i + 1, count, targets[i]);
    set_color(7);
    printf("  --------------------------------------------------\n");

    char command[2048];
    if (is_docker) {
      sprintf(
          command,
          "docker run --rm -v \"%%CD%%:/project\" "
          "-v electron_builder_cache:/root/.cache "
          "-v npm_cache:/root/.npm "
          "-w /project/reactapp "
          "electronuserland/builder:wine /bin/bash -c \"npm install && npm run "
          "build && npx electron-builder %s\"",
          args[i]);
    } else {
      // For native, we only run npm install/build on the first target to save
      // time
      if (i == 0) {
        printf("  [1/2] Preparing Environment (NPM Install & Build)...\n");
        system("cd reactapp && npm install --silent && npm run build --silent");
      }
      printf("  [2/2] Packaging with Electron-Builder...\n");
      sprintf(command, "cd reactapp && npx electron-builder %s", args[i]);
    }

    int result = system(command);
    double target_duration = difftime(time(NULL), target_start);

    if (result == 0) {
      set_color(10); // Green
      printf("  [SUCCESS] Created: %s\n", targets[i]);
      print_timer("Duration", target_duration);
      add_log(targets[i], target_duration, 1);
    } else {
      set_color(12); // Red
      printf("  [FAILURE] Failed to build: %s\n", targets[i]);
      add_log(targets[i], target_duration, 0);
    }
  }

  double total_session = difftime(time(NULL), start_session);
  set_color(14);
  printf("\n  [ SESSION COMPLETE ]\n");
  print_timer("GRAND TOTAL", total_session);
  printf("\n");
  system("pause");
}

// Function to execute a single build command
void run_native_build(const char *target_name, const char *builder_args) {
  time_t start_total = time(NULL);
  double t_install = 0, t_web = 0, t_pkg = 0;

  set_color(14); // Yellow
  printf("\n  [+] TARGET SELECTED: %s (NATIVE WINDOWS)\n", target_name);
  printf("  [+] STARTING PERFORMANCE TRACKING...\n");

  set_color(7); // White
  printf("  --------------------------------------------------\n");

  // --- STAGE 1: NPM INSTALL ---
  printf("  [1/3] Refreshing Dependencies...\n");
  time_t s1 = time(NULL);
  int r1 = system("cd reactapp && npm install --silent");
  t_install = difftime(time(NULL), s1);
  if (r1 != 0) {
    set_color(12);
    printf("  [ERROR] Dependency resolution failed.\n");
    add_log(target_name, difftime(time(NULL), start_total), 0);
    system("pause");
    return;
  }

  // --- STAGE 2: NPM BUILD (VITE) ---
  printf("  [2/3] Compiling Web Assets (Vite)...\n");
  time_t s2 = time(NULL);
  int r2 = system("cd reactapp && npm run build --silent");
  t_web = difftime(time(NULL), s2);
  if (r2 != 0) {
    set_color(12);
    printf("  [ERROR] Web asset compilation failed.\n");
    add_log(target_name, difftime(time(NULL), start_total), 0);
    system("pause");
    return;
  }

  // --- STAGE 3: ELECTRON BUILDER ---
  printf("  [3/3] Packaging Application Artifacts...\n");
  char command[2048];
  sprintf(command, "cd reactapp && npx electron-builder %s", builder_args);
  time_t s3 = time(NULL);
  int r3 = system(command);
  t_pkg = difftime(time(NULL), s3);

  double total_time = difftime(time(NULL), start_total);

  if (r3 == 0) {
    set_color(10); // Green
    printf("\n  [SUCCESS] Build artifact created successfully.\n");
    add_log(target_name, total_time, 1);
  } else {
    set_color(12); // Red
    printf("\n  [FAILURE] Packaging stage encountered an error.\n");
    add_log(target_name, total_time, 0);
  }

  // --- FINAL STATISTICS ---
  set_color(11); // Cyan
  printf("\n  [ BUILD STATISTICS ]\n");
  set_color(7);
  print_timer("Dependencies", t_install);
  print_timer("Web Assets", t_web);
  print_timer("Packaging", t_pkg);
  printf("   --------------------------------\n");
  set_color(14);
  print_timer("TOTAL DURATION", total_time);

  set_color(7); // Reset
  printf("\n");
  system("pause");
}

void run_docker_build(const char *target_name, const char *builder_args) {
  set_color(14); // Yellow
  printf("\n  [+] TARGET SELECTED: %s (DOCKER LINUX)\n", target_name);
  printf("  [+] INITIALIZING DOCKER CONTAINER WITH CACHE...\n");

  set_color(7); // White
  printf("  --------------------------------------------------\n");

  time_t start_total = time(NULL);

  char command[2048];
  sprintf(command,
          "docker run --rm -v \"%%CD%%:/project\" "
          "-v electron_builder_cache:/root/.cache "
          "-v npm_cache:/root/.npm "
          "-w /project/reactapp "
          "electronuserland/builder:wine /bin/bash -c \"npm install && npm run "
          "build && npx electron-builder %s\"",
          builder_args);

  int result = system(command);
  double total_time = difftime(time(NULL), start_total);

  if (result == 0) {
    set_color(10); // Green
    printf("\n  [SUCCESS] Build artifact created successfully.\n");
    add_log(target_name, total_time, 1);
  } else {
    set_color(12); // Red
    printf("\n  [FAILURE] Build process encountered an error.\n");
    add_log(target_name, total_time, 0);
  }

  printf("\n  [ SESSION TIMER ]\n");
  print_timer(target_name, total_time);

  set_color(7); // Reset
  printf("\n");
  system("pause");
}

void run_maintenance() {
  set_color(13);
  printf("\n  [MAINTENANCE] Updating Docker Images & Cleaning System...\n");
  set_color(7);
  system("docker pull electronuserland/builder:wine");
  printf("\n  [INFO] Pruning unused docker data...\n");
  set_color(10);
  printf("\n  [DONE] Environment Updated.\n");
  system("pause");
}

void print_summary() {
  if (history_count == 0)
    return;
  printf("\n  ==================================================\n");
  set_color(13); // Magenta
  printf("     SESSION BUILD SUMMARY\n");
  set_color(7);
  printf("  ==================================================\n");
  for (int i = 0; i < history_count; i++) {
    if (session_history[i].success)
      set_color(10);
    else
      set_color(12);
    printf("   [%s] ", session_history[i].success ? "PASS" : "FAIL");
    set_color(7);
    printf("%-30s | ", session_history[i].target);
    print_timer("", session_history[i].total_time);
  }
  printf("  ==================================================\n\n");
}

int main() {
  int choice;
  while (1) {
    print_header();
    set_color(15);
    printf("  SELECT BUILD MODULE:\n\n");

    set_color(11);
    printf("  [ WINDOWS - Native Fast Build ]\n");
    set_color(8);
    printf("   1. Installer (x64 Setup .exe)\n");
    printf("   2. Portable  (x64 Standalone .exe)\n");
    printf("   3. ARM64     (Surface Pro X / Snapdragon)\n");
    printf("   4. Universal (x64 + ARM64 Combined)\n");
    printf("   5. Universal Portable (Multi-Arch)\n");
    set_color(10);
    printf("   6. >> BUILD ALL WINDOWS (Split Timers)\n\n");

    set_color(11);
    printf("  [ LINUX - Docker Container ]\n");
    set_color(8);
    printf("   7. Debian    (.deb Ubuntu/Kali)\n");
    printf("   8. RedHat    (.rpm Fedora/CentOS)\n");
    printf("   9. ARM64     (Raspberry Pi/VMs)\n");
    set_color(10);
    printf("   10. >> BUILD ALL LINUX (Split Timers)\n\n");

    set_color(13);
    printf("  [ GLOBAL ]\n");
    printf("   11. FULL DEPLOYMENT SUITE\n");
    set_color(14);
    printf("   12. UPDATE TOOLS (Docker Pull)\n\n");

    set_color(12);
    printf("   0. TERMINATE & SHOW SUMMARY\n\n");

    set_color(15);
    printf("  >> COMMAND: ");
    if (scanf("%d", &choice) != 1) {
      while (getchar() != '\n')
        ;
      choice = -1;
    }

    switch (choice) {
    case 1:
      run_native_build("WINDOWS INSTALLER (x64)",
                       "--win --x64 --config.win.target=nsis");
      break;
    case 2:
      run_native_build("WINDOWS PORTABLE (x64)",
                       "--win --x64 --config.win.target=portable");
      break;
    case 3:
      run_native_build("WINDOWS ARM64", "--win --arm64");
      break;
    case 4:
      run_native_build("WINDOWS UNIVERSAL",
                       "--win --x64 --arm64 --config.win.target=nsis");
      break;
    case 5:
      run_native_build("WINDOWS PORTABLE UNIVERSAL",
                       "--win --x64 --arm64 --config.win.target=portable");
      break;
    case 6: {
      const char *t[] = {"WIN x64 INSTALLER", "WIN x64 PORTABLE", "WIN ARM64",
                         "WIN UNIVERSAL"};
      const char *a[] = {"--win --x64 --config.win.target=nsis",
                         "--win --x64 --config.win.target=portable",
                         "--win --arm64",
                         "--win --x64 --arm64 --config.win.target=nsis"};
      run_split_build("WINDOWS SUITE", t, a, 4, 0);
      break;
    }
    case 7:
      run_docker_build("LINUX DEBIAN", "--linux deb --x64");
      break;
    case 8:
      run_docker_build("LINUX REDHAT", "--linux rpm --x64");
      break;
    case 9:
      run_docker_build("LINUX ARM64", "--linux --arm64");
      break;
    case 10: {
      const char *t[] = {"LINUX DEB x64", "LINUX RPM x64", "LINUX ARM64"};
      const char *a[] = {"--linux deb --x64", "--linux rpm --x64",
                         "--linux --arm64"};
      run_split_build("LINUX SUITE", t, a, 3, 1);
      break;
    }
    case 11: {
      const char *t[] = {"WINDOWS x64",     "WINDOWS ARM64",   "WIN UNIVERSAL",
                         "LINUX x64 (DEB)", "LINUX x64 (RPM)", "LINUX ARM64"};
      const char *a[] = {"--win --x64",         "--win --arm64",
                         "--win --x64 --arm64", "--linux deb --x64",
                         "--linux rpm --x64",   "--linux --arm64"};
      run_split_build("GLOBAL DEPLOYMENT", t, a, 6,
                      1); // Use Docker for global to be safe
      break;
    }
    case 12:
      run_maintenance();
      break;
    case 0:
      print_summary();
      printf("\n  Exiting...\n");
      system("pause");
      return 0;
    default:
      printf("\n  Invalid Directive.\n");
      system("pause");
    }
  }
  return 0;
}
