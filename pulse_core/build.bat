@echo off
setlocal
echo.
echo  PULSE C-CORE BUILDER
echo  ====================

:: 1. Check Paths
set RAYLIB_BASE=_deps\raylib-5.0_win64_mingw-w64
set INC_PATH=%RAYLIB_BASE%\include
set LIB_PATH=%RAYLIB_BASE%\lib
set BIN_PATH=%RAYLIB_BASE%\bin

if not exist "%LIB_PATH%\libraylib.a" (
    echo [ERROR] Libraries not found. Run setup.ps1 first.
    pause
    exit /b
)

:: 2. Compile
echo [1/3] Compiling...
gcc main.c -o pulse_core.exe -O2 -Wall -Wno-missing-braces -I "%INC_PATH%" -L "%LIB_PATH%" -lraylib -lopengl32 -lgdi32 -lwinmm

if %errorlevel% neq 0 (
    echo [FAILURE] Compilation failed!
    pause
    exit /b
)

:: 3. Copy DLL (Crucial Step!)
echo [2/3] Checking Runtime Dependencies...
if not exist "libraylib.dll" (
    echo    - Copying libraylib.dll...
    copy "%BIN_PATH%\libraylib.dll" . >nul
)

:: 4. Run
echo [3/3] Launching System...
echo ========================================
pulse_core.exe
echo ========================================
echo.
echo System Terminated.
pause
