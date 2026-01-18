#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

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
  printf("     BUILD CONTROL SYSTEM v2.0 (C-Core)\n");
  printf("  ==================================================\n\n");
}

// Function to execute the build command
void run_build(const char *target_name, const char *builder_args) {
  set_color(14); // Yellow
  printf("\n  [+] TARGET SELECTED: %s\n", target_name);
  printf("  [+] INITIALIZING DOCKER CONTAINER...\n");

  set_color(7); // White
  printf("  --------------------------------------------------\n");

  // Construct the command
  // We use %CD% so Windows cmd expands it to current directory
  char command[2048];
  sprintf(command,
          "docker run --rm -v \"%%CD%%:/project\" -w /project/reactapp "
          "electronuserland/builder:wine /bin/bash -c \"npm install && npm run "
          "build && npx electron-builder %s\"",
          builder_args);

  // Execute
  int result = system(command);

  if (result == 0) {
    set_color(10); // Green
    printf("\n  [SUCCESS] Build artifact created successfully.\n");
  } else {
    set_color(12); // Red
    printf("\n  [FAILURE] Build process encountered an error.\n");
  }

  set_color(7); // Reset
  printf("\n");
  system("pause");
}

int main() {
  int choice;

  while (1) {
    print_header();
    set_color(15); // Bright White
    printf("  SELECT BUILD MODULE:\n\n");

    set_color(11); // Cyan
    printf("   [1] WINDOWS INSTALLER\n");
    set_color(8); // Gray
    printf("       (Setup .exe)\n\n");

    set_color(11); // Cyan
    printf("   [2] WINDOWS PORTABLE\n");
    set_color(8); // Gray
    printf("       (Standalone .exe)\n\n");

    set_color(11); // Cyan
    printf("   [3] LINUX DEBIAN\n");
    set_color(8); // Gray
    printf("       (.deb for Ubuntu, Kali, Mint, Pop!_OS)\n\n");

    set_color(11); // Cyan
    printf("   [4] LINUX REDHAT\n");
    set_color(8); // Gray
    printf("       (.rpm for Fedora, CentOS, RHEL)\n\n");

    set_color(13); // Magenta
    printf("   [5] FULL DEPLOYMENT (ALL)\n");
    set_color(8); // Gray
    printf("       (Builds everything at once)\n\n");

    set_color(12); // Red
    printf("   [0] TERMINATE\n\n");

    set_color(15);
    printf("  >> COMMAND: ");
    scanf("%d", &choice);

    switch (choice) {
    case 1:
      run_build("WINDOWS INSTALLER (.exe)", "--win nsis");
      break;
    case 2:
      run_build("WINDOWS PORTABLE (.exe)", "--win portable");
      break;
    case 3:
      run_build("LINUX DEBIAN (.deb)", "--linux deb");
      break;
    case 4:
      run_build("LINUX REDHAT (.rpm)", "--linux rpm");
      break;
    case 5:
      run_build("FULL SUITE (WIN + LINUX)", "--win --linux");
      break;
    case 0:
      printf("\n  Exiting...\n");
      return 0;
    default:
      printf("\n  Invalid Directive.\n");
      system("pause");
    }
  }
  return 0;
}
