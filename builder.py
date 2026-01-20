import customtkinter as ctk
import subprocess
import os
import sys
import threading

# Configuration
ctk.set_appearance_mode("Dark")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"

class BuilderApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Window Setup
        self.title("PULSE Builder System")
        self.geometry("600x650")
        self.resizable(False, False)

        # configure grid layout (2x1)
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=0) # Header
        self.grid_rowconfigure(1, weight=1) # Content

        # --- HEADER ---
        self.header_frame = ctk.CTkFrame(self, corner_radius=0, fg_color="#020617") # Match App Background
        self.header_frame.grid(row=0, column=0, sticky="ew")
        
        self.title_label = ctk.CTkLabel(self.header_frame, text="PULSE BUILDER", 
                                      font=ctk.CTkFont(size=24, weight="bold", family="Roboto"))
        self.title_label.pack(pady=20)
        
        self.subtitle_label = ctk.CTkLabel(self.header_frame, text="Select a target platform to compile",
                                         font=ctk.CTkFont(size=14, text_color="gray"))
        self.subtitle_label.pack(pady=(0, 15))

        # --- MAIN CONTENT ---
        self.main_frame = ctk.CTkScrollableFrame(self, corner_radius=0, fg_color="transparent")
        self.main_frame.grid(row=1, column=0, sticky="nsew", padx=20, pady=20)
        self.main_frame.grid_columnconfigure(0, weight=1)

        # BUTTONS - WINDOWS
        self.create_section_label("WINDOWS TARGETS")
        self.create_build_button("Windows Installer (.exe)", "Standard Installer (NSIS)", "--win nsis", "win")
        self.create_build_button("Windows Portable (.exe)", "Standalone Executable", "--win portable", "win")
        self.create_build_button("Windows ARM64 (.exe)", "For Surface Pro X / Snapdragon", "--win --arm64", "win-arm")

        # BUTTONS - LINUX
        self.create_section_label("LINUX TARGETS")
        self.create_build_button("Linux Debian (.deb)", "Ubuntu, Mint, Kali, Pop!_OS", "--linux deb", "linux")
        self.create_build_button("Linux RedHat (.rpm)", "Fedora, CentOS, RHEL", "--linux rpm", "linux")
        self.create_build_button("Linux ARM64 (.deb/.rpm)", "Raspberry Pi 4/5, VMs", "--linux --arm64", "linux-arm")

        # BUTTONS - GLOBAL
        self.create_section_label("GLOBAL OPERATIONS")
        self.create_build_button("FULL DEPLOYMENT SUITE", "Build All targets (Long, High CPU)", "--win --linux", "all", fg_color="#7c3aed", hover_color="#6d28d9")

    def create_section_label(self, text):
        label = ctk.CTkLabel(self.main_frame, text=text, anchor="w", 
                             font=ctk.CTkFont(size=12, weight="bold", family="Arial"),
                             text_color="#94a3b8")
        label.pack(fill="x", pady=(20, 5))

    def create_build_button(self, title, subtitle, args, icon_type, fg_color=None, hover_color=None):
        # Container for the button to add margin
        
        btn = ctk.CTkButton(self.main_frame, 
                            text=f"{title}\n{subtitle}", 
                            font=ctk.CTkFont(size=14, weight="bold"),
                            height=60,
                            corner_radius=10,
                            command=lambda: self.run_build(title, args),
                            anchor="w")
        
        # Determine colors based on type if not specified
        if fg_color is None:
            if "win" in icon_type:
                btn.configure(fg_color="#1e293b", hover_color="#334155") # Python Dark Slate
            elif "linux" in icon_type:
                btn.configure(fg_color="#1e293b", hover_color="#334155")
            
        else:
             btn.configure(fg_color=fg_color, hover_color=hover_color)

        btn.pack(fill="x", pady=5)

    def run_build(self, target_name, builder_args):
        # Construct the command to open in a new separate terminal window
        # We use cmd.exe /c start ... to ensure it pops up nicely
        
        # The complex Docker command
        docker_cmd = (
            f"docker run --rm -v \"%CD%:/project\" -w /project/reactapp "
            f"electronuserland/builder:wine /bin/bash -c "
            f"\"npm install && npm run build && npx electron-builder {builder_args}\""
        )
        
        # The full command to open a new window with title and pause at the end
        full_cmd = f'start "Building {target_name}..." cmd /c "{docker_cmd} && echo. && echo [DONE] Press any key to close... && pause"'
        
        print(f"Executing: {full_cmd}")
        os.system(full_cmd)

def main():
    app = BuilderApp()
    app.mainloop()

if __name__ == "__main__":
    main()
