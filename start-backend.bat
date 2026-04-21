@echo off
echo 🚀 Avvio INSTANT KEY Backend Server...
echo 📂 Directory corrente: %CD%
cd /d "%~dp0backend"
echo 📂 Spostamento in: %CD%
if not exist node_modules (
    echo 📦 Installazione dipendenze...
    npm install
    if errorlevel 1 (
        echo ❌ Errore nell'installazione delle dipendenze
        pause
        exit /b 1
    )
)
echo 🗄️  Avvio server...
npm start
if errorlevel 1 (
    echo ❌ Errore nell'avvio del server
    pause
    exit /b 1
)