@echo off
color 0B
cls
echo.
echo  $$$$$$$\  $$\   $$\ $$\        $$$$$$\  $$$$$$$$\ 
echo  $$  __$$\ $$ ^|  $$ ^|$$ ^|      $$  __$$\ $$  _____^|
echo  $$ ^|  $$ ^|$$ ^|  $$ ^|$$ ^|      $$ /  \__^|$$ ^|      
echo  $$$$$$$  ^|$$ ^|  $$ ^|$$ ^|      \$$$$$$\  $$$$$\    
echo  $$  ____/ $$ ^|  $$ ^|$$ ^|       \____$$\ $$  __^|   
echo  $$ ^|      $$ ^|  $$ ^|$$ ^|      $$\   $$ ^|$$ ^|      
echo  $$ ^|      \$$$$$$  ^|$$$$$$$$\ \$$$$$$  ^|$$$$$$$$\ 
echo  \__^|       \______/ \________^| \______/ \________^|
echo.
echo  ==================================================
echo     SYSTEM DEPLOYMENT CONSOLE  v1.0
echo  ==================================================
echo.
echo  [1/4] Initializing Container Subsystem...
timeout /t 2 >nul
echo  [2/4] Loading Build Configuration...
timeout /t 1 >nul
echo  [3/4] Establishing Uplink to Docker...
echo.
echo  TARGETS LOCKED:
echo   [+] Windows Installer (.exe)
echo   [+] Portable Binary   (.exe)
echo   [+] Debian Package    (.deb)
echo   [+] RedHat Package    (.rpm)
echo.
echo  Press ANY KEY to engage build sequence...
pause >nul
cls

echo.
echo  $$$$$$\  $$$$$$$\  $$$$$$$$\ $$$$$$\  
echo  \_$$  _^| $$  __$$\ $$  _____^|\_$$  _^| 
echo    $$ ^|   $$ ^|  $$ ^|$$ ^|        $$ ^|   
echo    $$ ^|   $$$$$$$  ^|$$$$$\      $$ ^|   
echo    $$ ^|   $$  __$$^< $$  __^|     $$ ^|   
echo    $$ ^|   $$ ^|  $$ ^|$$ ^|        $$ ^|   
echo  $$$$$$\  $$ ^|  $$ ^|$$ ^|      $$$$$$\  
echo  \______^| \__^|  \__^|\__^|      \______^| 
echo.
echo  EXECUTING BUILD PIPELINE...
echo  (This may take several minutes. Do not close.)
echo.

docker run --rm -v "%CD%:/project" -w /project/reactapp electronuserland/builder:wine /bin/bash -c "npm install && npm run build && electron-builder --win --linux"

echo.
echo  ==================================================
echo     MISSION ACCOMPLISHED. ARTIFACTS DEPLOYED.
echo  ==================================================
echo  Status: GREEN
echo  Location: /builds
echo.
pause
