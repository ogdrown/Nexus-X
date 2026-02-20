@echo off
set "PATH=C:\Program Files (x86)\NSIS\Bin;%PATH%"
echo NSIS Bin version:
"C:\Program Files (x86)\NSIS\Bin\makensis.exe" /VERSION
echo.
echo Building Nexus X v0.2.0 installer...
npx tauri build
pause
