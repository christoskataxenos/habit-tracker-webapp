import customtkinter
import os
import subprocess
import sys

# Get the location of customtkinter
ctk_path = os.path.dirname(customtkinter.__file__)

# Prepare the separator for --add-data (semicolon for Windows)
sep = ";" if os.name == 'nt' else ":"

# PyInstaller arguments
args = [
    sys.executable, "-m", "PyInstaller",
    "--noconfirm",
    "--onefile",
    "--windowed",  # No console window for the GUI itself
    "--name", "PulseBuilder",
    "--add-data", f"{ctk_path}{sep}customtkinter",  # Include ctk assets
    "builder.py"
]

print("Running PyInstaller with args:")
print(" ".join(args))

subprocess.check_call(args)
