@echo off
echo 🌐 Avvio INSTANT KEY Frontend Server...
echo.
echo Il server sarà disponibile su: http://localhost:8000
echo.
cd /d "%~dp0"
python -m http.server 8000